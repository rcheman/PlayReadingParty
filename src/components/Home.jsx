import React, { useState, useRef, useEffect } from 'react';
import CharacterList from './characterList';

const Home = ({ setActors, actors, scriptOption }) => {
  // const [actors, setActors] = useState([]);

  const actorFirstName = useRef('');
  const actorLastName = useRef('');

  // submit of actor name handler
  const handleInput = (event) => {
    let newActors = [...actors];
    let fullName = [actorFirstName.current.value, actorLastName.current.value];
    newActors.push(fullName);
    // set actors in state to be our new actors
    setActors(newActors);
    // reset input value to empty string to clear out old input
    actorFirstName.current.value = '';
    actorLastName.current.value = '';

    const nameObj = { firstName: fullName[0], lastName: fullName[1] };

    // fetch request to the backend to add the new actor to the database
    fetch('/newActor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nameObj),
    })
      .then((response) => response.json())
      .then((data) => {})
      .catch((error) => {
        console.error('Error: ', error);
      });
    event.preventDefault();
  };

  // get the actor names and display current actor names
  return (
    <div id='home'>
      <form onSubmit={handleInput}>
        <input ref={actorFirstName} placeholder="enter actor's first name" />
        <input ref={actorLastName} placeholder="enter actor's last name" />
        <button type='submit'>Add actors to list</button>
      </form>
      <ul id='actorList'>
        <h3>Actors</h3>
        {actors.map((actor) => (
          <li key={actor}>{actor[0] + ' ' + actor[1]}</li>
        ))}
      </ul>
      <CharacterList scriptOption={scriptOption} />
    </div>
  );
};

export default Home;
