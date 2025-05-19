const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minLength: [3, "Event title must be atleast 3 character long"],
  },
  description: {
    type: String,
    required: true,
    minLength: [10, "Description must be atleast 10 character long"],
    maxLength: [1000, "Description can not be more than 1000"]
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true,
    minLength: [5, "Event Venue must be atleast 10 character long"],
  },
  attendees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  inventoryAssigned: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory'
    }
  ],
  schedule: [
    {
      time: String,
      activity: String
    }
  ],
}, {timestamps: true});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event; 
