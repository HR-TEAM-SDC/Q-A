const express = require('express');
const pool = require('../db/queries');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello, express server here!');
});

app.get('/qa/questions', async (req, res) => {
  const query = req.query; // {product_id, page, count} parameters
  let page = query.page || 1;
  let count = query.count || 5;

  if (!query.product_id) {
    //if no product id is recieved, send back response
    res.status(422);
    res.send('Error: invalid product_id provided');
  }

  var getQuestions = await pool.query(
    `SELECT id AS question_id, body AS question_body, date_written AS question_date, asker_name, helpful AS question_helpfulness, reported
    FROM questions
    WHERE product_id=${query.product_id} LIMIT ${count};`
  );

  var ids = grabQID(getQuestions.rows);

  var getAnswers = await pool.query(
    `SELECT *
    FROM answers
    WHERE ${answersWhere(ids)}`
  );

  var package = {
    product_id: `${query.product_id}`,
    results: [],
  };

  res.status(200);
  res.json(getAnswers.rows);
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

//helper functions

const grabQID = function (qArray) {
  var iterable = [];
  qArray.forEach((question) => {
    iterable.push(question.question_id);
  });
  return iterable;
};

const answersWhere = function (idNumbers) {
  if (idNumbers.length === 1) {
    return `id_questions=${idNumbers[0]}`;
  }
  let finalCommand = '';

  idNumbers.forEach((id, index) => {
    if (index === 0) {
      finalCommand += `id_questions=${id} `;
    } else if (index !== idNumbers.length - 1) {
      finalCommand += `OR id_questions=${id} `;
    } else {
      finalCommand += `OR id_questions=${id}`;
    }
  });

  return finalCommand;
};
