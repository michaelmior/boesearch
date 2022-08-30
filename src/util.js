export const getSearchURL = (item) => {
  let searchTerm = item._FLNG_ENT_FULL_NAME;
  if (item.FLNG_ENT_CITY && item.FLNG_ENT_STATE) {
    searchTerm += ` ${item.FLNG_ENT_CITY}, ${item.FLNG_ENT_STATE}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
};
