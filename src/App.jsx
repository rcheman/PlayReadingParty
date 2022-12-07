import React, { Component, useState, useRef } from 'react';
import Script from './components/script';
import Home from './components/home';

const App = () => {
  const [showScript, setShowScript] = useState(true);

  return (
    <div>
      <Home />

      <Script />
      <button>Open Play Script</button>
    </div>
  );
};

export default App;
