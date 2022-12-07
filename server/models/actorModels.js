const { Pool } = require('pg');

const PG_URI =
  'postgres://hrhsnuah:1Jnz9Is2EKIg9LTIh-t0lnaa4o1lsQqk@chunee.db.elephantsql.com/hrhsnuah';

const pool = new Pool({
  connectionString: PG_URI,
});

module.exports = {
  query: (text, params, callback) => {
    console.log('executing query', text);
    return pool.query(text, params, callback);
  },
};
