const path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('node:fs'));

const ServerError = require('../services/utils');
const db = require('./database.js');
const { parseTitle, parseLines, parseCharacters } = require('../services/scriptParser.js');

//TODO: Rethink naming to clarify between the Script object that has just title and name, and the script array of strings.
// This affects naming confusion in the server and on the frontend as well.

/**
 * get all the script titles
 * @return {Promise<Array.<Script>>}
 */
async function getTitles() {
  const result = await db.query('select id, title from scripts');

  return result.rows.map((s) => (new Script(s.id, s.title)));
}

/**
 * get the specified script
 * @param {string} scriptDir The path for the script directory
 * @param {string} id The script ID
 * @return {Promise<Array<string>>} Script text chunked into sections
 */
async function getScript(scriptDir, id) {
  const result = await db.query(
    'select filename from scripts where id = $1 limit 1',
    [id]
  );

  const file = await fs.readFileAsync(scriptDir + '/' + result.rows[0].filename, 'utf8');
  return parseLines(file);
}

/**
 * delete the specified script
 * @param {string} id The script ID
 * @return {Promise<boolean>} Whether or not the query was successful
 */
async function deleteScript(id) {
  const result = await db.query('DELETE FROM scripts WHERE id = $1 RETURNING *;', [id]);
  return !!result;
}

/**
 * import the given script, parse it, and store it
 * @param {string} filepath The filepath where the new script is located
 * @return {Promise<Script>} Object containing the script's id and title
 */
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

  return new Script(scriptId, title);
}

class Script {
  /**
   * @param {number} id Unique script id
   * @param {string} title Script title
   */
  constructor(id, title) {
    this.id = id;
    this.title = title;
  }
}

module.exports = { getTitles, getScript, importScript, deleteScript };
