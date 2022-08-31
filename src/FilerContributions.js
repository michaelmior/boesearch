import { ReactiveList, ResultList } from "@appbaseio/reactivesearch";
import { FaCalendar } from "react-icons/fa";

import { formatCurrency, getNotesElement, getSearchURL } from './util';

import ContributionList from './ContributionList';

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
    defaultQuery={() => ({
      query: {
        match: {
          FILER_ID: filerID
        }
      }
    })}
    render={({data}) => (
      <ContributionList data={data} showRecipient={false} />
    )}
  />;
}

export default FilerContributions;
