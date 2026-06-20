export default function SeatGrid({ seats, selectedSeats, onToggleSeat }) {
  const statusColor = (seat) => {
    if (seat.status === 'booked') return 'seat booked';
    if (seat.status === 'reserved') return 'seat reserved';
    if (selectedSeats.includes(seat.seatNumber)) return 'seat selected';
    return 'seat available';
  };

  return (
    <div>
      <div className="seat-legend">
        <span className="seat available">Available</span>
        <span className="seat selected">Selected</span>
        <span className="seat reserved">Reserved</span>
        <span className="seat booked">Booked</span>
      </div>
      <div className="stage">🎭 STAGE</div>
      <div className="seat-grid">
        {seats.map((seat) => (
          <button
            key={seat._id}
            className={statusColor(seat)}
            disabled={seat.status === 'booked' || seat.status === 'reserved'}
            onClick={() => onToggleSeat(seat.seatNumber)}
            title={seat.seatNumber}
          >
            {seat.seatNumber}
          </button>
        ))}
      </div>
    </div>
  );
}
