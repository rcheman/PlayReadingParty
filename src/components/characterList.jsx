import React, { useState, useEffect } from 'react';
import Character from './Character';
import { getCharacters } from './api';

const CharacterList = ({ currentScript }) => {
  const [characters, setCharacters] = useState([]);

  // get the character data on the initial load and when the script option changes
  useEffect(() => {
    (async () => { // useEffect cannot take an async function. Must wrap async in regular function
      if (currentScript === null) {
        return;
      }
      // fetch request to get the character data
      const result = await getCharacters(currentScript);
      if (result.success) {
        setCharacters(result.data);
      }
    })();
  }, [currentScript]);

  // make an array of character information
  const charactersElements = [];
  for (let i = 0; i < characters.length; i++) {
    charactersElements.push(
      <Character key={`character ${i}`} characterData={characters[i]} />
    );
  }

  // render list of characters and their data
  return (
    <div className='characterList'>
      <h3>Characters in the play</h3>
      <ul>{currentScript !== null && charactersElements}</ul>
    </div>
  );
};

export default CharacterList;
