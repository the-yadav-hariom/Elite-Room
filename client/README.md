# Elite Jonrad Hotel - In-Room Guest Service & Staff Dispatch

In-room guest service and staff operations system for **Elite Jonrad Hotel**, built with **React.js** and **Tailwind CSS**.

---

## Dedicated HTTP Links & Routing

The Guest Room and Staff Terminal are completely separated with **no switcher bars or banners**:

| Role | Route / URL | Standalone HTML | Description |
| :--- | :--- | :--- | :--- |
| **Guest Room (304)** | `http://localhost:3000/` or `/guest` | [`guest.html`](guest.html) | Direct in-room guest tablet for Room 304 with instant call housekeeper button and quick chips. |
| **Staff Terminal** | `http://localhost:3000/staff` | [`staff.html`](staff.html) | Direct operations terminal for floor attendants with continuous ringtone, accept-to-silence, and dispatched board. |

---

## Live Cross-Tab Communication

When running in two separate tabs/windows:
1. Open the **Guest Room** (`http://localhost:3000/` or `guest.html`) in **Tab 1**.
2. Open the **Staff Terminal** (`http://localhost:3000/staff` or `staff.html`) in **Tab 2**.
3. Tap **"Call Housekeeper"** or **"Water"** on the guest screen.
4. The **Staff Terminal** in Tab 2 immediately begins **ringing continuously** with a flashing red alarm banner.
5. In the Staff Terminal, click **`✓ Accept & Silence Ringtone`**:
   - The ringtone **closes and stops immediately**.
   - The request is **removed from the incoming queue**.
   - The request is displayed exclusively on the **Dispatched Side**.

---

## How to Run

### Development Server (Vite)
```bash
cd client
npm run dev
```
- Open `http://localhost:3000/` for **Guest Room**.
- Open `http://localhost:3000/staff` for **Staff Terminal**.

### Direct Standalone HTML
- Open [`guest.html`](guest.html) directly in any browser for the guest tablet.
- Open [`staff.html`](staff.html) directly in any browser for the staff terminal.
