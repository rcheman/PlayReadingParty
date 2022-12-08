import React, { useState, useEffect } from 'react';
import Character from './character';

const CharacterList = () => {
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
    charactersElements.push(<Character characterData={characters[i]} />);
  }

  // render list of characters and their data
  return (
    <div>
      <p>this will be a character list</p>
      {charactersElements}
    </div>
  );
};

export default CharacterList;
