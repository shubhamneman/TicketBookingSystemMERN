const router = require('express').Router();
const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const Reservation = require('../models/Reservation');
const auth = require('../middleware/auth');

// POST /api/reserve
router.post('/', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { eventId, seatNumbers } = req.body;
    if (!eventId || !seatNumbers?.length)
      return res.status(400).json({ message: 'eventId and seatNumbers are required' });

    // Atomically find and update only available seats
    const seats = await Seat.find({
      eventId,
      seatNumber: { $in: seatNumbers },
      status: 'available'
    }).session(session);

    if (seats.length !== seatNumbers.length) {
      await session.abortTransaction();
      const unavailable = seatNumbers.filter(
        (s) => !seats.find((seat) => seat.seatNumber === s)
      );
      return res.status(409).json({ message: 'Some seats are no longer available', unavailable });
    }

    await Seat.updateMany(
      { eventId, seatNumber: { $in: seatNumbers }, status: 'available' },
      { $set: { status: 'reserved' } },
      { session }
    );

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const reservation = await Reservation.create(
      [{ userId: req.user.id, eventId, seatNumbers, expiresAt }],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json(reservation[0]);
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
