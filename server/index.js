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

  try {
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

    var answerIDObtain = grabAID(getAnswers.rows);

    var getPhotos = await pool.query(
      `SELECT *
    FROM answer_photos
    WHERE ${photosWhere(answerIDObtain)}`
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

    package.results = getQuestions.rows;

    res.status(200);
    res.json(package);
  } catch (err) {
    res.status(422);
    res.send('Error: invalid product_id provided');
  }
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

  try {
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
  } catch (err) {
    res.status(404);
    res.send(err);
  }
});

app.use(
  // needed for json body
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

app.post('/qa/questions/:question_id/answers', async (req, res) => {
  const params = req.params; //{question_id: number} this is how to access this portion
  const body = req.body; //{body, name, email, photos[]} is what we are expecting, if missing respond accordingly.

  var postAnswer = await pool.query(
    `INSERT INTO answers (id_questions, body, date_written, answerer_name, answerer_email, reported, helpful) VALUES ('${
      params.question_id
    }', '${body.body}', '${new Date().toISOString()}', '${body.name}', '${
      body.email
    }', '0', '0');`
  );

  var answerPhotoID = await pool.query(
    //answerPhotoID.rows[0].id will be the correct answer_id for what just got inserted
    `select id from answers order by id desc limit 1;`
  );

  if (body.photos.length !== 0) {
    body.photos.length.forEach((url) => {
      var photoInsert = pool.query(
        `INSERT INTO answer_photos (id_answers, url) VALUES ('${answerPhotoID.rows[0]}', '${url}');`
      );
    });
  }

  if (postAnswer.rowCount === 1) {
    res.status(201);
    res.end('Created');
  } else {
    res.status(400);
    res.end('Bad Request');
  }
});

app.put('/qa/questions/:question_id/helpful', async (req, res) => {
  const params = req.params; //{question_id: number} this is how to access this portion

  var putHelpfulQ = await pool.query(
    `UPDATE questions SET helpful = helpful + 1 WHERE id = ${params.question_id};`
  );

  res.status(204);
  res.end();
});

app.put('/qa/questions/:question_id/report', async (req, res) => {
  const params = req.params; //{question_id: number} this is how to access this portion

  var putReportQ = await pool.query(
    `UPDATE questions SET reported = '1' WHERE id = ${params.question_id};`
  );

  res.status(204);
  res.end();
});

app.put('/qa/answers/:answer_id/helpful', async (req, res) => {
  const params = req.params; //{answer_id: number} this is how to access this portion

  var putHelpfulA = await pool.query(
    `UPDATE answers SET helpful = helpful + 1 WHERE id = ${params.answer_id};`
  );

  res.status(204);
  res.end();
});

app.put('/qa/answers/:answer_id/report', async (req, res) => {
  const params = req.params; //{answer_id: number} this is how to access this portion

  var putReportQ = await pool.query(
    `UPDATE answers SET reported = '1' WHERE id = ${params.answer_id};`
  );

  res.status(204);
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

const photosInsert = function (photoURLs) {};
