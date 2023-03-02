import React, { useState, useRef, useEffect } from 'react';
import CharacterList from './characterList';
import ScriptNav from './ScriptNav';


const Home = ({ setActors, actors, currentScript, setCurrentScript }) => {
  const newActorInput = useRef('');

  // submit of actor name handler
  const newActorHandler = (event) => {
    event.preventDefault();
    const newActor = {name: newActorInput.current.value};

    // Add the new actor to the database
    fetch('/actors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newActor),
    }).then(() => {
      // set actors in state to be our new actors
      setActors([...actors, newActor]);
      // reset input value to empty string to clear out old input
      newActorInput.current.value = '';
    }).catch((error) => {
      console.error('Error: ', error);
    });
  };

  // get the actor names and display current actor names
  return (
    <div id='home' className='column'>
      <div className='row'>
      <ScriptNav setCurrentScript={setCurrentScript} />
      <form onSubmit={newActorHandler}>
        <input ref={newActorInput} placeholder="enter actor's name" />
        <button type='submit'>Add actor</button>
      </form>
      </div>
      <div className='row'> 
      <ul id='actorList'>
        <h3>Actors</h3>
        {actors.map((actor) => (
          <li key={actor.id}>{actor.name}</li>
        ))}
      </ul>
      <CharacterList currentScript={currentScript} />
      
      </div>
    </div>
  );
};

export default Home;
