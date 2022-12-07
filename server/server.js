const express = require('express');
const path = require('path');
const scriptController = require('./controller.js');

const app = express();

const PORT = 3000;

// parse the request body
app.use(express.json());

// handle requests for static files
app.use(express.static(path.resolve(__dirname, '../public')));

app.get('/script', scriptController.getCharacterData, (req, res) => {
  return res.status(200).json(res.locals.characterData);
});

// unknown rout handler
app.use((req, res) => res.sendStatus(404));

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

module.exports = app;
