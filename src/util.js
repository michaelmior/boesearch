import { FaRegStickyNote } from "react-icons/fa";
import { formatAddress } from "localized-address-format";

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
});

export const formatCurrency = (amount) => {
  return formatter.format(amount);
};

export const getSearchURL = (item) => {
  let searchTerm = item._FLNG_ENT_FULL_NAME;
  if (item.FLNG_ENT_CITY && item.FLNG_ENT_STATE) {
    searchTerm += ` ${item.FLNG_ENT_CITY}, ${item.FLNG_ENT_STATE}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
};

export const formatItemAddress = (item, candidate) => {
  return formatAddress({
    addressLines: [candidate ? item.ADDRESS : item.FLNG_ENT_ADD1],
    locality: candidate ? item.CITY : item.FLNG_ENT_CITY,
    administrativeArea: candidate ? item.STATE : item.FLNG_ENT_STATE,
    postalCode: candidate ? item.ZIPCODE : item.FLNG_ENT_ZIP,
    postalCountry: candidate ? 'US' : (item.FLNG_ENT_COUNTRY === 'United States' ? 'US': undefined)
  });
};

export const getNotesElement = (item) => {
  const notesText = [item.PURPOSE_CODE_DESC, item.TRANS_EXPLNTN]
    .map(s => (s || '').trim())
    .filter(s => s.length > 0)
    .map(s => <p>{s}</p>);
  const notes = notesText.length > 0 ?
    <div style={{paddingTop: '1em', paddingBottom: '1em', clear: 'both'}}>
      <FaRegStickyNote style={{float: 'left', marginRight: '1em'}}/>
      <div style={{float: 'left'}}>
        {notesText}
      </div>
    </div>: <></>;

  return notes;
};
