const db = require('./database.js');

function newActor(name) {
  return db.query(`INSERT INTO actors (name) VALUES ($1)`, [name.trim()]);
}

function getActors() {
  return db.query('SELECT * FROM actors').then((result) => {
    return result.rows.map((actor) => ({
      id: actor.id,
      name: actor.name,
    }));
  });
}

module.exports = { newActor, getActors };
