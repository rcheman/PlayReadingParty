import React, {useState} from 'react';

const ActorList = ({actors, setActors}) => {
  const [deleteError, setDeleteError] = useState('');

  const deleteActorHandler = async (event) => {
    const id = event.target.value

    try {
      const response = await fetch('/api/actors/' + id, { method: 'DELETE' });

      if (response.ok) {
        // upon successful deletion, remove that actor's name from the actor list
        setDeleteError('');
        setActors(actors.filter((actor) => actor.id.toString() !== id));
      } else {
        setDeleteError('Error when deleting the actor.');
      }
    } catch (error) {
      setDeleteError(error.message);
    }
  };

  return (
    <ul id="actorList">
      <h3>Actors</h3>
      <div className='error'>{deleteError}</div>
      {actors.map((actor) => (
        <li key={actor.id}>
          <button onClick={deleteActorHandler} className="delete" value={actor.id}>
            -
          </button>
          {actor.name}
        </li>
      ))}
    </ul>
  )
}

export default ActorList;