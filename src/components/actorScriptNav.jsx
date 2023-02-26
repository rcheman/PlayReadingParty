import React from 'react';
import ActorScriptButton from './actorScriptButton';

const ActorScriptNav = ({
  actors,
  setCurrentActor,
  setCurrentCharacters,
  scriptOption,
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
        scriptOption={scriptOption}
        key={`${actor.firstName} ${actor.lastName}Button`}
      />
    );
  }

  return <div id='actorNav'>{buttons}</div>;
};

export default ActorScriptNav;
