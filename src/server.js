const express = require('express');
const path = require('path');
const cors = require('cors');

const scriptController = require('./controllers/scriptController.js');
const actorController = require('./controllers/actorController.js');
const ServerError = require('./services/utils.js');

require('./services/startupChecks').assert();

const app = express();

const PORT = 3000;

app.use(cors()); // Required for dev mode. Todo disable in production

// parse the request body
app.use(express.json());

// handle requests for static files
app.use(express.static(path.resolve(__dirname, '../public')));

// uploads a new script
app.post('/script', scriptController.saveScript, scriptController.importScript, (req, res) => {
  return res.status(200).json({id: res.locals.id, title: res.locals.title});
});

// returns a list of all the script titles
app.get('/scripts/title', scriptController.getScriptTitles, (req, res) => {
  return res.status(200).json(res.locals.scriptTitles);
});

// returns the script text as a nested array
app.get('/script/:script', scriptController.getScript, (req, res) => {
  return res.status(200).json(res.locals.scriptText);
});

// return the character data
// can also be used with an actor=id query to get just the characters assigned to that actor
app.get('/script/:script/characters', scriptController.getCharacters, (req, res) => {
  return res.status(200).json(res.locals.characters);
});

app.delete('/script/:script', scriptController.deleteScript, (req, res) => {
  return res.sendStatus(200)
})

// get a list of all the actors
app.get('/actors', actorController.getActors, (req, res) => {
  return res.status(200).json(res.locals.actors);
});

// add a new actor to the db, return the actor object
app.post('/actors', actorController.newActor, (req, res) => {
  return res.status(201).json(res.locals.actor);
});

// delete an actor from the database based on their id
app.delete('/actors/:id', actorController.deleteActor, (req, res) => {
  return res.sendStatus(200);
});

// unknown rout handler
app.use((req, res) => res.sendStatus(404));

// middleware error handler
app.use((err, req, res, next) => {
  const defaultErr = {
    log: { err: `An error occurred. ${err.log ? err.log : err.message}` },
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
