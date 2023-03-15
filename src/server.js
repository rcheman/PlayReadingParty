const express = require('express');
const path = require('path');
const cors = require('cors');

const scriptController = require('./controllers/scriptController.js');
const actorController = require('./controllers/actorController.js');
const ServerError = require('./utils.js');

const app = express();

const PORT = 3000;

app.use(cors()); // Required for dev mode. Todo disable in production

// parse the request body
app.use(express.json());

// handle requests for static files
app.use(express.static(path.resolve(__dirname, '../public')));

// uploads a new script
app.post('/script', scriptController.saveScript, scriptController.importScript, (req, res) => {
  return res.status(200).json(res.locals.title);
});

// returns a list of all the script titles
app.get('/scripts/title', scriptController.getScriptTitles, (req, res) => {
  return res.status(200).json(res.locals.scriptTitles);
});

// returns the script as a nested array
app.get('/script/:title', scriptController.getScript, (req, res) => {
  return res.status(200).json(res.locals.fullPlay);
});

// return the character data
// can also be used with an actor=id query to get just the characters assigned to that actor
app.get('/script/:title/characters', scriptController.getCharacters, (req, res) => {
  return res.status(200).json(res.locals.characters);
});

// get a list of all the actors
app.get('/actors', actorController.getActors, (req, res) => {
  return res.status(200).json(res.locals.actors);
});

// add a new actor to the db
app.post('/actors', actorController.newActor, (req, res) => {
  return res.sendStatus(204);
});

// unknown rout handler
app.use((req, res) => res.sendStatus(404));

// middleware error handler
app.use((err, req, res, next) => {
  const defaultErr = {
    log: { err: `An error occurred. ${err}` },
    status: 500,
    message: 'Express error handler caught unknown middleware error',
  };
  const errorObj = err instanceof ServerError ? err : defaultErr;
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

module.exports = app;
