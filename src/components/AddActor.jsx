import React, {useState} from 'react';

const AddActor = ({actors, setActors}) => {
  const [addActorError, setAddActorError] = useState('');
  const [newActor, setNewActor] = useState('');

const newActorHandler = (e) => {
  e.preventDefault()
  // Add the new actor to the database, returning the new actor object
  fetch('/actors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({name: newActor}),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Error when adding the actor');
      }
    })
    .then((actor) => {
      // add the actor to the actor list and reset values
      setActors([...actors, actor])
      setAddActorError('');
      setNewActor('');
      e.target.reset();
    })
    .catch((error) => {
      setAddActorError(error.message);
    });
};

  return (
      <form onSubmit={newActorHandler}>
          <input onChange={(e)=>setNewActor(e.target.value)} placeholder="enter actor's name" />
          <div style={{ color: 'red' }}>{addActorError}</div>
          <button type="submit">Add actor</button>
      </form>
  )
}

export default AddActor