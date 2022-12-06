const fs = require('fs');
const path = require('path');

const script = fs.readFileSync(
  path.resolve(__dirname, './script/twelfth_night.txt'),
  'utf8'
);

const characterObjs = {};

// Split script on double \n to get individual
const splitLines = script.split('\n\n');

// loop through the script and create character objects
for (let i = 0; i < splitLines.length; i++) {
  // split lines further to character lines
  const characterLines = splitLines[i].split('\n');

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
      characterObjs[name].lineCount += count;
    } else {
      // create character object
      characterObjs[name] = new Character(name, count, 1);
    }
  }
}

function isUppercase(str) {
  return str === str.toUpperCase();
}

// checks if a name is a valid name
function isName(name) {
  return (
    isUppercase(name) &&
    name.length > 1 &&
    name.length < 15 &&
    !name.match(/(ACT)/)
  );
}

// character object constructor
function Character(name, lineCount, speaksNum) {
  this.name = name;
  this.lineCount = lineCount;
  this.speaksNum = speaksNum;
}

module.exports = characterObjs;
