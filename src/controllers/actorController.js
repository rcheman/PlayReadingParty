const actorRepo = require('../repository/actorRepository.js');

const actorController = {
  newActor: async (req, res, next) => {
    const { name } = req.body;

    try {
      res.locals.actor = await actorRepo.newActor(name);
      return next();
    } catch (error) {
      return next({
        log: `error: ${error} occurred when adding actor to the db`,
        message: 'error in newActor in actorController',
      });
    }
  },

  getActors: async (req, res, next) => {
    try {
      res.locals.actors = await actorRepo.getActors();
      return next();
    } catch (error) {
      return next({
        log: `error: ${error} occurred when getting actors from the db.`,
        message: 'error in getActors in actorController',
      });
    }
  },
  deleteActor: async (req, res, next) => {
    const { actorId } = req.params;

    try {
      res.locals.deletedActor = await actorRepo.deleteActor(actorId);
      return next();
    } catch (error) {
      return next({
        log: `error: ${error} occurred when deleting actor from the db.`,
        message: 'error in deleteActor in actorController',
      });
    }
  },
};

module.exports = actorController;
