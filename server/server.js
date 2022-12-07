const express = require('express');
const path = require('path');

const app = express();

const PORT = 9500;

// parse the request body
app.use(express.json());

// handle requests for static files
app.use(express.static(path.resolve(__dirname, '../client')));

// app.use('/')

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

module.exports = app;
