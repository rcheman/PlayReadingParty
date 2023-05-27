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

/**
 * Identify the title within the script
 * @param {string} scriptText The entire play script
 * @return {string} The script title
 * @throws {ServerError} Throws an error if it can't find a title
 */
function parseTitle(scriptText) {
  const matches = scriptText.match(/^Title: (.+)$/m);
  if (matches !== null && matches.length === 2) {
    return matches[1]; // Return just the title itself
  }

  throw new ServerError(452, 'Could not identify a title in the script');
}

/**
 * Split up the play script based on a double new line
 * @param {string} scriptText The entire play script
 * @return {Array.<string>} Script chunked into sections
 */
function parseLines(scriptText) {

  return scriptText
    .replaceAll('\r\n', '\n') // Convert any windows style newlines (CRLF) to unix style (LF)
    .split('\n\n'); // Different character's lines are separated by double \n
}

/**
 * Identify the characters in the script and count their lines
 * @param {string} scriptText The entire play script
 * @return {Object.<Character>} characters Object containing Character objects for each character in the play. Indexed by the character's name
 */
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

/**
 * Check if a potential name is all uppercase
 * @param {string} name a string that may be a character name
 * @return {boolean}
 */
function isUppercase(name) {
  return name === name.toUpperCase();
}

/**
 * Check if a name is valid
 * @param {string} name the string that comes before the first dot '.' in a section and may be a character name
 * @return {boolean}
 */
// TODO also exclude 'SCENE'
function isName(name) {
  return isUppercase(name) && name.length > 1 && name.length < 20 && !name.match(/(ACT)/);
}

class Character {
  /**
   * Construct a Character object
   * @param {string} name  character's name
   * @param {number} lineCount character's total lines
   * @param {number} speakCount total for how many times the character starts talking
   * @param {number | null} id id from the database
   * @param {number | null} actorId the id of the actor who is assigned to this character
   */
  constructor(name, lineCount, speakCount, id = null, actorId = null) {
    this.name = name;
    this.lineCount = lineCount;
    this.speakCount = speakCount;
    this.id = id;
    this.actorId = actorId;
  }
}

module.exports = { Character, parseTitle, parseLines, parseCharacters };
