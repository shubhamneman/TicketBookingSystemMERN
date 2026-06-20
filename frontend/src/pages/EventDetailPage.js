import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import SeatGrid from '../components/SeatGrid';
import CountdownTimer from '../components/CountdownTimer';

const STEP = { SELECT: 'SELECT', RESERVED: 'RESERVED', BOOKED: 'BOOKED' };

export default function EventDetailPage({ eventId, onBack }) {
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [reservation, setReservation] = useState(null);
  const [step, setStep] = useState(STEP.SELECT);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEvent = useCallback(() => {
    api.getEvent(eventId)
      .then(({ event, seats }) => { setEvent(event); setSeats(seats); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [eventId]);

  useEffect(() => { fetchEvent(); }, [fetchEvent]);

  const toggleSeat = (seatNumber) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber) ? prev.filter((s) => s !== seatNumber) : [...prev, seatNumber]
    );
    setError('');
  };

  const handleReserve = async () => {
    if (!selectedSeats.length) return setError('Please select at least one seat.');
    setActionLoading(true);
    setError('');
    try {
      const res = await api.reserve({ eventId, seatNumbers: selectedSeats });
      setReservation(res);
      setStep(STEP.RESERVED);
      fetchEvent(); // refresh seat statuses
    } catch (err) {
      setError(err.message);
      fetchEvent(); // refresh to show updated statuses
    } finally {
      setActionLoading(false);
    }
  };

  const handleBook = async () => {
    setActionLoading(true);
    setError('');
    try {
      const res = await api.book({ reservationId: reservation._id });
      setBooking(res);
      setStep(STEP.BOOKED);
      fetchEvent();
    } catch (err) {
      setError(err.message);
      if (err.message.includes('expired')) {
        setStep(STEP.SELECT);
        setReservation(null);
        setSelectedSeats([]);
        fetchEvent();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleExpire = useCallback(() => {
    setError('Your reservation has expired. Please select seats again.');
    setStep(STEP.SELECT);
    setReservation(null);
    setSelectedSeats([]);
    fetchEvent();
  }, [fetchEvent]);

  if (loading) return <div className="center-msg">Loading event...</div>;
  if (!event) return <div className="center-msg error-msg">{error || 'Event not found'}</div>;

  return (
    <div className="page">
      <button className="btn-back" onClick={onBack}>← Back to Events</button>

      <div className="event-header">
        <h2>{event.name}</h2>
        <p>📅 {new Date(event.dateTime).toLocaleString()} &nbsp;|&nbsp; 📍 {event.venue}</p>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {step === STEP.BOOKED ? (
        <div className="success-card">
          <h3>🎉 Booking Confirmed!</h3>
          <p>Your seats: <strong>{booking.seatNumbers.join(', ')}</strong></p>
          <button className="btn-primary" onClick={onBack}>Back to Events</button>
        </div>
      ) : (
        <>
          {step === STEP.RESERVED && reservation && (
            <CountdownTimer expiresAt={reservation.expiresAt} onExpire={handleExpire} />
          )}

          <SeatGrid seats={seats} selectedSeats={selectedSeats} onToggleSeat={step === STEP.SELECT ? toggleSeat : () => {}} />

          <div className="action-bar">
            {step === STEP.SELECT ? (
              <>
                <p>{selectedSeats.length} seat(s) selected: <strong>{selectedSeats.join(', ') || 'None'}</strong></p>
                <button className="btn-primary" onClick={handleReserve} disabled={actionLoading || !selectedSeats.length}>
                  {actionLoading ? 'Reserving...' : 'Reserve Seats'}
                </button>
              </>
            ) : (
              <>
                <p>Reserved seats: <strong>{reservation?.seatNumbers.join(', ')}</strong></p>
                <button className="btn-success" onClick={handleBook} disabled={actionLoading}>
                  {actionLoading ? 'Confirming...' : 'Confirm Booking'}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
