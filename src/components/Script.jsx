import React, { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import ActorScriptNav from './actorScriptNav';
import ReadingDots from './ReadingDots';
import Header from './Header';
import { getActors, getScript } from './api';

// Load the actor names and script titles on page load. Returns currentScriptId id to pass on.
export async function loader({ params }) {
  const currentScriptId = params.scriptId;
  const [loadedActors, loadedScript] = await Promise.all(
    [getActors(), getScript(currentScriptId)]);
  if (loadedActors.success && loadedScript.success) {
    return { loadedActors: loadedActors.data, loadedScript: loadedScript.data, currentScriptId };
  } else {
    console.error(loadedActors.data, loadedScript.data);
    // We return empty objects when there is an error because it makes it easier to trace back the error
    return { loadedScript: {}, loadedActors: {}, currentScriptId };
  }
}

const Script = () => {
  const { loadedActors, loadedScript, currentScriptId } = useLoaderData();
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
    <React.StrictMode>
      <div id='scriptPage' className='column' key='scriptWrapper'>
        <Header currentScriptId={currentScriptId} />
        <ActorScriptNav
          actors={loadedActors}
          setCurrentActor={setCurrentActor}
          setCurrentCharacters={setCurrentCharacters}
          currentScriptId={currentScriptId}
          key='ActorScriptNav'
        />
        <h2>Script</h2>
        <h5>Current Actor: {currentActor.name}</h5>
        <div style={{ display: 'flex', width: '100%' }}>
          <div id='scriptDiv'>
            <div>
              {lineChunks}
            </div>
          </div>
          <ReadingDots actors={loadedActors} currentActor={currentActor} currentScriptId={currentScriptId}
                       key='ReadingDots' />
        </div>
      </div>
    </React.StrictMode>
  );
};

export default Script;
