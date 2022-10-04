import React from 'react';
import {
  FaArrowAltCircleRight,
  FaArrowAltCircleLeft,
  FaCalendar,
  FaRegStickyNote,
} from 'react-icons/fa';
import {ReactiveList, ResultList} from '@appbaseio/reactivesearch';

import {formatCurrency, formatItemAddress, getSearchURL} from './util';
import AddressBlock from './AddressBlock';

function FilingList({data, showRecipient}) {
  // Generate paragraphs that include the two possible notes values
  const notesText = [data.PURPOSE_CODE_DESC, data.TRANS_EXPLNTN]
    .map((s) => (s || '').trim())
    .filter((s) => s.length > 0)
    .map((s) => <p>{s}</p>);

  // If we have relevant notes, generate the block
  const notes =
    notesText.length > 0 ? (
      <div style={{paddingTop: '1em', paddingBottom: '1em', clear: 'both'}}>
        <FaRegStickyNote style={{float: 'left', marginRight: '1em'}} />
        <div style={{float: 'left'}}>{notesText}</div>
      </div>
    ) : (
      <></>
    );

  return (
    <ReactiveList.ResultListWrapper>
      {data.map((item) => {
        // Show direction of contribution/expense
        const incoming = '_IN_AMT' in item;
        const dir1 = incoming ? 'from' : 'to';
        const dir2 = incoming ? 'to' : 'from';
        const icon = incoming ? (
          <FaArrowAltCircleLeft style={{marginRight: '1em'}} />
        ) : (
          <FaArrowAltCircleRight style={{marginRight: '1em'}} />
        );

        // Generate a title for each result, which may not include the recipient
        // (useful for detail pages when all donations have the same recipient)
        let title = [
          icon,
          `${formatCurrency(item.ORG_AMT)} ${dir1} ${
            item._FLNG_ENT_FULL_NAME || 'Unknown'
          }`,
        ];
        if (showRecipient) {
          title.push(
            <>
              {' '}
              {dir2}{' '}
              <a href={`/filer/${item.FILER_ID}`}>{item.CAND_COMM_NAME}</a>
            </>
          );
        }
        title.push(` (${item.ELECTION_YEAR})`);

        return (
          <ResultList key={item._id} className="results" as="div">
            <ResultList.Content>
              <ResultList.Title>{title}</ResultList.Title>

              <ResultList.Description>
                <div style={{paddingBottom: '1em', marginLeft: '2em'}}>
                  {item.FILING_SCHED_DESC}
                </div>
                <div style={{paddingBottom: '1em'}}>
                  <FaCalendar style={{float: 'left', marginRight: '1em'}} />
                  {new Date(item.SCHED_DATE).toLocaleDateString('en-us')}
                </div>

                <div style={{marginLeft: '2em'}}>
                  <a
                    className="name"
                    href={getSearchURL(item)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item._FLNG_ENT_FULL_NAME}
                  </a>
                </div>

                <AddressBlock address={formatItemAddress(item)} />
                {notes}
              </ResultList.Description>
            </ResultList.Content>
          </ResultList>
        );
      })}
    </ReactiveList.ResultListWrapper>
  );
}

export default FilingList;
