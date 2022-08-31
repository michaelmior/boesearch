import { formatAddress } from "localized-address-format";

// Build a currency formatter to use in `formatCurrency` below
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
});

export const formatCurrency = formatter.format;

export const formatItemAddress = (item, candidate) => {
  // Format the address where `candidate` is a boolean that determines
  // whether we are dealing with candidate or filer data, so that we
  // can select which fields to use from the data appropriately
  //
  // Note that all candidates are assumed to be in the US
  return formatAddress({
    addressLines: [candidate ? item.ADDRESS : item.FLNG_ENT_ADD1],
    locality: candidate ? item.CITY : item.FLNG_ENT_CITY,
    administrativeArea: candidate ? item.STATE : item.FLNG_ENT_STATE,
    postalCode: candidate ? item.ZIPCODE : item.FLNG_ENT_ZIP,
    postalCountry: candidate ? 'US' : (item.FLNG_ENT_COUNTRY === 'United States' ? 'US': undefined)
  });
};

export const getSearchURL = (item) => {
  let searchTerm = item._FLNG_ENT_FULL_NAME;
  if (item.FLNG_ENT_CITY && item.FLNG_ENT_STATE) {
    searchTerm += ` ${item.FLNG_ENT_CITY}, ${item.FLNG_ENT_STATE}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
};
