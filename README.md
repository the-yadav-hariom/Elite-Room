# Elite Jonrad Hotel - In-Room Guest Service & Staff Dispatch System

A modern in-room hospitality concierge and real-time staff dispatch terminal built with **React.js** and **Tailwind CSS**.

---

## Project Structure

```
├── client/                     # Frontend React + Tailwind application
│   ├── src/
│   │   ├── components/
│   │   │   ├── GuestRoom.jsx       # In-room guest tablet for Room 304
│   │   │   └── StaffDashboard.jsx  # Staff operations & dispatch terminal
│   │   ├── context/
│   │   │   └── RequestContext.jsx  # State & real-time dispatch synchronization
│   │   ├── App.jsx                 # Route handler between / and /staff
│   │   ├── index.css               # Animations, styling, Tailwind directives
│   │   └── main.jsx                # React root mount
│   ├── guest.html                  # Direct standalone guest room tablet
│   ├── staff.html                  # Direct standalone staff operations terminal
│   ├── preview.html                # Standalone preview
│   └── package.json                # Project dependencies and build scripts
├── service/                    # Backend service directory
├── DESIGN.md                   # Mediterranean luxury design system specifications
└── screen.png                  # Reference UI design snapshot
```

---

## Features

- **Guest Room Tablet (Room 304)**:
  - Big tactile **Call Housekeeper** hero button with subtle pulse & wave ripple effect.
  - One-tap quick requests: **Bottled Water** (💧), **Fresh Towels** (🧖), **Bill / Key** (🧾), **AC / Tech Check** (🔧), **Clean My Room** (🧹).
  - Silent in-room dispatch with real-time delivery estimates (<6 mins).
  - Front desk phone assistance banner.
- **Staff Operations Terminal**:
  - **Continuous Audio Ringtone**: Rings continuously only on the staff page when an in-room call arrives.
  - **Accept & Silence Workflow**: Accepting a request closes the ringtone immediately and moves the ticket to the **Dispatched Side**.
  - **Separated Operational Boards**:
    - `🚨 Incoming Requests`: Unaccepted queue.
    - `🚀 Dispatched Side`: Active requests being fulfilled.
    - `✓ Completed Side`: Resolved requests.
  - Live shift metric cards (Pending Queue, Urgent Chimes, En Route, SLA response speed).
  - Attendant assignment, custom resolution notes, and automated ETA updates.

---

## Getting Started

### 1. Install & Run Dev Server
```bash
cd client
npm install
npm run dev
```

- Open `http://localhost:3000/` for the **Guest Room Tablet**.
- Open `http://localhost:3000/staff` for the **Staff Operations Terminal**.

### 2. Standalone HTML
You can also open [`client/guest.html`](client/guest.html) and [`client/staff.html`](client/staff.html) directly in any modern browser.
