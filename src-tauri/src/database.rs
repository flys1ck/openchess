use diesel::{
    connection::SimpleConnection,
    result::Error as DieselError,
    sql_query,
    sql_types::{BigInt, Text},
    sqlite::SqliteConnection,
    QueryableByName, RunQueryDsl,
};
use std::{error::Error, fmt};

const MIN_RECLAIMABLE_BYTES: i128 = 16 * 1024 * 1024;
const MIN_RECLAIMABLE_PERCENT: i128 = 20;

#[derive(Clone, Debug, PartialEq, Eq, QueryableByName)]
pub struct DatabaseStats {
    #[diesel(sql_type = BigInt)]
    pub page_count: i64,
    #[diesel(sql_type = BigInt)]
    pub freelist_count: i64,
    #[diesel(sql_type = BigInt)]
    pub page_size: i64,
    #[diesel(sql_type = Text)]
    pub journal_mode: String,
}

impl DatabaseStats {
    pub fn allocated_bytes(&self) -> Result<i128, DatabaseMaintenanceError> {
        checked_product(self.page_count, self.page_size)
    }

    pub fn reclaimable_bytes(&self) -> Result<i128, DatabaseMaintenanceError> {
        checked_product(self.freelist_count, self.page_size)
    }

    fn validate(&self) -> Result<(), DatabaseMaintenanceError> {
        if self.page_count <= 0
            || self.page_size <= 0
            || self.freelist_count < 0
            || self.freelist_count > self.page_count
        {
            return Err(DatabaseMaintenanceError::InvalidStatistics(self.clone()));
        }

        Ok(())
    }
}

#[derive(Debug, PartialEq, Eq)]
pub enum CompactionOutcome {
    Skipped(DatabaseStats),
    Compacted {
        before: DatabaseStats,
        after: DatabaseStats,
    },
}

#[derive(Debug)]
pub enum DatabaseMaintenanceError {
    Database(DieselError),
    InvalidStatistics(DatabaseStats),
    ArithmeticOverflow,
}

impl fmt::Display for DatabaseMaintenanceError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Database(error) => write!(formatter, "{error}"),
            Self::InvalidStatistics(stats) => write!(
                formatter,
                "invalid SQLite statistics: page_count={}, freelist_count={}, page_size={}",
                stats.page_count, stats.freelist_count, stats.page_size
            ),
            Self::ArithmeticOverflow => write!(
                formatter,
                "SQLite statistics overflowed during compaction checks"
            ),
        }
    }
}

impl Error for DatabaseMaintenanceError {
    fn source(&self) -> Option<&(dyn Error + 'static)> {
        match self {
            Self::Database(error) => Some(error),
            Self::InvalidStatistics(_) | Self::ArithmeticOverflow => None,
        }
    }
}

impl From<DieselError> for DatabaseMaintenanceError {
    fn from(error: DieselError) -> Self {
        Self::Database(error)
    }
}

pub fn compact_database_if_needed(
    connection: &mut SqliteConnection,
) -> Result<CompactionOutcome, DatabaseMaintenanceError> {
    compact_database(connection, MIN_RECLAIMABLE_BYTES, MIN_RECLAIMABLE_PERCENT)
}

fn compact_database(
    connection: &mut SqliteConnection,
    min_reclaimable_bytes: i128,
    min_reclaimable_percent: i128,
) -> Result<CompactionOutcome, DatabaseMaintenanceError> {
    let before = database_stats(connection)?;
    if !should_compact(&before, min_reclaimable_bytes, min_reclaimable_percent)? {
        return Ok(CompactionOutcome::Skipped(before));
    }

    connection.batch_execute("VACUUM")?;
    if before.journal_mode.eq_ignore_ascii_case("wal") {
        connection.batch_execute("PRAGMA wal_checkpoint(TRUNCATE)")?;
    }

    Ok(CompactionOutcome::Compacted {
        before,
        after: database_stats(connection)?,
    })
}

fn database_stats(
    connection: &mut SqliteConnection,
) -> Result<DatabaseStats, DatabaseMaintenanceError> {
    sql_query(
        "select page_count, freelist_count, page_size, journal_mode
         from pragma_page_count(), pragma_freelist_count(), pragma_page_size(), pragma_journal_mode()",
    )
    .get_result(connection)
    .map_err(Into::into)
}

fn should_compact(
    stats: &DatabaseStats,
    min_reclaimable_bytes: i128,
    min_reclaimable_percent: i128,
) -> Result<bool, DatabaseMaintenanceError> {
    stats.validate()?;
    if !(0..=100).contains(&min_reclaimable_percent) || min_reclaimable_bytes < 0 {
        return Err(DatabaseMaintenanceError::InvalidStatistics(stats.clone()));
    }

    let reclaimable_bytes = stats.reclaimable_bytes()?;
    let reclaimable_percent_numerator = i128::from(stats.freelist_count)
        .checked_mul(100)
        .ok_or(DatabaseMaintenanceError::ArithmeticOverflow)?;
    let reclaimable_percent_threshold = i128::from(stats.page_count)
        .checked_mul(min_reclaimable_percent)
        .ok_or(DatabaseMaintenanceError::ArithmeticOverflow)?;

    Ok(reclaimable_bytes >= min_reclaimable_bytes
        && reclaimable_percent_numerator >= reclaimable_percent_threshold)
}

fn checked_product(left: i64, right: i64) -> Result<i128, DatabaseMaintenanceError> {
    i128::from(left)
        .checked_mul(i128::from(right))
        .ok_or(DatabaseMaintenanceError::ArithmeticOverflow)
}

#[cfg(test)]
mod tests {
    use super::*;
    use diesel::{sql_types::BigInt, Connection};
    use std::fs;
    use tempfile::{tempdir, TempDir};

    #[derive(QueryableByName)]
    struct Count {
        #[diesel(sql_type = BigInt)]
        count: i64,
    }

    fn stats(page_count: i64, freelist_count: i64, page_size: i64) -> DatabaseStats {
        DatabaseStats {
            page_count,
            freelist_count,
            page_size,
            journal_mode: "delete".to_owned(),
        }
    }

    fn temporary_connection() -> (TempDir, SqliteConnection) {
        let directory = tempdir().expect("temporary directory");
        let database_path = directory.path().join("database.sqlite");
        let connection =
            SqliteConnection::establish(database_path.to_str().expect("UTF-8 database path"))
                .expect("temporary SQLite connection");
        (directory, connection)
    }

    fn create_freelist(connection: &mut SqliteConnection) {
        connection
            .batch_execute(
                "create table payloads (
                    id integer primary key not null,
                    payload blob not null
                );
                with recursive numbers(value) as (
                    select 1
                    union all
                    select value + 1 from numbers where value < 256
                )
                insert into payloads (payload)
                select zeroblob(4096) from numbers;
                delete from payloads where id > 1;",
            )
            .expect("create database freelist");
    }

    #[test]
    fn compacts_at_exact_production_thresholds() {
        let stats = stats(20_480, 4_096, 4_096);

        assert!(
            should_compact(&stats, MIN_RECLAIMABLE_BYTES, MIN_RECLAIMABLE_PERCENT)
                .expect("valid statistics")
        );
    }

    #[test]
    fn skips_when_reclaimable_bytes_are_below_threshold() {
        let stats = stats(4_095, 4_095, 4_096);

        assert!(
            !should_compact(&stats, MIN_RECLAIMABLE_BYTES, MIN_RECLAIMABLE_PERCENT)
                .expect("valid statistics")
        );
    }

    #[test]
    fn skips_when_reclaimable_percentage_is_below_threshold() {
        let stats = stats(20_481, 4_096, 4_096);

        assert!(
            !should_compact(&stats, MIN_RECLAIMABLE_BYTES, MIN_RECLAIMABLE_PERCENT)
                .expect("valid statistics")
        );
    }

    #[test]
    fn rejects_empty_or_inconsistent_statistics() {
        for invalid_stats in [
            stats(0, 0, 4_096),
            stats(10, 11, 4_096),
            stats(10, -1, 4_096),
        ] {
            assert!(matches!(
                should_compact(
                    &invalid_stats,
                    MIN_RECLAIMABLE_BYTES,
                    MIN_RECLAIMABLE_PERCENT
                ),
                Err(DatabaseMaintenanceError::InvalidStatistics(_))
            ));
        }
    }

    #[test]
    fn checked_byte_calculations_handle_maximum_sqlite_values() {
        let stats = stats(i64::MAX, i64::MAX, i64::MAX);

        assert_eq!(
            stats.allocated_bytes().expect("checked allocated bytes"),
            i128::from(i64::MAX) * i128::from(i64::MAX)
        );
        assert_eq!(
            stats
                .reclaimable_bytes()
                .expect("checked reclaimable bytes"),
            i128::from(i64::MAX) * i128::from(i64::MAX)
        );
    }

    #[test]
    fn vacuum_reclaims_pages_without_removing_live_data() {
        let (directory, mut connection) = temporary_connection();
        create_freelist(&mut connection);
        let database_path = directory.path().join("database.sqlite");
        let file_size_before = fs::metadata(&database_path)
            .expect("database metadata")
            .len();

        let outcome = compact_database(&mut connection, 1, 1).expect("database compaction");
        let CompactionOutcome::Compacted { before, after } = outcome else {
            panic!("database should have been compacted");
        };

        let file_size_after = fs::metadata(&database_path)
            .expect("database metadata")
            .len();
        let live_rows = sql_query("select count(*) as count from payloads")
            .get_result::<Count>(&mut connection)
            .expect("live row count")
            .count;
        let integrity = sql_query("pragma integrity_check")
            .get_result::<IntegrityCheck>(&mut connection)
            .expect("integrity check")
            .integrity_check;

        assert!(before.freelist_count > 0);
        assert_eq!(after.freelist_count, 0);
        assert!(after.page_count < before.page_count);
        assert!(file_size_after < file_size_before);
        assert_eq!(live_rows, 1);
        assert_eq!(integrity, "ok");
    }

    #[test]
    fn vacuum_failure_is_returned_when_another_connection_holds_a_write_lock() {
        let (_directory, mut connection) = temporary_connection();
        create_freelist(&mut connection);
        connection
            .batch_execute("pragma busy_timeout = 1")
            .expect("maintenance busy timeout");

        let database_path = _directory.path().join("database.sqlite");
        let mut locking_connection =
            SqliteConnection::establish(database_path.to_str().expect("UTF-8 database path"))
                .expect("locking SQLite connection");
        locking_connection
            .batch_execute("begin immediate")
            .expect("acquire write lock");

        let result = compact_database(&mut connection, 1, 1);
        locking_connection
            .batch_execute("rollback")
            .expect("release write lock");

        assert!(matches!(
            result,
            Err(DatabaseMaintenanceError::Database(
                DieselError::DatabaseError(_, _)
            ))
        ));
    }

    #[test]
    fn vacuum_preserves_wal_mode_and_truncates_the_sidecar() {
        let (directory, mut connection) = temporary_connection();
        connection
            .batch_execute("pragma journal_mode = wal")
            .expect("enable WAL mode");
        create_freelist(&mut connection);

        let outcome = compact_database(&mut connection, 1, 1).expect("WAL database compaction");
        let CompactionOutcome::Compacted { after, .. } = outcome else {
            panic!("database should have been compacted");
        };
        let wal_path = directory.path().join("database.sqlite-wal");
        let wal_size = fs::metadata(wal_path)
            .map(|metadata| metadata.len())
            .unwrap_or(0);

        assert_eq!(after.journal_mode, "wal");
        assert_eq!(after.freelist_count, 0);
        assert_eq!(wal_size, 0);
    }

    #[derive(QueryableByName)]
    struct IntegrityCheck {
        #[diesel(sql_type = Text)]
        integrity_check: String,
    }
}
