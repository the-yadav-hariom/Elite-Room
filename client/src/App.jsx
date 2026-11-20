import React, { useState, useEffect } from 'react';
import { RequestProvider } from './context/RequestContext';
import GuestRoom from './components/GuestRoom';
import StaffDashboard from './components/StaffDashboard';

export default function App() {
  // Determine route based on HTTP URL path or hash:
  // e.g. http://localhost:3000/staff or http://localhost:3000/#staff -> 'staff'
  // e.g. http://localhost:3000/ or http://localhost:3000/guest -> 'guest'
  const getRoute = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('/staff') || hash.includes('staff')) {
      return 'staff';
    }
    return 'guest';
  };

  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(getRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  return (
    <RequestProvider>
      {route === 'staff' ? (
        <StaffDashboard />
      ) : (
        <GuestRoom />
      )}
    </RequestProvider>
  );
}
