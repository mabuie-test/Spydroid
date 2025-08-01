const mongoose = require('mongoose');

const DataPointSchema = new mongoose.Schema({
  username:  { type: String, required: true },
  timestamp: { type: Date,   default: Date.now },
  location:  { lat: Number, lng: Number, time: Date },
  sms:       Array,
  calls:     Array,
  photo:     String
});

module.exports = mongoose.model('DataPoint', DataPointSchema);
