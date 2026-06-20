import { useAuth } from '../context/AuthContext';

export default function Navbar({ onHome }) {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={onHome}>🎟 TicketBooking</div>
      <div className="navbar-user">
        {user && (
          <>
            <span>👤 {user.name}</span>
            <button className="btn-logout" onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
