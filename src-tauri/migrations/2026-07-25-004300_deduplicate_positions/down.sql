create table positions_old (
    id integer primary key not null,
    created_at timestamp default current_timestamp not null,
    fen text not null,
    position_key text not null,
    line integer not null,
    san text not null,
    source text default '' not null,
    destination text default '' not null,
    foreign key (line) references lines(id) on delete cascade
);

insert into positions_old (
    id,
    created_at,
    fen,
    position_key,
    line,
    san,
    source,
    destination
)
select
    positions.id,
    positions.created_at,
    chess_positions.position_key
        || ' '
        || positions.halfmove_clock
        || ' '
        || positions.fullmove_number,
    chess_positions.position_key,
    positions.line,
    positions.san,
    positions.source,
    positions.destination
from positions
inner join chess_positions on chess_positions.id = positions.chess_position;

drop table positions;
drop table chess_positions;
alter table positions_old rename to positions;

create unique index idx_positions_line_fen on positions (line, fen);
create index idx_positions_position_key on positions (position_key);
