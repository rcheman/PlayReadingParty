const express = require('express');
const path = require('path');

const scriptController = require('./controllers/scriptController.js');
const actorController = require('./controllers/actorController.js');
const characterController = require('./controllers/characterController.js')
const ServerError = require('./services/utils.js');

require('./services/startupChecks').assert();


const app = express();
app.disable('x-powered-by');

const PORT = 3000;

// parse the request body
app.use(express.json());

// handle requests for static files
app.use(express.static(path.resolve(__dirname, '../public')));

// uploads a new script
app.post('/api/script', scriptController.saveScript, scriptController.importScript, (req, res) => {
  return res.status(201).json({ id: res.locals.id, title: res.locals.title });
});

// returns a list of all the script titles
app.get('/api/scripts/title', scriptController.getScriptTitles, (req, res) => {
  return res.status(200).json(res.locals.scriptTitles);
});

// returns the script text as a nested array
app.get('/api/script/:scriptId', scriptController.getScript, (req, res) => {
  return res.status(200).json(res.locals.scriptText);
});

// deletes a script
app.delete('/api/script/:scriptId', scriptController.deleteScript, (req, res) => {
  return res.status(200).json(res.locals.deletedScript);
});

// return the character data
// can also be used with an actor=id query to get just the characters assigned to that actor
app.get('/api/characters/:scriptId', characterController.getCharacters, (req, res) => {
  return res.status(200).json(res.locals.characters);
});

// assigns a character to an actor
app.post('/api/characters/:scriptId/assignCharacter', characterController.assignCharacter, (req, res) => {
  return res.status(200).json(res.locals.assignedCharacter);
});

// get a list of all the actors
app.get('/api/actors', actorController.getActors, (req, res) => {
  return res.status(200).json(res.locals.actors);
});

// add a new actor to the db, return the actor object
app.post('/api/actors', actorController.newActor, (req, res) => {
  return res.status(201).json(res.locals.actor);
});

// delete an actor from the database based on their id
app.delete('/api/actors/:actorId', actorController.deleteActor, (req, res) => {
  return res.status(200).json(res.locals.deletedActor);
});

// Entire application uses client side routing origination in index.html, so all unhandled routes are handled through React Router
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

// unknown route handler
app.use((req, res) => res.sendStatus(404));

// middleware error handler
app.use((err, req, res, next) => {
  const defaultErr = {
    log: { err: `An error occurred. ${err.log ? err.log : err.message}` },
    status: 500,
    message: 'Express error handler caught unknown middleware error'
  };
  const errorObj = err instanceof ServerError ? err : defaultErr;
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

module.exports = app;
