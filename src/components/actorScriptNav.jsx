import React from 'react';
import ActorScriptButton from './actorScriptButton';

const ActorScriptNav = ({
  actors,
  setCurrentActor,
  setCurrentCharacters,
  currentScript,
}) => {
  const buttons = [];
  for (let actor of actors) {
    buttons.push(
      <ActorScriptButton
        setCurrentActor={setCurrentActor}
        setCurrentCharacters={setCurrentCharacters}
        firstName={actor.firstName}
        lastName={actor.lastName}
        id={actor.id}
        currentScript={currentScript}
        key={actor.id}
      />
    );
  }

  return <div id='actorNav'>{buttons}</div>;
};

export default ActorScriptNav;
