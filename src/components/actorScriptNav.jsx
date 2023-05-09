import React from 'react';
import ActorScriptButton from './actorScriptButton';

const ActorScriptNav = ({ actors, setCurrentActor, setCurrentCharacters, currentScriptId }) => {
  const buttons = [];
  for (let actor of actors) {
    buttons.push(
      <ActorScriptButton
        actor={actor}
        setCurrentActor={setCurrentActor}
        setCurrentCharacters={setCurrentCharacters}
        currentScriptId={currentScriptId}
        key={actor.id}
      />
    );
  }

  return <div id='actorNav'>{buttons}</div>;
};

export default ActorScriptNav;
