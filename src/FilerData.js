import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

import { formatCurrency, formatItemAddress } from './util';
import AddressBlock from './AddressBlock';

function FilerData({fields, aggregations}) {
  const address = formatItemAddress(fields, true);

  // Show the filer type (state/county) along with more details if applicable
  let filerType = fields.FILER_TYPE_DESC;
  const details = [];
  if (fields.COUNTY_DESC) {
    details.push(fields.COUNTY_DESC);
  }
  if (fields.MUNICIPALITY_DESC[0]) {
    const municipalityParts = fields.MUNICIPALITY_DESC[0].split(',');
    // If this is the county, we already added it, so skip
    if (municipalityParts[1] !== 'County') {
      // Otherwise, we convert info such as
      // "Rochester,City" to "City of Rochester"
      if (municipalityParts[0].indexOf(municipalityParts[1]) !== -1) {
        // This addresses weird cases such as "Rochester City,City"
        // so we get "Rochester City" instead of "City of Rochester City"
        details.push(municipalityParts[0]);
      } else {
        details.push(`${municipalityParts[1]} of ${municipalityParts[0]}`);
      }
    }
  }
  filerType += ` (${details.join(', ')})`;

  // Generate the correct icon based on candidate status
  const statusStyle = {fontSize: '0.75em'};
  let status = <></>;
  if (fields.STATUS[0] === 'ACTIVE') {
    status = <FaCheckCircle style={statusStyle} />
  } else if (fields.STATUS[0] === 'TERMINATED') {
    status = <FaTimesCircle style={statusStyle} />
  }

  return <div>
    <h2>
      <span style={{marginRight: '0.5em'}}>{fields.CAND_COMM_NAME}</span>

      {/* Add an icon with active/terminated status */}
      <Tippy content={fields.STATUS[0][0] + fields.STATUS[0].slice(1).toLowerCase()}>
        <div style={{display: 'inline'}}>{status}</div>
      </Tippy>
    </h2>
    <h3>Total Contributions {formatCurrency(aggregations._ORG_AMT_TOTAL.value)}</h3>

    {/* Add some additional metadata */}
    <p>{fields.COMMITTEE_TYPE_DESC}</p>
    <p>{filerType}</p>

    {/* Show the address text*/}
    <AddressBlock address={address} />

    {/* Embed a Google Maps instance with the location */}
    <iframe
      title="Map"
      height="200"
      style={{marginTop: '1em', width: '100%', background: '#EEE'}}
      loading="lazy"
      allowfullscreen
      referrerpolicy="no-referrer-when-downgrade"
      src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_MAPS_API_KEY}&q=${address.join(' ')}`}>
    </iframe>
  </div>;
}

export default FilerData;
