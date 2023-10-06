create table if not exists settings (
  setting_key text primary key not null,
  setting_value text not null
);

-- Add default settings
insert into settings (setting_key, setting_value) values ("lichess_token", "");
