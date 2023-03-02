const playData = require('./playData.js');
const db = require('./models/actorModels');

const scriptController = {
  getPlay: (req, res, next) => {
    const { title } = req.params;
    res.locals.fullPlay = playData[title].fullPlay;
    return next();
  },
  getScriptTitles: (req, res, next) => {
    // get all the script titles from the database
    db.query('SELECT title FROM scripts')
      .then((scriptTitles) => {
        res.locals.scriptTitles = [];
        scriptTitles.rows.forEach((script) => {
          res.locals.scriptTitles.push(script.title);
        });
        return next();
      })
      .catch((error) => {
        return next({
          log: `error: ${error} occured when getting script titles`,
          message: 'error in getScriptTitles in scriptController' ,
        });
      });
  },
};

module.exports = scriptController;
