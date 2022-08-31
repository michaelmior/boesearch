import React from 'react';
import { formatCurrency, formatItemAddress, getNotesElement, getSearchURL } from './util';
import { FaCalendar, FaMap } from "react-icons/fa";
import { ReactiveList, ResultList } from "@appbaseio/reactivesearch";

function ContributionList({data, showRecipient}) {
  return <ReactiveList.ResultListWrapper>
    {data.map((item) => {
      let title = `${formatCurrency(item.ORG_AMT)} from ${item._FLNG_ENT_FULL_NAME}`;
      if (showRecipient) {
        title += ` to ${item.CAND_COMM_NAME}`;
      }
      title += `(${item.ELECTION_YEAR})`;

      const address = formatItemAddress(item);
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

            {addressBlock}
            {getNotesElement(item)}
          </ResultList.Description>
        </ResultList.Content>
      </ResultList>);
    })}
  </ReactiveList.ResultListWrapper>
}

export default ContributionList;
