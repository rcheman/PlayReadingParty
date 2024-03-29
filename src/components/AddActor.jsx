import React, { useState } from 'react';
import { newActor } from './api';

/**
 * Input to add a new actor
 * @param {Array.<Actor>} actors Actors from state
 * @param {function} setActors Setter for actors state
 * @return {JSX.Element} React Component AddActor
 * @constructor
 */
const AddActor = ({ actors, setActors }) => {
  const [addActorError, setAddActorError] = useState('');

  const newActorHandler = async (e) => {
    e.preventDefault();

    const name = e.target.elements.actorName.value;
    // Add the new actor values to the database
    const result = await newActor(name);
    if (result.success) {
      // add the actor to the actor list and reset input and error message values
      setActors([...actors, result.data]);
      setAddActorError('');
      e.target.reset();
    } else {
      setAddActorError(result.data);
      console.error(result.data);
    }
  };

  return (
    <form onSubmit={newActorHandler}>
      <h3>Add a new actor</h3>
      <input name='actorName' placeholder="enter actor's name" />
      <div className='error'>{addActorError}</div>
      <button type='submit'>Add actor</button>
    </form>
  );
};

export default AddActor;
