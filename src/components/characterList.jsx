import React, { useState, useEffect } from 'react';
import Character from './character';

const CharacterList = (props) => {
  const [characters, setCharacters] = useState([]);
  const fetchedCharacters = [];

  useEffect(() => {
    // fetch request to get the character data
    fetch('/characterData')
      .then((response) => response.json())
      .then((characterObjs) => {
        for (let name in characterObjs) {
          fetchedCharacters.push(characterObjs[name]);
        }
        setCharacters(fetchedCharacters);
      })
      .catch((error) => {
        console.error(`error: ${error} when fetching character data`);
      });
  }, []);

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
      <h2>Characters in the play: </h2>
      {charactersElements}
    </div>
  );
};

export default CharacterList;
