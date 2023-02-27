const playData = require('./playData.js');

const scriptController = {
  getPlay: (req, res, next) => {
    const { title } = req.params;
    res.locals.fullPlay = playData[title].fullPlay;
    return next();
  },
};

module.exports = scriptController;
