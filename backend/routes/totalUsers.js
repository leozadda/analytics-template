const express = require('express');
const moment = require('moment');
const UserAnalytics = require('../models/UserAnalytics');
const router = express.Router();

// Route to display total user count, grouped by month of entry
router.get('/all-user-data', async (req, res) => {
  try {
    console.log('Received request for /all-user-data');
    const allData = await UserAnalytics.find({})
      .select('dateOfEntry -_id')
      .sort({ dateOfEntry: -1 });

    const monthlyData = {};

    allData.forEach(entry => {
      const monthOfEntry = moment(entry.dateOfEntry).format('MMMM');
      if (!monthlyData[monthOfEntry]) {
        monthlyData[monthOfEntry] = 0;
      }
      monthlyData[monthOfEntry]++;
    });

    res.status(200).json(monthlyData);
  } catch (error) {
    console.error('Error fetching all user data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;