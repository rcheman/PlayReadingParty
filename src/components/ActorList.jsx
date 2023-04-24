import React, { useState } from 'react';
import { deleteActor } from './api';

const ActorList = ({ actors, setActors }) => {
  const [deleteError, setDeleteError] = useState('');

  const deleteActorHandler = async (event) => {
    const id = event.target.value;
    const result = await deleteActor(id);
    // upon successful deletion, remove that actor's name from the actor list
    if (result.success) {
      setDeleteError('');
      setActors(actors.filter((actor) => actor.id.toString() !== id));
    } else {
      setDeleteError(result.data);
    }
  };

  return (
    <div>
      <h3>Actors</h3>
      <ul id='actorList'>
        <div className='error'>{deleteError}</div>
        {actors.map((actor) => (
          <li key={actor.id}>
            <button onClick={deleteActorHandler} className='delete' value={actor.id}>
              -
            </button>
            {actor.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActorList;
