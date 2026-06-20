import { useState, useEffect } from 'react';
import { api } from '../api';

export default function EventsPage({ onSelectEvent }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getEvents()
      .then(setEvents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="center-msg">Loading events...</div>;
  if (error) return <div className="center-msg error-msg">{error}</div>;

  return (
    <div className="page">
      <h2>Upcoming Events</h2>
      {events.length === 0 ? (
        <p className="center-msg">No events available. Run the seed script to add events.</p>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event._id} className="event-card" onClick={() => onSelectEvent(event._id)}>
              <h3>{event.name}</h3>
              <p>📅 {new Date(event.dateTime).toLocaleString()}</p>
              <p>📍 {event.venue}</p>
              <p>🎟 {event.totalSeats} Total Seats</p>
              <button className="btn-primary">View Seats</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
