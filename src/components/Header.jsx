import React from 'react';
import { Link } from 'react-router-dom';

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
