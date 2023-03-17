const db = require('./database.js');

function newActor(name) {
  return db.query(`INSERT INTO actors (name) VALUES ($1) RETURNING ID`, [name.trim()]).then((result) => {
    return { id: result.rows[0].id, name };
  });
}

function getActors() {
  return db.query('SELECT * FROM actors').then((result) => {
    return result.rows.map((actor) => ({
      id: actor.id,
      name: actor.name,
    }));
  });
}

function deleteActor(id) {
  return db.query(`DELETE FROM actors WHERE id = $1`, [id]);
}

module.exports = { newActor, getActors, deleteActor };
