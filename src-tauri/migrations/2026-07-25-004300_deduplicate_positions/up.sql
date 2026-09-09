create temporary table position_migration_guard (
    valid integer not null check (valid = 1)
);

with
    fen_1 as (
        select positions.*, instr(fen, ' ') as space_1
        from positions
    ),
    fen_2 as (
        select fen_1.*, space_1 + instr(substr(fen, space_1 + 1), ' ') as space_2
        from fen_1
    ),
    fen_3 as (
        select fen_2.*, space_2 + instr(substr(fen, space_2 + 1), ' ') as space_3
        from fen_2
    ),
    fen_4 as (
        select fen_3.*, space_3 + instr(substr(fen, space_3 + 1), ' ') as space_4
        from fen_3
    ),
    fen_5 as (
        select fen_4.*, space_4 + instr(substr(fen, space_4 + 1), ' ') as space_5
        from fen_4
    ),
    parsed_positions as (
        select
            *,
            substr(fen, 1, space_4 - 1) as parsed_position_key,
            substr(fen, space_4 + 1, space_5 - space_4 - 1) as halfmove_text,
            substr(fen, space_5 + 1) as fullmove_text
        from fen_5
    )
insert into position_migration_guard (valid)
select case
    when exists (
        select 1
        from parsed_positions
        where position_key <> parsed_position_key
            or halfmove_text = ''
            or halfmove_text glob '*[^0-9]*'
            or fullmove_text = ''
            or fullmove_text glob '*[^0-9]*'
            or cast(fullmove_text as integer) < 1
    )
    then 0
    else 1
end;

delete from position_migration_guard;

create table chess_positions (
    id integer primary key not null,
    position_key text not null unique
);

insert into chess_positions (position_key)
select distinct position_key
from positions
order by position_key;

create table positions_new (
    id integer primary key not null,
    created_at timestamp default current_timestamp not null,
    chess_position integer not null,
    line integer not null,
    ply integer not null check (ply >= 0),
    halfmove_clock integer not null check (halfmove_clock >= 0),
    fullmove_number integer not null check (fullmove_number >= 1),
    san text not null,
    source text default '' not null,
    destination text default '' not null,
    foreign key (chess_position) references chess_positions(id) on delete restrict,
    foreign key (line) references lines(id) on delete cascade
);

with
    fen_1 as (
        select positions.*, instr(fen, ' ') as space_1
        from positions
    ),
    fen_2 as (
        select fen_1.*, space_1 + instr(substr(fen, space_1 + 1), ' ') as space_2
        from fen_1
    ),
    fen_3 as (
        select fen_2.*, space_2 + instr(substr(fen, space_2 + 1), ' ') as space_3
        from fen_2
    ),
    fen_4 as (
        select fen_3.*, space_3 + instr(substr(fen, space_3 + 1), ' ') as space_4
        from fen_3
    ),
    fen_5 as (
        select fen_4.*, space_4 + instr(substr(fen, space_4 + 1), ' ') as space_5
        from fen_4
    ),
    parsed_positions as (
        select
            fen_5.*,
            cast(substr(fen, space_4 + 1, space_5 - space_4 - 1) as integer) as halfmove_clock,
            cast(substr(fen, space_5 + 1) as integer) as fullmove_number
        from fen_5
    ),
    numbered_positions as (
        select
            parsed_positions.*,
            row_number() over (
                partition by line
                order by
                    (fullmove_number - 1) * 2
                        + case substr(fen, space_1 + 1, space_2 - space_1 - 1)
                            when 'black' then 1
                            when 'b' then 1
                            else 0
                        end,
                    id
            ) - 1 as ply
        from parsed_positions
    )
insert into positions_new (
    id,
    created_at,
    chess_position,
    line,
    ply,
    halfmove_clock,
    fullmove_number,
    san,
    source,
    destination
)
select
    numbered_positions.id,
    numbered_positions.created_at,
    chess_positions.id,
    numbered_positions.line,
    numbered_positions.ply,
    numbered_positions.halfmove_clock,
    numbered_positions.fullmove_number,
    numbered_positions.san,
    numbered_positions.source,
    numbered_positions.destination
from numbered_positions
inner join chess_positions on chess_positions.position_key = numbered_positions.position_key;

insert into position_migration_guard (valid)
select case
    when (select count(*) from positions) <> (select count(*) from positions_new)
        or exists (
            select 1
            from positions
            inner join positions_new on positions_new.id = positions.id
            inner join chess_positions on chess_positions.id = positions_new.chess_position
            where positions.fen <> chess_positions.position_key
                || ' '
                || positions_new.halfmove_clock
                || ' '
                || positions_new.fullmove_number
        )
    then 0
    else 1
end;

drop table position_migration_guard;
drop table positions;
alter table positions_new rename to positions;

create unique index idx_positions_line_ply on positions (line, ply);
create index idx_positions_chess_position on positions (chess_position);

create trigger delete_orphaned_chess_position
after delete on positions
for each row
when not exists (
    select 1
    from positions
    where chess_position = old.chess_position
)
begin
    delete from chess_positions
    where id = old.chess_position;
end;
