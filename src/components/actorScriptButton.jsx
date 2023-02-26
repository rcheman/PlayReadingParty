import React from 'react';
import classNames from 'classnames';

const ActorScriptButton = ({
  firstName,
  lastName,
  setCurrentActor,
  setCurrentCharacters,
  currentActor,
  scriptOption,
}) => {
  // on change, change the value of current actor
  const onClickChange = (e) => {
    const value = e.target.value.split(' '); // todo, use actorId here instead of string manipulation
    const firstName = value.at(0);
    const lastName = value.at(-1);
    setCurrentActor([firstName, lastName]);

    // fetch request to get the current characters for the current actor
    fetch(`/currentCharacters/${firstName}/${lastName}/${scriptOption}`)
      .then((response) => response.json())
      .then((characters) => {
        const charArr = characters.map((character) => character.charactername);
        setCurrentCharacters(charArr);
      })
      .catch((error) => {
        console.error(`error: ${error} when fetching current characters`);
      });
  };

  const buttonClasses = ['actorNameButton', 'button-small'];
  // set button value as a string with first and last name
  const buttonVal = `${firstName} ${lastName}`;
  return (
    <input
      onClick={onClickChange}
      className={buttonClasses}
      type='button'
      value={buttonVal}
    />
  );
};

export default ActorScriptButton;
