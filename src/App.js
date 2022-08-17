import { ReactiveBase, DataSearch, MultiDropdownList, ReactiveList, ResultList } from "@appbaseio/reactivesearch";
import { formatAddress } from "localized-address-format";
import { FaCalendar, FaMap, FaRegStickyNote } from "react-icons/fa";
import useDarkMode from 'use-dark-mode';
import './App.css';

function getName(item) {
  return [
    item.FLNG_ENT_FIRST_NAME,
    item.FLNG_ENT_MIDDLE_NAME,
    item.FLNG_ENT_LAST_NAME
  ].filter(part => part !== undefined).join(' ').trim();
}

function getSearchTerm(item) {
  let searchTerm = getName(item);
  if (item.FLNG_ENT_CITY && item.FLNG_ENT_STATE) {
    searchTerm += ` ${item.FLNG_ENT_CITY}, ${item.FLNG_ENT_STATE}`;
  }

  return searchTerm;
}

function App() {
  const darkMode = useDarkMode(false);
  const theme = darkMode ? 'dark': 'light';

  return (
    <ReactiveBase
      url={process.env.REACT_APP_ES_URL}
      app={process.env.REACT_APP_ES_INDEX}
      credentials={`${process.env.REACT_APP_ES_USER}:${process.env.REACT_APP_ES_PASSWORD}`}
      themePreset={theme}
    >
      <div className="App">
        <DataSearch
          componentId="searchBox"
          dataField={[
            {field: '_FLNG_ENT_FULL_NAME', weight: 1}
          ]}
          placeholder='Search'
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
                const addressBlock = (address[0] !== "undefined" && address.join('').trim().length > 0) ? <><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.join(' '))}`} target="_blank" rel="noreferrer">
                      <FaMap style={{float: 'left', marginRight: '1em'}}/></a><div style={{float: 'left'}}>
                        {address.filter(line => line.indexOf('undefined') === -1).map(line => <>{line}<br/></>)}</div></> : <></>;

                const notes = item.TRANS_EXPLNTN ? <div style={{paddingTop: '1em', paddingBottom: '1em', clear: 'both'}}>
                  <FaRegStickyNote style={{float: 'left', marginRight: '1em'}}/>
                    {item.TRANS_EXPLNTN}
                </div>: <></>;
                return (<ResultList key={item._id}>
                  <ResultList.Content>
                    <ResultList.Title>
                      ${item.ORG_AMT} from {item._FLNG_ENT_FULL_NAME} to {item.CAND_COMM_NAME} ({item.ELECTION_YEAR})
                    </ResultList.Title>
                    <ResultList.Description>
                      <div style={{paddingBottom: '1em'}}>
                        <FaCalendar style={{float: 'left', marginRight: '1em'}}/>
                        {(new Date(item.SCHED_DATE)).toLocaleDateString('en-us')}
                      </div>
                        <div style={{marginLeft: '2em'}}><a className='name' href={`https://www.google.com/search?q=${encodeURIComponent(getSearchTerm(item))}`} target="_blank" rel="noreferrer">{getName(item)}</a></div>
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
