const express = require('express');
const pool = require('../db/queries');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello, express server here!');
});

app.get('/qa/questions', async (req, res) => {
  const query = req.query; // {product_id, page, count} parameters

  if (!query.product_id) {
    //if no product id is recieved, send back response
    res.status(422);
    res.send('Error: invalid product_id provided');
  }

  var getQuestions = await pool.query(
    `SELECT * FROM questions WHERE product_id=${query.product_id};`
  );

  console.log('this is my query: ', !!Number(getQuestions.rows[0].reported)); //array of objects, each object is row

  res.status(200);
  res.json(getQuestions.rows);
});

app.get('/qa/questions/:question_id/answers', async (req, res) => {
  // console.log(req.params); {question_id: number} this is how to access this portion
  const query = req.query; // {page, count} parameters allowed for this request
  res.status(200);
  res.send('success2');
});

app.post('/qa/questions', async (req, res) => {
  const query = req.query; //{body, name, email, product_id} is what we are expecting, if missing respond appropriately.
  res.status(201);
  res.end();
});

app.listen(port, () => {
  console.log(`Listening on port:${port}!`);
});
