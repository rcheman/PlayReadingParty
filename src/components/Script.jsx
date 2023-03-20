import React, { useState, useEffect } from 'react';
import ActorScriptNav from './actorScriptNav';

const Script = ({ actors, currentScript }) => {
  const [script, setScript] = useState([]);
  const [currentActor, setCurrentActor] = useState({});
  const [currentCharacters, setCurrentCharacters] = useState([]);

  // fetch the specified script
  useEffect(() => { (async () => { // useEffect cannot take an async function. Must wrap async in regular function
    try {
      const response = await fetch('/script/' + currentScript);

      if (response.ok) {
        setScript(await response.json());
      } else {
        console.error(`server error: ${response.body} when fetching script`);
      }
    } catch (error) {
      console.error(`network error: ${error} when fetching script`);
    }
  })();}, [currentScript]);

  // create div and p elements for each chunk of lines
  const lineChunks = [];
  const characterSet = new Set(currentCharacters);

  for (let [i, lineChunk] of Object.entries(script)) {
    // checks if the character name for this chunk is the name of a character assigned to the current actor
    // remove the dot because some scripts have a dot after the name of the character, ie VIOLA.
    const name = lineChunk.split('.')[0];
    if (characterSet.has(name)) {
      lineChunks.push(<pre className='currentActor' key={`chk-${i}`}>{lineChunk}</pre>);
    } else {
      lineChunks.push(<pre key={`chk-${i}`}>{lineChunk}</pre>
      );
    }
  }

  return (
    <div id="scriptPage" key="scriptWrapper">
      <ActorScriptNav
        actors={actors}
        setCurrentActor={setCurrentActor}
        setCurrentCharacters={setCurrentCharacters}
        currentScript={currentScript}
        key="ActorScriptNav"
      />
      <h2>script</h2>
      <h5>Current Actor: {currentActor.name}</h5>
      <div id="scriptDiv">{lineChunks}</div>
    </div>
  );
};

export default Script;
