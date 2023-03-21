const db = require('./database.js');

async function getId(scriptId, actorId) {
  const result = await db.query(
    `INSERT INTO read_position (actor_id, script_id, position)
     VALUES ($1, $2, 0)
     ON CONFLICT ON CONSTRAINT read_position_uq
         DO UPDATE SET actor_id = $1 -- need to do some update to allow us to return id
     RETURNING ID`,
    [actorId, scriptId]
  );

  return result.rows[0].id;
}

async function set(dotId, position) {
  await db.query(`UPDATE read_position SET position = $2 WHERE id = $1`, [dotId, position]);
}

async function getAll(scriptId) {
  const result = await db.query('SELECT id, actor_id, position FROM read_position WHERE script_id = $1', [scriptId]);

  return result.rows.map((dot) => ({
    id: dot.id,
    actorId: dot.actor_id,
    scriptId: scriptId,
    position: dot.position,
  }));
}

module.exports = { getId, set, getAll };
