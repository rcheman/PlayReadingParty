const fs = require('node:fs');
require('dotenv').config();

const playData = processScripts(process.env.UPLOADPATH);

function processScripts(uploadPath) {
  const scripts = {};
  const files = fs.readdirSync(uploadPath);
  files.forEach((filename) => {
    const file = fs.readFileSync(uploadPath + '/' + filename, 'utf8');
    const script = parseScript(file);
    scripts[script.title].fullPlay = script.fullPlay;
    scripts[script.title].characters = parseCharacters(file);
  });

  return scripts;
}

/*
TODO: Add handling for other script formats 

Currently we split line chunks on two new lines '\n\n' 
and identify character names based on a period after some all caps letters and then a new line 
ex: 'STEVE. \n My name is Steve and these are my lines.'

However, some plays are formatted where the do NOT have a new line after the character name 
ex:'BOB. My name is Bob and these are my lines.'

This format without the new line between character name and line means that the current algorithm can't identify character names or line counts.
*/

function parseScript(scriptText) {
  // Different character's lines are separated by double \n
  const lineChunks = scriptText.split('\n\n');
  const scriptData = {};
  // loop through the script and create character objects
  for (let lineChunk of lineChunks) {

    // Look for the script title if we haven't found it yet
    if (!scriptData.title) {
      const titlePrefix = 'Title:';

      if (lineChunk.startsWith(titlePrefix)) {
        scriptData.title = lineChunk.split('\n')[0].substring(0, titlePrefix.length).trim();
      }
    }
  }

  return lineChunks;
}

function parseCharacters(scriptText) {
  // Different character's lines are separated by double \n
  const lineChunks = scriptText.split('\n\n');
  const characters = {};
  // loop through the script and create character objects
  for (let lineChunk of lineChunks) {

    // A line chunk always starts with the character name followed by a period
    const name = lineChunk.split('.')[0];

    // check that the name is actually a name and not a different part of the play ex: ACT I
    if (!isName(name)) {
      continue;
    }

    // check if the character already has an object and add to that object
    if (!characters[name]) {
      characters[name] = new Character(name, 0, 0);
    }

    // minus one to account for the first line of the chunk that is just the name
    characters[name].lineCount += lineChunk.length - 1;
    characters[name].speakCount++;
  }

  return characters;
}

function isUppercase(str) {
  return str === str.toUpperCase();
}
// checks if a name is a valid name
function isName(name) {
  return isUppercase(name) && name.length > 1 && name.length < 20 && !name.match(/(ACT)/);
}
// character object constructor
function Character(name, lineCount, speakCount) {
  this.name = name;
  this.lineCount = lineCount;
  this.speakCount = speakCount;
}

module.exports = { Character, parseScript, parseCharacters };
