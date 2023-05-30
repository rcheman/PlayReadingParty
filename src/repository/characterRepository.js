const db = require('./database');
const { Character } = require('../services/scriptParser');

/**
 * Get all the characters for the current script.
 * Also can get the characters for a specified actor
 * @param {string} scriptId ID of the selected script
 * @param {number} actorId optional: ID of the selected actor. Default value of -1 to allow SQL query even when no ID is given
 * @return {Promise<{Character}>} Character objects indexed by their id
 */
async function getCharacters(scriptId, actorId = -1) {
  const result = await db.query(
    `
      SELECT id, name, line_count, speaks_count, actor_id
      FROM characters
      WHERE ($1 = -1 or actor_id = $1)
        AND script_id = $2`,
    [actorId, scriptId]
  );
  const characters = {};
  result.rows.forEach((c) => characters[c.id.toString()] = new Character(c.name, c.line_count, c.speaks_count, c.id.toString(), c.actor_id));
  return characters;

}

/**
 * Assign a character to a specified actor.
 * @param {string} scriptId ID of the selected script
 * @param {number} characterId ID of the selected character that will be assigned
 * @param {number} actorId ID of the actor that the character will be assigned to
 * @return {Promise<boolean>} Whether on to the query went through
 */
async function assignCharacter(scriptId, characterId, actorId) {
  const result = await db.query(`
    UPDATE characters
    SET actor_id = $1
    WHERE script_id = $2 AND id = $3
    RETURNING *`,
    [actorId, scriptId, characterId]
  );
  return !!result.rows;
}

module.exports = { getCharacters, assignCharacter };
