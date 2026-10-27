import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Product,
  Category,
  FarmerProfile,
  Order,
  OrderItem,
  DeliverySlot,
  Address,
  Review,
  Profile,
  OrderStatus,
  UserRole,
} from '../types';
import {
  SEED_PROFILES,
  SEED_FARMERS,
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_ADDRESSES,
  SEED_DELIVERY_SLOTS,
  SEED_ORDERS,
  SEED_ORDER_ITEMS,
  SEED_REVIEWS,
} from '../data/seedData';

// Local storage keys for persistent demo state across refreshes
const STORAGE_PREFIX = 'farm2home_demo_';

const BROKEN_IMG_REPLACEMENTS: Record<string, string> = {
  'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=600&q=80':
    'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
};

function getInitialStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (key === 'products' && Array.isArray(parsed)) {
      return parsed.map((p: any) => ({
        ...p,
        image_url: BROKEN_IMG_REPLACEMENTS[p.image_url] || p.image_url,
      })) as unknown as T;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

function saveStore<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// In-Memory / LocalStorage State for Demo Mode
class DemoDatabase {
  profiles: Profile[] = getInitialStore('profiles', SEED_PROFILES);
  farmers: FarmerProfile[] = getInitialStore('farmers', SEED_FARMERS);
  categories: Category[] = getInitialStore('categories', SEED_CATEGORIES);
  products: Product[] = getInitialStore('products', SEED_PRODUCTS);
  addresses: Address[] = getInitialStore('addresses', SEED_ADDRESSES);
  deliverySlots: DeliverySlot[] = getInitialStore('delivery_slots', SEED_DELIVERY_SLOTS);
  orders: Order[] = getInitialStore('orders', SEED_ORDERS);
  orderItems: OrderItem[] = getInitialStore('order_items', SEED_ORDER_ITEMS);
  reviews: Review[] = getInitialStore('reviews', SEED_REVIEWS);

  persist() {
    saveStore('profiles', this.profiles);
    saveStore('farmers', this.farmers);
    saveStore('categories', this.categories);
    saveStore('products', this.products);
    saveStore('addresses', this.addresses);
    saveStore('delivery_slots', this.deliverySlots);
    saveStore('orders', this.orders);
    saveStore('order_items', this.orderItems);
    saveStore('reviews', this.reviews);
  }

  resetToSeed() {
    this.profiles = [...SEED_PROFILES];
    this.farmers = [...SEED_FARMERS];
    this.categories = [...SEED_CATEGORIES];
    this.products = [...SEED_PRODUCTS];
    this.addresses = [...SEED_ADDRESSES];
    this.deliverySlots = [...SEED_DELIVERY_SLOTS];
    this.orders = [...SEED_ORDERS];
    this.orderItems = [...SEED_ORDER_ITEMS];
    this.reviews = [...SEED_REVIEWS];
    this.persist();
  }
}

export const demoDb = new DemoDatabase();

export const isUUID = (str?: string | null): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

// -----------------------------------------------------------------------------
// Unified Data API (Routes to Supabase or Demo Store)
// -----------------------------------------------------------------------------

export const api = {
  isLive: isSupabaseConfigured,

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('categories').select('*').eq('is_active', true);
      if (!error && data) return data as Category[];
    }
    return demoDb.categories.filter((c) => c.is_active);
  },

  // FARMERS
  async getFarmers(): Promise<FarmerProfile[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('farmer_profiles').select('*').eq('verification_status', 'verified');
      if (!error && data) return data as FarmerProfile[];
    }
    return demoDb.farmers.filter((f) => f.verification_status === 'verified');
  },

  async getFarmerById(id: string): Promise<FarmerProfile | null> {
    if (isSupabaseConfigured && supabase && isUUID(id)) {
      const { data, error } = await supabase.from('farmer_profiles').select('*').eq('id', id).single();
      if (!error && data) return data as FarmerProfile;
    }
    return demoDb.farmers.find((f) => f.id === id) || null;
  },

  async getFarmerByUserId(userId: string): Promise<FarmerProfile | null> {
    if (isSupabaseConfigured && supabase && isUUID(userId)) {
      const { data, error } = await supabase.from('farmer_profiles').select('*').eq('user_id', userId).single();
      if (!error && data) return data as FarmerProfile;
    }
    return demoDb.farmers.find((f) => f.user_id === userId) || null;
  },

  async updateFarmerProfile(id: string, updates: Partial<FarmerProfile>): Promise<FarmerProfile> {
    if (isSupabaseConfigured && supabase && isUUID(id)) {
      const { data, error } = await supabase.from('farmer_profiles').update(updates).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return data as FarmerProfile;
    }
    const idx = demoDb.farmers.findIndex((f) => f.id === id);
    if (idx === -1) throw new Error('Farmer not found');
    demoDb.farmers[idx] = { ...demoDb.farmers[idx], ...updates };
    demoDb.persist();
    return demoDb.farmers[idx];
  },

  // PRODUCTS
  async getProducts(params?: {
    categorySlug?: string;
    farmerId?: string;
    search?: string;
    locality?: string;
    minPrice?: number;
    maxPrice?: number;
    onlyActiveStock?: boolean;
    sortBy?: 'price-asc' | 'price-desc' | 'newest';
  }): Promise<Product[]> {
    let prods: Product[] = [];

    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('products').select('*, farmer:farmer_profiles(*), category:categories(*)');
      if (params?.onlyActiveStock) {
        query = query.eq('is_active', true).gt('available_quantity', 0);
      }
      if (params?.farmerId) query = query.eq('farmer_id', params.farmerId);
      const { data, error } = await query;
      if (!error && data) {
        prods = data as Product[];
      }
    }

    if (prods.length === 0) {
      // Use demo database
      prods = demoDb.products.map((p) => ({
        ...p,
        farmer: demoDb.farmers.find((f) => f.id === p.farmer_id),
        category: demoDb.categories.find((c) => c.id === p.category_id),
      }));
    }

    // Apply Client-Side / Fallback filtering & sorting
    if (params?.onlyActiveStock) {
      prods = prods.filter((p) => p.is_active && p.available_quantity > 0);
    }

    if (params?.categorySlug && params.categorySlug !== 'all') {
      prods = prods.filter((p) => p.category?.slug === params.categorySlug);
    }

    if (params?.farmerId) {
      prods = prods.filter((p) => p.farmer_id === params.farmerId);
    }

    if (params?.locality && params.locality !== 'all') {
      prods = prods.filter((p) => p.farmer?.locality.toLowerCase().includes(params.locality!.toLowerCase()));
    }

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      prods = prods.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.farmer?.farm_name.toLowerCase().includes(q)
      );
    }

    if (params?.minPrice !== undefined) {
      prods = prods.filter((p) => p.price >= params.minPrice!);
    }
    if (params?.maxPrice !== undefined) {
      prods = prods.filter((p) => p.price <= params.maxPrice!);
    }

    if (params?.sortBy === 'price-asc') {
      prods.sort((a, b) => a.price - b.price);
    } else if (params?.sortBy === 'price-desc') {
      prods.sort((a, b) => b.price - a.price);
    } else {
      // Default: newest
      prods.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return prods;
  },

  async getProductById(id: string): Promise<Product | null> {
    const prods = await this.getProducts();
    return prods.find((p) => p.id === id) || null;
  },

  async createProduct(
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Product> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('products').insert(productData).select().single();
      if (error) throw new Error(error.message);
      return data as Product;
    }
    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      farmer: demoDb.farmers.find((f) => f.id === productData.farmer_id),
      category: demoDb.categories.find((c) => c.id === productData.category_id),
    };
    demoDb.products.unshift(newProduct);
    demoDb.persist();
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured && supabase && isUUID(id)) {
      const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return data as Product;
    }
    const idx = demoDb.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    demoDb.products[idx] = {
      ...demoDb.products[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    demoDb.persist();
    return demoDb.products[idx];
  },

  async toggleProductActive(id: string, isActive: boolean): Promise<void> {
    await this.updateProduct(id, { is_active: isActive });
  },

  // DELIVERY SLOTS
  async getDeliverySlots(): Promise<DeliverySlot[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('delivery_slots').select('*').eq('is_active', true);
      if (!error && data && data.length > 0) return data as DeliverySlot[];
    }
    return demoDb.deliverySlots.filter((s) => s.is_active);
  },

  // ADDRESSES
  async getAddresses(consumerId: string): Promise<Address[]> {
    if (isSupabaseConfigured && supabase && isUUID(consumerId)) {
      const { data, error } = await supabase.from('addresses').select('*').eq('consumer_id', consumerId);
      if (!error && data) return data as Address[];
    }
    return demoDb.addresses.filter((a) => a.consumer_id === consumerId);
  },

  async createAddress(addressData: Omit<Address, 'id' | 'created_at'>): Promise<Address> {
    if (isSupabaseConfigured && supabase && isUUID(addressData.consumer_id)) {
      const { data, error } = await supabase.from('addresses').insert(addressData).select().single();
      if (error) throw new Error(error.message);
      return data as Address;
    }
    const newAddress: Address = {
      ...addressData,
      id: 'addr-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    // If set to default, unset other defaults
    if (newAddress.is_default) {
      demoDb.addresses.forEach((a) => {
        if (a.consumer_id === addressData.consumer_id) a.is_default = false;
      });
    }
    demoDb.addresses.push(newAddress);
    demoDb.persist();
    return newAddress;
  },

  // ORDER CREATION (ATOMIC WITH STOCK DEDUCTION)
  async placeOrder(params: {
    consumerId: string;
    addressId: string;
    deliverySlotId: string;
    paymentMethod: 'cod' | 'upi';
    notes?: string;
    items: { productId: string; quantity: number }[];
  }): Promise<{ orderId: string; orderNumber: string; totalAmount: number }> {
    const isAllUuid =
      isUUID(params.consumerId) &&
      isUUID(params.addressId) &&
      isUUID(params.deliverySlotId) &&
      params.items.every((it) => isUUID(it.productId));

    if (isSupabaseConfigured && supabase && isAllUuid) {
      // Execute transactional PostgreSQL RPC function
      const { data, error } = await supabase.rpc('create_order_transactional', {
        p_consumer_id: params.consumerId,
        p_address_id: params.addressId,
        p_delivery_slot_id: params.deliverySlotId,
        p_payment_method: params.paymentMethod,
        p_notes: params.notes || null,
        p_items: params.items.map((it) => ({
          product_id: it.productId,
          quantity: it.quantity,
        })),
      });

      if (error) throw new Error(error.message);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('farm2home:order_placed', { detail: { orderId: data.order_id } })
        );
      }
      return {
        orderId: data.order_id,
        orderNumber: data.order_number,
        totalAmount: data.total_amount,
      };
    }

    // Demo Mode: Local transactional order logic
    const slot = demoDb.deliverySlots.find((s) => s.id === params.deliverySlotId);
    if (!slot) throw new Error('Selected delivery slot not found');
    const bookedInSlot = demoDb.orders.filter(
      (o) => o.delivery_slot_id === slot.id && !['cancelled', 'rejected'].includes(o.status)
    ).length;
    if (bookedInSlot >= slot.capacity) {
      throw new Error('This delivery slot has reached maximum capacity. Please pick another.');
    }

    // Stock check
    let subtotal = 0;
    const validatedItems: { product: Product; quantity: number }[] = [];

    for (const item of params.items) {
      const prod = demoDb.products.find((p) => p.id === item.productId);
      if (!prod || !prod.is_active) {
        throw new Error(`Product ${item.productId} is unavailable.`);
      }
      if (prod.available_quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for "${prod.name}". Available: ${prod.available_quantity}, requested: ${item.quantity}`
        );
      }
      subtotal += prod.price * item.quantity;
      validatedItems.push({ product: prod, quantity: item.quantity });
    }

    const deliveryFee = 40;
    const totalAmount = subtotal + deliveryFee;
    const orderId = 'ord-' + Date.now();
    const orderNumber = `F2H-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const newOrder: Order = {
      id: orderId,
      consumer_id: params.consumerId,
      address_id: params.addressId,
      delivery_slot_id: params.deliverySlotId,
      order_number: orderNumber,
      status: 'pending',
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      payment_method: params.paymentMethod,
      payment_status: 'pending',
      notes: params.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Decrement stock and create line items
    for (const val of validatedItems) {
      val.product.available_quantity -= val.quantity;
      const orderItem: OrderItem = {
        id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        order_id: orderId,
        product_id: val.product.id,
        farmer_id: val.product.farmer_id,
        product_name_snapshot: val.product.name,
        unit_price: val.product.price,
        quantity: val.quantity,
        line_total: val.product.price * val.quantity,
        farmer_fulfillment_status: 'pending',
        created_at: new Date().toISOString(),
      };
      demoDb.orderItems.push(orderItem);
    }

    demoDb.orders.unshift(newOrder);
    demoDb.persist();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('farm2home:order_placed', { detail: { orderId } })
      );
    }

    return {
      orderId,
      orderNumber,
      totalAmount,
    };
  },

  // CANCEL ORDER WITH STOCK RESTORATION
  async cancelOrder(orderId: string, userId: string): Promise<void> {
    if (isSupabaseConfigured && supabase && isUUID(orderId) && isUUID(userId)) {
      const { error } = await supabase.rpc('cancel_order_restore_stock', {
        p_order_id: orderId,
        p_user_id: userId,
      });
      if (error) throw new Error(error.message);
      return;
    }

    const order = demoDb.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');
    if (!['pending', 'accepted'].includes(order.status)) {
      throw new Error(`Cannot cancel order in status "${order.status}". Harvest is already being prepared.`);
    }

    order.status = 'cancelled';
    order.updated_at = new Date().toISOString();

    // Restore stock
    const items = demoDb.orderItems.filter((i) => i.order_id === orderId);
    for (const item of items) {
      const prod = demoDb.products.find((p) => p.id === item.product_id);
      if (prod) {
        prod.available_quantity += item.quantity;
      }
    }

    demoDb.persist();
  },

  // ORDER STATUS PROGRESSION
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    if (isSupabaseConfigured && supabase && isUUID(orderId)) {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (error) throw new Error(error.message);
      return;
    }

    const order = demoDb.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');
    order.status = status;
    order.updated_at = new Date().toISOString();
    if (status === 'delivered') {
      order.payment_status = 'completed';
    }
    demoDb.persist();
  },

  async updateFarmerItemStatus(
    orderItemId: string,
    status: 'pending' | 'accepted' | 'rejected' | 'preparing' | 'ready'
  ): Promise<void> {
    if (isSupabaseConfigured && supabase && isUUID(orderItemId)) {
      const { error } = await supabase
        .from('order_items')
        .update({ farmer_fulfillment_status: status })
        .eq('id', orderItemId);
      if (error) throw new Error(error.message);
      return;
    }

    const item = demoDb.orderItems.find((i) => i.id === orderItemId);
    if (!item) throw new Error('Order item not found');
    item.farmer_fulfillment_status = status;

    // Check sibling items in same order; if all are ready, update master order to ready_for_pickup
    const siblings = demoDb.orderItems.filter((i) => i.order_id === item.order_id);
    const allReady = siblings.every((s) => s.farmer_fulfillment_status === 'ready');
    const order = demoDb.orders.find((o) => o.id === item.order_id);
    if (order && allReady && order.status !== 'ready_for_pickup' && order.status !== 'delivered') {
      order.status = 'ready_for_pickup';
    } else if (order && status === 'preparing' && order.status === 'pending') {
      order.status = 'preparing';
    } else if (order && status === 'accepted' && order.status === 'pending') {
      order.status = 'accepted';
    }

    demoDb.persist();
  },

  // ORDERS FETCHING
  async getOrdersForConsumer(consumerId: string): Promise<Order[]> {
    let orders: Order[] = [];
    if (isSupabaseConfigured && supabase && isUUID(consumerId)) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, address:addresses(*), delivery_slot:delivery_slots(*), items:order_items(*)')
        .eq('consumer_id', consumerId)
        .order('created_at', { ascending: false });
      if (!error && data) orders = data as Order[];
    }

    if (orders.length === 0) {
      orders = demoDb.orders
        .filter((o) => o.consumer_id === consumerId)
        .map((o) => ({
          ...o,
          address: demoDb.addresses.find((a) => a.id === o.address_id),
          delivery_slot: demoDb.deliverySlots.find((s) => s.id === o.delivery_slot_id),
          items: demoDb.orderItems
            .filter((i) => i.order_id === o.id)
            .map((i) => ({
              ...i,
              product: demoDb.products.find((p) => p.id === i.product_id),
              farmer: demoDb.farmers.find((f) => f.id === i.farmer_id),
            })),
        }))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return orders;
  },

  async getOrdersForFarmer(farmerId: string): Promise<{ order: Order; item: OrderItem }[]> {
    const relevantItems = demoDb.orderItems.filter((it) => it.farmer_id === farmerId);
    const results: { order: Order; item: OrderItem }[] = [];

    for (const item of relevantItems) {
      const order = demoDb.orders.find((o) => o.id === item.order_id);
      if (order) {
        results.push({
          order: {
            ...order,
            address: demoDb.addresses.find((a) => a.id === order.address_id),
            delivery_slot: demoDb.deliverySlots.find((s) => s.id === order.delivery_slot_id),
          },
          item: {
            ...item,
            product: demoDb.products.find((p) => p.id === item.product_id),
          },
        });
      }
    }

    return results.sort((a, b) => new Date(b.order.created_at).getTime() - new Date(a.order.created_at).getTime());
  },

  async getAllOrdersAdmin(): Promise<Order[]> {
    return demoDb.orders
      .map((o) => ({
        ...o,
        address: demoDb.addresses.find((a) => a.id === o.address_id),
        delivery_slot: demoDb.deliverySlots.find((s) => s.id === o.delivery_slot_id),
        items: demoDb.orderItems
          .filter((i) => i.order_id === o.id)
          .map((i) => ({
            ...i,
            product: demoDb.products.find((p) => p.id === i.product_id),
            farmer: demoDb.farmers.find((f) => f.id === i.farmer_id),
          })),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // REVIEWS
  async getReviewsForProduct(productId: string): Promise<Review[]> {
    return demoDb.reviews.filter((r) => r.product_id === productId);
  },

  async createReview(reviewData: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('reviews').insert(reviewData).select().single();
      if (error) throw new Error(error.message);
      return data as Review;
    }

    const newRev: Review = {
      ...reviewData,
      id: 'rev-' + Date.now(),
      created_at: new Date().toISOString(),
      consumer_name: 'Verified Consumer',
    };
    demoDb.reviews.unshift(newRev);
    demoDb.persist();
    return newRev;
  },

  // ADMIN METRICS
  async getAdminStats() {
    const totalFarmers = demoDb.farmers.length;
    const totalConsumers = demoDb.profiles.filter((p) => p.role === 'consumer').length;
    const totalProducts = demoDb.products.length;
    const totalOrders = demoDb.orders.length;
    const pendingOrders = demoDb.orders.filter((o) => ['pending', 'accepted', 'preparing'].includes(o.status)).length;
    const completedOrders = demoDb.orders.filter((o) => o.status === 'delivered').length;
    const totalRevenue = demoDb.orders
      .filter((o) => o.status !== 'cancelled' && o.status !== 'rejected')
      .reduce((sum, o) => sum + o.total_amount, 0);

    return {
      totalFarmers,
      totalConsumers,
      totalProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
    };
  },
};
