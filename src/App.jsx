import React, { Component, useState, useEffect } from 'react';
import Script from './components/script';
import Home from './components/home';

const App = () => {
  const [showScript, setShowScript] = useState(false);
  const [actors, setActors] = useState([]);

  const switchScript = () => {
    setShowScript(!showScript);
  };

  useEffect(() => {
    fetch('/getActors')
      .then((response) => response.json())
      .then((actorList) => {
        let fullActorList = [...actors];

        actorList.forEach((actorRow) => {
          const fullName = [actorRow.first_name, actorRow.last_name];
          fullActorList.push(fullName);
        });
        setActors(fullActorList);
      })
      .catch((error) => {
        console.error('Error: ', error);
      });
  }, []);

  return (
    <div>
      <button onClick={switchScript}>Open/Close Script</button>
      {showScript ? (
        <Script actors={actors} />
      ) : (
        <Home setActors={setActors} actors={actors} key={'home'} />
      )}
    </div>
  );
};

export default App;
