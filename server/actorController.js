const db = require('./models/actorModels');
const playData = require('./playData');

const actorController = {
  newActor: (req, res, next) => {
    const { firstName, lastName } = req.body;
    // add actor to the database
    const values = [firstName.trim(), lastName.trim()];
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
        res.locals.actorList = actorList.rows.map(
          (actor) =>
            (actor = {
              firstName: actor.first_name,
              lastName: actor.last_name,
              id: actor.id,
            })
        );
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
    const { title } = req.params;

    // Returns the entire character list if there isn't a query
    if (!actor) {
      res.locals.characterData = Object.values(playData[title].characterObjs);
      return next();
    }
    let characterdb;
    if (title === 'test') {
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

    const characterData = [];
    db.query(text, values)
      .then((actorCharacters) => {
        // filter out the characters from the character data based on what characters are assigned to the actor
        for (let i = 0; i < actorCharacters.rows.length; i++) {
          let assignedCharacter =
            playData[title].characterObjs[
              actorCharacters.rows[i].charactername
            ];
          if (assignedCharacter) {
            characterData.push(assignedCharacter);
          }
        }
        res.locals.characterData = characterData;
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
