const router = require('express').Router();
const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const Reservation = require('../models/Reservation');
const auth = require('../middleware/auth');

// POST /api/bookings
router.post('/', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { reservationId } = req.body;
    if (!reservationId)
      return res.status(400).json({ message: 'reservationId is required' });

    const reservation = await Reservation.findOne({
      _id: reservationId,
      userId: req.user.id
    }).session(session);

    if (!reservation) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.expiresAt < new Date()) {
      await session.abortTransaction();
      return res.status(410).json({ message: 'Reservation has expired' });
    }

    await Seat.updateMany(
      { eventId: reservation.eventId, seatNumber: { $in: reservation.seatNumbers }, status: 'reserved' },
      { $set: { status: 'booked' } },
      { session }
    );

    await Reservation.deleteOne({ _id: reservationId }, { session });

    await session.commitTransaction();
    res.json({
      message: 'Booking confirmed!',
      eventId: reservation.eventId,
      seatNumbers: reservation.seatNumbers
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
