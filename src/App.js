import React from 'react';
import {ReactiveBase} from '@appbaseio/reactivesearch';
import {Navigate, Routes, Route} from 'react-router-dom';
import useDarkMode from 'use-dark-mode';

import Filer from './Filer';
import Header from './Header';
import Search from './Search';

import './App.css';

function App() {
  // Dark mode toggle is inside the header, but
  // we need the theme here for ReactiveSearch
  const darkMode = useDarkMode();
  const theme = darkMode.value ? 'dark' : 'light';

  return (
    <ReactiveBase
      url={process.env.REACT_APP_ES_URL}
      app={process.env.REACT_APP_ES_INDEX}
      credentials={`${process.env.REACT_APP_ES_USER}:${process.env.REACT_APP_ES_PASSWORD}`}
      headers={{'Bypass-Tunnel-Reminder': 1}}
      themePreset={theme}
    >
      <div className="App">
        <Header />
        <Routes>
          {/* TODO: Add a proper homepage */}
          <Route path="/" element={<Navigate replace to="/search" />} />

          <Route path="search" element={<Search />} />
          <Route path="filer/:filerID" element={<Filer />} />
        </Routes>
      </div>
    </ReactiveBase>
  );
}

export default App;
