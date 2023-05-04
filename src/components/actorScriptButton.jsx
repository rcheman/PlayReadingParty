import React from 'react';
import { getCurrentActorCharacters } from './api';

const ActorScriptButton = ({ actor, setCurrentActor, setCurrentCharacters, currentScript }) => {
  // on change, change the value of current actor
  const setActorHandler = async () => {
    setCurrentActor(actor);
    // We need to fetch the assigned characters of the actor we're switching to
    const result = await getCurrentActorCharacters(actor, currentScript);
    if (result.success) {
      const characters = result.data.map((c) => c.name);
      setCurrentCharacters(characters);
    } else {
      console.error(result.data);
    }
  };

  return (
    <button onClick={setActorHandler} className='actorNameButton button-small' value={actor.id}>
      {actor.name}
    </button>
  );
};

export default ActorScriptButton;
