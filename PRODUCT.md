# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

1. **Urban Consumers (Mira Bhayandar):**
   - Apartment dwellers in Mira Road (Shanti Nagar, Kanakia, Beverly Park) and Bhayandar (East/West).
   - Seeking genuinely fresh, un-waxed, chemical-free morning harvests with transparent farm provenance.
   - Primary Job: Browse verified seasonal produce, select delivery windows, and receive farm-direct orders with transparent doorstep COD/UPI settlement.

2. **Local Cultivators / Farmers (Uttan, Dongri, Morva, Rai):**
   - Generational agrarian families cultivating coastal vegetables, sweet potatoes, bananas, papayas, and leafy greens.
   - Constrained by middleman commissions (35%–55%) and irregular transport schedules.
   - Primary Job: List morning crop yields, accept harvest orders, pack designated eco-baskets, and hand off to scheduled logistics batches.

3. **Platform Administrators & Coordinators:**
   - Agricultural cooperative officers and Idea Lab managers.
   - Primary Job: Verify farmer profiles, moderate produce listings, supervise delivery slot thresholds, and monitor distribution volume.

## Product Purpose

Farm2Home exists to build an equitable, direct-to-consumer agricultural bridge in Mira Bhayandar, Maharashtra. By replacing 4 layers of APMC mandi wholesale middlemen with scheduled morning harvest-to-door logistics, the platform increases farmer income realization while delivering peak-nutrition, unadulterated produce to urban households within 4–6 hours of plucking.

## Positioning

Unlike conventional quick-commerce grocery apps (which rely on dark stores and cold-storage distribution) or APMC mandi brokers (which delay transit by 48–72 hours and take massive cuts), Farm2Home provides **guaranteed same-day harvest fulfillment** with open geo-traceability to specific coastal and hillside farms in Uttan, Dongri, and Morva.

## Operating Context

- **Harvest Rhythm:** Farmers harvest leafy greens and delicate vegetables at 5:00 AM daybreak to preserve cellular hydration and crispness.
- **Delivery Windows:** Scheduled morning batches (07:00 AM – 10:00 AM IST) and evening batches (04:30 PM – 07:30 PM IST) to prevent perishable spoilage.
- **Logistics Channel:** Centralized electric delivery runners collecting packed produce crates from farm gates along the Uttan coastal corridor and dispatching across Mira Bhayandar.
- **Settlement Ritual:** Cash on Delivery (COD) and doorstep UPI QR-code scanning at the recipient's threshold.

## Capabilities and Constraints

- **Transactional Inventory Engine:** Atomic stock deduction with row-level locking to prevent overselling; automatic inventory restoration upon order cancellation.
- **Delivery Slot Capacity Gate:** Hard limits on order volume per locality window to eliminate dispatch bottlenecks.
- **OpenStreetMap Geo-Visualization:** Leaflet-powered route waypoints showing farm origin, consumer destination, and road transit path.
- **Dual-Mode System:** Seamless in-browser transactional demo database with persistent localStorage fallback, plus native Supabase PostgreSQL integration.
- **No Online Payment Gateway Dependency:** Exclusively Cash on Delivery and Doorstep UPI (no simulated online payment success screens).
- **Security & Authorization:** Supabase Row Level Security (RLS) policies enforcing strict user role isolation (consumer, farmer, admin).

## Brand Commitments

- **Brand Name:** Farm2Home
- **Tagline:** *"Fresh from Local Farms, Delivered to Your Home."*
- **Voice & Tone:** Authentic, grounded, respectful of agrarian labor, professional, and accessible to non-technical users.
- **Identity Palette:** Natural forest emerald (`#1A351D`), deep earth (`#214325`), warm cream (`#FAF8F5`), and harvest terracotta accents (`#B8613A`).
- **Terminology:** Indian Rupee formatting (`₹`), regional agrarian localization (Uttan, Dongri, Morva, Rai), and bilingual Marathi crop annotations (*पालक*, *मेथी*, *भेंडी*, *वांगी*, *शहाळे*).

## Evidence on Hand

- **Geographic Seed Store:** `src/data/seedData.ts` with authentic coordinates for Uttan Coastal Agro, Dongri Hillside Orchards, and Rai-Morva Natural Farms.
- **PostgreSQL Migrations:** `supabase/migrations/20261027_init_farm2home.sql` with complete schemas, constraints, and RPC functions.
- **Automated Verification:** `scripts/test-farm2home.js` validating transactional order placement, overselling rejection, capacity enforcement, and stock restoration.
- **Incumbent Design Authority:** `DESIGN.md` defining color tokens, typography, component hierarchies, and database schemas.

## Product Principles

1. **Farmer Sovereignty First:** Cultivators receive 100% of their listed farm-gate price without broker commissions or hidden deductions.
2. **Honest Provenance:** Every product card transparently displays the exact farm name, locality, and harvest timestamp.
3. **No Phantom Guarantees:** Never claim real-time GPS tracking or online payment success unless verified by real infrastructure.
4. **Resilient Local Operation:** The application functions deterministically even under poor network conditions or without external cloud credentials via interactive fallback mode.
5. **Zero Waste through Scheduled Demand:** Harvests occur only for booked slots, eliminating surplus agricultural spoilage.

## Accessibility & Inclusion

- Multi-tier typography with high WCAG AA contrast against warm cream and white surfaces.
- Simple, legible interface designed for users with varying levels of digital literacy.
- Accessible form controls with visible focus indicators, error feedback, and tactile touch targets (minimum 44x44px).
