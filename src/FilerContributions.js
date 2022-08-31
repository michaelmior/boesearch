import { ReactiveList } from "@appbaseio/reactivesearch";

import ContributionList from './ContributionList';
import Loader from './Loader';

function FilerContributions({filerID}) {
  return <ReactiveList
    componentId="filerContributions"
    sortOptions={[
      {label: "Amount", dataField: "ORG_AMT", sortBy: "desc"},
      {label: "Donation date", dataField: "SCHED_DATE", sortBy: "desc"},
      {label: "Election year", dataField: "ELECTION_YEAR", sortBy: "desc"},
    ]}
    size={10}
    pagination={true}

    // Retrieve only contributions to this single filer
    defaultQuery={() => ({
      query: {
        match: {
          FILER_ID: filerID
        }
      }
    })}
    render={({error, loading, data}) => {
      if (loading) {
        return <Loader/>
      } else if (error) {
        // TODO: Add a better error message
        return <div>Error</div>;
      } else {
        return <ContributionList data={data} showRecipient={false} />
      }
    }}
  />;
}

export default FilerContributions;
