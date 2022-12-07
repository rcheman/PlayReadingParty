const playData = require('../playData.js');
const db = require('./models/actorModels');

const scriptController = {
  newActor: (req, res, next) => {
    // req.body.fullname should be an array with first and last name
    const { firstName, lastName } = req.body;
    console.log(req.body);
    // add actor to the database
    // firstName = firstName.toLowercase();
    const values = [firstName.toLowerCase(), lastName.toLowerCase()];
    const text = `INSERT INTO actors 
      (first_name, last_name)
      VALUES ($1, $2)`;

    db.query(text, values)
      .then(() => {
        console.log('added actor to the db');
        return next();
      })
      .catch((error) => {
        return next({
          log: 'error in newActor in controller',
          message: `error: ${error} occured when adding actor to the db`,
        });
      });
  },

  getPlay: (req, res, next) => {
    res.locals.fullPlay = playData.fullPlay;
    return next();
  },
};

module.exports = scriptController;
