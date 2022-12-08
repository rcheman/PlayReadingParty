import React, { useState, useEffect } from 'react';

const Script = () => {
  const [script, setScript] = useState([]);

  // fetch script from the backend
  let fullScript = [];
  useEffect(() => {
    fetch('/script')
      .then((response) => response.json())
      .then((script) => {
        for (let i = 0; i < script.length; i++) {
          // script[i]
          fullScript.push(script[i]);
          console.log(script[i][0]);
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

  return (
    <div id='scriptPage'>
      <h2>script</h2>
      <div id='scriptDiv'>{lineChunks}</div>
    </div>
  );
};

export default Script;
