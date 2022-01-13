const express = require('express');
const pool = require('../db/queries');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello, express server here!');
});

app.listen(port, () => {
  console.log(`Listening on port:${port}!`);
});
