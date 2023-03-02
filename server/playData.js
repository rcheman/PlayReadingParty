const fs = require('node:fs');
const path = require('path');

const twelfthNightPath = '../playScript/twelfth_night.txt';
const testScriptPath = '../playScript/testPlay.txt';

const playData = {};

function parseScript(playPath, title) {
  const script = fs.readFileSync(path.resolve(__dirname, playPath), 'utf8');
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

    // get the character name and remove dot from the end
    let name = characterLines[0];
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

  function isUppercase(str) {
    return str === str.toUpperCase();
  }

  // checks if a name is a valid name
  function isName(name) {
    return isUppercase(name) && name.length > 1 && name.length < 15 && !name.match(/(ACT)/);
  }

  // character object constructor
  function Character(name, lineCount, speaksNum) {
    this.name = name;
    this.lineCount = lineCount;
    this.speaksNum = speaksNum;
  }
  scriptData.title = title;
  scriptData.fullPlay = fullPlay;
  scriptData.characterObjs = characterObjs;

  playData[scriptData.title] = scriptData;
}

const TestPlay = parseScript(testScriptPath, 'Test Play');
const TwelfthNight = parseScript(twelfthNightPath, 'Twelfth Night');

module.exports = { playData };
