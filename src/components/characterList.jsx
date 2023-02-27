import React, { useState, useEffect } from 'react';
import Character from './Character';

const CharacterList = ({ currentScript }) => {
  const [characters, setCharacters] = useState([]);

  // get the character data on the initial load and when the script option changes
  useEffect(() => {
    // fetch request to get the character data
    fetch('/script/' + currentScript + '/characters')
      .then((response) => response.json())
      .then((characterData) => {
        setCharacters(characterData);
      })
      .catch((error) => {
        console.error(`error: ${error} when fetching character data`);
      });
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
      <h3>Characters in the play: </h3>
      <ul>{charactersElements}</ul>
    </div>
  );
};

export default CharacterList;
