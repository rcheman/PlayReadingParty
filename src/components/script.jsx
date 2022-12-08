import React, { useState, useEffect } from 'react';
import ActorScriptNav from './actorScriptNav';

const Script = ({ actors }) => {
  const [script, setScript] = useState([]);
  const [currentActor, setCurrentActor] = useState([]);
  const [currentCharacters, setCurrentCharacters] = useState([]);

  // fetch script from the backend
  let fullScript = [];
  useEffect(() => {
    fetch('/script')
      .then((response) => response.json())
      .then((script) => {
        for (let i = 0; i < script.length; i++) {
          // script[i]
          fullScript.push(script[i]);
        }
        // fullScript = fullScript.flat();
        setScript(fullScript);
      })
      .catch((error) => {
        console.error(`error: ${error} when fetching script`);
      });
  }, []);

  // create div and p elements for each chunk of lines
  const lineChunks = [];
  for (let i = 0; i < script.length; i++) {
    // assign the character name as the className for the div
    const name = script[i][0].replace('.', '').toLowerCase();
    lineChunks.push(
      <div className={`${name}`}>
        {script[i].map((lines) => (
          <p>{lines}</p>
        ))}
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
