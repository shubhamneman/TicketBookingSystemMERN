const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateTime: { type: Date, required: true },
  venue: { type: String, required: true },
  totalSeats: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
