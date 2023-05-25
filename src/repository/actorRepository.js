const db = require('./database.js');

/**
 * @typedef Actor
 * @property {number} id Database generated id
 * @property {string} name User entered Actor name
 */

/**@module actorRepo */


/**
 * Add a new actor to the database
 * @param {string} name User entered actor name
 * @return {Promise<Actor>}
 */
async function newActor(name) {
  const result = await db.query(`INSERT INTO actors (name) VALUES ($1) RETURNING ID`, [name.trim()]);

  return { id: result.rows[0].id, name };
}

/**
 * Get all the actors from the database
 * @return {Promise<Array.<Actor>>}
 */
async function getActors() {
  const result = await db.query('SELECT * FROM actors');

  return result.rows.map((actor) => ({ id: actor.id, name: actor.name }));
}

/**
 * Delete a single actor from the database
 * @param {number} id
 * @return {Promise<Actor>}
 */
async function deleteActor(id) {
  const result = await db.query(`DELETE FROM actors WHERE id = $1 RETURNING *`, [id]);
  return result.rows[0];
}

module.exports = { newActor, getActors, deleteActor };
