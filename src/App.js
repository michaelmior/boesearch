import React from 'react';
import { ReactiveBase, DataSearch, MultiDropdownList, ReactiveList, ResultList } from "@appbaseio/reactivesearch";
import { LightDarkToggle } from 'react-light-dark-toggle';
import { formatAddress } from "localized-address-format";
import { FaCalendar, FaMap, FaRegStickyNote } from "react-icons/fa";
import useDarkMode from 'use-dark-mode';

import { getName, getSearchURL } from './util';
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
        <header>
          <h1>NY BOE Contributor Search</h1>

          <div style={{ paddingTop: '1.5em', position: 'absolute', top: 0, right: '2em', zIndex: 999 }}>
            <LightDarkToggle
              onToggle={darkMode.toggle}
              isLight={!darkMode.value}
              size='2em' />
          </div>
        </header>

        <DataSearch
          componentId="searchBox"
          dataField={[
            {field: '_FLNG_ENT_FULL_NAME', weight: 1}
          ]}
          placeholder='Search'
          queryFormat="and"
        />
        <br />
        <MultiDropdownList
          componentId="electionTypeFilter"
          dataField="ELECTION_TYPE"
          title="Filter by Election type"
          aggregationSize={5}
          queryFormat="or"
          react={{and: ["searchBox"]}}
        />
        <br />
        <ReactiveList
          componentId="results"
          dataField="_score"
          sortOptions={[
            {label: "Relevance", dataField: "_score", sortBy: "desc"},
            {label: "Amount", dataField: "ORG_AMT", sortBy: "desc"},
            {label: "Donation date", dataField: "SCHED_DATE", sortBy: "desc"},
            {label: "Election year", dataField: "ELECTION_YEAR", sortBy: "desc"},
          ]}
          size={50}
          pagination={true}
          react={{
            and: ["searchBox", "electionTypeFilter"]
          }}
          render={({data}) => (
            <ReactiveList.ResultListWrapper>
              {data.map((item) => {
                const address = formatAddress({
                  addressLines: [item.FLNG_ENT_ADD1],
                  locality: item.FLNG_ENT_CITY,
                  administrativeArea: item.FLNG_ENT_STATE,
                  postalCode: item.FLNG_ENT_ZIP,
                  postalCountry: item.FLNG_ENT_COUNTRY === 'United States' ? 'US': undefined
                });
                const addressBlock = (address[0] !== "undefined" && address.join('').trim().length > 0) ?
                  <React.Fragment>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.join(' '))}`} target="_blank" rel="noreferrer">
                      <FaMap style={{float: 'left', marginRight: '1em'}}/>
                    </a>
                    <div style={{float: 'left'}}>
                      {address.filter(line => line.indexOf('undefined') === -1)
                              .map((line, i) =>
                                <React.Fragment key={i}>
                                  {line}<br/>
                                </React.Fragment>)}
                    </div>
                  </React.Fragment> : <></>;

                const notesText = [item.PURPOSE_CODE_DESC, item.TRANS_EXPLNTN]
                  .map(s => (s || '').trim())
                  .filter(s => s.length > 0)
                  .map(s => <p>{s}</p>);
                const notes = notesText.length > 0 ?
                  <div style={{paddingTop: '1em', paddingBottom: '1em', clear: 'both'}}>
                    <FaRegStickyNote style={{float: 'left', marginRight: '1em'}}/>
                    <div style={{float: 'left'}}>
                      {notesText}
                    </div>
                  </div>: <></>;

                const formatter = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2
                });

                return (<ResultList key={item._id}>
                  <ResultList.Content>
                    <ResultList.Title>
                      {formatter.format(item.ORG_AMT)} from {item._FLNG_ENT_FULL_NAME} to {item.CAND_COMM_NAME} ({item.ELECTION_YEAR})
                    </ResultList.Title>
                    <ResultList.Description>
                      <div style={{paddingBottom: '1em'}}>
                        <FaCalendar style={{float: 'left', marginRight: '1em'}}/>
                        {(new Date(item.SCHED_DATE)).toLocaleDateString('en-us')}
                      </div>

                      <div style={{marginLeft: '2em'}}>
                        <a className='name' href={getSearchURL(item)} target="_blank" rel="noreferrer">
                          {getName(item)}
                        </a>
                      </div>

                      {addressBlock}
                      {notes}
                    </ResultList.Description>
                  </ResultList.Content>
                </ResultList>);
              })}
            </ReactiveList.ResultListWrapper>
          )}
        />
      </div>
    </ReactiveBase>
  );
}

export default App;
