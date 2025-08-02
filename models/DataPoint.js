const mongoose = require('mongoose');

const DataPointSchema = new mongoose.Schema({
  username:  { type: String, required: true },
  timestamp: { type: Date,   default: Date.now },
  location:  {
    lat:  Number,
    lng:  Number,
    time: Date
  },
  sms:   [{ from:String, message:String, timestamp:Date }],
  calls: [{ number:String, type:String, duration:Number, timestamp:Date }],
  photo: String
});

module.exports = mongoose.model('DataPoint', DataPointSchema);
