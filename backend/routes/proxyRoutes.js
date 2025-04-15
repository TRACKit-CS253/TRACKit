const express = require('express');
const router = express.Router();
const axios = require('axios');

// Proxy endpoint for attendance API
router.post('/proxy/attendance', async (req, res) => {
  try {
    // Forward the request to the actual attendance API
    const response = await axios.post('http://172.31.1.3:5000/api/attendance', req.body);
    
    // Return the response from the attendance API
    res.json(response.data);
  } catch (error) {
    console.error('Attendance API proxy error:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error fetching attendance data',
      error: error.message
    });
  }
});

module.exports = router;