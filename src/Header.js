import React from 'react';
import { LightDarkToggle } from 'react-light-dark-toggle';
import useDarkMode from 'use-dark-mode';

import './Header.css';

function Header() {
  const darkMode = useDarkMode();

  return <header style={{display: 'block'}}>
    <h1 style={{textAlign: 'center'}}>NY BOE Contributor Search</h1>
    <hr style={{width: '100%', borderStyle: 'solid', borderColor: '#EEE'}}/>
    <div style={{ paddingTop: '1.5em', position: 'absolute', top: 0, right: '2em', zIndex: 999 }}>
      <LightDarkToggle
        onToggle={darkMode.toggle}
        isLight={!darkMode.value}
        size='2em' />
    </div>
  </header>
}

export default Header;
