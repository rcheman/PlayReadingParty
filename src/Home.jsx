import React, { useState } from 'react';
import { useLoaderData } from 'react-router-dom'

import CharacterList from './components/characterList';
import ScriptNav from './components/ScriptNav';
import Upload from './components/Upload';
import ActorList from './components/ActorList';
import AddActor from './components/AddActor';
import Header from './components/Header'


// Load the actor names and script titles on page load
export async function loader() {
  const [loadedActors, loadedScripts] = await Promise.all([getActors(), getScriptTitles()])
  return { loadedActors, loadedScripts}
}

async function getActors(){
  try {
    const response = await fetch('/api/actors')

    if (response.ok) {
      return await response.json()
    } else {
      console.log('Server Error:', response.body);
    }
  } catch (error) {
    console.error('Network Error:', error);
  }
}

async function getScriptTitles(){
  try {
    const response = await fetch('/api/scripts/title');

    if (response.ok) {
      return await response.json();
    } else {
      console.error(`server error: ${response.body} when fetching script`);
    }
  } catch (error) {
    return (error.message)
  }
}


const Home = () => {
  // With the loaded data, set the initial state for the actors and script list
  const { loadedActors, loadedScripts } = useLoaderData();
  const [actors, setActors] = useState(loadedActors)
  const [scripts, setScripts] = useState(loadedScripts);
  const [currentScript, setCurrentScript] = useState(null)


  return (
    <div id="home" className="column">
    <Header currentScript={currentScript}/>
      <div className="row">
        <ScriptNav setCurrentScript={setCurrentScript} currentScript={currentScript} scripts={scripts} setScripts={setScripts} />
        <Upload setCurrentScript={setCurrentScript} setScripts={setScripts} scripts={scripts} />
        <AddActor actors={actors} setActors={setActors}/>
      </div>
      <div className="row">
        <ActorList actors={actors} setActors={setActors}/>
        <CharacterList currentScript={currentScript} />
      </div>
    </div>
  );
};

export default Home;
