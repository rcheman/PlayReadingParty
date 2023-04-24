const ServerError = require('./utils');
/*
TODO: Add handling for other script formats 

Currently we split line chunks on two new lines '\n\n' 
and identify character names based on a period after some all caps letters and then a new line 
ex: 'STEVE. \n My name is Steve and these are my lines.'

However, some plays are formatted where the do NOT have a new line after the character name 
ex:'BOB. My name is Bob and these are my lines.'

This format without the new line between character name and line means that the current algorithm can't identify character names or line counts.
*/

function parseTitle(scriptText) {
  const matches = scriptText.match(/^Title: (.+)$/m);
  if (matches !== null && matches.length === 2) {
    return matches[1]; // Return just the title itself
  }

  throw new ServerError(452, 'Could not identify a title in the script');
}

function parseLines(scriptText) {
  // Different character's lines are separated by double \n
  return scriptText.split('\n\n');
}

function parseCharacters(scriptText) {
  const lineChunks = parseLines(scriptText);
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
    characters[name].lineCount += lineChunk.split('\n').length - 1;
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
function Character(name, lineCount, speakCount, id= '0', actorId = '0') {
  this.name = name;
  this.lineCount = lineCount;
  this.speakCount = speakCount;
  this.id = id;
  this.actorId = actorId

}

module.exports = { Character, parseTitle, parseLines, parseCharacters };
