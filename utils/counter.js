// Generic counter or helper if needed for IDs or analysis
let requestCounter = 0;

const getNextRequestId = () => {
  return ++requestCounter;
};

module.exports = {
  getNextRequestId
};
