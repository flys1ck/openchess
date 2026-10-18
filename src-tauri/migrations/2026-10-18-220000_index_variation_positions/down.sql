delete from positions
where id not in (
    select min(id)
    from positions
    group by line, ply
);

drop index idx_positions_line_move;
create unique index idx_positions_line_ply on positions (line, ply);
