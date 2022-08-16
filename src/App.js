import { ReactiveBase, DataSearch, MultiDropdownList, ReactiveList, ResultList } from "@appbaseio/reactivesearch";
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
            {field: 'FLNG_ENT_LAST_NAME', weight: 1}
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
              {data.map((item) =>
                <ResultList key={item._id}>
                  <ResultList.Content>
                    <ResultList.Title>
                      ${item.ORG_AMT} from {item.FLNG_ENT_FIRST_NAME} {item.FLNG_ENT_LAST_NAME} to {item.CAND_COMM_NAME} ({item.ELECTION_YEAR})
                    </ResultList.Title>
                    <ResultList.Description>
                      {(new Date(item.SCHED_DATE)).toLocaleDateString('en-us')}<br/>
                      {item.FLNG_ENT_ADD1}<br/>
                        {item.FLNG_ENT_CITY}, {item.FLNG_ENT_STATE} {item.FLNG_ENT_ZIP}<br/>
                      {item.FLNG_ENT_COUNTRY}
                    </ResultList.Description>
                  </ResultList.Content>
                </ResultList>
              )}
            </ReactiveList.ResultListWrapper>
          )}
        />
      </div>
    </ReactiveBase>
  );
}

export default App;
