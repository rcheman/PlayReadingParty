import React, { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';

import ScriptNav from './components/ScriptNav';
import Upload from './components/Upload';
import ActorList from './components/ActorList';
import AddActor from './components/AddActor';
import Header from './components/Header';
import { getActors, getScriptTitles } from './components/api';
import CharacterAssignment from './components/CharacterAssignment';


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


const Home = () => {
  // With the loaded data, set the initial state for the actors and script list
  const { loadedActors, loadedScripts, scriptId } = useLoaderData();
  const [actors, setActors] = useState(loadedActors);
  const [scripts, setScripts] = useState(loadedScripts);
  const [currentScriptId, setCurrentScriptId] = useState(null);

  // On initial render, this checks if there was already a script selected previously so the page can return to that state.
  useEffect(() => {
    if (scriptId) {
      setCurrentScriptId(scriptId);
    }
  }, []);

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
