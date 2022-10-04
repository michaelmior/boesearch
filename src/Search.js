import React from 'react';
import {useQueryParam, withDefault, StringParam} from 'use-query-params';
import {
  DataSearch,
  RangeInput,
  MultiDropdownList,
  ReactiveList,
} from '@appbaseio/reactivesearch';

import FilingList from './FilingList';
import Loader from './Loader';

import './Search.css';

function Search() {
  const [searchField, setSearchField] = useQueryParam(
    'searchField',
    withDefault(StringParam, '_FLNG_ENT_FULL_NAME')
  );

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        columnGap: '3em',
        rowGap: '2em',
        flexFlow: 'wrap',
      }}
    >
      <div>
        {/* Allow searching by either filer name or candidate name */}
        <div style={{marginBottom: '1em'}}>
          <strong>Search by</strong>
          <label>
            <input
              type="radio"
              value="_FLNG_ENT_FULL_NAME"
              checked={searchField === '_FLNG_ENT_FULL_NAME'}
              onChange={() => setSearchField('_FLNG_ENT_FULL_NAME')}
            />
            <span>Filing entity name</span>
          </label>
          <label>
            <input
              name="search_candidate"
              type="radio"
              value="CAND_COMM_NAME"
              checked={searchField === 'CAND_COMM_NAME'}
              onChange={() => setSearchField('CAND_COMM_NAME')}
            />
            <span>Candidate name</span>
          </label>
        </div>

        <MultiDropdownList
          componentId="electionTypeFilter"
          dataField="ELECTION_TYPE"
          title="Election type"
          aggregationSize={5}
          queryFormat="or"
          URLParams={true}
          react={{and: ['searchBox', 'electionYearFilter']}}
        />
        <br />
        <RangeInput
          title="Election year"
          componentId="electionYearFilter"
          dataField="ELECTION_YEAR"
          react={{and: ['searchBox', 'electionTypeFilter']}}
          stepValue={1}
          showHistogram={true}
          showFilter={true}
          URLParams={true}
          // For some reason DynamicRangeInput isn't working,
          // so for now we just set these values manually
          range={{start: 1999, end: 2022}}
          defaultValue={{start: 1999, end: 2022}}
        />
      </div>

      <div style={{flex: 1}}>
        <DataSearch
          componentId="searchBox"
          dataField={[{field: searchField, weight: 1}]}
          placeholder="Search"
          queryFormat="and"
          URLParams={true}
        />
        <br />
        <ReactiveList
          componentId="results"
          dataField="_score"
          sortOptions={[
            {label: 'Relevance', dataField: '_score', sortBy: 'desc'},
            {label: 'Amount', dataField: 'ORG_AMT', sortBy: 'desc'},
            {label: 'Donation date', dataField: 'SCHED_DATE', sortBy: 'desc'},
            {
              label: 'Election year',
              dataField: 'ELECTION_YEAR',
              sortBy: 'desc',
            },
          ]}
          size={50}
          pagination={true}
          react={{
            // Any other filters which are added must be listed
            // here so that the search results will update to match
            and: ['searchBox', 'electionTypeFilter', 'electionYearFilter'],
          }}
          render={({error, loading, data}) => {
            if (loading) {
              return <Loader />;
            } else if (error) {
              // TODO: Add a better error message
              return <div>Error</div>;
            } else {
              return <FilingList data={data} showRecipient={true} />;
            }
          }}
        />
      </div>
    </div>
  );
}

export default Search;
