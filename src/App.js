import { ReactiveBase, DataSearch, MultiDropdownList, ReactiveList, ResultList } from "@appbaseio/reactivesearch";
import { formatAddress } from "localized-address-format";
import { FaCalendar, FaMap } from "react-icons/fa";
import './App.css';

function App() {
  return (
    <ReactiveBase
      url={process.env.REACT_APP_ES_URL}
      app={process.env.REACT_APP_ES_INDEX}
      credentials={`${process.env.REACT_APP_ES_USER}:${process.env.REACT_APP_ES_PASSWORD}`}
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
                      <FaMap style={{float: 'left', marginRight: '1em', color: '#424242'}}/></a><div style={{float: 'left'}}>
                        {address.filter(line => line.indexOf('undefined') === -1).map(line => <>{line}<br/></>)}</div></> : <></>;
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
                      <div style={{marginLeft: '2em'}}>{[item.FLNG_ENT_FIRST_NAME, item.FLNG_ENT_MIDDLE_NAME, item.FLNG_ENT_LAST_NAME].filter(part => part !== undefined).join(' ').trim()}</div>
                      {addressBlock}
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
