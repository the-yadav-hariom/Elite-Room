import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const RequestContext = createContext();

const CLOUD_SYNC_TOPIC = 'elite_jonrad_hotel_304_dispatch';
const CLOUD_SYNC_URL = `https://ntfy.sh/${CLOUD_SYNC_TOPIC}`;
const CLOUD_SYNC_WS = `wss://ntfy.sh/${CLOUD_SYNC_TOPIC}/ws`;

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
    } catch (e) {}
    return INITIAL_REQUESTS;
  });

  const [isStaffRinging, setIsStaffRinging] = useState(false);
  const [latestRingingRequest, setLatestRingingRequest] = useState(null);

  // Sync state to localStorage for local cross-tab communication
  useEffect(() => {
    try {
      localStorage.setItem('elite_jonrad_requests', JSON.stringify(requests));
    } catch (e) {}
  }, [requests]);

  // Central message processor for cloud payloads
  const handleIncomingCloudMessage = useCallback((payload) => {
    if (!payload) return;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch (e) {}
    }
    if (!payload || typeof payload !== 'object') return;

    if (payload.type === 'NEW_REQUEST' && payload.request) {
      setRequests(prev => {
        if (prev.some(r => r.id === payload.request.id)) return prev;
        return [payload.request, ...prev];
      });
      // Ring immediately on staff dashboard!
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
  }, []);

  // ================= BULLETPROOF REAL-TIME RECEIVER (SSE + WS + 1s SHORT-POLL) =================
  useEffect(() => {
    let eventSource = null;
    let ws = null;

    // 1. Server-Sent Events (SSE)
    try {
      eventSource = new EventSource(`${CLOUD_SYNC_URL}/sse`);
      eventSource.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          if (raw.event === 'message' && raw.message) {
            let payload = null;
            try { payload = JSON.parse(raw.message); } catch (e) { payload = raw.message; }
            handleIncomingCloudMessage(payload);
          }
        } catch (e) {}
      };
    } catch (err) {}

    // 2. Parallel WebSocket (ultra-low latency sub-50ms)
    try {
      ws = new WebSocket(CLOUD_SYNC_WS);
      ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          if (raw.event === 'message' && raw.message) {
            let payload = null;
            try { payload = JSON.parse(raw.message); } catch (e) { payload = raw.message; }
            handleIncomingCloudMessage(payload);
          }
        } catch (e) {}
      };
    } catch (err) {}

    // 3. Fallback 1-second short-poll (guarantees delivery if SSE/WS blocked by Wi-Fi or firewall)
    const pollInterval = setInterval(() => {
      fetch(`${CLOUD_SYNC_URL}/json?poll=1&since=12s`)
        .then(r => r.text())
        .then(text => {
          text.trim().split('\n').forEach(line => {
            try {
              const raw = JSON.parse(line);
              if (raw.event === 'message' && raw.message) {
                let payload = null;
                try { payload = JSON.parse(raw.message); } catch (e) { payload = raw.message; }
                handleIncomingCloudMessage(payload);
              }
            } catch (e) {}
          });
        }).catch(() => {});
    }, 1000);

    // 4. Local tab storage event listener
    const handleStorage = (e) => {
      if (e.key === 'elite_jonrad_requests' && e.newValue) {
        try {
          setRequests(JSON.parse(e.newValue));
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
      if (ws) ws.close();
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [handleIncomingCloudMessage]);

  // ================= MULTI-TRANSPORT CLOUD BROADCAST (PHONE -> LAPTOP) =================
  const broadcastCloudMessage = (payload) => {
    const payloadStr = JSON.stringify(payload);

    // Transport 1: Raw string POST to topic (ntfy reads entire body as message)
    fetch(CLOUD_SYNC_URL, {
      method: 'POST',
      body: payloadStr,
      keepalive: true
    }).catch(() => {});

    // Transport 2: no-cors POST (bypasses any mobile carrier/CORS firewall)
    fetch(CLOUD_SYNC_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: payloadStr,
      keepalive: true
    }).catch(() => {});

    // Transport 3: Official JSON API with topic and message fields
    fetch('https://ntfy.sh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: CLOUD_SYNC_TOPIC,
        message: payloadStr,
        title: 'Elite Jonrad Hotel - Room 304',
        priority: 5
      }),
      keepalive: true
    }).catch(() => {});

    // Transport 4: navigator.sendBeacon for mobile OS background reliability
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(CLOUD_SYNC_URL, payloadStr);
      }
    } catch (e) {}
  };

  // When a guest clicks a button from the phone:
  // ABSOLUTELY NO AUDIO IS PLAYED ON GUEST SIDE!
  // Transmits to staff laptop over internet instantly!
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

    // Broadcast across all internet transports to laptop
    broadcastCloudMessage({
      type: 'NEW_REQUEST',
      request: newReq
    });

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
    broadcastCloudMessage({
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

  // Accept all incoming requests
  const acceptAllIncoming = (attendantName = 'Attendant Ana') => {
    setIsStaffRinging(false);
    setLatestRingingRequest(null);

    try {
      localStorage.setItem('elite_jonrad_staff_ringing', 'false');
    } catch (e) {}

    setRequests(prev =>
      prev.map(item => {
        if (item.status === 'pending') {
          broadcastCloudMessage({
            type: 'ACCEPT_REQUEST',
            id: item.id,
            assignedTo: attendantName
          });
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

  // Fast accept + send ETA
  const quickAcceptAndEta = (id, mins = 3, attendantName = 'Attendant Ana') => {
    setIsStaffRinging(false);
    setLatestRingingRequest(null);

    broadcastCloudMessage({
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
            acceptedAt: new Date().toISOString(),
            notes: item.notes ? `${item.notes} | ETA: ${mins}m` : `Attendant en route • ETA: ${mins}m`
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
      broadcastCloudMessage({ type: 'COMPLETE_REQUEST', id });
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
        acceptAllIncoming,
        quickAcceptAndEta,
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
