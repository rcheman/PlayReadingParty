import React, { useState, useEffect } from 'react';
import Script from './components/Script';
import Home from './components/Home';

const App = () => {
  const [showScript, setShowScript] = useState(false);
  const [actors, setActors] = useState([]);
  const [scriptOption, changeScriptOption] = useState('test');

  const openScript = () => {
    setShowScript(!showScript);
  };

  const changeScript = () => {
    if (scriptOption === 'test') {
      changeScriptOption('twelfthNight');
    } else {
      changeScriptOption('test');
    }
  };

  // get the actor list initially on render
  // TODO: switch to useQuery to run simultaneously to the render instead of after initial render
  useEffect(() => {
    fetch('/actors')
      .then((response) => response.json())
      .then((actorList) => {
        let fullActorList = [...actors];

        actorList.forEach((actorRow) => {
          const actor = {
            firstName: actorRow.first_name,
            lastName: actorRow.last_name,
            id: actorRow.id,
          };
          fullActorList.push(actor);
        });
        setActors(fullActorList);
      })
      .catch((error) => {
        console.error('Error: ', error);
      });
  }, []);

  return (
    <div>
      <header>
        <h1>Play Reading Assistant</h1>
        <nav>
          <button onClick={openScript}>Open/Close Script</button>
          <button onClick={changeScript}>Change Script</button>
        </nav>
      </header>
      {showScript ? (
        <Script actors={actors} scriptOption={scriptOption} />
      ) : (
        <Home
          setActors={setActors}
          actors={actors}
          key='Home'
          scriptOption={scriptOption}
        />
      )}
    </div>
  );
};

export default App;
