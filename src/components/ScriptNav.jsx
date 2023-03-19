import React, { useEffect, useState } from 'react';

const ScriptNav = ({ currentScript, setCurrentScript, scripts, setScripts }) => {
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
      .then(setScripts)
      .catch((error) => {
        setScriptError(error.message)
      });
  }, []);

  function deleteScript(event){
    const deleteId = event.target.value;
    fetch('/script/' + deleteId, {
      method: 'DELETE'
    })
    .then((response) => {
      if (response.ok) {
        setScriptError('')
        setScripts(scripts.filter((t) => t.id.toString() !== deleteId))
        if (deleteId === currentScript){
          setCurrentScript(null)
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
  for (let s of scripts) {
    buttons.push(
      <li key={"scriptButton" + s.id}>
        <button className='delete' onClick={deleteScript} value={s.id}>-</button>
        <button
          onClick={() => {
            setCurrentScript(s.id);
          }}
          className="button-small"
        >
          {s.title}
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
