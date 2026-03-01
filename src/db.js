const { Pool } = require("pg");
require("dotenv").config();

// PostgreSQL se connection banata hai
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// SQL query run karta hai aur rows return karta hai
async function runQuery(sql) {
  const result = await pool.query(sql);
  return result.rows;
}

module.exports = { runQuery };
