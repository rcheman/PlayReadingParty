const fs = require('node:fs');
require('dotenv').config();

const playData = processScripts(process.env.UPLOADPATH);

function processScripts(uploadPath) {
  const scripts = {};
  const files = fs.readdirSync(uploadPath);
  files.forEach((file) => {
    const path = uploadPath + file;
    const temp = parseScript(path);
    scripts[temp.title] = temp;
  });

  return scripts;
}

// TODO: Add handling for other script formats ex: CHARACTERNAME. these are lines of text.
//  currently only support CHARACTERNAME. \n these are lines of text
//  similarly for splitting line chunks

function parseScript(playPath) {
  const script = fs.readFileSync(playPath, 'utf8');
  // Split script on double \n to get individual
  const splitLines = script.split('\n\n');
  const fullPlay = [];
  const characterObjs = {};
  const scriptData = {};
  // loop through the script and create character objects
  for (let i = 0; i < splitLines.length; i++) {
    // split lines further to character lines
    const characterLines = splitLines[i].split('\n');
    fullPlay.push(characterLines);

    let firstLine = characterLines[0];
    // get the script title from the text file
    // only check for a title if there hasn't been one assigned
    if (!scriptData.title) {
      const words = firstLine.split(' ');
      if (words[0] === 'Title:') {
        scriptData.title = words.slice(1).join(' ');
      }
    }

    // get the character name and remove dot from the end
    let name = firstLine;
    name = name.replace('.', '');
    // check that the name is actually a name and not a different part of the play ex: ACT I
    if (isName(name)) {
      // count lines for the current character chunk
      let count = 0;
      for (let line in characterLines) {
        count++;
      }
      // check if the character already has an object and add to that object
      if (characterObjs[name]) {
        characterObjs[name].speaksNum++;
        // minus one to account for the first line that is just the name
        characterObjs[name].lineCount += count - 1;
      } else {
        // create character object
        characterObjs[name] = new Character(name, count - 1, 1);
      }
    }
  }
  // save the full play and character objects to return out
  scriptData.fullPlay = fullPlay;
  scriptData.characterObjs = characterObjs;

  return scriptData;
}

function isUppercase(str) {
  return str === str.toUpperCase();
}
// checks if a name is a valid name
function isName(name) {
  return isUppercase(name) && name.length > 1 && name.length < 20 && !name.match(/(ACT)/);
}
// character object constructor
function Character(name, lineCount, speaksNum) {
  this.name = name;
  this.lineCount = lineCount;
  this.speaksNum = speaksNum;
}

module.exports = { playData, parseScript };
