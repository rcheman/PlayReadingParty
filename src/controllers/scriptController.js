const multer = require('multer');
require('dotenv').config();

const scriptRepo = require('../repository/scriptRepository.js');

const scriptController = {
  getScriptTitles: (req, res, next) => {
    scriptRepo.getTitles()
      .then((scripts) => {
        res.locals.scriptTitles = scripts;
        return next();
      })
      .catch((error) => {
        return next({
          log: `error: ${error} occurred when getting script titles`,
          message: 'error in getScriptTitles in scriptController',
        });
      });
  },

  getCharacters: (req, res, next) => {
    const { actor } = req.query;
    const { title } = req.params;

    scriptRepo.getCharacters(title, actor)
      .then((characters) => {
        res.locals.characters = characters;
        return next();
      })
      .catch((error) => {
        return next({
          log: `error: ${error} occurred when getting actor's characters from the db.`,
          message: 'error in getActorCharacters in actorController.',
        });
      });
  },

  getScript: (req, res, next) => {
    const { title } = req.params; // todo script id

    scriptRepo.getScript(process.env.UPLOADPATH, title)
      .then((script) => {
        res.locals.fullPlay = script;
        next();
      })
      .catch((error) => {
        next({
          log: `error: ${error} occurred when getting the script`,
          message: 'error when getting the script',
        });
      });
  },

  saveScript: (req, res, next) => {
    const MAX_FILESIZE_BYTES = 50 * 1024 * 1024; //50MB. If updating, change constant in Upload.jsx too.

    // configure multer storage to upload files to the path from the .env file
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, process.env.UPLOADPATH);
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
      },
    });

    function fileFilter(req, file, cb) {
      // TODO: instead of erroring out on incorrect file names, change unaccepted symbols to something safe like an underscore
      const name = file.originalname;
      // check for invalid file names
      if (name.length < 100 && name.match(/^[a-zA-Z0-9](?:[a-zA-Z0-9 '._-]*[a-zA-Z0-9])?$/)) {
        // cb expects null and then a boolean for whether the file should be accepted. See multer docs on fileFilter for more info.
        return cb(null, true);
      } else {
        return cb(new Error('File name is incorrect format and file was not uploaded'));
      }
    }

    // limit file uploads to less than 50MB
    const limits = { fileSize: MAX_FILESIZE_BYTES };

    const upload = multer({ storage, limits, fileFilter });
    const scriptUpload = upload.single('scriptFormField');

    // actually upload the script
    scriptUpload(req, res, next, (error) => {
      if (error)
        return next({
          log: `error: ${error} occurred when uploading the script`,
          message: 'error when uploading the script',
        });
      else {
        return next();
      }
    });
  },
  importScript: (req, res, next) => {
    const path = process.env.UPLOADPATH + req.file.filename;

    scriptRepo.importScript(path)
      .then((title) => {
        res.locals.title = title;
        return next();
      })
      .catch((error) => {
        if (error.message === 'Script title already exists') {
          // the script is already in the database, send a conflict status
          return res.sendStatus(409);
        } else {
          return next({
            log: `error: ${error} occurred when adding script to the database`,
            message: 'error when adding the script to the database',
          });
        }
      });
  },
};

module.exports = scriptController;
