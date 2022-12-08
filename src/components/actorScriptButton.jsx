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
    const value = e.target.value.split(' ');
    setCurrentActor([value[0], value[1]]);

    // create url with current actor parameter name
    let url = new URL('http://localhost:3000/currentCharacters');
    url.searchParams.append('firstName', value[0]);
    url.searchParams.append('lastName', value[1]);
    url.searchParams.append('option', scriptOption);

    // fetch request to get the current characters for the current actor
    fetch(url.href)
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
