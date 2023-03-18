import React, { useEffect, useState } from 'react';

const ScriptNav = ({ currentScript, setCurrentScript, titles, setTitles }) => {
  const [scriptError, setScriptError] = useState('')

  // get all the script titles
  useEffect(() => {
    fetch('/scripts/title')
      .then((response) => {
        if (response.ok){
          return response.json()
        }
        else {
          throw new Error ('Error when getting the scripts')
        }
      })
      .then((scripts) => scripts.map((s) => s.title))
      .then(setTitles)
      .catch((error) => {
        setScriptError(error.message)
      });
  }, []);

  function deleteScript(event){
    const deleteTitle = event.target.value;
    fetch('/script/' + deleteTitle, {
      method: 'DELETE'
    })
    .then((response) => {
      if (response.ok) {
        setScriptError('')
        setTitles(titles.filter((title) => title !== deleteTitle))
        if (deleteTitle === currentScript){
          setCurrentScript('')
        }
      } else {
        throw new Error('Error when deleting the script')
      }
    })
    .catch((error) => {
      setScriptError(error.message)
    })
  }

  // create individual buttons for each script title
  const buttons = [];
  for (let title of titles) {
    buttons.push(
      <li>
        <button className='delete' onClick={deleteScript} value={title}>-</button>
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

  return (
  <ul className="scriptList"> 
  <h3>Scripts</h3>
  <div className='error'>{scriptError}</div>
  {buttons}</ul>);
};

export default ScriptNav;
