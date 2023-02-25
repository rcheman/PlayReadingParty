const playData = require('./playData.js');
const db = require('./models/actorModels');

const scriptController = {
  getPlay: (req, res, next) => {
    const { title } = req.params;
    res.locals.fullPlay = playData[title].fullPlay;
    return next();
  },

  getCharacterData: (req, res, next) => {
    const { title } = req.params;
    res.locals.characterData = playData[title].characterObjs;
    return next();
  },
};

module.exports = scriptController;
