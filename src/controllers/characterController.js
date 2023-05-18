const characterRepo = require('../repository/characterRepository');
const characterController = {
  getCharacters: async (req, res, next) => {
    const { actorId } = req.query;
    const { scriptId } = req.params;

    try {
      res.locals.characters = await characterRepo.getCharacters(scriptId, actorId);
      return next();
    } catch (error) {
      return next({
        log: `error: ${error} occurred when getting actor's characters from the db.`,
        message: 'error in getActorCharacters in actorController.'
      });
    }
  },
  assignCharacter: async (req, res, next) => {
    const { scriptId } = req.params;
    const { actorId, characterId } = req.body;
    try {
      res.locals.assignedCharacter = await characterRepo.assignCharacter(scriptId, characterId, actorId);
      return next();
    } catch (error) {
      return next({
        log: `error: ${error} occurred when assigning a character to an actor.`,
        message: `error in addCharacter in actorController.`
      });
    }

  }
};

module.exports = characterController;