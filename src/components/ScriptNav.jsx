import React, { useEffect, useState } from 'react';

const ScriptNav = ({ currentScript, setCurrentScript, scripts, setScripts }) => {
  const [scriptError, setScriptError] = useState('')

  // get all the script titles
  useEffect(() => { (async () => { // useEffect cannot take an async function. Must wrap async in regular function
    try {
      const response = await fetch('/scripts/title');

      if (response.ok) {
        setScripts(await response.json());
      } else {
        console.error(`server error: ${response.body} when fetching script`);
      }
    } catch (error) {
      setScriptError(error.message);
    }
  })();}, []);

  async function deleteScript(event){
    const deleteId = event.target.value;

    try {
      const response = await fetch('/api/script/' + deleteId, { method: 'DELETE' });

      if (response.ok) {
        setScriptError('')
        setScripts(scripts.filter((t) => t.id.toString() !== deleteId))
        if (deleteId === currentScript){
          setCurrentScript(null)
        }
      } else {
        setScriptError('Error when deleting the script')
      }
    } catch (error) {
      setScriptError(error.message)
    }
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
