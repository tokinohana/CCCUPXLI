

# Event Ticketing System - Frontend Mockup

## Overview
A complete, navigable React frontend for an event ticketing platform with public buyer pages, payment flows, user dashboard, and admin operations. All data is mock-based with no backend integration. Payment method is treated as a variable/enum, with Midtrans shown as a disabled placeholder.

---

## Pages & Features

### 🟢 Public Pages (Buyer Side)

**1. Landing Page (`/`)**
- Hero section with event title, date (27th), venue, and description
- Eye-catching CTA button → "Buy Tickets"
- Clean, modern design with event imagery placeholder

**2. Ticket Selection (`/tickets`)**
- 2–3 ticket types displayed as cards (e.g., Regular, VIP, VVIP)
- Price display, quantity selectors (+/- buttons)
- Live price breakdown summary at the bottom
- "Continue to Checkout" button

**3. Checkout (`/checkout`)**
- Form: Full Name, Email, Phone, ID (optional)
- Prefilled ticket summary from previous step
- Payment method selector with 4 options:
  - Manual QRIS
  - Pay at Booth
  - Pay on Event Day
  - Midtrans (disabled, "Coming Soon" badge)
- "Place Order" button → generates mock order ID → navigates to confirmation

**4. Order Confirmation (`/order/:id`)**
- Order number, ticket details, payment method, status badge
- Dynamic content based on payment method:
  - QRIS → "Upload proof" button + link to QRIS payment page
  - Offline → Instructions summary with deadline
  - Midtrans → "Payment gateway coming soon" message
- Status badges: pending, waiting verification, paid, cancelled

---

### 🟡 Payment Pages

**5. Manual QRIS Payment (`/payment/manual/:id`)**
- Static QR code image placeholder
- Unique transfer amount display
- Step-by-step transfer instructions
- "I Have Paid" button (updates mock status to `waiting_manual_verification`)

**6. Offline Payment Instructions (`/payment/offline/:id`)**
- Location details (Booth / Campus Counter)
- Opening hours and deadline
- What to bring checklist
- Order code display

**7. Online Payment Placeholder (`/payment/online/:id`)**
- Simple message: "Midtrans integration will be implemented later"

---

### 🔵 User Dashboard

**8. My Tickets (`/my-tickets`)**
- List of user's mock orders
- Per order: status badge, ticket details
- If paid → show QR code placeholder
- If unpaid → "Continue Payment" button
- If pending → show relevant instructions
- Cancel button for pending orders

---

### 🟠 Admin Pages (separate layout)

**9. Admin Dashboard (`/admin`)**
- Stats cards: total sold, paid orders, pending payments, offline unpaid, manual verification queue
- All using mock statistics

**10. Payment Verification (`/admin/payments`)**
- Tabbed view: Online (auto-confirmed) | Manual QRIS Waiting | Offline Waiting
- Table per tab: Order ID, Name, Payment Method, Status
- Action buttons: Approve / Cancel (simulate state changes)

**11. Ticket Scanner (`/admin/scan`)**
- Camera viewport placeholder (styled box)
- "Scan QR" simulation button
- Manual order code input field
- Result card showing:
  - ✅ "VALID TICKET" with name + ticket type + "Mark as Used" button
  - ⚠️ "ALREADY USED" warning
  - ❌ "PAYMENT NOT COMPLETED" error

**12. Orders Management (`/admin/orders`)**
- Full orders table with filters: payment method, status, date, ticket type
- UI-only filtering on mock data array

---

## Design & Architecture

- **Styling**: Tailwind CSS, clean modern minimal design, card-based layouts, fully responsive
- **Status badges**: Green (Paid), Yellow (Pending), Red (Cancelled), Blue (Waiting Verification)
- **Layouts**: Separate public layout and admin layout (with sidebar navigation)
- **Project structure**: `components/`, `pages/`, `layouts/`, `mockData/`, `utils/`
- **Reusable components**: StatusBadge, TicketCard, PaymentOptionCard, OrderTable, StatCard
- **State**: React Context for global order/cart state with mock data
- **Routing**: React Router with nested routes for admin section
- **Payment method**: Treated as enum variable (`qris_manual`, `cash_booth`, `cash_event_day`, `midtrans`)

