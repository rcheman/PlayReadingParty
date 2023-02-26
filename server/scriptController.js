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
    const { actor } = req.query;
    // skips to next middleware when there is a query parameter
    if (actor) {
      return next();
    }
    res.locals.characterData = playData[title].characterObjs;
    res.locals.title = title;
    return next();
  },
};

module.exports = scriptController;
