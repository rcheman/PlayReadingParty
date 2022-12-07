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
    });

  // console.log(script);

  // create html elements looping through the script
  // to make each name a h2 tag and each full line after it a p tag
  // return the jsx html elements
  //
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
