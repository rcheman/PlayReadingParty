import React, {useState} from 'react';

const ActorList = ({actors, setActors}) => {
  const [deleteError, setDeleteError] = useState('');


  const deleteActorHandler = (event) => {
    const id = event.target.value
    fetch('/actors/' + id, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          // upon successful deletion, remove that actor's name from the actor list
          setDeleteError('');
          setActors(actors.filter((actor) => actor.id.toString() !== id));
        } else {
          throw new Error('Error when deleting the actor.');
        }
      })
      .catch((error) => {
        setDeleteError(error.message);
      });
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