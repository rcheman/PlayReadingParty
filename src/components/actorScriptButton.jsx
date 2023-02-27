import React from 'react';

const ActorScriptButton = ({ actor, setCurrentActor, setCurrentCharacters, currentScript }) => {
  // on change, change the value of current actor
  const setActorHandler = () => {
    setCurrentActor(actor);

    // fetch request to get the current characters for the current actor
    fetch(`/script/${currentScript}/characters?actor=${actor.id}`)
      .then((response) => response.json())
      .then((characterData) => {
        const charArr = characterData.map((character) => character.name);
        setCurrentCharacters(charArr);
      })
      .catch((error) => {
        console.error(`error: ${error} when fetching current characters`);
      });
  };

  return (
    <button onClick={setActorHandler} className="actorNameButton button-small" value={actor.id}>
      {actor.name}
    </button>
  );
};

export default ActorScriptButton;
