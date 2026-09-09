create temporary table hierarchy_migration_guard (
    valid integer not null check (valid = 1)
);

insert into hierarchy_migration_guard (valid)
select case
    when exists (
        select 1
        from lines
        left join chapters on chapters.id = lines.chapter
        left join studies on studies.id = chapters.study
        where chapters.id is null
            or studies.id is null
            or lines.study is not chapters.study
    ) or exists (
        select 1
        from positions
        left join lines on lines.id = positions.line
        left join chapters on chapters.id = lines.chapter
        where positions.line is null
            or lines.id is null
            or chapters.id is null
            or positions.chapter is not lines.chapter
            or positions.study is not chapters.study
            or length(trim(positions.fen)) - length(replace(trim(positions.fen), ' ', '')) <> 5
    )
    then 0
    else 1
end;

drop table hierarchy_migration_guard;

create table lines_new (
    id integer primary key not null,
    created_at timestamp default current_timestamp not null,
    name text not null,
    pgn text not null,
    chapter integer not null,
    moves text not null,
    orientation text check (orientation in ('white', 'black')) default 'white' not null,
    foreign key (chapter) references chapters(id) on delete cascade
);

insert into lines_new (id, created_at, name, pgn, chapter, moves, orientation)
select id, created_at, name, pgn, chapter, moves, orientation
from lines;

create table positions_new (
    id integer primary key not null,
    created_at timestamp default current_timestamp not null,
    fen text not null,
    position_key text not null,
    line integer not null,
    san text not null,
    source text default '' not null,
    destination text default '' not null,
    foreign key (line) references lines_new(id) on delete cascade
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
    )
insert into positions_new (id, created_at, fen, position_key, line, san, source, destination)
select id, created_at, fen, substr(fen, 1, space_4 - 1), line, san, source, destination
from fen_4;

drop table positions;
drop table lines;

alter table lines_new rename to lines;
alter table positions_new rename to positions;

create index idx_lines_chapter_name on lines (chapter, name);
create unique index idx_positions_line_fen on positions (line, fen);
create index idx_positions_position_key on positions (position_key);
