const path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('node:fs'));

const ServerError = require('../services/utils');
const db = require('./database.js');
const { Character, parseTitle, parseLines, parseCharacters } = require('../services/scriptParser.js');

async function getCharacters(scriptId, actorId = -1) {
  const result = await db.query(
    `
      SELECT id, name, line_count, speaks_count
      FROM characters
      WHERE ($1 = -1 or actor_id = $1)
        AND script_id = $2`,
    [actorId, scriptId]
  );

  return result.rows.map((c) => new Character(c.name, c.line_count, c.speaks_count));
}

async function getTitles() {
  const result = await db.query('select id, title from scripts');

  return result.rows.map((s) => ({ id: s.id, title: s.title }));
}

async function getScript(scriptDir, id) {
  const result = await db.query(
    'select filename from scripts where id = $1 limit 1',
    [id]
  );

  const file = await fs.readFileAsync(scriptDir + '/' + result.rows[0].filename, 'utf8');
  return parseLines(file);
}

async function deleteScript(id) {
  const result = await db.query('DELETE FROM scripts WHERE id = $1 RETURNING filename;', [id]);

  return result.rows[0].filename;
}

async function importScript(filepath) {
  // Add script and characters if it doesn't already exist
  const file = await fs.readFileAsync(filepath, 'utf8');

  let title = parseTitle(file);
  let characters = parseCharacters(file);

  const titleResult = await db.query(`SELECT 'found' FROM scripts WHERE title = $1`, [title]);
  if (titleResult.rows.length > 0) {
    throw new ServerError(409, 'Script title already exists');
  }

  const scriptResult = await db.query(
    'INSERT INTO scripts (title, filename) VALUES ($1, $2) RETURNING id',
    [title, path.basename(filepath)]
  );

  // Build out the arrays of column values, so we can insert all characters in one query
  let scriptId = scriptResult.rows[0].id;
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

  await db.query(text, [scriptId, names, counts, speakNums]);

  return {id: scriptId, title}; // The id/title of the newly added script
}

module.exports = { getCharacters, getTitles, getScript, importScript, deleteScript };
