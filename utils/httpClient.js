// Minimal HTTP client utility for internal service communication if needed
const axios = require('axios');

const httpClient = axios.create({
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

module.exports = httpClient;
