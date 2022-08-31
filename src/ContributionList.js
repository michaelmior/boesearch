import React from 'react';
import { FaCalendar } from "react-icons/fa";
import { ReactiveList, ResultList } from "@appbaseio/reactivesearch";

import { formatCurrency, formatItemAddress, getNotesElement, getSearchURL } from './util';
import AddressBlock from './AddressBlock';

function ContributionList({data, showRecipient}) {
  return <ReactiveList.ResultListWrapper>
    {data.map((item) => {
      let title = `${formatCurrency(item.ORG_AMT)} from ${item._FLNG_ENT_FULL_NAME}`;
      if (showRecipient) {
        title += ` to ${item.CAND_COMM_NAME}`;
      }
      title += `(${item.ELECTION_YEAR})`;

      return (<ResultList key={item._id} className="results">
        <ResultList.Content>
          <ResultList.Title>
            {title}
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

            <AddressBlock address={formatItemAddress(item)} />
            {getNotesElement(item)}
          </ResultList.Description>
        </ResultList.Content>
      </ResultList>);
    })}
  </ReactiveList.ResultListWrapper>
}

export default ContributionList;
