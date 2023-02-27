import React, { useState, useEffect } from 'react';
import ActorScriptNav from './actorScriptNav';

const Script = ({ actors, currentScript }) => {
  const [script, setScript] = useState([]);
  const [currentActor, setCurrentActor] = useState({});
  const [currentCharacters, setCurrentCharacters] = useState([]);

  // fetch the specified script
  useEffect(() => {
    fetch('/script/' + currentScript)
      .then((response) => response.json())
      .then(setScript)
      .catch((error) => {
        console.error(`error: ${error} when fetching script`);
      });
  }, [currentScript]);

  // create div and p elements for each chunk of lines
  const lineChunks = [];
  const characterSet = new Set(currentCharacters);
  let currentActorCharacter;

  for (let i = 0; i < script.length; i++) {
    // checks if the character name for this chunk is the name of a character assigned to the current actor
    // remove the dot because some scripts have a dot after the name of the character, ie VIOLA.
    const name = script[i][0].replace('.', '');
    if (characterSet.has(name)) {
      currentActorCharacter = `currentActor`;
    } else {
      currentActorCharacter = 'notCurrentActor';
    }
    lineChunks.push(
      <div className={(name, currentActorCharacter)}>
        <blockquote>
          {script[i].map((lines) => (
            <span>
              {lines}
              <br></br>
            </span>
          ))}
        </blockquote>
      </div>
    );
  }

  return (
    <div id='scriptPage'>
      <ActorScriptNav
        actors={actors}
        setCurrentActor={setCurrentActor}
        setCurrentCharacters={setCurrentCharacters}
        currentScript={currentScript}
      />
      <h2>script</h2>
      <h5>
        Current Actor: {currentActor.name}
      </h5>
      <div id='scriptDiv'>{lineChunks}</div>
    </div>
  );
};

export default Script;
