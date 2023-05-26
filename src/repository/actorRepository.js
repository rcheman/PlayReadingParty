const db = require('./database.js');

/**
 * Add a new actor to the database
 * @param {string} name User entered actor name
 * @return {Promise<Actor>} The new actor object
 */
async function newActor(name) {
  const result = await db.query(`INSERT INTO actors (name) VALUES ($1) RETURNING ID`, [name.trim()]);

  return new Actor(result.rows[0].id, name);
}

/**
 * Get all the actors from the database
 * @return {Promise<Array.<Actor>>} Array of all the actor's
 */
async function getActors() {
  const result = await db.query('SELECT * FROM actors');

  return result.rows.map((actor) => (new Actor(actor.id, actor.name)));
}

/**
 * Delete a single actor from the database
 * @param {number} id ID of the actor to delete
 * @return {Promise<boolean>} Whether the query went through
 */
async function deleteActor(id) {
  const result = await db.query(`DELETE FROM actors WHERE id = $1 RETURNING *`, [id]);
  return !!result;
}

/** Actor Class */
class Actor {
  /**
   * @param {number} id Unique actor ID
   * @param {string} name Actor name
   */
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}

module.exports = { newActor, getActors, deleteActor };
