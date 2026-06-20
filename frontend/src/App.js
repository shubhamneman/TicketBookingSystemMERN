import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import './App.css';

function AppContent() {
  const { user } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState(null);

  if (!user) return <AuthPage />;

  return (
    <>
      <Navbar onHome={() => setSelectedEventId(null)} />
      <main className="main-content">
        {selectedEventId ? (
          <EventDetailPage
            eventId={selectedEventId}
            onBack={() => setSelectedEventId(null)}
          />
        ) : (
          <EventsPage onSelectEvent={setSelectedEventId} />
        )}
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
