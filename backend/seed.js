require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');
const Seat = require('./models/Seat');

const events = [
  { name: 'Rock Fest 2025', dateTime: new Date('2025-08-15T19:00:00'), venue: 'Square Garden', totalSeats: 30 },
  { name: 'Jazz Night', dateTime: new Date('2025-09-01T20:00:00'), venue: 'Blue Club', totalSeats: 20 },
  { name: 'Tech Conference', dateTime: new Date('2025-10-10T09:00:00'), venue: 'Convention Center', totalSeats: 25 }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Event.deleteMany({});
  await Seat.deleteMany({});
  console.log('Cleared existing data');

  for (const evData of events) {
    const event = await Event.create(evData);
    const seats = Array.from({ length: evData.totalSeats }, (_, i) => ({
      eventId: event._id,
      seatNumber: `S${String(i + 1).padStart(2, '0')}`,
      status: 'available'
    }));
    await Seat.insertMany(seats);
    console.log(`Created event: ${event.name} with ${evData.totalSeats} seats`);
  }

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
