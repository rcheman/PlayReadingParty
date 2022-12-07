import React from 'react';

const Character = (characterData) => {
  // render individual character list with stats
  return (
    <div class='characterData'>
      <h4>Name: {characterData.name}</h4>
      <p>Total Lines: {characterData.lineCount}</p>
      <p>Amount Character Speaks: {characterData.speaksNum}</p>
    </div>
  );
};

export default Character;
