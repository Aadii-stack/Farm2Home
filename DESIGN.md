# DESIGN.md – Farm2Home Architecture & Specifications

**Source of Truth for Farm2Home: Direct Farm-to-Home Delivery Platform**

---

## 1. Executive Summary & Problem Context

**Farm2Home** is an agricultural commerce web application engineered specifically for the peri-urban farming ecosystem surrounding **Mira Bhayandar, Maharashtra** (including agrarian coastal clusters in Uttan, Dongri, Morva, Rai, and Murdha).

### Core Challenges Addressed:
1. **Intermediary Exploitation:** Traditional APMC mandi brokers and middle agents take 35%–55% margins, leaving local farmers with minimal profits.
2. **Delivery & Scheduling Irregularities:** Perishable produce (fresh leafy greens like *palak*, *methi*, herbs, and coastal vegetables) deteriorates quickly without scheduled harvest-to-doorstep delivery windows.
3. **Urban Consumer Disconnect:** Urban apartment dwellers in Mira Road and Bhayandar demand pesticide-conscious, fresh local produce but lack verifiable links to genuine local cultivators.

---

## 2. Technical Architecture & Technology Stack

```
[ Frontend: React 19 / Vite + TypeScript + Tailwind CSS ]
           │                                 │
           ▼                                 ▼
[ Local State / Unified Repository ]    [ Leaflet & OpenStreetMap ]
     │                   │
     ▼ (Live Mode)       ▼ (Demo/Fallback Mode)
[ Supabase Client ]   [ LocalStorage / Memory Seed Store ]
     │
     ├── Auth (Role-based: Consumer, Farmer, Admin)
     ├── Database (PostgreSQL with RLS & Constraints)
     ├── Stored Procedures (Atomic checkout & stock allocation)
     └── Storage (Product & farmer imagery)
```

- **Frontend Framework:** React 19 (or 18+ LTS) with TypeScript, bundled using Vite.
- **Styling & UI Components:** Tailwind CSS v4, custom design tokens, Lucide icons, accessible Radix-inspired components.
- **Mapping:** Leaflet + OpenStreetMap (`react-leaflet` / native Leaflet bindings) for farm origins and urban delivery waypoints centered at Mira Bhayandar (`19.2812° N, 72.8561° E`).
- **Database & Auth:** Supabase PostgreSQL with Row Level Security (RLS) on all user-managed tables.
- **Transactional Order Engine:** PostgreSQL RPC functions (`create_order_transactional`, `cancel_order_restore_stock`, `update_order_status`) guaranteeing zero overselling and atomic inventory reconciliation.
- **Graceful Fallback:** Seamless auto-detect demo mode that replicates all database constraints in-browser when Supabase keys are absent, ensuring immediate, reproducible testing in any environment.

---

## 3. UI/UX Design System

### 3.1 Color Palette
Reflecting the lush coastal farmlands of Thane district and authentic Indian agricultural heritage:

| Token | Hex Code | Purpose |
|-------|----------|---------|
| `primary` (Forest Emerald) | `#1A4329` | Main branding, primary CTAs, active headers |
| `primary-light` (Farm Leaf) | `#2E7D46` | Badges, hover states, accent highlights |
| `primary-dark` (Deep Earth) | `#0F2918` | Dark typography, footer, high-contrast containers |
| `accent` (Harvest Terracotta) | `#D97706` | Pending alerts, price highlights, urgent actions |
| `background` (Warm Cream) | `#FBF9F4` | Primary body background, soft organic feel |
| `surface` (Crisp White) | `#FFFFFF` | Cards, modals, form inputs |
| `surface-subtle` (Pale Leaf) | `#F0F5F1` | Table alternate rows, badge backgrounds |
| `text-primary` | `#111827` | High contrast readable content |
| `text-muted` | `#4B5563` | Subtitles, helper text, timestamps |

### 3.2 Typography & Localization
- **Font Stack:** Inter / Plus Jakarta Sans / system UI font stack with high legibility.
- **Currency:** Indian Rupee formatting (`₹{amount}`) with localized units (e.g., `₹40 / kg`, `₹25 / bunch`).
- **Dates & Times:** Indian standard formatting (`DD MMM YYYY, hh:mm A IST`).
- **Local Context:** Mira Bhayandar sub-regions explicitly supported:
  - *Uttan Coastal Organic Belts* (Fresh herbs, greens, coconuts)
  - *Dongri Hills & Orchards* (Papayas, seasonal gourds, bananas)
  - *Morva & Rai Valley* (Brinjals, cluster beans/gawar, ladyfingers/bhindi, spinach)
  - *Murdha & Bhayandar West Mandi Border* (Radish, coriander, spring onions)
  - *Consumer Delivery Hubs*: Mira Road (Shanti Nagar, Kanakia, Beverly Park), Bhayandar East (Indralok, Navghar), Bhayandar West (Maxus Mall, Venkateshwar Nagar).

---

## 4. Database Schema Design (PostgreSQL / Supabase)

### 4.1 Tables & Relations
1. **`profiles`**
   - `id` UUID PK (FK to `auth.users.id` on delete cascade)
   - `full_name` TEXT NOT NULL
   - `phone` TEXT NOT NULL
   - `role` TEXT NOT NULL CHECK (`role IN ('consumer', 'farmer', 'admin')`)
   - `created_at` TIMESTAMPTZ DEFAULT now()
   - `updated_at` TIMESTAMPTZ DEFAULT now()

2. **`farmer_profiles`**
   - `id` UUID PK DEFAULT gen_random_uuid()
   - `user_id` UUID NOT NULL UNIQUE REFERENCES profiles(id)
   - `farm_name` TEXT NOT NULL
   - `description` TEXT
   - `locality` TEXT NOT NULL (e.g., 'Uttan', 'Dongri', 'Morva', 'Rai')
   - `address` TEXT NOT NULL
   - `latitude` NUMERIC(10, 6) NOT NULL
   - `longitude` NUMERIC(10, 6) NOT NULL
   - `verification_status` TEXT NOT NULL DEFAULT 'verified' CHECK (`verification_status IN ('pending', 'verified', 'rejected')`)
   - `created_at` TIMESTAMPTZ DEFAULT now()

3. **`categories`**
   - `id` UUID PK DEFAULT gen_random_uuid()
   - `name` TEXT NOT NULL
   - `slug` TEXT NOT NULL UNIQUE
   - `image_url` TEXT
   - `is_active` BOOLEAN DEFAULT true

4. **`products`**
   - `id` UUID PK DEFAULT gen_random_uuid()
   - `farmer_id` UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE
   - `category_id` UUID NOT NULL REFERENCES categories(id)
   - `name` TEXT NOT NULL
   - `description` TEXT
   - `image_url` TEXT NOT NULL
   - `price` NUMERIC(10, 2) NOT NULL CHECK (price > 0)
   - `unit` TEXT NOT NULL (e.g. 'kg', '500g', 'bunch', 'piece')
   - `available_quantity` INT NOT NULL CHECK (available_quantity >= 0)
   - `harvest_date` DATE NOT NULL
   - `is_active` BOOLEAN DEFAULT true
   - `created_at` TIMESTAMPTZ DEFAULT now()
   - `updated_at` TIMESTAMPTZ DEFAULT now()

5. **`addresses`**
   - `id` UUID PK DEFAULT gen_random_uuid()
   - `consumer_id` UUID NOT NULL REFERENCES profiles(id)
   - `address_label` TEXT NOT NULL (e.g. 'Home', 'Office')
   - `recipient_name` TEXT NOT NULL
   - `phone` TEXT NOT NULL
   - `address_line` TEXT NOT NULL
   - `locality` TEXT NOT NULL
   - `city` TEXT NOT NULL DEFAULT 'Mira Bhayandar'
   - `postal_code` TEXT NOT NULL
   - `latitude` NUMERIC(10, 6)
   - `longitude` NUMERIC(10, 6)
   - `is_default` BOOLEAN DEFAULT false
   - `created_at` TIMESTAMPTZ DEFAULT now()

6. **`delivery_slots`**
   - `id` UUID PK DEFAULT gen_random_uuid()
   - `delivery_date` DATE NOT NULL
   - `start_time` TIME NOT NULL
   - `end_time` TIME NOT NULL
   - `locality` TEXT NOT NULL
   - `capacity` INT NOT NULL CHECK (capacity > 0)
   - `is_active` BOOLEAN DEFAULT true

7. **`orders`**
   - `id` UUID PK DEFAULT gen_random_uuid()
   - `consumer_id` UUID NOT NULL REFERENCES profiles(id)
   - `address_id` UUID NOT NULL REFERENCES addresses(id)
   - `delivery_slot_id` UUID NOT NULL REFERENCES delivery_slots(id)
   - `order_number` TEXT NOT NULL UNIQUE
   - `status` TEXT NOT NULL DEFAULT 'pending' CHECK (`status IN ('pending', 'accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled', 'rejected')`)
   - `subtotal` NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0)
   - `delivery_fee` NUMERIC(10, 2) NOT NULL DEFAULT 40.00
   - `total_amount` NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0)
   - `payment_method` TEXT NOT NULL DEFAULT 'cod' CHECK (`payment_method IN ('cod', 'upi')`)
   - `payment_status` TEXT NOT NULL DEFAULT 'pending' CHECK (`payment_status IN ('pending', 'completed', 'refunded')`)
   - `notes` TEXT
   - `created_at` TIMESTAMPTZ DEFAULT now()
   - `updated_at` TIMESTAMPTZ DEFAULT now()

8. **`order_items`**
   - `id` UUID PK DEFAULT gen_random_uuid()
   - `order_id` UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE
   - `product_id` UUID NOT NULL REFERENCES products(id)
   - `farmer_id` UUID NOT NULL REFERENCES farmer_profiles(id)
   - `product_name_snapshot` TEXT NOT NULL
   - `unit_price` NUMERIC(10, 2) NOT NULL CHECK (unit_price > 0)
   - `quantity` INT NOT NULL CHECK (quantity > 0)
   - `line_total` NUMERIC(10, 2) NOT NULL CHECK (line_total > 0)
   - `farmer_fulfillment_status` TEXT NOT NULL DEFAULT 'pending' CHECK (`farmer_fulfillment_status IN ('pending', 'accepted', 'rejected', 'preparing', 'ready')`)
   - `created_at` TIMESTAMPTZ DEFAULT now()

9. **`deliveries`**
   - `id` UUID PK DEFAULT gen_random_uuid()
   - `order_id` UUID NOT NULL REFERENCES orders(id)
   - `delivery_slot_id` UUID NOT NULL REFERENCES delivery_slots(id)
   - `delivery_agent_id` UUID REFERENCES profiles(id)
   - `status` TEXT NOT NULL DEFAULT 'scheduled' CHECK (`status IN ('scheduled', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed')`)
   - `assigned_at` TIMESTAMPTZ
   - `picked_up_at` TIMESTAMPTZ
   - `delivered_at` TIMESTAMPTZ
   - `delivery_notes` TEXT
   - `created_at` TIMESTAMPTZ DEFAULT now()
   - `updated_at` TIMESTAMPTZ DEFAULT now()

10. **`reviews`**
    - `id` UUID PK DEFAULT gen_random_uuid()
    - `order_item_id` UUID NOT NULL UNIQUE REFERENCES order_items(id)
    - `consumer_id` UUID NOT NULL REFERENCES profiles(id)
    - `product_id` UUID NOT NULL REFERENCES products(id)
    - `rating` INT NOT NULL CHECK (rating BETWEEN 1 AND 5)
    - `comment` TEXT
    - `created_at` TIMESTAMPTZ DEFAULT now()

---

## 5. Security & Row Level Security (RLS) Rules

1. **Authentication Enforcement:** Anonymous users can only read active categories, verified farmer profiles, and active products with stock > 0.
2. **Consumer Data Segregation:** Consumers can select, update, and insert only their own `addresses`, `orders`, `order_items` belonging to their orders, and create reviews on items they ordered.
3. **Farmer Data Isolation:** Farmers can read orders and order items where `farmer_id` matches their own `farmer_profile.id`. They cannot modify other farmers' products or see customer data from unrelated orders.
4. **Admin Privileges:** Only users where `profiles.role = 'admin'` have blanket read and update access to moderation, delivery slots, and platform analytics.
5. **Transactional Integrity:** Checkouts and cancellations must run through PostgreSQL server functions verifying that `products.available_quantity >= requested_quantity` and decrementing inventory synchronously under an atomic row-lock.

---

## 6. Functional Modules & UX Workflows

### 6.1 Public Portal
- **Header:** Brand mark, Mira Bhayandar locality selector, Search trigger, Navigation links (Marketplace, Farmers, How it Works, Impact), Cart counter, Authentication actions.
- **Hero:** Punchy value proposition: *"Direct from Mira Bhayandar Farms to Your Kitchen within Hours."* Visual badges: 0% Mandi Markups, 100% Fresh Harvests, Fair Income for Local Cultivators.
- **Marketplace Explorer:** Grid with interactive multi-filter (Categories: Leafy Greens, Exotic Veggies, Coastal Fruits, Farm Grains; Locality: Uttan, Dongri, Morva, Rai; Price Sort; Organic / Certified badge).

### 6.2 Farmer Portal
- **Live Metric Bar:** Today's Harvest Value, Orders to Pack, Pending Approvals.
- **Inventory Manager:** Live stock adjustments, Harvest Date tag, In-Stock/Out-of-Stock instant toggle, image previews.
- **Fulfillment Engine:** Per-item order acceptance with packing status updates.

### 6.3 Consumer Portal & Checkout
- **Instant Drawer Cart:** Quantity increments, real-time total calculation in INR with clear ₹40 delivery fee breakdown.
- **Checkout Wizard:**
  1. Address Selection (pre-populated Mira Road / Bhayandar locations + Add Custom).
  2. Delivery Slot Booking (e.g. *Tomorrow Morning 07:00 AM - 10:00 AM* with remaining slot capacity counter).
  3. Payment Choice (Cash on Delivery / UPI on Delivery).
  4. Confirmation & Live Interactive Timeline Tracker.
- **Order Details & OpenStreetMap View:** Visual representation of farm origin in Uttan/Dongri/Morva and delivery address in Mira Bhayandar with Leaflet markers.
- **Review Submission:** 5-star rating + optional feedback on completed items.

### 6.4 Administrative Center
- **System Overview:** Total registered farmers, active listings, gross platform volume.
- **Moderation Table:** Farmer verification workflow, product review.
- **Slot Capacity Manager:** Adjust max daily orders per slot to prevent logistical bottlenecks.
