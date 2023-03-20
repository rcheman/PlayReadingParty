import React, {useState} from 'react';

const AddActor = ({actors, setActors}) => {
  const [addActorError, setAddActorError] = useState('');

  const newActorHandler = async (e) => {
    e.preventDefault();

    const newActor = e.target.elements.actorName.value;
    // Add the new actor to the database, returning the new actor object
    try {
      const response = await fetch('/actors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newActor }),
      });

      if (response.ok) {
        const actor = await response.json();
        // add the actor to the actor list and reset values
        setActors([...actors, actor]);
        setAddActorError('');
        e.target.reset();
      } else {
        setAddActorError('Error when adding the actor');
      }
    } catch (error) {
      setAddActorError(error.message);
    }
  };

  return (
    <form onSubmit={newActorHandler}>
      <h3>Add a new actor</h3>
      <input name="actorName" placeholder="enter actor's name" />
      <div className='error'>{addActorError}</div>
      <button type="submit">Add actor</button>
    </form>
  )
}

export default AddActor;
