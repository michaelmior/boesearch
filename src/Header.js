import React from 'react';
import { LightDarkToggle } from 'react-light-dark-toggle';
import useDarkMode from 'use-dark-mode';

import './Header.css';

function Header() {
  const darkMode = useDarkMode();

  return <header>
    <div style={{ paddingTop: '1.5em', position: 'absolute', top: 0, right: '2em', zIndex: 999 }}>
      <LightDarkToggle
        onToggle={darkMode.toggle}
        isLight={!darkMode.value}
        size='2em' />
    </div>
  </header>
}

export default Header;
