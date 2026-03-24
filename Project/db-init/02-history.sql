CREATE DATABASE history;
\connect history

CREATE TABLE view_history (
    video_id INTEGER PRIMARY KEY,
    view_count INTEGER NOT NULL DEFAULT 0
);
