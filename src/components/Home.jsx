import React, { useState } from 'react';
import CharacterList from './characterList';
import ScriptNav from './ScriptNav';
import Upload from './Upload';
import ActorList from './ActorList';
import AddActor from './AddActor';

const Home = ({ setActors, actors, currentScript, setCurrentScript }) => {
  const [scripts, setScripts] = useState([]);

  return (
    <div id="home" className="column">
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
