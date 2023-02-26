const db = require('./models/actorModels');

const actorController = {
  newActor: (req, res, next) => {
    // req.body.fullname should be an array with first and last name
    const { firstName, lastName } = req.body;
    // add actor to the database
    const values = [firstName.toLowerCase().trim(), lastName.toLowerCase().trim()];
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
    // TODO: add query property to change what table we are checking
    const { firstName, lastName, option } = req.params;
    let characterdb;
    if (option === 'test') {
      characterdb = 'test_characters';
    } else {
      characterdb = 'characters';
    }
    // TODO use actorID to refer to actors rather than by concatenating firstName and lastName
    const values = [firstName, lastName];
    const text = `SELECT c.name as characterName
    FROM actors
    LEFT JOIN ${characterdb} c
    ON actors.ID=c.actor_id
    WHERE first_name=$1 AND last_name=$2`;

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
