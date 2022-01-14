const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'me',
  password: 'password',
  database: 'q_a',
});

//  host: 'localhost',
//  port: 5432,
// Others have advised me that I 'need' this. However everything is working correctly on the local machine. Making note for potential solution to error on deployment.

pool
  .connect()
  .then((res) => {
    console.log('Connected to Postgress');
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = pool;
