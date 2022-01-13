const express = require('express');
const pool = require('../db/queries');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello, express server here!');
});

app.get('/qa/questions', async (req, res) => {
  var getQuestions = await pool.query(
    "SELECT * FROM questions WHERE id='1' OR id='2';"
  );
  // console.log('this is my query: ', getQuestions.rows); array of objects, each object is row
  res.send(getQuestions.rows);
});

app.listen(port, () => {
  console.log(`Listening on port:${port}!`);
});
