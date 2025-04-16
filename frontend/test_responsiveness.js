const axios = require('axios');

// Configuration
const BASE_URL = 'http://172.27.16.252:3000'; // Replace with your site's base URL
const ENDPOINTS = [
  '/', // Home page
];

const measureResponseTime = async (url) => {
  try {
    const startTime = Date.now(); // Start time
    const response = await axios.get(url); // Send GET request
    const endTime = Date.now(); // End time

    console.log(`Response from ${url}:`);
    console.log(`Status: ${response.status}`);
    console.log(`Time Taken: ${endTime - startTime} ms\n`);
  } catch (error) {
    console.error(`Error accessing ${url}:`, error.message);
  }
};

const testResponseTimes = async () => {
  console.log('Measuring response times...\n');
  for (const endpoint of ENDPOINTS) {
    const url = `${BASE_URL}${endpoint}`;
    await measureResponseTime(url);
  }
  console.log('Response time testing completed.');
};

// Run the script
testResponseTimes();