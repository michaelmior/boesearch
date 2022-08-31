import { formatItemAddress } from './util';
import AddressBlock from './AddressBlock';

function FilerData({data}) {
  const address = formatItemAddress(data, true);
  let filerType = data.FILER_TYPE_DESC;
  if (data.COUNTY_DESC) {
    filerType += ` (${data.COUNTY_DESC})`;
  }
  return <div>
    <h2>{data.CAND_COMM_NAME}</h2>
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
