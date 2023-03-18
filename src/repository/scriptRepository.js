const path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('node:fs'));

const ServerError = require('../utils');
const db = require('./database.js');
const { Character, parseTitle, parseLines, parseCharacters } = require('../services/scriptParser.js');

function getCharacters(title, actorId = -1) {
  const values = [actorId, title];
  const sql = `
      SELECT c.id as id, c.name as name, line_count, speaks_count
      FROM characters c
               JOIN scripts s ON script_id = s.id
      WHERE ($1 = -1 or actor_id = $1)
        AND s.title = $2`;

  return db.query(sql, values).then((result) => {
    return result.rows.map((c) => new Character(c.name, c.line_count, c.speaks_count));
  });
}

function getTitles() {
  return db.query('select id, title from scripts').then((result) => {
    return result.rows.map((s) => ({
      id: s.id,
      title: s.title,
    }));
  });
}

function getScript(scriptDir, title) {
  return db
    .query('select filename from scripts where title = $1 limit 1', [title])
    .then((result) => {
      return fs.readFileAsync(scriptDir + '/' + result.rows[0].filename, 'utf8');
    })
    .then(parseLines);
}
function deleteScript(title) {
  return db.query('DELETE FROM scripts WHERE title = $1 RETURNING filename;', [title])
    .then((result) => {
      return result.rows[0].filename;
    })
}

function importScript(filepath) {
  let title;
  let characters;

  // Add script and characters if it doesn't already exist
  return fs
    .readFileAsync(filepath, 'utf8')
    .then((file) => {
      title = parseTitle(file);
      characters = parseCharacters(file);

      return db.query(`SELECT 'found' FROM scripts WHERE title = $1`, [title]);
    })
    .then((result) => {
      if (result.rows.length > 0) {
        throw new ServerError(409, 'Script title already exists');
      }

      return db.query('INSERT INTO scripts (title, filename) VALUES ($1, $2) RETURNING id', [
        title,
        path.basename(filepath),
      ]);
    })
    .then((result) => {
      // Build out the arrays of column values, so we can insert all characters in one query
      scriptId = result.rows[0].id;
      const names = [];
      const counts = [];
      const speakNums = [];
      for (let char of Object.values(characters)) {
        names.push(char.name);
        counts.push(char.lineCount);
        speakNums.push(char.speakCount);
      }
      // add all the characters to the database
      let text = `INSERT INTO characters (script_id, name, line_count, speaks_count) 
          VALUES ($1, UNNEST($2::TEXT[]), UNNEST($3::INTEGER[]),UNNEST($4::INTEGER[]))`;

      return db.query(text, [scriptId, names, counts, speakNums]);
    })
    .then(() => {
      return title; // The title of the newly added script
    });
}


module.exports = { getCharacters, getTitles, getScript, importScript, deleteScript };
