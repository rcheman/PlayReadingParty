import React, { useState } from 'react';
import { deleteScript } from './api';
import { Link } from 'react-router-dom';

const ScriptNav = ({ currentScriptId, setCurrentScriptId, scripts, setScripts }) => {
  const [scriptError, setScriptError] = useState('');

  async function deleteScriptHandler(event) {
    const scriptId = event.target.value;
    // Delete the script from the database and remove it from the script list
    const result = await deleteScript(scriptId);
    if (result.success) {
      setScriptError('');
      setScripts(scripts.filter((t) => t.id.toString() !== scriptId));
      if (scriptId === currentScriptId) {
        setCurrentScriptId(null);
      }
    } else {
      setScriptError(result.data);
    }
  }

  // create individual buttons for each script title
  const buttons = [];
  for (let s of scripts) {
    buttons.push(
      <li key={'scriptButton' + s.id}>
        <button className='delete' onClick={deleteScriptHandler} value={s.id}>-</button>
        <Link to={`/${s.id}`}
              onClick={() => {
                setCurrentScriptId(s.id);
              }}
              className='button'
        >
          {s.title}
        </Link>
      </li>
    );
  }

  return (
    <div>
      <div id='scriptNav'>
        <h3>Scripts</h3>
        {currentScriptId && (<Link to={`script/${currentScriptId}`} className='button'>Open Script</Link>)}
      </div>
      <ul className='scriptList'>
        <div className='error'>{scriptError}</div>
        {buttons}</ul>
    </div>
  );
};

export default ScriptNav;
