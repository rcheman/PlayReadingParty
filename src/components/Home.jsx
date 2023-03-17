import React, { useState, useRef, useEffect } from 'react';
import CharacterList from './characterList';
import ScriptNav from './ScriptNav';
import Upload from './Upload';

const Home = ({ setActors, actors, currentScript, setCurrentScript }) => {
  const [titles, setTitles] = useState([]);
  const [deleteError, setDeleteError] = useState('');
  const [addError, setAddError] = useState('');
  const newActorInput = useRef('');

  // submit of actor name handler
  const newActorHandler = (event) => {
    event.preventDefault();
    const newActor = { name: newActorInput.current.value };

    // Add the new actor to the database, returning the new actor object
    fetch('/actors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newActor),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Error when adding the actor');
        }
      })
      .then((actor) => {
        setActors([...actors, actor]);
        // reset input value to empty string to clear out old input
        newActorInput.current.value = '';
        setAddError('');
      })
      .catch((error) => {
        setAddError(error.message);
      });
  };

  const deleteActor = (event) => {
    const actor = event.target.value.split(',');
    const name = actor[0];
    const id = actor[1];
    fetch('/actors/' + id, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          // upon successful deletion, remove that actor's name from the actor list
          setDeleteError('');
          setActors(() => actors.filter((actor) => actor.name !== name));
        } else {
          throw new Error('Error when deleting the actor.');
        }
      })
      .catch((error) => {
        setDeleteError(error.message);
      });
  };

  // get the actor names and display current actor names
  return (
    <div id="home" className="column">
      <div className="row">
        <ScriptNav setCurrentScript={setCurrentScript} titles={titles} setTitles={setTitles} />
        <Upload setCurrentScript={setCurrentScript} setTitles={setTitles} titles={titles} />
        <form onSubmit={newActorHandler}>
          <input ref={newActorInput} placeholder="enter actor's name" />
          <div style={{ color: 'red' }}>{addError}</div>
          <button type="submit">Add actor</button>
        </form>
      </div>
      <div className="row">
        <ul id="actorList">
          <h3>Actors</h3>
          <div style={{ color: 'red' }}>{deleteError}</div>
          {actors.map((actor) => (
            <li key={actor.id}>
              <button onClick={deleteActor} className="delete" value={`${actor.name},${actor.id}`}>
                -
              </button>
              {actor.name}
            </li>
          ))}
        </ul>
        <CharacterList currentScript={currentScript} />
      </div>
    </div>
  );
};

export default Home;
