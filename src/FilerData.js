import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

import { formatItemAddress } from './util';
import AddressBlock from './AddressBlock';

function FilerData({data}) {
  const address = formatItemAddress(data, true);
  let filerType = data.FILER_TYPE_DESC;
  if (data.COUNTY_DESC) {
    filerType += ` (${data.COUNTY_DESC})`;
  }

  const statusStyle = {fontSize: '0.75em'};
  let status = <></>;
  if (data.STATUS[0] === 'ACTIVE') {
    status = <FaCheckCircle style={statusStyle} />
  } else if (data.STATUS[0] === 'TERMINATED') {
    status = <FaTimesCircle style={statusStyle} />
  }

  return <div>
    <h2>
      <span style={{marginRight: '0.5em'}}>{data.CAND_COMM_NAME}</span>
      <Tippy content={data.STATUS[0][0] + data.STATUS[0].slice(1).toLowerCase()}>
        <div style={{display: 'inline'}}>{status}</div>
      </Tippy>
    </h2>
    <p>{data.COMMITTEE_TYPE_DESC}</p>
    <p>{filerType}</p>
    <AddressBlock address={address} />
    <iframe
      title="Map"
      height="200"
      style={{marginTop: '1em', width: '100%'}}
      loading="lazy"
      allowfullscreen
      referrerpolicy="no-referrer-when-downgrade"
      src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_MAPS_API_KEY}&q=${address.join(' ')}`}>
    </iframe>
  </div>;
}

export default FilerData;