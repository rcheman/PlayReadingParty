import React, { useState } from 'react';
import { deleteScript } from './api';

const ScriptNav = ({ currentScript, setCurrentScript, scripts, setScripts }) => {
  const [scriptError, setScriptError] = useState('')

  async function deleteScriptHandler(event){
    const deleteId = event.target.value;
      // Delete the script from the database and remove it from the script list
      const result =  await deleteScript(deleteId)
      if (result.success){
        setScriptError('')
        setScripts(scripts.filter((t) => t.id.toString() !== deleteId))
        if (deleteId === currentScript){
          setCurrentScript(null)
        }
      } else {
        setScriptError(result.data)
      }
  }

  // create individual buttons for each script title
  const buttons = [];
  for (let s of scripts) {
    buttons.push(
      <li key={"scriptButton" + s.id}>
        <button className='delete' onClick={deleteScriptHandler} value={s.id}>-</button>
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
