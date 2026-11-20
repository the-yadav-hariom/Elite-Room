import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const RequestContext = createContext();

const CLOUD_SYNC_URL = 'https://ntfy.sh/elite_jonrad_hotel_304_dispatch';

const INITIAL_REQUESTS = [
  {
    id: 'req-304-bell',
    room: '304',
    roomType: 'Executive King Room',
    floor: 'Floor 3',
    guestName: 'Alexander Wright (VIP)',
    serviceItem: 'Call Housekeeper',
    category: 'Housekeeping',
    department: 'Housekeeping Desk',
    urgency: 'high',
    status: 'pending',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    assignedTo: 'Attendant Ana',
    notes: 'In-room chime rung via luxury concierge tablet.',
    icon: '🛎️'
  },
  {
    id: 'req-304-water',
    room: '304',
    roomType: 'Executive King Room',
    floor: 'Floor 3',
    guestName: 'Alexander Wright (VIP)',
    serviceItem: 'Bottled Water (2x Still)',
    category: 'Room Service',
    department: 'Room Service',
    urgency: 'medium',
    status: 'dispatched',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    assignedTo: 'Attendant Ana',
    notes: 'Guest requested chilled sparkling or still waters.',
    icon: '💧'
  },
  {
    id: 'req-312-clean',
    room: '312',
    roomType: 'Deluxe Sea View Suite',
    floor: 'Floor 3',
    guestName: 'Elena Rostova',
    serviceItem: 'Clean My Room',
    category: 'Housekeeping',
    department: 'Housekeeping Desk',
    urgency: 'low',
    status: 'dispatched',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    assignedTo: 'Attendant Ana',
    notes: 'Fresh linens requested.',
    icon: '🧹'
  },
  {
    id: 'req-308-ac',
    room: '308',
    roomType: 'Terrace Junior Suite',
    floor: 'Floor 3',
    guestName: 'Marcus Vance',
    serviceItem: 'AC / Tech Check',
    category: 'Maintenance',
    department: 'Engineering Tech',
    urgency: 'medium',
    status: 'dispatched',
    timestamp: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
    assignedTo: 'Tech Mike',
    notes: 'Thermostat reading 24C, requested adjustment to 20C.',
    icon: '🔧'
  },
  {
    id: 'req-301-towels',
    room: '301',
    roomType: 'Superior Queen',
    floor: 'Floor 3',
    guestName: 'Sophia Lin',
    serviceItem: 'Extra Bath Towels',
    category: 'Housekeeping',
    department: 'Housekeeping Desk',
    urgency: 'low',
    status: 'completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    assignedTo: 'Attendant Ana',
    notes: 'Delivered 2x plush bath sheets.',
    icon: '🧖'
  }
];

export function RequestProvider({ children }) {
  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('elite_jonrad_requests');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    return INITIAL_REQUESTS;
  });

  const [isStaffRinging, setIsStaffRinging] = useState(false);
  const [latestRingingRequest, setLatestRingingRequest] = useState(null);

  // Sync state to localStorage for local cross-tab communication
  useEffect(() => {
    try {
      localStorage.setItem('elite_jonrad_requests', JSON.stringify(requests));
    } catch (e) {
      console.warn('Storage write failed', e);
    }
  }, [requests]);

  // ================= CLOUD REAL-TIME SYNCHRONIZATION (PHONE <-> LAPTOP) =================
  useEffect(() => {
    let eventSource = null;

    try {
      eventSource = new EventSource(`${CLOUD_SYNC_URL}/sse`);
      
      eventSource.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          if (raw.event === 'message' && raw.message) {
            const payload = JSON.parse(raw.message);

            if (payload.type === 'NEW_REQUEST' && payload.request) {
              setRequests(prev => {
                if (prev.some(r => r.id === payload.request.id)) return prev;
                return [payload.request, ...prev];
              });
              // Triggers continuous ringing on staff dashboard!
              setIsStaffRinging(true);
              setLatestRingingRequest(payload.request);
            } else if (payload.type === 'ACCEPT_REQUEST' && payload.id) {
              setRequests(prev =>
                prev.map(r => r.id === payload.id ? { ...r, status: 'dispatched', assignedTo: payload.assignedTo || 'Attendant Ana' } : r)
              );
              setIsStaffRinging(false);
              setLatestRingingRequest(null);
            } else if (payload.type === 'COMPLETE_REQUEST' && payload.id) {
              setRequests(prev =>
                prev.map(r => r.id === payload.id ? { ...r, status: 'completed' } : r)
              );
            }
          }
        } catch (e) {
          // Non-JSON message from broker, safe to ignore
        }
      };
    } catch (err) {
      console.warn('Cloud EventSource initialization:', err);
    }

    // Local tab storage event listener
    const handleStorage = (e) => {
      if (e.key === 'elite_jonrad_requests' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setRequests(parsed);
        } catch (err) {}
      }
      if (e.key === 'elite_jonrad_staff_ringing') {
        if (e.newValue === 'true') {
          setIsStaffRinging(true);
        } else if (e.newValue === 'false') {
          setIsStaffRinging(false);
          setLatestRingingRequest(null);
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (eventSource) eventSource.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Dispatch cloud message helper
  const sendCloudBroadcast = async (payload) => {
    try {
      await fetch(CLOUD_SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Cloud broadcast notification notice:', err);
    }
  };

  // When a guest clicks a button from the phone / guest room side:
  // ABSOLUTELY NO AUDIO IS PLAYED HERE ON GUEST SIDE!
  // Transmits via Cloud SSE to the staff laptop instantly over internet!
  const addGuestRequest = (serviceItem, category, department, room = '304', notes = '') => {
    const newReq = {
      id: `req-${Date.now()}`,
      room,
      roomType: room === '304' ? 'Executive King Room' : `Room ${room}`,
      floor: `Floor ${room.charAt(0)}`,
      guestName: room === '304' ? 'Alexander Wright (VIP)' : 'In-House Guest',
      serviceItem,
      category: category || 'Guest Request',
      department: department || 'Floor Captain',
      urgency: 'high',
      status: 'pending',
      timestamp: new Date().toISOString(),
      assignedTo: 'Unassigned',
      notes: notes || `Direct in-room dispatch from Room ${room} tablet.`,
      icon: serviceItem.includes('Water') ? '💧' : serviceItem.includes('Towel') ? '🧖' : serviceItem.includes('Bill') ? '🧾' : serviceItem.includes('AC') ? '🔧' : serviceItem.includes('Clean') ? '🧹' : '🛎️'
    };

    setRequests(prev => [newReq, ...prev]);

    // 1. Broadcast over internet (reaches laptop anywhere!)
    sendCloudBroadcast({
      type: 'NEW_REQUEST',
      request: newReq
    });

    // 2. Broadcast to local tabs
    try {
      localStorage.setItem('elite_jonrad_staff_ringing', 'true');
    } catch (e) {}

    return newReq;
  };

  // When staff accepts the request on the laptop:
  // 1. Closes continuous ringing immediately
  // 2. Moves request to dispatched board
  // 3. Notifies phone over the internet
  const acceptRequest = (id, attendantName = 'Attendant Ana') => {
    setIsStaffRinging(false);
    setLatestRingingRequest(null);

    // Broadcast accept event over internet
    sendCloudBroadcast({
      type: 'ACCEPT_REQUEST',
      id,
      assignedTo: attendantName
    });

    try {
      localStorage.setItem('elite_jonrad_staff_ringing', 'false');
    } catch (e) {}

    setRequests(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'dispatched',
            assignedTo: attendantName,
            acceptedAt: new Date().toISOString()
          };
        }
        return item;
      })
    );
  };

  const stopStaffRinging = useCallback(() => {
    setIsStaffRinging(false);
    setLatestRingingRequest(null);
    try {
      localStorage.setItem('elite_jonrad_staff_ringing', 'false');
    } catch (e) {}
  }, []);

  const updateRequestStatus = (id, newStatus, assignedTo) => {
    if (newStatus === 'dispatched' || newStatus === 'completed') {
      stopStaffRinging();
    }
    if (newStatus === 'completed') {
      sendCloudBroadcast({ type: 'COMPLETE_REQUEST', id });
    }
    setRequests(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: newStatus,
            assignedTo: assignedTo !== undefined ? assignedTo : item.assignedTo
          };
        }
        return item;
      })
    );
  };

  const addRequestNote = (id, noteText) => {
    setRequests(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            notes: item.notes ? `${item.notes} | ${noteText}` : noteText
          };
        }
        return item;
      })
    );
  };

  return (
    <RequestContext.Provider
      value={{
        requests,
        isStaffRinging,
        latestRingingRequest,
        stopStaffRinging,
        addGuestRequest,
        acceptRequest,
        updateRequestStatus,
        addRequestNote
      }}
    >
      {children}
    </RequestContext.Provider>
  );
}

export function useRequests() {
  const ctx = useContext(RequestContext);
  if (!ctx) throw new Error('useRequests must be used within a RequestProvider');
  return ctx;
}
