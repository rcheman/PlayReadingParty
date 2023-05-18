const db = require('./database');
const { Character } = require('../services/scriptParser');

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

};

async function assignCharacter(scriptId, characterId, actorId) {
  return await db.query(`
    UPDATE characters
    SET actor_id = $1
    WHERE script_id = $2 AND id = $3
    RETURNING *`,
    [actorId, scriptId, characterId]
  );
};

module.exports = { getCharacters, assignCharacter };