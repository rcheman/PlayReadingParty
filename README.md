![logo](public/logo/500pxplay-reading-party-high-resolution-logo-white-on-black-background.png)

# Play Reading Party

### Sometimes you just want to read a play with your friends and use silly accents, but it can be challenging to figure out who all the characters are and which of you should be Lord Darlington and who should be the The Duchess of Berwick. On top of that, if there are only a few of you and many characters, it can be hard to remember if you are also Messenger 1 who has just entered the scene. Play Reading Party is the solution to that problem, allowing you to read plays with your friends and see exactly which characters you are as you read along.

## Getting Started

To get a local copy up and running, follow these steps

### Prerequisites

- Install npm
  ([How to install Node and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm))
- Install podman ([How to install Podman](https://podman.io/getting-started/installation))
  - If you prefer, you can use Docker instead of podman and replace podman with Docker in the package.json scripts.

### Installation

1. Clone the repo
2. Install NPM packages and build: `npm install && npm run build`
3. Set up environment variables
   - Create a .env file in the root directory of the project
   - Add the path for where you want script files to be stored after they have been uploaded by the user
     ```
     UPLOADPATH=/example/path/scriptUploads
     ```
   - Add a database uri for your postgres database
     ```
     DATABASE_URI='postgresql://playreading:pass@localhost/playreadingparty'
     ```
4. Run `npm start` to start Play Reading Party.
5. Navigate to http://localhost:3000 in your browser
