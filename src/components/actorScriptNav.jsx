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
        currentActor={currentActor}
        firstName={actor[0]}
        lastName={actor[1]}
        scriptOption={scriptOption}
        key={`${actor}Button`}
      />
    );
  }

  return <div id='actorNav'>{buttons}</div>;
};

export default ActorScriptNav;
