export const getName = (item) => {
  return [
    item.FLNG_ENT_FIRST_NAME,
    item.FLNG_ENT_MIDDLE_NAME,
    item.FLNG_ENT_LAST_NAME
  ].filter(part => part !== undefined).join(' ').trim();
};

export const getSearchURL = (item) => {
  let searchTerm = getName(item);
  if (item.FLNG_ENT_CITY && item.FLNG_ENT_STATE) {
    searchTerm += ` ${item.FLNG_ENT_CITY}, ${item.FLNG_ENT_STATE}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
};
