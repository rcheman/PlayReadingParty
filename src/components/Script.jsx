import React, { useState } from 'react';
import { useLoaderData} from 'react-router-dom';
import ActorScriptNav from './actorScriptNav';
import ReadingDots from './ReadingDots';
import Header from './Header';
import { getActors, getScript } from './api';

// Load the actor names and script titles on page load. Returns currentScript id to pass on.
export async function loader({ params }) {
  const currentScript = params.scriptId
  const [loadedActors, loadedScript] = await Promise.all(
    [getActors(), getScript(currentScript)])

  return { loadedActors, loadedScript, currentScript }
}
const Script = () => {
  const { loadedActors, loadedScript, currentScript } = useLoaderData()
  const [currentActor, setCurrentActor] = useState({});
  const [currentCharacters, setCurrentCharacters] = useState([]);

  // create div and p elements for each chunk of lines
  const lineChunks = [];
  const characterSet = new Set(currentCharacters);

  for (let [i, lineChunk] of Object.entries(loadedScript)) {
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
      <Header />
      <ActorScriptNav
        actors={loadedActors}
        setCurrentActor={setCurrentActor}
        setCurrentCharacters={setCurrentCharacters}
        currentScript={currentScript}
        key="ActorScriptNav"
      />
      <h2>Script</h2>
      <h5>Current Actor: {currentActor.name}</h5>
      <div style={{display:'flex', width:'100%'}}
      >
        <div id="scriptDiv">
          <div>
            {lineChunks}
          </div>
        </div>
        <ReadingDots actors={loadedActors} currentActor={currentActor} currentScript={currentScript} key="ReadingDots"/>
      </div>
    </div>
  );
};

export default Script;
