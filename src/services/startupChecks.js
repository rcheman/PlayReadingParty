require('dotenv').config();

// color codes for colored output in terminals
const red = "\x1b[31m";
const bold = "\x1b[1m";
const reset = "\x1b[0m";

/**
 * Check that the required environment variables are present when the server is starting.
 * If an environment variable is missing, log what variable is missing and stop the server
 */
function assertEnvVarsPresent() {
  let variables = [
    'DATABASE_URL',
    'UPLOADPATH'
  ];

  let hasMissingVar = false;

  for (const variable of variables) {
    if (!process.env[variable]) {
      if (!hasMissingVar) {
        console.log(`${bold}${red}!!! Refusing to start due to missing environment variables. Please add them to a .env file in the root of the project !!!${reset}`);
      }
      hasMissingVar = true;
      console.log(`  - Missing "${variable}" variable in .env file.`);
    }
  }

  if (hasMissingVar) {
    process.exit(1);
  }
}

module.exports = { assert: assertEnvVarsPresent };
