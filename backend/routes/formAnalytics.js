const express = require('express');
const UserAnalytics = require('../models/UserAnalytics');
const router = express.Router();

// Route to save or update submitted form data
router.post('/track-submitted-form', async (req, res) => {
  const { uid, submittedForm, email } = req.body;
  console.log('Received /track-submitted-form request:', req.body);

  try {
    let analytics = await UserAnalytics.findOne({ uid });

    if (analytics) {
      // Update existing entry
      console.log('Updating existing entry for UID:', uid);
      analytics.submittedForm = true;
      analytics.interactedForm = true;
      analytics.submittedFormText = email;
    } else {
      analytics = new UserAnalytics({
        uid,
        userIPAddress: '', // Update this to get the actual IP address
        userCoordinates: { lat: 0, lon: 0 }, // Update this to get the actual coordinates
        interactedForm: true,
        submittedForm: true,
        submittedFormText: '',
        unsubmittedFormText: email,
        pageInteractions: [], // Initialize with an empty array
      });

    }

    await analytics.save();
    console.log('Saved analytics data for UID:', uid);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in /track-submitted-form:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route to save or update unsubmitted form data
router.post('/track-unsubmitted-form', async (req, res) => {
  const { uid, interactedForm, formInput } = req.body;
  console.log('Received /track-unsubmitted-form request:', req.body);

  try {
    let analytics = await UserAnalytics.findOne({ uid });

    if (analytics) {
      // Update existing entry
      console.log('Updating existing entry for UID:', uid);
      analytics.interactedForm = interactedForm;
      analytics.unsubmittedFormText = formInput;
    } else {
      // Create new entry
      console.log('Creating new entry for UID:', uid);
      analytics = new UserAnalytics({
        uid,
        userIPAddress: '', // Update this to get the actual IP address
        userCoordinates: { lat: 0, lon: 0 }, // Update this to get the actual coordinates
        interactedForm: interactedForm,
        submittedForm: false,
        submittedFormText: '',
        unsubmittedFormText: formInput,
        pageInteractions: [], // Initialize with an empty array
      });
    }

    await analytics.save();
    res.status(200).json({ message: 'Analytics data saved successfully' });
  } catch (error) {
    console.error('Error saving analytics data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to display all user data, including non-interacting visitors
router.get('/all-form-data', async (req, res) => {
  try {
    console.log('Received request for /all-form-data');
    const allData = await UserAnalytics.find({})
      .select('uid interactedForm submittedForm submittedFormText unsubmittedFormText dateOfEntry -_id')
      .sort({ dateOfEntry: -1 }) // Sort by newest first
      .limit(100); // Limit to last 100 entries

    const formattedData = allData.map(entry => {
      let status;
      let email;

      if (entry.submittedForm) {
        status = 'Submitted';
        email = entry.submittedFormText;
      } else if (entry.interactedForm) {
        status = 'Interacted';
        email = entry.unsubmittedFormText;
      } else {
        status = 'Visited';
        email = '';
      }

      return {
        uid: entry.uid,
        status: status,
        email: email,
        visitDate: entry.dateOfEntry
      };
    });

    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching all user data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


module.exports = router;
