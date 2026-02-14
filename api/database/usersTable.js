import db from "../config/db.js";

export const initDb = () => {
    return new Promise((resolve, reject) => {  
        db.run("PRAGMA foreign_keys = ON");

        const sql = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT CHECK(role IN ('admin', 'staff','guest')) NOT NULL DEFAULT 'guest',
                status TEXT CHECK(status IN ('active', 'inactive')) NOT NULL DEFAULT 'active',
                token TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS devices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                device_fingerprint TEXT NOT NULL,
                trusted_status TEXT CHECK(trusted_status IN ('trusted', 'untrusted')) NOT NULL DEFAULT 'untrusted',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                resource_accessed TEXT NOT NULL,
                access_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `;

        db.exec(sql, (err) => {
            if (err) {
                console.error("❌ Error creating tables:", err.message);
                reject(err);
            } else {
                console.log("✅ Tables 'users', 'devices', and 'logs' are ready.");
                resolve();
            }
        });
    })
}