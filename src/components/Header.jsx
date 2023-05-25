import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Header component that displays the page name and acts as the 'Home' button
 * @param {string} currentScriptId The ID for the current script
 * @return {JSX.Element} React Component Header
 * @constructor
 */
const Header = ({ currentScriptId }) => {

  return (
    <div>
      <header>
        <h1><Link to={`/${currentScriptId}`} id='titleLink'>Play Reading Party</Link></h1>
      </header>
    </div>
  );
};

export default Header;
