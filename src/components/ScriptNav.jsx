import React, { useEffect, useState } from 'react';

const ScriptNav = ({ setCurrentScript }) => {
  const [titles, setTitles] = useState([]);
  // get all the script titles
  useEffect(() => {
    fetch('/script')
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
      <button
        onClick={() => {
          setCurrentScript(title);
        }}
        className="scriptButton button-small"
        key={title}
      >
        {title}
      </button>
    );
  }

  return <div className="scriptNav">{buttons}</div>;
};

export default ScriptNav;
