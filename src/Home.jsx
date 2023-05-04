import React, { useState } from 'react';
import { useLoaderData } from 'react-router-dom';

import CharacterList from './components/characterList';
import ScriptNav from './components/ScriptNav';
import Upload from './components/Upload';
import ActorList from './components/ActorList';
import AddActor from './components/AddActor';
import Header from './components/Header';
import { getActors, getScriptTitles } from './components/api';


// Load the actor names and script titles on page load
export async function loader() {
  const [loadedActors, loadedScripts] = await Promise.all([getActors(), getScriptTitles()]);
  if (loadedActors.success && loadedScripts.success) {
    return { loadedActors: loadedActors.data, loadedScripts: loadedScripts.data };
  } else {
      console.error(loadedActors.data, loadedScripts.data);
    // We return empty objects when there is an error because it makes it easier to trace back the error
      return { loadedScripts: {}, loadedActors: {} };
  }
}


const Home = () => {
  // With the loaded data, set the initial state for the actors and script list
  const { loadedActors, loadedScripts } = useLoaderData();
  const [actors, setActors] = useState(loadedActors);
  const [scripts, setScripts] = useState(loadedScripts);
  const [currentScript, setCurrentScript] = useState(null);


  return (
    <div id='home' className='column'>
      <Header currentScript={currentScript} />
      <div className='row'>
        <ScriptNav setCurrentScript={setCurrentScript} currentScript={currentScript} scripts={scripts}
                   setScripts={setScripts} />
        <Upload setCurrentScript={setCurrentScript} setScripts={setScripts} scripts={scripts} />
        <AddActor actors={actors} setActors={setActors} />
      </div>
      <div className='row'>
        <ActorList actors={actors} setActors={setActors} />
        <CharacterList currentScript={currentScript} />
      </div>
    </div>
  );
};

export default Home;
