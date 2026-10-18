drop index idx_lines_chapter_name;
create index idx_lines_chapter_name on lines (chapter, name);
