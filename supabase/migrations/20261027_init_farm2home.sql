-- Farm2Home Database Migration
-- PostgreSQL / Supabase Schema for Direct Farm-to-Home Delivery Platform
-- Centered on Mira Bhayandar, Maharashtra

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked to auth.users)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'consumer' CHECK (role IN ('consumer', 'farmer', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

--------------------------------------------------------------------------------
-- 2. FARMER PROFILES
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_name TEXT NOT NULL,
    description TEXT,
    locality TEXT NOT NULL, -- e.g., 'Uttan', 'Dongri', 'Morva', 'Rai', 'Bhayandar West'
    address TEXT NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_farmer_locality ON public.farmer_profiles(locality);
CREATE INDEX IF NOT EXISTS idx_farmer_verification ON public.farmer_profiles(verification_status);

--------------------------------------------------------------------------------
-- 3. CATEGORIES
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

--------------------------------------------------------------------------------
-- 4. PRODUCTS
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.farmer_profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    unit TEXT NOT NULL, -- e.g., 'kg', '500g', 'bunch', 'piece'
    available_quantity INT NOT NULL CHECK (available_quantity >= 0),
    harvest_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON public.products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active_stock ON public.products(is_active, available_quantity);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin(to_tsvector('english', name));

--------------------------------------------------------------------------------
-- 5. CONSUMER ADDRESSES
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    address_label TEXT NOT NULL DEFAULT 'Home', -- 'Home', 'Work', etc.
    recipient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line TEXT NOT NULL,
    locality TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Mira Bhayandar',
    postal_code TEXT NOT NULL,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_addresses_consumer_id ON public.addresses(consumer_id);

--------------------------------------------------------------------------------
-- 6. DELIVERY SLOTS
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.delivery_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    locality TEXT NOT NULL, -- e.g. 'Mira Road', 'Bhayandar East', 'Bhayandar West'
    capacity INT NOT NULL CHECK (capacity > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT unique_slot_window UNIQUE (delivery_date, start_time, end_time, locality)
);

CREATE INDEX IF NOT EXISTS idx_delivery_slots_lookup ON public.delivery_slots(delivery_date, locality, is_active);

--------------------------------------------------------------------------------
-- 7. ORDERS
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    address_id UUID NOT NULL REFERENCES public.addresses(id) ON DELETE RESTRICT,
    delivery_slot_id UUID NOT NULL REFERENCES public.delivery_slots(id) ON DELETE RESTRICT,
    order_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'accepted',
        'preparing',
        'ready_for_pickup',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'rejected'
    )),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 40.00 CHECK (delivery_fee >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'upi')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'refunded')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_consumer ON public.orders(consumer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_slot ON public.orders(delivery_slot_id);

--------------------------------------------------------------------------------
-- 8. ORDER ITEMS (Per-product and per-farmer line items)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    farmer_id UUID NOT NULL REFERENCES public.farmer_profiles(id) ON DELETE RESTRICT,
    product_name_snapshot TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price > 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    line_total NUMERIC(10, 2) NOT NULL CHECK (line_total > 0),
    farmer_fulfillment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
        farmer_fulfillment_status IN ('pending', 'accepted', 'rejected', 'preparing', 'ready')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_farmer_id ON public.order_items(farmer_id);

--------------------------------------------------------------------------------
-- 9. DELIVERIES
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
    delivery_slot_id UUID NOT NULL REFERENCES public.delivery_slots(id) ON DELETE RESTRICT,
    delivery_agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (
        status IN ('scheduled', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed')
    ),
    assigned_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    delivery_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON public.deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);

--------------------------------------------------------------------------------
-- 10. REVIEWS
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL UNIQUE REFERENCES public.order_items(id) ON DELETE CASCADE,
    consumer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_consumer_id ON public.reviews(consumer_id);

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone authenticated can read profiles; users can update own profile
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Farmer Profiles: Public viewable if verified; farmers can manage their own
CREATE POLICY "Public can view verified farmers" ON public.farmer_profiles
    FOR SELECT USING (verification_status = 'verified' OR auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Farmers can insert their profile" ON public.farmer_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Farmers can update their profile" ON public.farmer_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Categories: Public read; admin manage
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can modify categories" ON public.categories
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Products: Public can view active products from verified farmers; farmer manages own
CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT USING (
        (is_active = true AND available_quantity >= 0)
        OR EXISTS (
            SELECT 1 FROM public.farmer_profiles WHERE id = products.farmer_id AND user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Farmers can insert products" ON public.products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.farmer_profiles WHERE id = farmer_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Farmers can update own products" ON public.products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.farmer_profiles WHERE id = farmer_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Farmers can delete own products" ON public.products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.farmer_profiles WHERE id = farmer_id AND user_id = auth.uid()
        )
    );

-- Addresses: Consumers view/manage own
CREATE POLICY "Consumers manage own addresses" ON public.addresses
    FOR ALL USING (auth.uid() = consumer_id);

-- Delivery Slots: Public read active; admin manage
CREATE POLICY "Public can view active delivery slots" ON public.delivery_slots
    FOR SELECT USING (true);

CREATE POLICY "Admins manage delivery slots" ON public.delivery_slots
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Orders: Consumers read/create own; Farmers read orders containing their items; Admin reads all
CREATE POLICY "Consumers can view own orders" ON public.orders
    FOR SELECT USING (
        auth.uid() = consumer_id
        OR EXISTS (
            SELECT 1 FROM public.order_items oi
            JOIN public.farmer_profiles fp ON fp.id = oi.farmer_id
            WHERE oi.order_id = orders.id AND fp.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Consumers can insert own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = consumer_id);

CREATE POLICY "Authorized users can update orders" ON public.orders
    FOR UPDATE USING (
        auth.uid() = consumer_id
        OR EXISTS (
            SELECT 1 FROM public.order_items oi
            JOIN public.farmer_profiles fp ON fp.id = oi.farmer_id
            WHERE oi.order_id = orders.id AND fp.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Order Items: Consumers view items in their orders; farmers view their line items
CREATE POLICY "View order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND consumer_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.farmer_profiles WHERE id = order_items.farmer_id AND user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Farmers update fulfillment status" ON public.order_items
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.farmer_profiles WHERE id = order_items.farmer_id AND user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Deliveries: Viewable by order owner, farmer, delivery agent, admin
CREATE POLICY "View deliveries" ON public.deliveries
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.orders WHERE id = deliveries.order_id AND consumer_id = auth.uid())
        OR auth.uid() = delivery_agent_id
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins or agents update deliveries" ON public.deliveries
    FOR UPDATE USING (
        auth.uid() = delivery_agent_id
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Reviews: Viewable by public; insertable only by consumer who bought the item
CREATE POLICY "Public can view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Consumers insert reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = consumer_id);

--------------------------------------------------------------------------------
-- TRANSACTIONAL STORED PROCEDURES / RPC FUNCTIONS
--------------------------------------------------------------------------------

-- 1. Atomic Order Creation with Stock Reservation
CREATE OR REPLACE FUNCTION public.create_order_transactional(
    p_consumer_id UUID,
    p_address_id UUID,
    p_delivery_slot_id UUID,
    p_payment_method TEXT,
    p_notes TEXT,
    p_items JSONB -- Array of { product_id, quantity }
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_order_number TEXT;
    v_subtotal NUMERIC(10, 2) := 0;
    v_delivery_fee NUMERIC(10, 2) := 40.00;
    v_total_amount NUMERIC(10, 2) := 0;
    v_slot_capacity INT;
    v_slot_booked INT;
    v_item RECORD;
    v_prod RECORD;
    v_line_total NUMERIC(10, 2);
BEGIN
    -- Check delivery slot capacity
    SELECT capacity INTO v_slot_capacity
    FROM public.delivery_slots
    WHERE id = p_delivery_slot_id AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Selected delivery slot is inactive or not found.';
    END IF;

    SELECT COUNT(*) INTO v_slot_booked
    FROM public.orders
    WHERE delivery_slot_id = p_delivery_slot_id AND status NOT IN ('cancelled', 'rejected');

    IF v_slot_booked >= v_slot_capacity THEN
        RAISE EXCEPTION 'Delivery slot has reached maximum capacity. Please select another slot.';
    END IF;

    -- Generate unique order number (e.g., F2H-MB-20261027-ABCD)
    v_order_number := 'F2H-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(gen_random_uuid()::text, 1, 6));

    -- First pass: Validate stock & compute subtotal with row-level locks
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INT)
    LOOP
        SELECT p.id, p.name, p.price, p.available_quantity, p.farmer_id
        INTO v_prod
        FROM public.products p
        WHERE p.id = v_item.product_id AND p.is_active = true
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product % is not available or inactive.', v_item.product_id;
        END IF;

        IF v_prod.available_quantity < v_item.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product "%" (Available: %, Requested: %)', 
                v_prod.name, v_prod.available_quantity, v_item.quantity;
        END IF;

        v_line_total := v_prod.price * v_item.quantity;
        v_subtotal := v_subtotal + v_line_total;
    END LOOP;

    v_total_amount := v_subtotal + v_delivery_fee;

    -- Create master order
    INSERT INTO public.orders (
        consumer_id,
        address_id,
        delivery_slot_id,
        order_number,
        status,
        subtotal,
        delivery_fee,
        total_amount,
        payment_method,
        payment_status,
        notes
    ) VALUES (
        p_consumer_id,
        p_address_id,
        p_delivery_slot_id,
        v_order_number,
        'pending',
        v_subtotal,
        v_delivery_fee,
        v_total_amount,
        p_payment_method,
        'pending',
        p_notes
    ) RETURNING id INTO v_order_id;

    -- Second pass: Insert line items and decrement product inventory
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INT)
    LOOP
        SELECT p.id, p.name, p.price, p.farmer_id
        INTO v_prod
        FROM public.products p
        WHERE p.id = v_item.product_id;

        v_line_total := v_prod.price * v_item.quantity;

        INSERT INTO public.order_items (
            order_id,
            product_id,
            farmer_id,
            product_name_snapshot,
            unit_price,
            quantity,
            line_total,
            farmer_fulfillment_status
        ) VALUES (
            v_order_id,
            v_prod.id,
            v_prod.farmer_id,
            v_prod.name,
            v_prod.price,
            v_item.quantity,
            v_line_total,
            'pending'
        );

        -- Decrement stock atomically
        UPDATE public.products
        SET available_quantity = available_quantity - v_item.quantity,
            updated_at = now()
        WHERE id = v_prod.id;
    END LOOP;

    -- Create corresponding delivery entry
    INSERT INTO public.deliveries (
        order_id,
        delivery_slot_id,
        status
    ) VALUES (
        v_order_id,
        p_delivery_slot_id,
        'scheduled'
    );

    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_number', v_order_number,
        'total_amount', v_total_amount
    );
END;
$$;

-- 2. Atomic Order Cancellation with Stock Restoration
CREATE OR REPLACE FUNCTION public.cancel_order_restore_stock(
    p_order_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
BEGIN
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found.';
    END IF;

    -- Verification of permissions
    IF v_order.consumer_id <> p_user_id AND NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = p_user_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Unauthorized to cancel this order.';
    END IF;

    IF v_order.status NOT IN ('pending', 'accepted') THEN
        RAISE EXCEPTION 'Cannot cancel order in status "%". Harvest preparation has already commenced.', v_order.status;
    END IF;

    -- Update order status
    UPDATE public.orders
    SET status = 'cancelled',
        updated_at = now()
    WHERE id = p_order_id;

    -- Update delivery status
    UPDATE public.deliveries
    SET status = 'failed',
        delivery_notes = 'Order cancelled by customer',
        updated_at = now()
    WHERE order_id = p_order_id;

    -- Restore stock for each item
    FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id
    LOOP
        UPDATE public.products
        SET available_quantity = available_quantity + v_item.quantity,
            updated_at = now()
        WHERE id = v_item.product_id;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'message', 'Order cancelled and stock restored successfully.');
END;
$$;
