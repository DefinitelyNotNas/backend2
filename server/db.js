const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : undefined,
});

// Simple query helper used by routers
const q = async (text, params) => {
  const result = await pool.query(text, params);
  return result;
};

module.exports = pool;
module.exports.q = q;
