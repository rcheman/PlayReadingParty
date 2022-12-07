import React, { Component, useState, useRef } from 'react';
import Script from './components/script';
import Home from './components/home';

const App = () => {
  const [showScript, setShowScript] = useState(false);

  const switchScript = () => {
    setShowScript(!showScript);
  };

  return (
    <div>
      {showScript ? <Script /> : <Home />}

      <button onClick={switchScript}>Open/Close Script</button>
    </div>
  );
};

export default App;
