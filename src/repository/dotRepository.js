const db = require('./database.js');

/**
 * Get ID for a progress dot, creates one if it does not already exist
 * @param {number} scriptId ID of the script that the dot belongs to
 * @param {number} actorId ID of the actor that the dot belongs to
 * @return {Promise<number>} ID of the progress dot
 */
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

/**
 * Update the position of the progress dot
 * @param {number} dotId ID of the progress dot
 * @param {number} position New position of the progress dot
 */
async function set(dotId, position) {
  await db.query(`UPDATE read_position SET position = $2 WHERE id = $1`, [dotId, position]);
}

/**
 * Get all the progress dots for the specified script
 * @param {number} scriptId ID of the script
 * @return {Promise<Array.<Dot>>} Array of all progress dots for the specified script
 */
async function getAll(scriptId) {
  const result = await db.query('SELECT id, actor_id, position FROM read_position WHERE script_id = $1', [scriptId]);

  return result.rows.map((dot) => (new Dot(dot.id, dot.actor_id, scriptId, dot.position)));
}

class Dot {
  /**
   * @param {number} id ID of the progress dot
   * @param {number} actorId ID of the actor associated with the dot
   * @param {number} scriptId ID of the selected script
   * @param {number} position Current position of the dot
   */
  constructor(id, actorId, scriptId, position) {
    this.id = id;
    this.actorId = actorId;
    this.scriptId = scriptId;
    this.position = position;
  }
}

module.exports = { getId, set, getAll };
