export type UserRole = 'consumer' | 'farmer' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface FarmerProfile {
  id: string;
  user_id: string;
  farm_name: string;
  description: string;
  locality: string; // e.g. 'Uttan', 'Dongri', 'Morva', 'Rai', 'Bhayandar West'
  address: string;
  latitude: number;
  longitude: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at?: string;
  user?: Profile;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  farmer_id: string;
  category_id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  unit: string; // 'kg', '500g', 'bunch', 'piece'
  available_quantity: number;
  harvest_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  farmer?: FarmerProfile;
  category?: Category;
}

export interface Address {
  id: string;
  consumer_id: string;
  address_label: string; // 'Home', 'Office', 'Parents'
  recipient_name: string;
  phone: string;
  address_line: string;
  locality: string;
  city: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  created_at?: string;
}

export interface DeliverySlot {
  id: string;
  delivery_date: string;
  start_time: string;
  end_time: string;
  locality: string;
  capacity: number;
  is_active: boolean;
  remaining_capacity?: number;
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'rejected';

export type PaymentMethod = 'cod' | 'upi';
export type PaymentStatus = 'pending' | 'completed' | 'refunded';

export interface Order {
  id: string;
  consumer_id: string;
  address_id: string;
  delivery_slot_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  address?: Address;
  delivery_slot?: DeliverySlot;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  farmer_id: string;
  product_name_snapshot: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  farmer_fulfillment_status: 'pending' | 'accepted' | 'rejected' | 'preparing' | 'ready';
  created_at: string;
  product?: Product;
  farmer?: FarmerProfile;
}

export type DeliveryStatus =
  | 'scheduled'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'failed';

export interface Delivery {
  id: string;
  order_id: string;
  delivery_slot_id: string;
  delivery_agent_id?: string;
  status: DeliveryStatus;
  assigned_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
  delivery_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  order_item_id: string;
  consumer_id: string;
  product_id: string;
  rating: number; // 1 to 5
  comment?: string;
  created_at: string;
  consumer_name?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
