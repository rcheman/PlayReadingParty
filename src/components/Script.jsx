import React, { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import ActorScriptNav from './actorScriptNav';
import ReadingDots from './ReadingDots';
import Header from './Header';
import { getActors, getScript } from './api';

/**
 * React Router loader for the Script page, load the actor names and script titles
 * @param {URLSearchParams} params The URL parameter from React Router
 * @param {string} params.scriptId The script ID
 * @returns {Promise<Object>} Either returns the loaded data or empty objects and the Script ID.
 * @returns {Array.<Actor>|{}} Object.loadedActors
 * @returns {Array.<string>|{}} Object.loadedScript The entire script text chunked into sections
 * @returns {scriptId: String} Object.scriptId
 */
export async function loader({ params }) {
  const scriptId = params.scriptId;
  const [loadedActors, loadedScript] = await Promise.all([getActors(), getScript(scriptId)]);
  if (loadedActors.success && loadedScript.success) {
    return {loadedActors: loadedActors.data, loadedScript: loadedScript.data, scriptId};
  } else {
    console.error(loadedActors.data, loadedScript.data, scriptId);
    return {loadedActors: {}, loadedScript: {}, scriptId};
  }
}

/**
 * Component containing the entire script page, linked to from the ScriptNav component 'Open Script' button
 * @return {JSX.Element} React Component Script
 * @constructor
 */
const Script = () => {
  const { loadedActors, loadedScript, currentScriptId } = useLoaderData();
  const [currentActor, setCurrentActor] = useState({});
  const [currentCharacters, setCurrentCharacters] = useState([]);

  // create div and p elements for each chunk of lines
  const lineChunks = [];
  const characterSet = new Set(currentCharacters);

  // NOTE: Currently using Object.entries for performance purposes, potentially look into benchmarking other iterative approaches
  for (let [i, lineChunk] of Object.entries(loadedScript)) {
    // checks if the character name for this chunk is the name of a character assigned to the current actor
    // remove the dot because some scripts have a dot after the name of the character, ie VIOLA.
    const name = lineChunk.split('.')[0];
    if (characterSet.has(name)) {
      lineChunks.push(<pre className='currentActor' key={`chk-${i}`}>{lineChunk}</pre>);
    } else {
      lineChunks.push(<pre key={`chk-${i}`}>{lineChunk}</pre>);
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
