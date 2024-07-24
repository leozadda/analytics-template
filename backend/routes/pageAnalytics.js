const express = require('express');
const UserAnalytics = require('../models/UserAnalytics');
const router = express.Router();
const axios = require('axios');

// Route to save or update submitted form data
router.post('/save-page-data', async (req, res) => {
  const { uid, pageData } = req.body;
  console.log('Received page data:', req.body);

  try {
    let user = await UserAnalytics.findOne({ uid });

    if (user) {
      // Update existing entry
      console.log('Updating existing entry for UID:', uid);
      user.pageInteractions.push(pageData);
    } else {
      // Create new entry
      console.log('Creating new entry for UID:', uid);
      user = new UserAnalytics({
        uid,
        userIPAddress: '',
        userCoordinates: { lat: 0, lon: 0 },
        interactedForm: false,
        submittedForm: false,
        submittedFormText: '',
        unsubmittedFormText: '',
        pageInteractions: [pageData],
      });
    }

    await user.save();
    console.log('Saved analytics data for UID:', uid);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in /save-page-data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route to display all user data, including non-interacting visitors
router.get('/get-page-data', async (req, res) => {
  try {
    console.log('Received request for /get-page-data');
    const allData = await UserAnalytics.find({})
      .select('uid pageInteractions dateOfEntry -_id')
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
