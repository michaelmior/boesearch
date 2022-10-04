import React, {useState} from 'react';
import {ReactiveComponent} from '@appbaseio/reactivesearch';
import {useParams} from 'react-router-dom';

import FilerFilings from './FilerFilings';
import FilerData from './FilerData';
import Loader from './Loader';

function Filer() {
  const {filerID} = useParams();
  let [showFilings, setShowFilings] = useState(false);

  return (
    <div style={{maxWidth: '800px', margin: '0 auto'}}>
      <ReactiveComponent
        componentId="filerData"
        defaultQuery={() => ({
          fields: [
            'CAND_COMM_NAME',
            'FILER_TYPE_DESC',
            'COMMITTEE_TYPE_DESC',
            'STATUS',
            'COUNTY_DESC',
            'MUNICIPALITY_DESC',
            'TREASURER_FIRST_NAME',
            'TREASURER_LAST_NAME',
            'TREASURER_MIDDLE_NAME',
            'ADDRESS',
            'CITY',
            'STATE',
            'ZIPCODE',
          ],
          _source: false,

          // Filings are only for this single filer
          query: {
            match: {
              FILER_ID: filerID,
            },
          },

          // Get the total amount of contributions
          aggs: {
            _IN_AMT_TOTAL: {sum: {field: '_IN_AMT'}},
            _OUT_AMT_TOTAL: {sum: {field: '_OUT_AMT'}},
          },

          // Since we just need the filer info (same for all requests), get one
          size: 1,
        })}
        render={({error, loading, data, aggregations}) => {
          if (loading) {
            return <Loader />;
          } else if (error || data.length !== 1) {
            // TODO: Add a better error message
            return <div>Error</div>;
          } else {
            // Now that the main data was loaded, show contributions
            setShowFilings(true);

            const fields = data[0].fields;
            return <FilerData fields={fields} aggregations={aggregations} />;
          }
        }}
      />

      <div style={{display: showFilings ? 'block' : 'none'}}>
        <h3 style={{marginBottom: '0em'}}>Contributions and Expenses</h3>
        <FilerFilings filerID={filerID} />
      </div>
    </div>
  );
}

export default Filer;
