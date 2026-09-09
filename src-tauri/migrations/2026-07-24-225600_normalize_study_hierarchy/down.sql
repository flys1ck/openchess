create table lines_old (
    id integer primary key not null,
    created_at timestamp default current_timestamp not null,
    name text not null,
    pgn text not null,
    chapter integer not null,
    moves text not null,
    study integer not null,
    orientation text check (orientation in ('white', 'black')) default 'white' not null,
    foreign key (chapter) references chapters(id) on delete cascade,
    foreign key (study) references studies(id) on delete cascade
);

insert into lines_old (id, created_at, name, pgn, chapter, moves, study, orientation)
select
    lines.id,
    lines.created_at,
    lines.name,
    lines.pgn,
    lines.chapter,
    lines.moves,
    chapters.study,
    lines.orientation
from lines
inner join chapters on chapters.id = lines.chapter;

create table positions_old (
    id integer primary key not null,
    created_at timestamp default current_timestamp not null,
    fen text not null,
    study integer,
    chapter integer,
    line integer,
    san text not null,
    source text default '' not null,
    destination text default '' not null,
    foreign key (study) references studies(id) on delete cascade,
    foreign key (chapter) references chapters(id) on delete cascade,
    foreign key (line) references lines_old(id) on delete cascade
);

insert into positions_old (id, created_at, fen, study, chapter, line, san, source, destination)
select
    positions.id,
    positions.created_at,
    positions.fen,
    chapters.study,
    lines.chapter,
    positions.line,
    positions.san,
    positions.source,
    positions.destination
from positions
inner join lines on lines.id = positions.line
inner join chapters on chapters.id = lines.chapter;

drop table positions;
drop table lines;

alter table lines_old rename to lines;
alter table positions_old rename to positions;

create unique index idx_positions_line_fen on positions (line, fen);
