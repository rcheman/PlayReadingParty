const multer = require('multer');
const fs = require('node:fs');
require('dotenv').config();

const scriptRepo = require('../repository/scriptRepository.js');
const ServerError = require('../services/utils.js');

const scriptController = {
  getScriptTitles: async (req, res, next) => {
    try {
      res.locals.scriptTitles = await scriptRepo.getTitles();
      return next();
    } catch(error) {
      return next({
        log: `error: ${error} occurred when getting script titles`,
        message: 'error in getScriptTitles in scriptController',
      });
    }
  },

  getCharacters: async (req, res, next) => {
    const { actorId } = req.query;
    const { scriptId } = req.params;

    try {
      res.locals.characters = await scriptRepo.getCharacters(scriptId, actorId);
      return next();
    } catch (error) {
      return next({
        log: `error: ${error} occurred when getting actor's characters from the db.`,
        message: 'error in getActorCharacters in actorController.',
      });
    }
  },

  getScript: async (req, res, next) => {
    const { scriptId } = req.params;

    try {
      res.locals.scriptText = await scriptRepo.getScript(process.env.UPLOADPATH, scriptId);
      return next();
    } catch (error) {
      return next({
        log: `error: ${error} occurred when getting the script`,
        message: 'error when getting the script',
      });
    }
  },

  deleteScript: async (req, res, next) => {
    const { scriptId } = req.params;

    try {
      // delete the script from the db
      const filename = await scriptRepo.deleteScript(scriptId);
      // remove the local copy of the script
      await fs.unlinkAsync(process.env.UPLOADPATH + '/' + filename);
      return next();
    } catch (error) {
      return next({
        log: `error: ${error} occurred when getting the script`,
        message: 'error when deleting the script',
      });
    }

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
        return cb(new Error('File name is incorrectly formatted'), false);
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
  
  importScript: async (req, res, next) => {
    const path = process.env.UPLOADPATH + req.file.filename;

    try {
      const script = await scriptRepo.importScript(path);
      res.locals.id = script.id;
      res.locals.title = script.title;
      return next();
    } catch (error) {
      // remove the uploaded file because some error occurred while processing it
      await fs.unlinkAsync(path);
      // handles errors for duplicate script and unable to find a title
      if (error instanceof ServerError) {
        return next(error);
      } else {
        return next({
          log: `error: ${error} occurred when adding script to the database`,
          message: 'error when adding the script to the database',
        });
      }
    }
  },
};

module.exports = scriptController;
