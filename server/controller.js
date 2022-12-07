const characterData = require('../characterData.js');

const scriptController = {
  getCharacterData: (req, res, next) => {
    res.locals.characterData = characterData;
    return next();
  },
};

module.exports = scriptController;
