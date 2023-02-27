const db = require('./models/actorModels');
const playData = require('./playData');

const actorController = {
  newActor: (req, res, next) => {
    const { name } = req.body;
    const values = [name.trim()];

    // add actor to the database
    db.query(`INSERT INTO actors (name) VALUES ($1)`, values)
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
    db.query('SELECT * FROM actors')
      .then((actorList) => {
        res.locals.actorList = actorList.rows.map(
          (actor) => ({
              id: actor.id,
              name: actor.name,
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

    const values = [actor, title];
    const sql = `
      SELECT c.name as name
      FROM actors
        JOIN characters c ON actors.id = c.actor_id
        JOIN scripts s ON s.id = c.script_id
      WHERE actors.id = $1
        AND s.title = $2`; // todo use script id instead of title

    res.locals.characterData = [];
    db.query(sql, values)
      .then((actorCharacters) => {
        // filter out the characters from the character data based on what characters are assigned to the actor
        for (let i = 0; i < actorCharacters.rows.length; i++) {
          let assignedCharacter = playData[title].characterObjs[actorCharacters.rows[i].name];
          if (assignedCharacter) {
            res.locals.characterData.push(assignedCharacter);
          }
        }
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
