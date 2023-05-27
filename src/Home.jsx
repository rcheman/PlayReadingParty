import React, { useState } from 'react';
import { useLoaderData } from 'react-router-dom';

import ScriptNav from './components/ScriptNav';
import Upload from './components/Upload';
import ActorList from './components/ActorList';
import AddActor from './components/AddActor';
import Header from './components/Header';
import { getActors, getScriptTitles } from './components/api';
import CharacterAssignment from './components/CharacterAssignment';

/**
 * React Router loader for the Home page, load the actor names and script titles
 * @param {URLSearchParams} params The URL parameter from React Router
 * @param {string} params.scriptId The script ID
 * @returns {Promise<Object>} Either returns the loaded data or empty objects and the Script ID.
 * @returns {Array.<Actor>|{}} Object.loadedActors
 * @returns {Array.<Script>|{}} Object.loadedScripts Array of Script objects that have an id and title
 * @returns {scriptId: String} Object.scriptId
 */
// Load the actor names and script titles on page load
export async function loader({ params }) {
  const scriptId = params.scriptId;
  const [loadedActors, loadedScripts] = await Promise.all([getActors(), getScriptTitles()]);
  if (loadedActors.success && loadedScripts.success) {
    return {loadedActors: loadedActors.data, loadedScripts: loadedScripts.data, scriptId};
  } else {
    console.error(loadedActors.data, loadedScripts.data, scriptId);
    return {loadedActors: {}, loadedScripts: {}, scriptId};
  }
}

/**
 * Component containing the entire home page, linked to from the Header button
 * @return {JSX.Element} React Component Home
 * @constructor
 */
const Home = () => {
  // With the loaded data, set the initial state for the actors and script list
  const { loadedActors, loadedScripts, scriptId } = useLoaderData();
  const [actors, setActors] = useState(loadedActors);
  const [scripts, setScripts] = useState(loadedScripts);
  const [currentScriptId, setCurrentScriptId] = useState(scriptId);

  return (
    <div id='home' className='column'>
      <React.StrictMode>
        <Header currentScriptId={currentScriptId} />
        <div className='row'>
          <ScriptNav setCurrentScriptId={setCurrentScriptId} currentScriptId={currentScriptId} scripts={scripts}
                     setScripts={setScripts} />
          <Upload setCurrentScriptId={setCurrentScriptId} setScripts={setScripts} scripts={scripts} />
          <AddActor actors={actors} setActors={setActors} />
          <ActorList actors={actors} setActors={setActors} />
        </div>
      </React.StrictMode>
      <CharacterAssignment actors={actors} currentScriptId={currentScriptId} />
    </div>
  );
};

export default Home;
