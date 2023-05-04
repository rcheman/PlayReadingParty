const db = require('./database.js');

async function newActor(name) {
  const result = await db.query(`INSERT INTO actors (name) VALUES ($1) RETURNING ID`, [name.trim()]);

  return { id: result.rows[0].id, name };
}

async function getActors() {
  const result = await db.query('SELECT * FROM actors');

  return result.rows.map((actor) => ({ id: actor.id, name: actor.name }));
}

async function deleteActor(id) {
  return await db.query(`DELETE FROM actors WHERE id = $1 RETURNING *`, [id]);
}

module.exports = { newActor, getActors, deleteActor };
