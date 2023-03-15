const multer = require('multer');
const db = require('../repository/database.js');
const { playData, parseScript } = require('../playData.js');
require('dotenv').config();

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
          log: `error: ${error} occurred when getting script titles`,
          message: 'error in getScriptTitles in scriptController',
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
  parseScript: (req, res, next) => {
    // run the script through playData and save the results to the database
    const path = process.env.UPLOADPATH + req.file.filename;
    const scriptData = parseScript(path);
    playData[scriptData.title] = scriptData;
    const characterObjects = Object.values(scriptData.characterObjs);

    // check if the script already exists
    db.query(`SELECT 'found' FROM scripts WHERE title=$1`, [scriptData.title])
      .then((result) => {
        if (result.rows.length > 0) {
          throw new Error('Script title already exists');
        }
        // script is not in the database, add it
        else {
          return db.query('INSERT INTO scripts (title, filename) VALUES ($1, $2) RETURNING id', [
            scriptData.title,
            req.file.filename,
          ]);
        }
      })
      .then((result) => {
        const id = result.rows[0].id;
        return id;
      })
      .then((id) => {
        // Build out the arrays of column values so we can insert all characters in one query
        const names = [];
        const counts = [];
        const speakNums = [];
        for (let char of characterObjects) {
          names.push(char.name);
          counts.push(char.lineCount);
          speakNums.push(char.speakCount);
        }
        // add all the characters to the database
        let text = `INSERT INTO characters (script_id, name, line_count, speaks_count) 
          VALUES ($1, UNNEST($2::TEXT[]), UNNEST($3::INTEGER[]),UNNEST($4::INTEGER[]))`;

        return db.query(text, [id, names, counts, speakNums]);
      })
      .then(() => {
        res.locals.title = scriptData.title;
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
