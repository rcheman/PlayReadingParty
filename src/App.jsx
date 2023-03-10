import React, { useState, useEffect } from 'react';
import Script from './components/Script';
import Home from './components/Home';

const App = () => {
  const [showScript, setShowScript] = useState(false);
  const [actors, setActors] = useState([]);
  const [currentScript, setCurrentScript] = useState('Twelfth Night');

  const openScript = () => {
    setShowScript(!showScript);
  };

  // get the actor list initially on render
  // TODO: switch to useQuery to run simultaneously to the render instead of after initial render
  useEffect(() => {
    fetch('/actors')
      .then((response) => response.json())
      .then(setActors)
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
        </nav>
      </header>
      {showScript ? (
        <Script actors={actors} currentScript={currentScript} />
      ) : (
        <Home
          setActors={setActors}
          actors={actors}
          key="Home"
          currentScript={currentScript}
          setCurrentScript={setCurrentScript}
        />
      )}
    </div>
  );
};

export default App;
