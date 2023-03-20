const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
});

module.exports = {
  query: async (text, params, callback) => {
    console.log('executing query', text);
    return await pool.query(text, params, callback);
  },
};
