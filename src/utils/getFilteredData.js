// Function that filtered data
export const getFilteredData = (data, search) => {
  if (!search) return data;

  const lowerSearch = search.toLowerCase();
  return data.filter((item) => {
    return Object.values(item).some((value) => {
      return String(value).toLowerCase().includes(lowerSearch);
    });
  });
};
