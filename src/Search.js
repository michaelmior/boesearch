import React, { useState } from 'react';
import { FaCalendar, FaMap, FaRegStickyNote } from "react-icons/fa";
import { formatAddress } from "localized-address-format";
import { DataSearch, RangeInput, MultiDropdownList, ReactiveList, ResultList } from "@appbaseio/reactivesearch";

import { getSearchURL } from './util';

function Search() {
  const [searchField, setSearchField] = useState('_FLNG_ENT_FULL_NAME');

  return (<>
    <div>
      <div style={{marginBottom: '1em'}}>
        <strong>Search by</strong>
        <label>
          <input type="radio" value="_FLNG_ENT_FULL_NAME" checked={searchField === '_FLNG_ENT_FULL_NAME'} onChange={() => setSearchField('_FLNG_ENT_FULL_NAME')}/>
          <span>Filing entity name</span>
        </label>
        <label>
          <input name="search_candidate" type="radio" value="CAND_COMM_NAME" checked={searchField === 'CAND_COMM_NAME'} onChange={() => setSearchField('CAND_COMM_NAME')}/>
          <span>Candidate name</span>
        </label>
      </div>
      <MultiDropdownList
        componentId="electionTypeFilter"
        dataField="ELECTION_TYPE"
        title="Election type"
        aggregationSize={5}
        queryFormat="or"
        react={{and: ["searchBox", "electionYearFilter"]}}
      />
      <br/>
      <RangeInput
        title="Election year"
        componentId="electionYearFilter"
        dataField="ELECTION_YEAR"
        react={{and: ["searchBox", "electionTypeFilter"]}}
        stepValue={1}
        showHistogram={true}
        showFilter={true}
        range={{start: 1999, end: 2022}}
        defaultValue={{start: 1999, end: 2022}}
      />
    </div>

    <div style={{flex: 1}}>
      <DataSearch
        componentId="searchBox"
        dataField={[
          {field: searchField, weight: 1}
        ]}
        placeholder='Search'
        queryFormat="and"
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
          and: ["searchBox", "electionTypeFilter", "electionYearFilter"]
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

              return (<ResultList key={item._id} className="results">
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
                        {item._FLNG_ENT_FULL_NAME}
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
  </>);
}

export default Search;
