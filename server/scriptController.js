const playData = require('../playData.js');
const db = require('./models/actorModels');

const scriptController = {
  getPlay: (req, res, next) => {
    // TODO change reference to testplay or twelfthNightplay
    const { title } = req.query;

    res.locals.fullPlay = playData[title].fullPlay;
    return next();
  },

  getCharacterData: (req, res, next) => {
    // TODO change reference to testplay or twelfthNightplay
    const { title } = req.query;
    res.locals.characterData = playData[title].characterObjs;
    return next();
  },
};

module.exports = scriptController;
