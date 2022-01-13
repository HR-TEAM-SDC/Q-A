const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'me',
  password: 'password',
  database: 'q_a',
});

pool
  .connect()
  .then((res) => {
    console.log('Connected to Postgress');
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = {
  pool,
};
