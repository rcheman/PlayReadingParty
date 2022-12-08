const express = require('express');
const path = require('path');
const scriptController = require('./scriptController.js');
const actorController = require('./actorController');

const app = express();

const PORT = 3000;

// parse the request body
app.use(express.json());

// handle requests for static files
app.use(express.static(path.resolve(__dirname, '../public')));

// returns the script as a nested array
app.get('/script', scriptController.getPlay, (req, res) => {
  return res.status(200).json(res.locals.fullPlay);
});

// return the character objects
app.get('/characterData', scriptController.getCharacterData, (req, res) => {
  return res.status(200).json(res.locals.characterData);
});

// get a list of all the actors
app.get('/getActors', actorController.getActors, (req, res) => {
  return res.status(200).json(res.locals.actorList);
});

// add a new actor to the db
app.post('/newActor', actorController.newActor, (req, res) => {
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
