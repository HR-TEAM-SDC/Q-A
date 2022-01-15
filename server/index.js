const express = require('express');
const { param } = require('express/lib/request');
const pool = require('../db/queries');
const bodyParser = require('body-parser');

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

  var ids = grabQID(getQuestions.rows); //merely scraping all question IDS to have answer Query be all set

  var getAnswers = await pool.query(
    `SELECT *
    FROM answers
    WHERE ${answersWhere(ids)}`
  );

  var aids = grabAID(getAnswers.rows);

  var getPhotos = await pool.query(
    `SELECT *
    FROM answer_photos
    WHERE ${photosWhere(aids)}`
  );

  var package = {
    //accumalator variable which will be return to sender
    product_id: `${query.product_id}`,
    results: [],
  };

  getQuestions.rows.forEach((question) => {
    //Attaching both Questions and Answers Data Server Side
    getAnswers.rows.forEach((answer) => {
      if (!question.answers) {
        question.answers = {};
      }
      if (question.question_id == answer.id_questions) {
        question.answers[answer.id] = {
          id: Number(answer.id),
          body: answer.body,
          date: answer.date_written,
          answerer_name: answer.answerer_name,
          helpfulness: answer.helpful,
          photos: [],
        };
        getPhotos.rows.forEach((photo) => {
          if (answer.id == photo.id_answers) {
            question.answers[answer.id].photos.push(photo.url);
          }
        });
      }
    });
  });

  getQuestions.rows.forEach((question) => {
    question.reported = !!Number(question.reported); //fixing boolean reported data
    question.question_id = Number(question.question_id);
  });

  package.results = getQuestions.rows;

  res.status(200);
  res.json(package);
});

app.get('/qa/questions/:question_id/answers', async (req, res) => {
  // console.log(req.params); {question_id: number} this is how to access this portion
  const params = req.params;
  const query = req.query; // {page, count} parameters allowed for this request

  var package = {
    //accumalator variable which will be return to sender
    question: params.question_id,
    page: query.page || 1,
    count: query.count || 5,
    results: [],
  };

  var getAnswers = await pool.query(
    `SELECT *
    FROM answers
    WHERE id_questions=${params.question_id}`
  );

  var answerIDS = grabAID(getAnswers.rows);

  var getPhotos = await pool.query(
    `SELECT *
    FROM answer_photos
    WHERE ${photosWhere(answerIDS)}`
  );

  getAnswers.rows.forEach((answer) => {
    var slot = {};
    slot.answer_id = answer.id;
    slot.body = answer.body;
    slot.date = answer.date_written;
    slot.answerer_name = answer.answerer_name;
    slot.helpfulness = answer.helpful;
    slot.photos = [];

    getPhotos.rows.forEach((photo) => {
      if (answer.id == photo.id_answers) {
        slot.photos.push(photo.url);
      }
    });

    package.results.push(slot);
  });

  res.status(200);
  res.send(package);
});

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.post('/qa/questions', async (req, res) => {
  const body = req.body; //{body, name, email, product_id} is what we are expecting, if missing respond appropriately.

  var postQuestion = await pool.query(
    `INSERT INTO questions (product_id, body, date_written, asker_name, asker_email, reported, helpful) VALUES ('${
      body.product_id
    }', '${body.body}', '${new Date().toISOString()}', '${body.name}', '${
      body.email
    }', '0', '0');`
  );

  if (postQuestion.rowCount === 1) {
    res.status(201);
    res.end('Created');
  } else {
    res.status(400);
    res.end('Bad Request');
  }
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

const grabAID = function (aArray) {
  var iterable = [];
  aArray.forEach((answer) => {
    iterable.push(answer.id);
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

const photosWhere = function (idNumbers) {
  if (idNumbers.length === 1) {
    return `id_answers=${idNumbers[0]}`;
  }
  let finalCommand = '';

  idNumbers.forEach((id, index) => {
    if (index === 0) {
      finalCommand += `id_answers=${id} `;
    } else if (index !== idNumbers.length - 1) {
      finalCommand += `OR id_answers=${id} `;
    } else {
      finalCommand += `OR id_answers=${id}`;
    }
  });

  return finalCommand;
};
