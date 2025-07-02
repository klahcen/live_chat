// db.js
const Database = require('better-sqlite3');

// Open or create the SQLite database file named "chat.db"
const db = new Database('chat.db');

// Create "messages" table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT NOT NULL,
    receiver TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

module.exports = db;
