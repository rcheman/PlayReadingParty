import React from 'react';
import ActorScriptButton from './actorScriptButton';

/**
 * Component containing all the actor buttons on the script page
 * @param {Array.<Actor>} actors Actors from state
 * @param {function} setCurrentActor Setter for currentActor state
 * @param {function} setCurrentCharacters Setter for currentCharacters state
 * @param {string} currentScriptId The ID for the current script
 * @return {JSX.Element} React Component ActorScriptNav
 * @constructor
 */

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
