import React, { useState, useRef, useEffect } from 'react';
import { useRequests } from '../context/RequestContext';

export default function GuestRoom() {
  const { addGuestRequest, lastDispatchedEvent } = useRequests();

  const [isRippling, setIsRippling] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);
  const [activeRequest, setActiveRequest] = useState(() => {
    try {
      const saved = localStorage.getItem('elite_jonrad_guest_active_req');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const alertTimeoutRef = useRef(null);

  // Listen to staff dispatch event
  useEffect(() => {
    if (lastDispatchedEvent && lastDispatchedEvent.type === 'ACCEPT_REQUEST') {
      const attendant = lastDispatchedEvent.assignedTo || 'Attendant Ana';
      setActiveRequest(prev => {
        const updated = {
          serviceItem: prev ? prev.serviceItem : 'In-Room Service',
          room: '304',
          status: 'dispatched',
          assignedTo: attendant,
          timestamp: new Date().toISOString()
        };
        try {
          localStorage.setItem('elite_jonrad_guest_active_req', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
      setAlertInfo({
        type: 'dispatched',
        title: 'Your request dispatched',
        detail: `${attendant} has accepted your request and is en route to Room 304.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      alertTimeoutRef.current = setTimeout(() => setAlertInfo(null), 12000);
    }
  }, [lastDispatchedEvent]);

  const handleGuestCall = (serviceItem, category, department, customNote) => {
    // 1. Dispatch request to staff side (Triggers continuous ringtone only on staff terminal)
    addGuestRequest(serviceItem, category, department, '304', customNote);

    const reqState = {
      serviceItem,
      room: '304',
      status: 'submitted',
      timestamp: new Date().toISOString()
    };
    setActiveRequest(reqState);
    try {
      localStorage.setItem('elite_jonrad_guest_active_req', JSON.stringify(reqState));
    } catch (e) {}

    // 2. Visual tactile ripple effect on guest screen
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 1400);

    // 3. Show guest confirmation alert: "Your request submitted"
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    setAlertInfo({
      type: 'submitted',
      title: 'Your request submitted',
      detail: `Your request for "${serviceItem}" has been submitted to Floor 3 Staff Desk.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    alertTimeoutRef.current = setTimeout(() => setAlertInfo(null), 10000);
  };

  return (
    <div className="bg-[#F8F9FA] text-slate-800 antialiased font-sans min-h-screen flex flex-col justify-between selection:bg-amber-100">
      <main className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between px-4 pb-4 pt-4 ios-safe-top ios-safe-bottom">
        
        {/* ================= HEADER SECTION ================= */}
        <header className="pt-2 pb-2">
          {/* Brand & Live Concierge Badge */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#091A36] text-amber-200 flex items-center justify-center font-serif text-sm font-semibold shadow-sm border border-amber-300/30">
                EJ
              </div>
              <div>
                <h1 className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                  ELITE JONRAD HOTEL
                </h1>
                <p className="text-sm font-bold text-slate-900 leading-tight">
                  Hotel &amp; Suites Luxury Concierge
                </p>
              </div>
            </div>

            {/* Live Concierge Status Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-semibold text-emerald-700 tracking-tight">
                Live Concierge
              </span>
            </div>
          </div>

          {/* Room Context Card */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-between mt-2.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold text-base border border-blue-100">
                304
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-900">Executive King Room</span>
                  <span className="text-[10px] text-slate-400">• Floor 3</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Est. Housekeeping response:{' '}
                  <span className="text-emerald-600 font-medium">&lt; 6 mins</span>
                </p>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500">
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
          </div>

          {/* Live Request Status Tracker Card */}
          {activeRequest && (
            <div
              className={`rounded-2xl p-3.5 mt-2.5 border-2 shadow-sm transition-all duration-300 flex items-center justify-between ${
                activeRequest.status === 'dispatched'
                  ? 'bg-emerald-50/95 border-emerald-400 text-emerald-950'
                  : 'bg-amber-50/95 border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                    activeRequest.status === 'dispatched'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {activeRequest.status === 'dispatched' ? '🚀' : '🟡'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider">
                      {activeRequest.status === 'dispatched'
                        ? 'Your Request Dispatched'
                        : 'Your Request Submitted'}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activeRequest.status === 'dispatched'
                          ? 'bg-emerald-500 animate-pulse'
                          : 'bg-amber-500 animate-ping'
                      }`}
                    ></span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {activeRequest.serviceItem}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {activeRequest.status === 'dispatched'
                      ? `${activeRequest.assignedTo || 'Attendant Ana'} en route to Room 304`
                      : 'Staff laptop terminal is ringing now • Waiting for dispatch'}
                  </p>
                </div>
              </div>

              <span
                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                  activeRequest.status === 'dispatched'
                    ? 'bg-emerald-200 text-emerald-900 border-emerald-400'
                    : 'bg-amber-200 text-amber-900 border-amber-400'
                }`}
              >
                {activeRequest.status === 'dispatched' ? 'Dispatched' : 'Submitted'}
              </span>
            </div>
          )}
        </header>

        {/* ================= HERO CALL SECTION ================= */}
        <section className="my-auto py-4 flex flex-col items-center justify-center text-center relative">
          {/* Ripple Halo Wave */}
          {isRippling && <div className="ripple-ring" />}

          {/* Main Round Tactile Button */}
          <button
            onClick={() => handleGuestCall('Call Housekeeper', 'Housekeeping', 'Housekeeping Desk', 'High-priority instant chime from Room 304.')}
            className="touch-press animate-bell-pulse relative w-56 h-56 rounded-full bg-gradient-to-b from-[#DC5333] via-[#C84B31] to-[#A3341C] text-white flex flex-col items-center justify-center shadow-bell-ambient border-[3px] border-[#FF987A]/30 focus:outline-none select-none cursor-pointer"
          >
            {/* Bell Icon & Sparkle Ping */}
            <div className="relative mb-2">
              <div className="w-14 h-12 flex items-center justify-center drop-shadow-md">
                <svg
                  className="w-12 h-12 text-amber-200 fill-amber-200 drop-shadow-lg"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 2.5a1.25 1.25 0 011.25 1.25V4.2a7.5 7.5 0 016.25 7.4v2.4a2 2 0 00.7 1.5l.8.6a.75.75 0 01-.45 1.3H3.45a.75.75 0 01-.45-1.3l.8-.6a2 2 0 00.7-1.5v-2.4A7.5 7.5 0 0110.75 4.2V3.75A1.25 1.25 0 0112 2.5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M9 19.5a3 3 0 006 0" strokeLinecap="round" />
                </svg>
              </div>

              {/* Sparkle ping dot */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-100"></span>
              </span>
            </div>

            {/* Call Housekeeper headline */}
            <span className="text-xl font-bold tracking-tight text-white drop-shadow-sm font-sans">
              Call Housekeeper
            </span>

            {/* Room 304 capsule */}
            <span className="mt-1 text-xs uppercase tracking-widest font-semibold text-amber-200/90 bg-black/20 px-3.5 py-0.5 rounded-full">
              ROOM 304
            </span>

            {/* Tap micro-cue */}
            <span className="text-[10px] text-white/70 font-light mt-1.5 tracking-wide">
              Tap for instant chime
            </span>
          </button>

          {/* Context Helper Description */}
          <div className="mt-6 max-w-[280px]">
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Need towels, water, or immediate assistance? One tap alerts your Floor 3 captain on the staff terminal.
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Assigned to: <span className="text-slate-700 font-semibold">Attendant Ana &amp; Reception Desk</span>
            </p>
          </div>
        </section>

        {/* ================= QUICK ROOM REQUESTS SECTION ================= */}
        <section className="mt-1 mb-2">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              QUICK ROOM REQUESTS
            </h2>
            <span className="text-[11px] font-medium text-slate-600">
              One-tap dispatch
            </span>
          </div>

          {/* Row 1: Water / Towels / Bill */}
          <div className="grid grid-cols-3 gap-2 pb-1">
            {/* Water */}
            <button
              onClick={() => handleGuestCall('Bottled Water', 'Room Service', 'Room Service Desk', '2x Still Bottled Waters requested.')}
              className="touch-press flex items-center justify-center gap-1.5 py-2.5 px-2 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <span className="text-base leading-none">💧</span>
              <span>Water</span>
            </button>

            {/* Towels */}
            <button
              onClick={() => handleGuestCall('Fresh Towels', 'Housekeeping', 'Housekeeping Desk', 'Plush bath & face towels requested.')}
              className="touch-press flex items-center justify-center gap-1.5 py-2.5 px-2 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <span className="text-base leading-none">🧖</span>
              <span>Towels</span>
            </button>

            {/* Bill / Key */}
            <button
              onClick={() => handleGuestCall('Bill / Digital Key', 'Front Desk', 'Front Desk Reception', 'Folio summary and late checkout check requested.')}
              className="touch-press flex items-center justify-center gap-1.5 py-2.5 px-2 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <span className="text-base leading-none">🧾</span>
              <span>Bill / Key</span>
            </button>
          </div>

          {/* Row 2: AC / Tech Check & Clean My Room */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {/* AC / Tech Check */}
            <button
              onClick={() => handleGuestCall('AC / Tech Check', 'Maintenance', 'Engineering Tech', 'Thermostat, TV or Wi-Fi check requested in Room 304.')}
              className="touch-press flex items-center justify-start gap-2.5 p-2.5 bg-slate-100/90 hover:bg-slate-200/80 rounded-xl border border-slate-200/80 text-left cursor-pointer"
            >
              <span className="text-sm pl-1">🔧</span>
              <div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">
                  AC / Tech Check
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  Wi-Fi, TV, HVAC, power
                </div>
              </div>
            </button>

            {/* Clean My Room */}
            <button
              onClick={() => handleGuestCall('Clean My Room', 'Housekeeping', 'Housekeeping Desk', 'Complete room make up & fresh bed linens requested.')}
              className="touch-press flex items-center justify-start gap-2.5 p-2.5 bg-slate-100/90 hover:bg-slate-200/80 rounded-xl border border-slate-200/80 text-left cursor-pointer"
            >
              <span className="text-sm pl-1">🧹</span>
              <div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">
                  Clean My Room
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  Fresh bed linens &amp; tidy
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* ================= LIVE NOTIFICATION ALERT BANNER ================= */}
        {alertInfo && (
          <div
            className={`fixed top-4 left-4 right-4 max-w-md mx-auto z-50 p-4 rounded-2xl shadow-2xl border-2 flex items-start justify-between gap-3 animate-in slide-in-from-top-4 duration-300 ${
              alertInfo.type === 'dispatched'
                ? 'bg-[#064E3B] text-white border-emerald-400'
                : 'bg-[#091A36] text-white border-amber-400'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                alertInfo.type === 'dispatched'
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                  : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
              }`}
            >
              {alertInfo.type === 'dispatched' ? '🚀' : '🛎️'}
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full font-mono ${
                    alertInfo.type === 'dispatched'
                      ? 'bg-emerald-400 text-emerald-950 font-black'
                      : 'bg-amber-400 text-slate-950 font-black'
                  }`}
                >
                  {alertInfo.type === 'dispatched' ? 'DISPATCHED' : 'SUBMITTED'}
                </span>
                <span className="text-[10px] text-slate-300 font-medium">Room 304</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                {alertInfo.title}
              </h4>
              <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                {alertInfo.detail}
              </p>
            </div>
            <button
              onClick={() => setAlertInfo(null)}
              className="text-slate-300 hover:text-white text-sm px-2 py-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* ================= IMMEDIATE VERBAL HELP / FOOTER ================= */}
        <footer className="pt-1 text-center">
          <div className="bg-[#FFFDF5] border border-amber-200/70 rounded-xl px-3 py-2 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 text-left">
              <span className="text-lg">🛎️</span>
              <div>
                <div className="text-[11px] font-bold text-slate-800 leading-tight">
                  Need immediate verbal help?
                </div>
                <div className="text-[10px] text-slate-500">
                  Pick up in-room phone &amp; dial <span className="font-semibold text-slate-700">0</span> or front desk
                </div>
              </div>
            </div>
            <a
              href="tel:0"
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#091A36] text-white hover:bg-[#0F2C59] shadow-sm transition-colors whitespace-nowrap ml-2"
            >
              Call Front Desk
            </a>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Elite Jonrad Hotel • In-Room Hospitality Engine • Room 304 Session
          </p>
        </footer>

      </main>
    </div>
  );
}
