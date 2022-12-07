const characterData = require('../characterData.js');
const db = require('./models/actorModels');

const scriptController = {
  getCharacterData: async (req, res, next) => {
    return next();
  },
};

module.exports = scriptController;
