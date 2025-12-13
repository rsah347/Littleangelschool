require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

pool.connect((err, client, release) => {
    if (err) {
        console.error("❌ DB connection error:", err.stack);
    } else {
        console.log("✅ Database connected successfully");
        release();
    }
});

module.exports = pool;
