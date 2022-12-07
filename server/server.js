const express = require('express');
const path = require('path');
const scriptController = require('./controller.js');

const app = express();

const PORT = 3000;

// parse the request body
app.use(express.json());

// handle requests for static files
app.use(express.static(path.resolve(__dirname, '../public')));

// currently returning nothing
app.get('/script', scriptController.getPlay, (req, res) => {
  return res.status(200).json(res.locals.fullPlay);
});

// add a new actor to the db
app.post('/newActor', scriptController.newActor, (req, res) => {
  return res.sendStatus(204);
});

// unknown rout handler
app.use((req, res) => res.sendStatus(404));

// middleware error handler
app.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

module.exports = app;
