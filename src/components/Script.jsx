import React, { useState, useEffect } from 'react';
import ActorScriptNav from './actorScriptNav';

const Script = ({ actors, currentScript }) => {
  const [script, setScript] = useState([]);
  const [currentActor, setCurrentActor] = useState({});
  const [currentCharacters, setCurrentCharacters] = useState([]);

  // fetch the specified script
  // todo handle errors in .then(), otherwise when an error gets returned, interpreted as script text, and then
  // todo shows up on the page with every character of the string as its own line
  useEffect(() => {
    fetch('/script/' + currentScript)
      .then((response) => response.json())
      .then(setScript)
      .catch((error) => {
        console.error(`error: ${error} when fetching script`);
      });
  }, [currentScript]);

  // create div and p elements for each chunk of lines
  const lineChunks = [];
  const characterSet = new Set(currentCharacters);

  for (let lineChunk of script) {
    // checks if the character name for this chunk is the name of a character assigned to the current actor
    // remove the dot because some scripts have a dot after the name of the character, ie VIOLA.
    const name = lineChunk.split('.')[0];
    if (characterSet.has(name)) {
      lineChunks.push(<pre className='currentActor'>{lineChunk}</pre>);
    } else {
      lineChunks.push(<pre>{lineChunk}</pre>
      );
    }
  }

  return (
    <div id="scriptPage">
      <ActorScriptNav
        actors={actors}
        setCurrentActor={setCurrentActor}
        setCurrentCharacters={setCurrentCharacters}
        currentScript={currentScript}
      />
      <h2>script</h2>
      <h5>Current Actor: {currentActor.name}</h5>
      <div id="scriptDiv">{lineChunks}</div>
    </div>
  );
};

export default Script;
