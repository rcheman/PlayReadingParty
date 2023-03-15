const actorRepo = require('../repository/actorRepository.js');

const actorController = {
  newActor: (req, res, next) => {
    const { name } = req.body;

    actorRepo.newActor(name)
      .then(() => {
        return next();
      })
      .catch((error) => {
        return next({
          log: `error: ${error} occurred when adding actor to the db`,
          message: 'error in newActor in actorController',
        });
      });
  },

  getActors: (req, res, next) => {
    actorRepo.getActors()
      .then((actors) => {
        res.locals.actors = actors;
        return next();
      })
      .catch((error) => {
        return next({
          log: `error: ${error} occurred when getting actors from the db.`,
          message: 'error in getActor in actorController',
        });
      });
  },
};

module.exports = actorController;
