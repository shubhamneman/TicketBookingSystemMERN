import { useState, useEffect } from 'react';

export default function CountdownTimer({ expiresAt, onExpire }) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000))
  );

  useEffect(() => {
    if (secondsLeft <= 0) { onExpire(); return; }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); onExpire(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const isUrgent = secondsLeft <= 60;

  return (
    <div className={`countdown ${isUrgent ? 'urgent' : ''}`}>
      ⏱ Reservation expires in: <strong>{mins}:{secs}</strong>
    </div>
  );
}
