import React, { useEffect } from 'react';

const ScriptNav = ({ setCurrentScript, titles, setTitles }) => {
  // get all the script titles
  useEffect(() => {
    fetch('/scripts/title')
      .then((response) => response.json())
      .then(setTitles)
      .catch((error) => {
        console.error(`error: ${error} when fetching script titles`);
      });
  }, []);

  // create individual buttons for each script title
  const buttons = [];
  for (let title of titles) {
    buttons.push(
      <li>
        <button
          onClick={() => {
            setCurrentScript(title);
          }}
          className="button-small"
          key={title}
        >
          {title}
        </button>
      </li>
    );
  }

  return <ul className="scriptList">{buttons}</ul>;
};

export default ScriptNav;
