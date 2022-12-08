import React from 'react';

const Character = (props) => {
  // render individual character list with stats

  const { name, lineCount, speaksNum } = props.characterData;

  return (
    <div className='characterData'>
      <h4>Name: {name}</h4>
      <p>Total Lines: {lineCount}</p>
      <p>Amount Character Speaks: {speaksNum}</p>
    </div>
  );
};

export default Character;
