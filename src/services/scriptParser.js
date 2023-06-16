const ServerError = require('./utils');

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
    let name = lineChunk.split('.')[0];

    // Check for various honorific abbreviations
    if (name.match(/MR|MRS|MS|MISS|DR|JR|SR|PROF|REV|ST|COL|GEN|GOV|PRES|LT/)){
      name += lineChunk.split('.')[1]
    }

    // check that the name is actually a name and not a different part of the play ex: ACT I
    if (!isName(name)) {
      continue;
    }

    // check if the character already has an object and add to that object
    if (!characters[name]) {
      characters[name] = new Character(name, 0, 0);
    }

    // Check for "CHARACTERNAME. Start of lines" or "CHARACTERNAME. \n Start of lines."
    // This determines if the first line should be counted or not.
    const firstLine = lineChunk.split('\n')[0]
    if (firstLine.length > name.length){
      characters[name].lineCount += lineChunk.split('\n').length
    } else {
      // minus one to account for the first line of the chunk that is just the name
      characters[name].lineCount += lineChunk.split('\n').length - 1;
    }
    characters[name].speakCount++;
  }

  // Remove any characters who have a lineCount of 0, they were wrongly identified
  for (let key in characters) {
    if (characters[key].lineCount < 1) {
      delete characters[key]
    }
  }

  return characters
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
function isName(name) {
  return isUppercase(name) && name.length > 1 && name.length < 30 && !name.match(/(ACT|SCENE|START|THE PERSONS OF THE PLAY|EPILOGUE|THEATRE)/);
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
