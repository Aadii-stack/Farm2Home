-- ============================================================================
-- Farm2Home Comprehensive Database Seed Script
-- Populates all 10 tables with authentic Mira Bhayandar agricultural demo data
-- Safe to re-run (all inserts use ON CONFLICT DO NOTHING / UPDATE)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Allow seed profiles even before auth.users are verified by making constraint deferred
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- -----------------------------------------------------------------------------
-- 1. AUTH USERS (Enables live email/password login in Supabase Auth if needed)
-- Password for all demo accounts: Password123!
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES
        ('11111111-1111-4111-a111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'consumer@farm2home.local', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aaditya Sharma","role":"consumer"}', now(), now()),
        ('22222222-2222-4222-a222-222222222221', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bhaskar@farm2home.local', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Bhaskar Patil","role":"farmer"}', now(), now()),
        ('22222222-2222-4222-a222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rajesh@farm2home.local', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rajesh Mhatre","role":"farmer"}', now(), now()),
        ('22222222-2222-4222-a222-222222222223', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sunita@farm2home.local', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sunita Tare","role":"farmer"}', now(), now()),
        ('33333333-3333-4333-a333-333333333331', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@farm2home.local', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Mira Bhayandar Agrico Admin","role":"admin"}', now(), now())
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- -----------------------------------------------------------------------------
-- 2. PUBLIC PROFILES
-- -----------------------------------------------------------------------------
INSERT INTO public.profiles (id, full_name, phone, role) VALUES
('11111111-1111-4111-a111-111111111111', 'Aaditya Sharma', '+91 98201 12345', 'consumer'),
('22222222-2222-4222-a222-222222222221', 'Bhaskar Patil', '+91 98202 23456', 'farmer'),
('22222222-2222-4222-a222-222222222222', 'Rajesh Mhatre', '+91 98203 34567', 'farmer'),
('22222222-2222-4222-a222-222222222223', 'Sunita Tare', '+91 98204 45678', 'farmer'),
('33333333-3333-4333-a333-333333333331', 'Mira Bhayandar Agrico Admin', '+91 98200 00001', 'admin')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role;

-- -----------------------------------------------------------------------------
-- 3. FARMER PROFILES
-- -----------------------------------------------------------------------------
INSERT INTO public.farmer_profiles (id, user_id, farm_name, description, locality, address, latitude, longitude, verification_status) VALUES
(
    '44444444-4444-4444-a444-444444444441',
    '22222222-2222-4222-a222-222222222221',
    'Uttan Coastal Agro',
    'Third-generation organic coastal farm in Uttan village cultivating mineral-rich green vegetables, sweet potatoes, and coastal coconuts without synthetic pesticides.',
    'Uttan',
    'Survey No. 42, Near Velankanni Shrine, Uttan Beach Road, Bhayandar West',
    19.281800,
    72.783200,
    'verified'
),
(
    '44444444-4444-4444-a444-444444444442',
    '22222222-2222-4222-a222-222222222222',
    'Dongri Hillside Orchards',
    'Terraced orchard located on the Dongri slopes utilizing drip irrigation and natural compost for tree-ripened papayas, bananas, and native gourds.',
    'Dongri',
    'Plot 18, Dongri Fort Approach Road, Bhayandar West',
    19.294100,
    72.809500,
    'verified'
),
(
    '44444444-4444-4444-a444-444444444443',
    '22222222-2222-4222-a222-222222222223',
    'Rai-Morva Natural Farms',
    'Community farm cooperative between Rai and Morva cultivating traditional Marathi heirloom leafy greens like palak, methi, and tender bhindi picked at daybreak.',
    'Rai & Morva',
    'Near Old Church, Rai Village, Mira Bhayandar',
    19.299500,
    72.834000,
    'verified'
)
ON CONFLICT (id) DO UPDATE SET
    farm_name = EXCLUDED.farm_name,
    description = EXCLUDED.description,
    locality = EXCLUDED.locality,
    verification_status = EXCLUDED.verification_status;

-- -----------------------------------------------------------------------------
-- 4. CATEGORIES
-- -----------------------------------------------------------------------------
INSERT INTO public.categories (id, name, slug, image_url, is_active) VALUES
('55555555-5555-4555-a555-555555555551', 'Leafy Greens & Herbs', 'leafy-greens', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', true),
('55555555-5555-4555-a555-555555555552', 'Daily Fresh Vegetables', 'daily-vegetables', 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=600&q=80', true),
('55555555-5555-4555-a555-555555555553', 'Farm Fresh Fruits', 'farm-fruits', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80', true),
('55555555-5555-4555-a555-555555555554', 'Roots & Tubers', 'roots-tubers', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80', true),
('55555555-5555-4555-a555-555555555555', 'Farm Grains & Rice', 'grains-staples', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    image_url = EXCLUDED.image_url;

-- -----------------------------------------------------------------------------
-- 5. PRODUCTS
-- -----------------------------------------------------------------------------
INSERT INTO public.products (id, farmer_id, category_id, name, description, image_url, price, unit, available_quantity, harvest_date, is_active) VALUES
(
    '66666666-6666-4666-a666-666666666601',
    '44444444-4444-4444-a444-444444444443',
    '55555555-5555-4555-a555-555555555551',
    'Desi Organic Palak (पालक)',
    'Crisp, earthy, nutrient-dense spinach leaves freshly hand-harvested at 5:00 AM from Morva fields. Zero chemical sprays.',
    'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    30.00,
    '250g bunch',
    45,
    CURRENT_DATE,
    true
),
(
    '66666666-6666-4666-a666-666666666602',
    '44444444-4444-4444-a444-444444444443',
    '55555555-5555-4555-a555-555555555551',
    'Fresh Rai Methi (मेथी)',
    'Aromatic small-leaf desi methi grown using well-water in Rai village. Perfect for Gujarati Theplas and Aloo Methi.',
    'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80',
    25.00,
    'bunch',
    38,
    CURRENT_DATE,
    true
),
(
    '66666666-6666-4666-a666-666666666603',
    '44444444-4444-4444-a444-444444444443',
    '55555555-5555-4555-a555-555555555552',
    'Tender Morva Bhindi (भेंडी)',
    'Slender, snap-fresh green okra with tiny seeds. Crisp texture that cooks without excess slime.',
    'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?auto=format&fit=crop&w=600&q=80',
    45.00,
    '500g',
    26,
    CURRENT_DATE,
    true
),
(
    '66666666-6666-4666-a666-666666666604',
    '44444444-4444-4444-a444-444444444441',
    '55555555-5555-4555-a555-555555555552',
    'Uttan Round Brinjals (काळी वांगी)',
    'Glossy purple coastal brinjals with tender seedless flesh, grown specifically for authentic Maharashtrian Bharli Vangi.',
    'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80',
    35.00,
    '500g',
    32,
    CURRENT_DATE,
    true
),
(
    '66666666-6666-4666-a666-666666666605',
    '44444444-4444-4444-a444-444444444442',
    '55555555-5555-4555-a555-555555555553',
    'Dongri Natural Ripe Papaya (पपई)',
    'Tree-ripened golden sweet papaya grown naturally without carbide or chemical ripening agents. High in vitamin C.',
    'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=600&q=80',
    65.00,
    'piece (1-1.2 kg)',
    18,
    CURRENT_DATE,
    true
),
(
    '66666666-6666-4666-a666-666666666606',
    '44444444-4444-4444-a444-444444444441',
    '55555555-5555-4555-a555-555555555553',
    'Fresh Uttan Tender Coconut (शहाळे)',
    'Directly plucked from coastal grove palm trees in Uttan with 400ml+ refreshing sweet electrolyte-rich water and soft malai.',
    'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=600&q=80',
    55.00,
    'piece',
    40,
    CURRENT_DATE,
    true
),
(
    '66666666-6666-4666-a666-666666666607',
    '44444444-4444-4444-a444-444444444441',
    '55555555-5555-4555-a555-555555555554',
    'Red Soil Sweet Potatoes (रताळी)',
    'Naturally sweet tubers rich in dietary fiber and vitamins harvested from the porous coastal soil of Gorai-Uttan.',
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    50.00,
    '1 kg',
    24,
    CURRENT_DATE,
    true
),
(
    '66666666-6666-4666-a666-666666666608',
    '44444444-4444-4444-a444-444444444443',
    '55555555-5555-4555-a555-555555555551',
    'Aromatic Desi Kothimbir (Coriander)',
    'Intensely fragrant fresh coriander with root-soil integrity preserved to maintain freshness for up to 5 days in your kitchen.',
    'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
    20.00,
    'bunch',
    50,
    CURRENT_DATE,
    true
),
(
    '66666666-6666-4666-a666-666666666609',
    '44444444-4444-4444-a444-444444444442',
    '55555555-5555-4555-a555-555555555552',
    'Farm Fresh Ridge Gourd (Turai)',
    'Tender ridge gourd with sweet natural moisture, harvested daily from bamboo trellises at Dongri slopes.',
    'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80',
    40.00,
    '500g',
    15,
    CURRENT_DATE,
    true
),
(
    '66666666-6666-4666-a666-666666666610',
    '44444444-4444-4444-a444-444444444442',
    '55555555-5555-4555-a555-555555555555',
    'Palghar Wada Kolam Raw Rice',
    'Aromatic short-grain heritage Maharashtrian rice grown by local allied farmer collectives, naturally aged for 12 months.',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    95.00,
    '1 kg pouch',
    30,
    CURRENT_DATE - INTERVAL '15 days',
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    price = EXCLUDED.price,
    available_quantity = EXCLUDED.available_quantity,
    harvest_date = EXCLUDED.harvest_date;

-- -----------------------------------------------------------------------------
-- 6. DELIVERY SLOTS
-- -----------------------------------------------------------------------------
INSERT INTO public.delivery_slots (id, delivery_date, start_time, end_time, locality, capacity, is_active) VALUES
('77777777-7777-4777-a777-777777777701', CURRENT_DATE + INTERVAL '1 day', '07:00:00', '10:00:00', 'Mira Road & Bhayandar East', 25, true),
('77777777-7777-4777-a777-777777777702', CURRENT_DATE + INTERVAL '1 day', '16:30:00', '19:30:00', 'Mira Road & Bhayandar East', 20, true),
('77777777-7777-4777-a777-777777777703', CURRENT_DATE + INTERVAL '1 day', '07:30:00', '10:30:00', 'Bhayandar West (Maxus / 150ft Rd)', 20, true),
('77777777-7777-4777-a777-777777777704', CURRENT_DATE + INTERVAL '2 days', '07:00:00', '10:00:00', 'Mira Road & Bhayandar East', 30, true)
ON CONFLICT (id) DO UPDATE SET
    capacity = EXCLUDED.capacity,
    is_active = EXCLUDED.is_active;

-- -----------------------------------------------------------------------------
-- 7. ADDRESSES
-- -----------------------------------------------------------------------------
INSERT INTO public.addresses (id, consumer_id, address_label, recipient_name, phone, address_line, locality, city, postal_code, latitude, longitude, is_default) VALUES
(
    '88888888-8888-4888-a888-888888888801',
    '11111111-1111-4111-a111-111111111111',
    'Home',
    'Aaditya Sharma',
    '+91 98201 12345',
    'Flat 402, Gokul Horizon, Near Shanti Nagar Sector 4',
    'Mira Road East',
    'Mira Bhayandar',
    '401107',
    19.284500,
    72.868200,
    true
),
(
    '88888888-8888-4888-a888-888888888802',
    '11111111-1111-4111-a111-111111111111',
    'Office',
    'Aaditya Sharma',
    '+91 98201 12345',
    'Shop 12, Ostwal Point, Kanakia Road',
    'Mira Road East',
    'Mira Bhayandar',
    '401107',
    19.278000,
    72.871000,
    false
)
ON CONFLICT (id) DO UPDATE SET
    address_line = EXCLUDED.address_line,
    recipient_name = EXCLUDED.recipient_name;

-- -----------------------------------------------------------------------------
-- 8. ORDERS
-- -----------------------------------------------------------------------------
INSERT INTO public.orders (id, consumer_id, address_id, delivery_slot_id, order_number, status, subtotal, delivery_fee, total_amount, payment_method, payment_status, notes) VALUES
(
    '99999999-9999-4999-a999-999999999901',
    '11111111-1111-4111-a111-111111111111',
    '88888888-8888-4888-a888-888888888801',
    '77777777-7777-4777-a777-777777777701',
    'F2H-20261027-0104',
    'preparing',
    155.00,
    40.00,
    195.00,
    'cod',
    'pending',
    'Please ring bell twice, elderly at home.'
),
(
    '99999999-9999-4999-a999-999999999902',
    '11111111-1111-4111-a111-111111111111',
    '88888888-8888-4888-a888-888888888801',
    '77777777-7777-4777-a777-777777777702',
    'F2H-20261025-0089',
    'delivered',
    215.00,
    40.00,
    255.00,
    'cod',
    'completed',
    'Leave at security if door unanswered'
)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    total_amount = EXCLUDED.total_amount;

-- -----------------------------------------------------------------------------
-- 9. ORDER ITEMS
-- -----------------------------------------------------------------------------
INSERT INTO public.order_items (id, order_id, product_id, farmer_id, product_name_snapshot, unit_price, quantity, line_total, farmer_fulfillment_status) VALUES
(
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaa1',
    '99999999-9999-4999-a999-999999999901',
    '66666666-6666-4666-a666-666666666601',
    '44444444-4444-4444-a444-444444444443',
    'Desi Organic Palak (Spinach)',
    30.00,
    2,
    60.00,
    'preparing'
),
(
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaa2',
    '99999999-9999-4999-a999-999999999901',
    '66666666-6666-4666-a666-666666666604',
    '44444444-4444-4444-a444-444444444441',
    'Uttan Round Brinjals (Vangi)',
    35.00,
    1,
    35.00,
    'ready'
),
(
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaa3',
    '99999999-9999-4999-a999-999999999901',
    '66666666-6666-4666-a666-666666666605',
    '44444444-4444-4444-a444-444444444442',
    'Dongri Natural Ripe Papaya',
    60.00,
    1,
    60.00,
    'accepted'
),
(
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaa4',
    '99999999-9999-4999-a999-999999999902',
    '66666666-6666-4666-a666-666666666606',
    '44444444-4444-4444-a444-444444444441',
    'Fresh Uttan Tender Coconut (Shahad)',
    55.00,
    2,
    110.00,
    'ready'
),
(
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaa5',
    '99999999-9999-4999-a999-999999999902',
    '66666666-6666-4666-a666-666666666610',
    '44444444-4444-4444-a444-444444444442',
    'Palghar Wada Kolam Raw Rice',
    95.00,
    1,
    95.00,
    'ready'
),
(
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaa6',
    '99999999-9999-4999-a999-999999999902',
    '66666666-6666-4666-a666-666666666608',
    '44444444-4444-4444-a444-444444444443',
    'Aromatic Desi Kothimbir (Coriander)',
    20.00,
    1,
    20.00,
    'ready'
)
ON CONFLICT (id) DO UPDATE SET
    farmer_fulfillment_status = EXCLUDED.farmer_fulfillment_status;

-- -----------------------------------------------------------------------------
-- 10. DELIVERIES
-- -----------------------------------------------------------------------------
INSERT INTO public.deliveries (id, order_id, delivery_slot_id, status) VALUES
('cccccccc-cccc-4ccc-accc-ccccccccccc1', '99999999-9999-4999-a999-999999999901', '77777777-7777-4777-a777-777777777701', 'scheduled'),
('cccccccc-cccc-4ccc-accc-ccccccccccc2', '99999999-9999-4999-a999-999999999902', '77777777-7777-4777-a777-777777777702', 'delivered')
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status;

-- -----------------------------------------------------------------------------
-- 11. REVIEWS
-- -----------------------------------------------------------------------------
INSERT INTO public.reviews (id, order_item_id, consumer_id, product_id, rating, comment) VALUES
(
    'bbbbbbbb-bbbb-4bbb-abbb-bbbbbbbbbbb1',
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaa4',
    '11111111-1111-4111-a111-111111111111',
    '66666666-6666-4666-a666-666666666606',
    5,
    'The tender coconuts from Uttan were incredibly sweet with plenty of soft malai! Way fresher than anything from the local vegetable market.'
),
(
    'bbbbbbbb-bbbb-4bbb-abbb-bbbbbbbbbbb2',
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaa5',
    '11111111-1111-4111-a111-111111111111',
    '66666666-6666-4666-a666-666666666610',
    5,
    'Authentic fragrant Wada Kolam rice. Knowing it supports farmers in our neighboring Dongri-Palghar belt makes it even better.'
)
ON CONFLICT (id) DO UPDATE SET
    rating = EXCLUDED.rating,
    comment = EXCLUDED.comment;
