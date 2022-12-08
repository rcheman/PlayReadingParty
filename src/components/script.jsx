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
          fullScript.push(script[i]);
        }
        fullScript = fullScript.flat();
        setScript(fullScript);
      })
      .catch((error) => {
        console.error(`error: ${error} when fetching script`);
      });
  }, []);

  //  create p elements for each line in the script
  return (
    <div id='scriptPage'>
      <h2>script</h2>
      <div id='scriptDiv'>
        {script.map((lines) => (
          <p>{lines}</p>
        ))}
      </div>
    </div>
  );
};

export default Script;
