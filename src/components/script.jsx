import React, { useState, useEffect } from 'react';
import ActorScriptNav from './actorScriptNav';
import classNames from 'classnames';

const Script = ({ actors, scriptOption }) => {
  const [script, setScript] = useState([]);
  const [currentActor, setCurrentActor] = useState([]);
  const [currentCharacters, setCurrentCharacters] = useState([]);
  const [chunkedLines, setLines] = useState([]);

  // fetch script from the backend
  let fullScript = [];

  let url = new URL('http://localhost:3000/script');
  url.searchParams.append('title', scriptOption);

  useEffect(() => {
    fetch(url.href)
      .then((response) => response.json())
      .then((fetchedScript) => {
        for (let i = 0; i < fetchedScript.length; i++) {
          // script[i]
          fullScript.push(fetchedScript[i]);
        }
        setScript(fullScript);
      })
      .catch((error) => {
        console.error(`error: ${error} when fetching script`);
      });
  }, []);

  // create div and p elements for each chunk of lines
  const lineChunks = [];
  const characterSet = new Set(currentCharacters);
  let currentActorCharacter;

  for (let i = 0; i < script.length; i++) {
    // assign the character name as the className for the div
    const name = script[i][0].replace('.', '').toLowerCase();
    if (characterSet.has(name.toUpperCase())) {
      currentActorCharacter = `currentActor`;
    } else {
      currentActorCharacter = 'notCurrentActor';
    }
    const characterClass = classNames(name, currentActorCharacter);
    lineChunks.push(
      <div className={characterClass}>
        <blockquote>
          {script[i].map((lines) => (
            <p>{lines}</p>
          ))}
        </blockquote>
      </div>
    );
  }

  // on actor nav button change
  // pull the characters whose id's match the current actor's id
  // give lines that are that actor's lines a separate class name

  // fetch request to get the names of the characters that the current actor is assigned to

  return (
    <div id='scriptPage'>
      <ActorScriptNav
        actors={actors}
        currentActor={currentActor}
        setCurrentActor={setCurrentActor}
        setCurrentCharacters={setCurrentCharacters}
        scriptOption={scriptOption}
      />
      <h2>script</h2>
      <h5>
        Current Actor: {currentActor[0]} {currentActor[1]}
      </h5>
      <div id='scriptDiv'>{lineChunks}</div>
    </div>
  );
};

export default Script;
