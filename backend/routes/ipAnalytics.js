const express = require('express');
const UserAnalytics = require('../models/UserAnalytics');
const router = express.Router();
const axios = require('axios');

// Route to save or update submitted form data
router.post('/save-ip-address', async (req, res) => {
  const { uid, userIPAddress } = req.body;
  console.log('Received:', req.body);

  try {
    let user = await UserAnalytics.findOne({ uid });

    // Fetch the geographical coordinates for the IP address
    const response = await axios.get(`http://ip-api.com/json/${userIPAddress}`);
    if (response.data.status !== 'success') {
      throw new Error('Failed to fetch geolocation data');
    }
    const { lat, lon } = response.data;

    if (user) {
      // Update existing entry
      console.log('Updating existing entry for UID:', uid);
      user.userIPAddress = userIPAddress;
      user.userCoordinates = { lat, lon };
    } else {
      // Create new entry
      console.log('Creating new entry for UID:', uid);
      user = new UserAnalytics({
        uid,
        userIPAddress,
        userCoordinates: { lat, lon },
        interactedForm: false,
        submittedForm: false,
        submittedFormText: '',
        unsubmittedFormText: '',
        pageInteractions: [],
      });
    }

    await user.save();
    console.log('Saved analytics data for UID:', uid);
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error in /save-ip-address:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route to display all user data, including non-interacting visitors
router.get('/all-ip-data', async (req, res) => {
  try {
    console.log('Received request for /all-ip-data');
    const allData = await UserAnalytics.find({})
      .select('uid userIPAddress userCoordinates dateOfEntry -_id')
      .sort({ dateOfEntry: -1 }) // Sort by newest first
      .limit(100); // Limit to last 100 entries
    // Send data
    res.status(200).json(allData);
  } catch (error) {
    console.error('Error fetching all user data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
