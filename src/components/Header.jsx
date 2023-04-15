import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({currentScript}) => {


  return (
    <div>
      <header>
        <h1>Play Reading Party</h1>
        <nav>
            <Link to={'/'} className='button'>Home</Link>
            <Link to={`script/${currentScript}`} className='button' style={{display: currentScript ? 'inline':'none'}}>Open Script</Link>
        </nav>
      </header>
    </div>
  );
};

export default Header;
