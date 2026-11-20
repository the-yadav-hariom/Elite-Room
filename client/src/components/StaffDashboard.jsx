import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRequests } from '../context/RequestContext';

export default function StaffDashboard() {
  const {
    requests,
    isStaffRinging,
    latestRingingRequest,
    stopStaffRinging,
    acceptRequest,
    updateRequestStatus,
    addRequestNote
  } = useRequests();

  // Primary operational tabs:
  // 'incoming' = unaccepted incoming calls (ringing)
  // 'dispatched' = accepted calls currently in progress (dispatch side)
  // 'completed' = resolved requests
  const [activeTab, setActiveTab] = useState('incoming');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [noteInputId, setNoteInputId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [quickNotice, setQuickNotice] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio Context and Ringtone Interval - EXCLUSIVE TO STAFF PAGE ONLY!
  const audioContextRef = useRef(null);
  const ringIntervalRef = useRef(null);

  // Synthesize hotel brass desk chime for staff alert
  const playStaffBellChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // High harmonic chime
      [2093, 2637, 3135].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.24 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.95);
      });

      // Second reverberation
      [1760, 2093, 2793].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + 0.22);
        gain.gain.setValueAtTime(0.28 / (idx + 1), now + 0.22);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + 0.22);
        osc.stop(now + 1.45);
      });
    } catch (err) {
      console.warn('Staff audio error:', err);
    }
  }, [soundEnabled]);

  // Continuous ringing loop on staff side
  useEffect(() => {
    if (isStaffRinging && soundEnabled) {
      // Ring immediately
      playStaffBellChime();

      // Loop every 1.8 seconds continuously until accepted
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = setInterval(() => {
        playStaffBellChime();
      }, 1800);
    } else {
      if (ringIntervalRef.current) {
        clearInterval(ringIntervalRef.current);
        ringIntervalRef.current = null;
      }
    }

    return () => {
      if (ringIntervalRef.current) {
        clearInterval(ringIntervalRef.current);
        ringIntervalRef.current = null;
      }
    };
  }, [isStaffRinging, soundEnabled, playStaffBellChime]);

  // Group requests
  const incomingRequests = useMemo(() => {
    return requests.filter(r => r.status === 'pending');
  }, [requests]);

  const dispatchedRequests = useMemo(() => {
    return requests.filter(r => r.status === 'dispatched');
  }, [requests]);

  const completedRequests = useMemo(() => {
    return requests.filter(r => r.status === 'completed');
  }, [requests]);

  // Tab dataset
  const currentTabList = useMemo(() => {
    let list = [];
    if (activeTab === 'incoming') list = incomingRequests;
    else if (activeTab === 'dispatched') list = dispatchedRequests;
    else if (activeTab === 'completed') list = completedRequests;

    return list.filter(req => {
      if (selectedCategory !== 'All' && req.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !req.room.toLowerCase().includes(q) &&
          !req.serviceItem.toLowerCase().includes(q) &&
          !req.guestName.toLowerCase().includes(q) &&
          !req.department.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [activeTab, incomingRequests, dispatchedRequests, completedRequests, selectedCategory, searchQuery]);

  // Handle staff accepting a request
  const handleAccept = (reqId) => {
    // 1. Closes the ringing tone immediately
    // 2. Moves the request to dispatched side (removes from incoming)
    acceptRequest(reqId, 'Attendant Ana');

    // 3. Switch view directly to the "Dispatched Side" so staff only sees dispatched items!
    setActiveTab('dispatched');

    setQuickNotice('✓ Request Accepted! Ringtone stopped. Moved to Dispatch Side.');
    setTimeout(() => setQuickNotice(null), 4000);
  };

  const handleComplete = (reqId) => {
    updateRequestStatus(reqId, 'completed');
    setQuickNotice('✓ Service fulfilled and marked completed.');
    setTimeout(() => setQuickNotice(null), 3000);
  };

  const handleAddNote = (id) => {
    if (!noteText.trim()) return;
    addRequestNote(id, noteText.trim());
    setNoteText('');
    setNoteInputId(null);
    setQuickNotice('Note appended to request log.');
    setTimeout(() => setQuickNotice(null), 2500);
  };

  const handleSendEta = (id, mins) => {
    addRequestNote(id, `Attendant dispatched • ETA: ${mins} minutes`);
    setQuickNotice(`ETA ${mins}m sent to guest room!`);
    setTimeout(() => setQuickNotice(null), 2500);
  };

  const formatTimeAgo = (isoString) => {
    try {
      const diffSecs = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diffSecs < 60) return `${diffSecs}s ago`;
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours}h ago`;
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-12 selection:bg-blue-100">
      
      {/* ================= CONTINUOUS RINGING ALARM BANNER (STAFF TERMINAL ONLY) ================= */}
      {isStaffRinging && (
        <div className="bg-red-600 text-white px-4 py-3 shadow-lg border-b-2 border-red-700 animate-pulse sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-bounce">🔔</span>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold tracking-wide uppercase">
                  INCOMING GUEST CALL RINGING NOW!
                </h2>
                <p className="text-xs text-red-100">
                  {latestRingingRequest
                    ? `Room ${latestRingingRequest.room}: ${latestRingingRequest.serviceItem} — Continuously ringing on staff page until accepted!`
                    : 'Ringtone is actively ringing on staff page. Accept request to silence.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {incomingRequests.length > 0 && (
                <button
                  onClick={() => handleAccept(incomingRequests[0].id)}
                  className="px-4 py-1.5 rounded-lg bg-white text-red-700 hover:bg-red-50 text-xs font-bold shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  ✓ Accept &amp; Silence Ringtone
                </button>
              )}
              <button
                onClick={stopStaffRinging}
                className="px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-900 text-white text-xs font-semibold cursor-pointer"
                title="Silence alarm"
              >
                Mute Alarm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand & Floor Context */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0F2756] text-amber-200 flex items-center justify-center font-serif text-sm font-semibold shadow-sm border border-amber-300/30">
              EJ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-bold text-slate-500">
                  ELITE JONRAD HOTEL
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold border border-slate-200">
                  Floor 3 Terminal
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-[#0F2756] leading-none mt-0.5">
                Staff Operations &amp; Guest Request Dispatch
              </h1>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playStaffBellChime();
              }}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
              title="Toggle Staff Audio Ringtone"
            >
              <span>{soundEnabled ? '🔔' : '🔕'}</span>
              <span className="hidden md:inline">{soundEnabled ? 'Ringtone Ready' : 'Muted'}</span>
            </button>

            {/* Active Attendant Card */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-500">Duty:</span>
              <span className="font-semibold text-slate-800">Ana Morales (Captain)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Quick notice toast */}
      {quickNotice && (
        <div className="fixed top-20 right-6 z-50 bg-[#0F2756] text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span>{quickNotice}</span>
        </div>
      )}

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* 1. SHIFT OPERATIONAL METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          
          {/* Incoming Unaccepted Calls */}
          <div
            onClick={() => setActiveTab('incoming')}
            className={`p-4 rounded-xl border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
              activeTab === 'incoming'
                ? 'ring-2 ring-red-400 bg-red-50/20 border-red-300'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Incoming Calls (Unaccepted)
              </p>
              <h3 className="text-2xl font-bold text-red-600 mt-1 font-mono flex items-center gap-2">
                {incomingRequests.length}
                {isStaffRinging && (
                  <span className="inline-flex w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                )}
              </h3>
              <p className="text-[11px] text-red-600 font-medium mt-0.5">
                {isStaffRinging ? 'Ringing continuously!' : incomingRequests.length > 0 ? 'Needs acceptance' : 'Queue clear'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-lg border border-red-100">
              🚨
            </div>
          </div>

          {/* Dispatched Side (Accepted Calls) */}
          <div
            onClick={() => setActiveTab('dispatched')}
            className={`p-4 rounded-xl border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
              activeTab === 'dispatched'
                ? 'ring-2 ring-blue-500 bg-blue-50/20 border-blue-300'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Dispatched Side (In Action)
              </p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1 font-mono">
                {dispatchedRequests.length}
              </h3>
              <p className="text-[11px] text-blue-500 font-medium mt-0.5">
                Accepted &amp; in-flight
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg border border-blue-100">
              🚀
            </div>
          </div>

          {/* Average SLA Response */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Floor SLA Speed
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                3.4m
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Target: &lt; 6 mins
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg border border-amber-100">
              ⚡
            </div>
          </div>

          {/* Completed History */}
          <div
            onClick={() => setActiveTab('completed')}
            className={`p-4 rounded-xl border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
              activeTab === 'completed'
                ? 'ring-2 ring-emerald-500 bg-emerald-50/20 border-emerald-300'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Completed Side
              </p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
                {completedRequests.length}
              </h3>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                Delivered &amp; resolved
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg border border-emerald-100">
              ✓
            </div>
          </div>

        </div>

        {/* 2. DEDICATED SECTIONS / TAB SWITCHER */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* The 2 Main Distinct Sides: INCOMING vs DISPATCHED */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              
              {/* Tab 1: Incoming Unaccepted Requests */}
              <button
                onClick={() => setActiveTab('incoming')}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'incoming'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <span>🚨 Incoming Requests</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === 'incoming' ? 'bg-white text-red-700' : 'bg-red-100 text-red-700'
                }`}>
                  {incomingRequests.length}
                </span>
                {isStaffRinging && (
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                )}
              </button>

              {/* Tab 2: Dispatched Side (Only Accepted Requests Show Here!) */}
              <button
                onClick={() => setActiveTab('dispatched')}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'dispatched'
                    ? 'bg-[#0F2756] text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <span>🚀 Dispatched Side</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === 'dispatched' ? 'bg-blue-400 text-slate-900' : 'bg-blue-100 text-blue-800'
                }`}>
                  {dispatchedRequests.length}
                </span>
              </button>

              {/* Tab 3: Completed */}
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'completed'
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>✓ Completed</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === 'completed' ? 'bg-white text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {completedRequests.length}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-xs sm:max-w-sm">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search Room, Item, or Guest..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2756]/20 focus:border-[#0F2756]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Department:
            </span>
            {['All', 'Housekeeping', 'Room Service', 'Maintenance', 'Front Desk'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0F2756] text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3. CURRENT ACTIVE VIEW LIST */}
        <div className="space-y-3">
          
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {activeTab === 'incoming' && '🚨 Incoming Queue (Unaccepted Calls — Ringing on Staff Page)'}
              {activeTab === 'dispatched' && '🚀 Dispatched Side (Only Accepted Requests)'}
              {activeTab === 'completed' && '✓ Completed History'}
            </h2>
            <span className="text-xs text-slate-400">
              Showing {currentTabList.length} items
            </span>
          </div>

          {currentTabList.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
              <span className="text-4xl">
                {activeTab === 'incoming' ? '🎉' : activeTab === 'dispatched' ? '📦' : '📜'}
              </span>
              <h4 className="text-sm font-bold text-slate-700 mt-2">
                {activeTab === 'incoming' && 'No Incoming Requests'}
                {activeTab === 'dispatched' && 'No Dispatched Requests Yet'}
                {activeTab === 'completed' && 'No Completed Requests'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {activeTab === 'incoming' && 'All guest requests have been accepted and moved to the Dispatched side! Ringtone is silent.'}
                {activeTab === 'dispatched' && 'When you accept an incoming request, it will appear strictly here on the Dispatched side.'}
                {activeTab === 'completed' && 'Resolved requests will be archived here.'}
              </p>
            </div>
          ) : (
            currentTabList.map(req => {
              const isPending = req.status === 'pending';
              const isDispatched = req.status === 'dispatched';
              const isCompleted = req.status === 'completed';

              return (
                <div
                  key={req.id}
                  className={`bg-white rounded-xl border p-4 sm:p-5 transition-all shadow-xs ${
                    isPending
                      ? 'border-red-400 bg-red-50/15 ring-2 ring-red-200'
                      : isDispatched
                      ? 'border-blue-300 bg-blue-50/10'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    
                    {/* Left: Room Badge & Details */}
                    <div className="flex items-start gap-3.5">
                      
                      {/* Room Number Block */}
                      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold font-mono shrink-0 border ${
                        isPending
                          ? 'bg-red-100 text-red-900 border-red-300 animate-pulse'
                          : req.room === '304'
                          ? 'bg-blue-50 text-blue-900 border-blue-200'
                          : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        <span className="text-base leading-none">{req.room}</span>
                        <span className="text-[9px] font-normal text-slate-500 mt-0.5">Floor 3</span>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base">{req.icon}</span>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900">
                            {req.serviceItem}
                          </h3>

                          {/* Status Pill */}
                          {isPending && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white flex items-center gap-1 animate-pulse">
                              <span>🔔 Ringing Now</span>
                            </span>
                          )}

                          {isDispatched && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                              🚀 Dispatched &amp; En Route
                            </span>
                          )}

                          {isCompleted && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ✓ Completed
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 mt-1">
                          <span className="font-semibold text-slate-700">{req.guestName}</span>
                          <span>•</span>
                          <span>{req.roomType}</span>
                          <span>•</span>
                          <span className="text-slate-400 font-mono">{formatTimeAgo(req.timestamp)}</span>
                          <span>•</span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600 font-medium">
                            {req.department}
                          </span>
                        </div>

                        {req.notes && (
                          <p className="text-xs text-slate-600 mt-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                            <strong className="text-slate-700">Dispatch Note:</strong> {req.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Staff Action Buttons */}
                    <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                        <span>Assigned:</span>
                        <span className="font-semibold text-slate-800">{req.assignedTo}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* ACCEPT BUTTON (Incoming only): Closes ringing & moves to dispatched side */}
                        {isPending && (
                          <button
                            onClick={() => handleAccept(req.id)}
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 animate-bounce"
                          >
                            <span>✓ Accept &amp; Silence Ringtone</span>
                          </button>
                        )}

                        {/* ACTIONS (Dispatched side only) */}
                        {isDispatched && (
                          <>
                            <button
                              onClick={() => handleComplete(req.id)}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                            >
                              ✓ Mark Completed
                            </button>
                            <button
                              onClick={() => handleSendEta(req.id, 2)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-medium cursor-pointer"
                            >
                              +2m ETA
                            </button>
                          </>
                        )}

                        {isCompleted && (
                          <button
                            onClick={() => updateRequestStatus(req.id, 'dispatched', 'Attendant Ana')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium cursor-pointer"
                          >
                            Re-dispatch
                          </button>
                        )}

                        <button
                          onClick={() => setNoteInputId(noteInputId === req.id ? null : req.id)}
                          className="px-2 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 text-xs hover:bg-slate-100 cursor-pointer"
                          title="Add internal note"
                        >
                          💬
                        </button>
                      </div>
                    </div>
                  </div>

                  {noteInputId === req.id && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Add staff resolution note..."
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0F2756]"
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddNote(req.id);
                        }}
                      />
                      <button
                        onClick={() => handleAddNote(req.id)}
                        className="px-3 py-1.5 bg-[#0F2756] text-white text-xs font-semibold rounded-lg hover:bg-[#1E3A8A] cursor-pointer"
                      >
                        Save Note
                      </button>
                      <button
                        onClick={() => setNoteInputId(null)}
                        className="px-2 py-1.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </main>
    </div>
  );
}
