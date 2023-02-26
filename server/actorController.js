const db = require('./models/actorModels');

const actorController = {
  newActor: (req, res, next) => {
    const { firstName, lastName } = req.body;
    // add actor to the database
    const values = [firstName, lastName];
    const text = `INSERT INTO actors 
          (first_name, last_name)
          VALUES ($1, $2)`;

    db.query(text, values)
      .then(() => {
        return next();
      })
      .catch((error) => {
        return next({
          log: 'error in newActor in actorController',
          message: `error: ${error} occured when adding actor to the db`,
        });
      });
  },

  getActors: (req, res, next) => {
    // query the db to get a list of all the actors
    const text = `SELECT * FROM actors`;
    db.query(text)
      .then((actorList) => {
        res.locals.actorList = actorList.rows;
        return next();
      })
      .catch((error) => {
        return next({
          log: 'error in getActor in actorController',
          message: `error: ${error} occured when getting actors from the db.`,
        });
      });
  },

  getActorCharacters: (req, res, next) => {
    const { actor } = req.query;
    // skips over this middleware when there isn't a query
    if (!actor) {
      return next();
    }
    let characterdb;
    if (res.locals.title === 'test') {
      characterdb = 'test_characters';
    } else {
      characterdb = 'characters';
    }
    const values = [actor];
    const text = `SELECT c.name as characterName
    FROM actors
    LEFT JOIN ${characterdb} c
    ON actors.id=c.actor_id
    WHERE actors.id=$1`;

    db.query(text, values)
      .then((characterList) => {
        res.locals.currentCharactersList = characterList.rows;
        return next();
      })
      .catch((error) => {
        return next({
          log: 'error in getActorCharacters in actorController.',
          message: `error: ${error} occured when getting actor's characters from the db.`,
        });
      });
  },
};

module.exports = actorController;
