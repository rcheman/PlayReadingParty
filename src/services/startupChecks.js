require('dotenv').config();

const red = "\x1b[31m";
const bold = "\x1b[1m";
const reset = "\x1b[0m";

function assertEnvVarsPresent() {
  let variables = [
    'DATABASE_URI',
    'UPLOADPATH'
  ];

  // color codes for colored output in terminals
  let canStart = true;

  for (const variable of variables) {
    if (!process.env[variable]) {
      if (canStart === true) {
        console.log(`${bold}${red}!!! Refusing to start due to missing environment variables. Please add them to a .env file in the root of the project !!!${reset}`);
      }
      canStart = false;
      console.log(`  - Missing "${variable}" variable in .env file.`);
    }
  }

  if (!canStart) {
    process.exit(1);
  }
}

module.exports = { assert: assertEnvVarsPresent };