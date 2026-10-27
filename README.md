# Farm2Home – Direct Farm-to-Home Delivery Platform

> **Tagline:** *Fresh from Local Farms, Delivered to Your Home.*  
> **Regional Context:** Mira Bhayandar, Maharashtra (Uttan, Dongri, Morva, Rai, Murdha)  
> **Built for:** College Idea Lab Innovation & Social Agritech Demonstration

---

## 1. Project Overview & Problem Statement

Local farmers in the coastal and hilly agrarian belts of **Mira Bhayandar** (specifically around **Uttan, Dongri, Morva, and Rai**) face steep structural challenges connecting with urban consumers residing in apartment clusters across Mira Road and Bhayandar. 

### Key Friction Points Addressed:
1. **Middleman Exploitation:** Traditional APMC mandi brokers and commission agents deduct 35%–55% of the produce value, leaving farmers with minimal profits.
2. **Perishability & Scheduling Delays:** Fresh leafy greens (*palak*, *methi*, coriander) and delicate coastal produce degrade rapidly over 48–72 hours of multi-tiered wholesale transport.
3. **Urban Quality Deficit:** Consumers frequently purchase chemically ripened or artificially preserved vegetables with zero visibility into harvest provenance.

**Farm2Home** is an agricultural commerce web application engineered to bridge this gap. Cultivators list morning harvests, urban residents order into capacity-managed delivery windows, and produce is dispatched directly to doorsteps within 4–6 hours of picking.

---

## 2. Technology Stack

- **Frontend Framework:** React with TypeScript, bundled with Vite.
- **Styling & UI Components:** Tailwind CSS, responsive card systems, Lucide icons, mobile-first design tokens.
- **Geographic Mapping:** Leaflet + OpenStreetMap for visual farm origin to doorstep delivery waypoints centered at Mira Bhayandar (`19.2845° N, 72.8250° E`).
- **Database & Authentication:** Supabase (PostgreSQL) with Row Level Security (RLS) on all user-managed tables.
- **Transactional Stored Procedures:** PostgreSQL RPC functions (`create_order_transactional`, `cancel_order_restore_stock`) ensuring atomic stock reservation and zero overselling.
- **Dual-Mode Architecture:** Live Supabase connectivity with an intelligent in-browser LocalStorage/memory fallback demo database pre-populated with realistic Mira Bhayandar agricultural data.
- **Deployment:** Vercel for frontend and Supabase for backend services (Docker-ready with multi-stage `Dockerfile` and `docker-compose.yml`).

---

## 3. Key Feature Modules

### 3.1 Public Portal
- **Hero Section:** Value proposition with trust metrics (0% broker markups, 4-6 hours harvest-to-door, 100% fair payout).
- **Search & Filters:** Search by product name, category, cultivator, or locality.
- **Featured Seasonal Harvests:** Cards displaying live stock, harvest dates, and direct cultivator prices in ₹ INR.
- **Local Cultivator Profiles:** Stories and verified badges for farmers in Uttan, Dongri, and Morva.
- **How It Works Timeline:** Visual 4-step harvest cycle from 5:00 AM daybreak plucking to doorstep delivery.
- **Socioeconomic Impact & Testimonials:** Local resident reviews from Shanti Nagar, Kanakia, and Navghar.

### 3.2 Marketplace Explorer
- Multi-criteria filtering by category (*Leafy Greens & Herbs*, *Daily Fresh Vegetables*, *Farm Fresh Fruits*, *Roots & Tubers*, *Farm Grains & Staples*).
- Farmland locality filter (*Uttan Coastal Belts*, *Dongri Orchards*, *Rai & Morva Natural Farms*, *Bhayandar West*).
- Price sorting (*Low to High*, *High to Low*, *Fresh Harvests Newest*).
- Real-time stock alerts and direct "Add to Basket" controls.
- Comprehensive **Product Detail Modal** with farmer profile, harvest date, and verified reviews.

### 3.3 Consumer Dashboard & Order Tracking
- **Interactive Delivery Map:** Leaflet map plotting the pickup farm coordinates and delivery address with route polyline.
- **Order Progress Timeline:** Visual tracking through 6 states:  
  `Pending` ➔ `Accepted` ➔ `Preparing` ➔ `Ready for Pickup` ➔ `Out for Delivery` ➔ `Delivered`.
- **Order Cancellation:** Permitted for pending/accepted orders with atomic stock restoration.
- **Reorder Functionality:** 1-click replenishment of prior harvest baskets.
- **Review Submission:** 1–5 star rating and comment on delivered items.
- **Saved Addresses:** Manage multiple delivery locations across Mira Road and Bhayandar.

### 3.4 Farmer Dashboard
- **Executive Metric Cards:** Total realized earnings in ₹ INR, active crop listings, pending orders, and completed pickups.
- **Produce Management:** List new crops with image URL, price, unit, stock, and harvest date. Edit or toggle live/hidden visibility.
- **Incoming Order Fulfillment:** Accept, reject (with automatic stock refund), mark *Preparing* (harvesting/washing), and mark *Ready for Pickup*.
- **Delivery Schedule:** Batches grouped by morning (7:00–10:00 AM) and evening (4:30–7:30 PM) windows.
- **Farm Profile:** Update farm name, bio, locality, and GPS coordinates.

### 3.5 Administrator Oversight Desk
- System metrics: Gross platform volume, registered farmers, registered consumers, total orders.
- Farmer account verification workflow (Approve / Reject).
- Platform-wide product moderation.
- Delivery slot capacity management (adjust order thresholds per window to prevent vehicle overload).
- Global order status supervision.

---

## 4. Database Schema (Supabase / PostgreSQL)

The database schema is defined in `supabase/migrations/20261027_init_farm2home.sql`.

| Table | Purpose |
|-------|---------|
| `profiles` | User profile linked to `auth.users`, storing `role` ('consumer', 'farmer', 'admin'). |
| `farmer_profiles` | Extended farm metadata, locality, GPS latitude/longitude, and verification status. |
| `categories` | Product categories (Leafy Greens, Vegetables, Fruits, Roots, Grains). |
| `products` | Produce catalog with unit pricing, active stock, and harvest date constraints. |
| `addresses` | Consumer delivery addresses in Mira Bhayandar with geographical coordinates. |
| `delivery_slots` | Date, time window (morning/evening), locality, and maximum order capacity. |
| `orders` | Master orders storing subtotal, ₹40 delivery fee, payment method (COD/UPI), status. |
| `order_items` | Individual product line items with farmer assignment and per-item fulfillment status. |
| `deliveries` | Dispatch tracking linked to slots, delivery agents, and timestamps. |
| `reviews` | 1–5 star ratings and consumer feedback linked to verified purchased order items. |

### Row Level Security (RLS) & RPC Functions
- **RLS Enabled on All Tables:** Consumers access only their own orders/addresses; farmers access only orders containing their crops; admins possess platform oversight.
- **`create_order_transactional`:** Validates delivery slot capacity, verifies available stock with row-level locks (`FOR UPDATE`), creates orders and line items, and atomically decrements product inventory.
- **`cancel_order_restore_stock`:** Validates cancellation eligibility and restores product quantities back to inventory.

---

## 5. Local Setup & Installation

### Prerequisites
- Node.js (v18 or higher, tested on Node v24)
- npm (v9 or higher)

### Step 1: Clone and Install
```bash
git clone <repository-url>
cd "idea lab"
npm install
```

### Step 2: Environment Configuration (Optional for Live Supabase)
By default, the application runs in **Interactive Demo Mode** with comprehensive seed data. To connect your live Supabase project:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update the environment variables:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Open your Supabase Dashboard ➔ **SQL Editor**, paste and execute `supabase/migrations/20261027_init_farm2home.sql`.

### Step 3: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Production Build & Verification
```bash
npm run build
npm run preview
```

---

## 6. Docker & Containerized Execution

### Build and Run with Docker Compose
```bash
docker compose up --build -d
```
Access the application at [http://localhost:3000](http://localhost:3000).

### Stop Containers
```bash
docker compose down
```

---

## 7. 1-Click Demo Evaluation Credentials

When running in demo mode, use the quick role switcher in the top navigation or the **Auth Page** to test all three system personas:

1. **🛒 Urban Consumer (`Aaditya Sharma`)**
   - Phone: `+91 98201 12345`
   - Pre-loaded with delivery addresses in Mira Road East and active orders.
2. **🚜 Local Cultivator (`Bhaskar Patil`)**
   - Farm: *Uttan Coastal Agro*, Uttan, Bhayandar West
   - Phone: `+91 98202 23456`
   - Pre-loaded with crop listings (coconuts, sweet potatoes, greens) and incoming harvest orders.
3. **⚡ Platform Administrator (`Mira Bhayandar Agrico Admin`)**
   - Phone: `+91 98200 00001`
   - Full access to farmer verification, product moderation, delivery slot capacities, and order controls.

---

## 8. Automated Test Suite

A standalone invariant and transactional verification script is included in `scripts/test-farm2home.js`:

```bash
node scripts/test-farm2home.js
```

### Validated Invariants:
- `Test 1:` Normal order placement & atomic stock deduction.
- `Test 2:` Delivery slot capacity boundary enforcement.
- `Test 3:` Inventory race condition & overselling prevention.
- `Test 4:` Order cancellation & automatic stock restoration.

---

## 9. Deployment to Vercel

1. Push your repository to GitHub or GitLab.
2. Import the project in [Vercel](https://vercel.com).
3. Set Framework Preset to **Vite**.
4. Set Build Command to `npm run build` and Output Directory to `dist`.
5. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under Environment Variables.
6. Deploy!
