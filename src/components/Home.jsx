import React, { useState } from 'react';
import CharacterList from './characterList';
import ScriptNav from './ScriptNav';
import Upload from './Upload';
import ActorList from './ActorList';
import AddActor from './AddActor';

const Home = ({ setActors, actors, currentScript, setCurrentScript }) => {
  const [titles, setTitles] = useState([]);

  return (
    <div id="home" className="column">
      <div className="row">
        <ScriptNav setCurrentScript={setCurrentScript} currentScript={currentScript} titles={titles} setTitles={setTitles} />
        <Upload setCurrentScript={setCurrentScript} setTitles={setTitles} titles={titles} />
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
