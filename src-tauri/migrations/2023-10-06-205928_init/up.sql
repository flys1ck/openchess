create table if not exists studies (
    id integer primary key,
    created_at timestamp default current_timestamp not null,
    name text not null,
    description text
);

create table if not exists chapters (
    id integer primary key,
    created_at timestamp default current_timestamp not null,
    study integer not null,
    name text not null,
    foreign key (study) references studies(id) on delete cascade
);

create table if not exists lines (
    id integer primary key,
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

create table if not exists positions (
    id integer primary key,
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
    foreign key (line) references lines(id) on delete cascade
);
