import React, { Component, useState, useRef } from 'react';

const App = () => {
  const [actors, setActors] = useState([]);

  const actorFirstName = useRef('');
  const actorLastName = useRef('');

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
      .then((data) => {
        console.log('successfully added to db: ', data);
      })
      .catch((error) => {
        console.error('Error: ', error);
      });

    event.preventDefault();
  };

  return (
    <div>
      <h1>Here is the react app!!!!!!!!!!!!</h1>
      <div>
        <form onSubmit={handleInput}>
          <input ref={actorFirstName} placeholder="enter actor's first name" />
          <input ref={actorLastName} placeholder="enter actor's last name" />
          <button type='submit'>Add actors to list</button>
        </form>
      </div>
      <ul>
        {actors.map((actor) => (
          <li>{actor[0] + ' ' + actor[1]}</li>
        ))}
      </ul>
      <button>Open Play Script</button>
    </div>
  );
};

export default App;