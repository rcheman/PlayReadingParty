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
 * @param {string} params.scriptId The current script ID
 * @return {Promise<loaderActorsScriptsScriptId>}
 */
// Load the actor names and script titles on page load
export async function loader({ params }) {
  const scriptId = params.scriptId;
  const [loadedActors, loadedScripts] = await Promise.all([getActors(), getScriptTitles()]);
  if (loadedActors.success && loadedScripts.success) {
    return { loadedActors: loadedActors.data, loadedScripts: loadedScripts.data, scriptId };
  } else {
    console.error(loadedActors.data, loadedScripts.data);
    // We return empty objects when there is an error because it makes it easier to trace back the error
    return { loadedScripts: {}, loadedActors: {}, scriptId };
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
