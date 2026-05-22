const { Pool } = require('pg');
require('dotenv').config();


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('fail to connect', err.stack);
  }
  console.log('connect success');
  release();
});

module.exports = pool;