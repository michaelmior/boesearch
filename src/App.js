import React from 'react';
import { ReactiveBase } from "@appbaseio/reactivesearch";
import useDarkMode from 'use-dark-mode';

import Header from './Header';
import Search from './Search';
import './App.css';

function App() {
  const darkMode = useDarkMode();
  const theme = darkMode.value ? 'dark': 'light';

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

        <div style={{display: 'flex', justifyContent: 'center', columnGap: '3em', rowGap: '2em', flexFlow: 'wrap'}}>
          <h1>NY BOE Contributor Search</h1>
          <hr style={{width: '100%', borderStyle: 'solid', borderColor: '#EEE'}}/>

          <Search />

        </div>
      </div>
    </ReactiveBase>
  );
}

export default App;
