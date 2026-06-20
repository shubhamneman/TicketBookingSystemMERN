const router = require('express').Router();
const Event = require('../models/Event');
const Seat = require('../models/Seat');
const auth = require('../middleware/auth');

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ dateTime: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const seats = await Seat.find({ eventId: req.params.id }).sort({ seatNumber: 1 });
    res.json({ event, seats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/events - create event + auto-generate seats (admin use / seed)
router.post('/', auth, async (req, res) => {
  try {
    const { name, dateTime, venue, totalSeats } = req.body;
    if (!name || !dateTime || !venue || !totalSeats)
      return res.status(400).json({ message: 'All fields required' });

    const event = await Event.create({ name, dateTime, venue, totalSeats });

    const seatDocs = Array.from({ length: totalSeats }, (_, i) => ({
      eventId: event._id,
      seatNumber: `S${String(i + 1).padStart(2, '0')}`,
      status: 'available'
    }));
    await Seat.insertMany(seatDocs);

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
