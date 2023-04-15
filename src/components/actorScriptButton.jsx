import React from 'react';

const ActorScriptButton = ({ actor, setCurrentActor, setCurrentCharacters, currentScript }) => {
  // on change, change the value of current actor
  const setActorHandler = async () => {
    setCurrentActor(actor);

    // fetch request to get the current characters for the current actor
    try {
      const response = await fetch(`/api/script/${currentScript}/characters?actorId=${actor.id}`);

      if (response.ok) {
        setCurrentCharacters((await response.json()).map((c) => c.name));
      } else {
        console.error('Server Error:', response.body);
      }
    } catch (error) {
        console.error(`error: ${error} when fetching current characters`);
    }
  };

  return (
    <button onClick={setActorHandler} className="actorNameButton button-small" value={actor.id}>
      {actor.name}
    </button>
  );
};

export default ActorScriptButton;
