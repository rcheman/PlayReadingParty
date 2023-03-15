import React from 'react';

const Character = (props) => {
  // render individual character list with stats

  const { name, lineCount, speakCount } = props.characterData;

  return (
    <ul className='characterData'>
      <h5>Name: {name}</h5>
      <li>Total Lines: {lineCount}</li>
      <li>Amount Character Speaks: {speakCount}</li>
    </ul>
  );
};

export default Character;
