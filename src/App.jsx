import React, { useState, useEffect } from 'react';
import Script from './components/Script';
import Home from './components/Home';

const App = () => {
  const [showScript, setShowScript] = useState(false);
  const [actors, setActors] = useState([]);
  const [currentScript, setCurrentScript] = useState(null);

  const openScript = () => {
    setShowScript(!showScript);
  };

  // get the actor list initially on render
  // TODO: switch to useQuery to run simultaneously to the render instead of after initial render
  useEffect(() => { (async () => { // useEffect cannot take an async function. Must wrap async in regular function
    try {
      const response = await fetch('/actors')

      if (response.ok) {
        setActors(await response.json());
      } else {
        console.log('Server Error:', response.body);
      }
    } catch (error) {
      console.error('Network Error:', error);
    }
  })();}, []);

  return (
    <div>
      <header>
        <h1>Play Reading Party</h1>
        <nav>
          <button onClick={openScript} style={{visibility: currentScript === null ? 'hidden' : 'visible'}}>Open/Close Script</button>
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
