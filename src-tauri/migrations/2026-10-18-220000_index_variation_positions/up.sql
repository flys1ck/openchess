-- A repeated position in a mainline stored the same move twice; one row per move is enough for the lookup
delete from positions
where id not in (
    select min(id)
    from positions
    group by line, chess_position, san
);

drop index idx_positions_line_ply;
create unique index idx_positions_line_move on positions (line, chess_position, san);
