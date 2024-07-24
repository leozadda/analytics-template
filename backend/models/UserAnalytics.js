const mongoose = require('mongoose');

// Define the schema for our analytics data
const UserAnalyticSchema = new mongoose.Schema({
  uid: { type: String, unique: true }, // Unique identifier for each user
  interactedForm: Boolean, // Whether the user interacted with the form
  submittedForm: Boolean, // Whether the form was submitted
  submittedFormText: String, // The text that was submitted (email in this case)
  unsubmittedFormText: String, // The text that was left unsubmitted
  userIPAddress: String, // User's IP address
  dateOfEntry: { type: Date, default: Date.now }, // Date of the analytics entry
  pageInteractions: [{
    pageName: String, // the name of the page
    componentsScrolled: [String], // the react components user scrolled
    percentPageScrolled: Number, // percentage of the page scrolled
    timeEntered: Date, // the timestamp when the user entered the page
    timeExited: Date, // the timestamp when the user exited the page
    totalTimeSpentPage: Number, // calculates the total time spent on the page
  }],
  userCoordinates: {
    lat: Number, // Latitude of the user
    lon: Number, // Longitude of the user
  }
});

// Create a model from the schema
module.exports = mongoose.model('UserAnalytics', UserAnalyticSchema);
