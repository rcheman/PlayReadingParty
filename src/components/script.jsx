import React, { useState } from 'react';

const Script = () => {
  const [script, setScript] = useState([]);

  // fetch script from the backend
  let fullScript = [];
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

  //  create p elements for each line in the script
  return (
    <div>
      <h2>script</h2>
      <div>
        {script.map((lines) => (
          <p>{lines}</p>
        ))}
      </div>
    </div>
  );
};

export default Script;
