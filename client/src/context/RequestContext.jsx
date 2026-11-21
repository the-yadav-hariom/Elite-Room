import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const RequestContext = createContext();

const MQTT_TOPIC = 'elite_jonrad_hotel_304_dispatch';
const BROKERS = [
  { name: 'emqx', host: 'broker.emqx.io', port: 8084, path: '/mqtt' },
  { name: 'hivemq', host: 'broker.hivemq.com', port: 8884, path: '/mqtt' }
];

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

  const mqttClientsRef = useRef([]);

  // ================= DUAL-BROKER MQTT WEBSOCKET REAL-TIME RECEIVER =================
  useEffect(() => {
    let isMounted = true;
    const activeClients = [];

    const initBrokers = () => {
      const PahoMQTT = (typeof window !== 'undefined' && window.Paho && window.Paho.MQTT) ? window.Paho.MQTT : null;
      if (!PahoMQTT) {
        setTimeout(initBrokers, 400);
        return;
      }

      BROKERS.forEach(b => {
        try {
          const clientId = `spa_${b.name}_${Math.random().toString(16).substring(2, 8)}`;
          const client = new PahoMQTT.Client(b.host, b.port, b.path, clientId);

          const doConnect = () => {
            if (!isMounted) return;
            client.connect({
              useSSL: true,
              timeout: 6,
              keepAliveInterval: 30,
              cleanSession: true,
              onSuccess: () => {
                if (isMounted) {
                  try { client.subscribe(MQTT_TOPIC, { qos: 1 }); } catch (e) {}
                }
              },
              onFailure: () => {
                if (isMounted) setTimeout(doConnect, 4000);
              }
            });
          };

          client.onConnectionLost = () => {
            if (isMounted) setTimeout(doConnect, 2500);
          };

          client.onMessageArrived = (message) => {
            try {
              const payload = JSON.parse(message.payloadString);
              handleIncomingCloudMessage(payload);
            } catch (e) {}
          };

          doConnect();
          activeClients.push(client);
        } catch (e) {}
      });

      mqttClientsRef.current = activeClients;
    };

    initBrokers();

    // Local tab storage event listener
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

    let bc = null;
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('elite_jonrad_hotel_bus');
      bc.onmessage = (e) => {
        if (e.data) handleIncomingCloudMessage(e.data);
      };
    }

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
      activeClients.forEach(c => {
        try { if (c.isConnected()) c.disconnect(); } catch (e) {}
      });
    };
  }, [handleIncomingCloudMessage]);

  // ================= DUAL-BROKER MQTT CLOUD BROADCAST (PHONE -> LAPTOP) =================
  const broadcastCloudMessage = (payload) => {
    const payloadStr = JSON.stringify(payload);

    // 1. Dual MQTT Broadcast
    const PahoMQTT = (typeof window !== 'undefined' && window.Paho && window.Paho.MQTT) ? window.Paho.MQTT : null;
    if (PahoMQTT && mqttClientsRef.current) {
      mqttClientsRef.current.forEach(c => {
        try {
          if (c && c.isConnected()) {
            const msg = new PahoMQTT.Message(payloadStr);
            msg.destinationName = MQTT_TOPIC;
            msg.qos = 1;
            c.send(msg);
          }
        } catch (e) {}
      });
    }

    // 2. Local BroadcastChannel
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('elite_jonrad_hotel_bus');
        bc.postMessage(payload);
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
