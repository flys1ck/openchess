// @generated automatically by Diesel CLI.

diesel::table! {
    chapters (id) {
        id -> Nullable<Integer>,
        created_at -> Timestamp,
        study -> Integer,
        name -> Text,
    }
}

diesel::table! {
    lines (id) {
        id -> Nullable<Integer>,
        created_at -> Timestamp,
        name -> Text,
        pgn -> Text,
        chapter -> Integer,
        moves -> Text,
        study -> Integer,
        orientation -> Text,
    }
}

diesel::table! {
    positions (id) {
        id -> Nullable<Integer>,
        created_at -> Timestamp,
        fen -> Text,
        study -> Nullable<Integer>,
        chapter -> Nullable<Integer>,
        line -> Nullable<Integer>,
        san -> Text,
        source -> Text,
        destination -> Text,
    }
}

diesel::table! {
    settings (setting_key) {
        setting_key -> Text,
        setting_value -> Text,
    }
}

diesel::table! {
    studies (id) {
        id -> Nullable<Integer>,
        created_at -> Timestamp,
        name -> Text,
        description -> Nullable<Text>,
    }
}

diesel::joinable!(chapters -> studies (study));
diesel::joinable!(lines -> chapters (chapter));
diesel::joinable!(lines -> studies (study));
diesel::joinable!(positions -> chapters (chapter));
diesel::joinable!(positions -> lines (line));
diesel::joinable!(positions -> studies (study));

diesel::allow_tables_to_appear_in_same_query!(
    chapters,
    lines,
    positions,
    settings,
    studies,
);
