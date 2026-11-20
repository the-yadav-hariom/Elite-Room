// Vercel Serverless Function: Real-Time Request Relay
// Provides zero-CORS same-origin relay between Phone and Laptop

let inMemoryRequests = [];

export default function handler(req, res) {
  // Global CORS headers for cross-device access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle incoming actions from phone or staff
  if (req.method === 'POST') {
    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (e) {}
    }

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    if (payload.type === 'NEW_REQUEST' && payload.request) {
      // Prepend and deduplicate by id
      inMemoryRequests = [
        payload.request,
        ...inMemoryRequests.filter(r => r.id !== payload.request.id)
      ];
      // Keep last 50 requests
      if (inMemoryRequests.length > 50) {
        inMemoryRequests = inMemoryRequests.slice(0, 50);
      }
      return res.status(200).json({ success: true, count: inMemoryRequests.length, request: payload.request });
    }

    if (payload.type === 'ACCEPT_REQUEST' && payload.id) {
      inMemoryRequests = inMemoryRequests.map(r =>
        r.id === payload.id
          ? { ...r, status: 'dispatched', assignedTo: payload.assignedTo || 'Attendant Ana' }
          : r
      );
      return res.status(200).json({ success: true, count: inMemoryRequests.length });
    }

    if (payload.type === 'COMPLETE_REQUEST' && payload.id) {
      inMemoryRequests = inMemoryRequests.map(r =>
        r.id === payload.id ? { ...r, status: 'completed' } : r
      );
      return res.status(200).json({ success: true, count: inMemoryRequests.length });
    }

    return res.status(200).json({ success: true, count: inMemoryRequests.length });
  }

  // GET requests: Return current queue
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      requests: inMemoryRequests
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
