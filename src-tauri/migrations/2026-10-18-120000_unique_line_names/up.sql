with numbered_lines as (
    select id, row_number() over (partition by chapter order by id) as position
    from lines
)
update lines
set name = 'Line ' || numbered_lines.position
from numbered_lines
where numbered_lines.id = lines.id
    and trim(lines.name) = '';

with ranked_lines as (
    select id, chapter, name, row_number() over (partition by chapter, name order by id) as occurrence
    from lines
)
update lines
set name = case
    when exists (
        select 1
        from lines as other_lines
        where other_lines.chapter = ranked_lines.chapter
            and other_lines.name = ranked_lines.name || ' (' || ranked_lines.occurrence || ')'
    )
    then ranked_lines.name || ' (#' || ranked_lines.id || ')'
    else ranked_lines.name || ' (' || ranked_lines.occurrence || ')'
end
from ranked_lines
where ranked_lines.id = lines.id
    and ranked_lines.occurrence > 1;

drop index idx_lines_chapter_name;
create unique index idx_lines_chapter_name on lines (chapter, name);
