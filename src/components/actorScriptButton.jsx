import React from 'react';
import { getCurrentActorCharacters } from './api';

const ActorScriptButton = ({ actor, setCurrentActor, setCurrentCharacters, currentScript }) => {
  // on change, change the value of current actor
  const setActorHandler = async () => {
    setCurrentActor(actor);
    setCurrentCharacters(await getCurrentActorCharacters(actor, currentScript))
    }

  return (
    <button onClick={setActorHandler} className="actorNameButton button-small" value={actor.id}>
      {actor.name}
    </button>
  );
};

export default ActorScriptButton;
