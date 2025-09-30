Tech stack: Express.js | Node.js | MySQL | JavaScript
purpose: Intended for use as a personal diary for future reference

Below are queries kept as a reference for the database

# gratitude-app
gratitude-app

Used queries : 
use grat_db;

CREATE TABLE mood_entries (
    entry TEXT,
    mood VARCHAR(50),
    date VARCHAR(10) CHECK (date REGEXP '^[0-1][0-9]/[0-3][0-9]/[0-9]{4}$')  -- Ensures MM/DD/YYYY format
);

CREATE TABLE mood_entries (
    entry TEXT,
    mood VARCHAR(50),
    date VARCHAR(10)  -- No CHECK constraint for date formatting
);

Select * from mood_entries;

