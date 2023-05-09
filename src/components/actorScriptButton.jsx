import React from 'react';
import { getCurrentActorCharacters } from './api';

const ActorScriptButton = ({ actor, setCurrentActor, setCurrentCharacters, currentScriptId }) => {
  // on change, change the value of current actor
  const setActorHandler = async () => {
    setCurrentActor(actor);
    // We need to fetch the assigned characters of the actor we're switching to
    const result = await getCurrentActorCharacters(actor, currentScriptId);
    if (result.success) {
      const characters = [];
      for (let key in result.data) {
        characters.push(result.data[key].name);
      }
      setCurrentCharacters(characters);
    } else {
      console.error(result.data);
    }
  };

  return (
    <button onClick={setActorHandler} className='actorNameButton' value={actor.id}>
      {actor.name}
    </button>
  );
};

export default ActorScriptButton;
