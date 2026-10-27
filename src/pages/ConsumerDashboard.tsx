import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCcw,
  Star,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api, isUUID } from '../services/api';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Order, Address, OrderStatus, Product, OrderItem } from '../types';
import { DeliveryMap } from '../components/common/DeliveryMap';

export const ConsumerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Review modal state
  const [reviewItem, setReviewItem] = useState<{
    orderItemId: string;
    productId: string;
    productName: string;
  } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadConsumerData = async (focusOrderId?: string, silent?: boolean) => {
    if (!user) return;
    if (!silent) setIsLoading(true);
    try {
      const [ords, addrs] = await Promise.all([
        api.getOrdersForConsumer(user.id),
        api.getAddresses(user.id),
      ]);
      setOrders(ords);
      setAddresses(addrs);

      if (focusOrderId) {
        const found = ords.find((o) => o.id === focusOrderId);
        if (found) setSelectedOrder(found);
        else if (ords.length > 0) setSelectedOrder(ords[0]);
      } else {
        setSelectedOrder((prev) => {
          if (!prev) return ords.length > 0 ? ords[0] : null;
          const matched = ords.find((o) => o.id === prev.id);
          return matched || (ords.length > 0 ? ords[0] : null);
        });
      }
    } catch (err: any) {
      console.error('Error loading consumer data:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadConsumerData();

    // 1. Instant event when an order is placed locally in the app
    const onOrderPlaced = (e: any) => {
      const placedOrderId = e.detail?.orderId;
      loadConsumerData(placedOrderId);
    };
    window.addEventListener('farm2home:order_placed', onOrderPlaced);

    // 2. Real-time background sync interval (3.5s) to reflect live harvest status without refresh
    const syncTimer = setInterval(() => {
      loadConsumerData(undefined, true);
    }, 3500);

    // 3. Supabase Realtime channel if valid UUID
    let channel: any = null;
    if (isSupabaseConfigured && supabase && isUUID(user.id)) {
      channel = supabase
        .channel(`consumer-orders-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `consumer_id=eq.${user.id}`,
          },
          () => {
            loadConsumerData(undefined, true);
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener('farm2home:order_placed', onOrderPlaced);
      clearInterval(syncTimer);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id]);

  const handleCancelOrder = async (orderId: string) => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to cancel this order? Any reserved farm stock will be restored.')) {
      return;
    }

    try {
      await api.cancelOrder(orderId, user.id);
      setStatusMessage('Order cancelled and reserved stock restored successfully.');
      await loadConsumerData();
      if (selectedOrder?.id === orderId) {
        const updated = await api.getOrdersForConsumer(user.id);
        setSelectedOrder(updated.find((o: Order) => o.id === orderId) || null);
      }
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order');
    }
  };

  const handleReorder = async (order: Order) => {
    if (!order.items || order.items.length === 0) return;
    let addedCount = 0;
    for (const it of order.items) {
      if (it.product && it.product.is_active && it.product.available_quantity > 0) {
        addToCart(it.product, it.quantity);
        addedCount++;
      }
    }
    if (addedCount > 0) {
      setIsCartOpen(true);
      setStatusMessage(`Added ${addedCount} items to your harvest basket!`);
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      alert('Selected items are currently out of season or stock.');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewItem || !user) return;
    setIsSubmittingReview(true);
    try {
      await api.createReview({
        order_item_id: reviewItem.orderItemId,
        consumer_id: user.id,
        product_id: reviewItem.productId,
        rating: Number(rating),
        comment: comment.trim(),
      });
      setStatusMessage('Thank you for rating your farm produce!');
      setReviewItem(null);
      setComment('');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const statusSteps: OrderStatus[] = [
    'pending',
    'accepted',
    'preparing',
    'ready_for_pickup',
    'out_for_delivery',
    'delivered',
  ];

  const getStatusIndex = (st: OrderStatus) => {
    return statusSteps.indexOf(st);
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <p className="text-xs text-slate-500">Please sign in as a consumer to view your orders.</p>
      </div>
    );
  }

  // Determine points for Leaflet map if selected order has farm and delivery coords
  const primaryItem = selectedOrder?.items?.[0];
  const farmPoint = primaryItem?.farmer
    ? {
        lat: primaryItem.farmer.latitude,
        lng: primaryItem.farmer.longitude,
        name: primaryItem.farmer.farm_name,
        locality: primaryItem.farmer.locality,
      }
    : {
        lat: 19.2818,
        lng: 72.7832,
        name: 'Uttan Coastal Agro',
        locality: 'Uttan',
      };

  const deliveryPoint = selectedOrder?.address
    ? {
        lat: selectedOrder.address.latitude || 19.2845,
        lng: selectedOrder.address.longitude || 72.8682,
        address: selectedOrder.address.address_line,
        recipient: selectedOrder.address.recipient_name,
      }
    : {
        lat: 19.2845,
        lng: 72.8682,
        address: 'Mira Road East',
        recipient: user.full_name,
      };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-farm-700 bg-farm-100 px-3 py-1 rounded-full">
            Consumer Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Welcome back, {user.full_name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track active harvest orders, coordinate doorstep deliveries, and manage saved addresses.
          </p>
        </div>

        <div className="text-xs bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-farm-800 text-white flex items-center justify-center font-bold">
            🛒
          </div>
          <div>
            <p className="text-slate-400 font-semibold uppercase text-[10px]">Registered Phone</p>
            <p className="font-bold text-slate-800">{user.phone}</p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Order Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Orders list */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
            <span>Your Order History ({orders.length})</span>
          </h3>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">You haven't placed any orders yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className={`p-4 rounded-2xl border cursor-pointer transition text-xs space-y-2 ${
                    selectedOrder?.id === ord.id
                      ? 'border-farm-800 bg-farm-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">#{ord.order_number}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ord.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'cancelled' || ord.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-slate-500 text-[11px]">
                    {new Date(ord.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-600">{ord.items?.length || 1} produce lines</span>
                    <span className="font-extrabold text-slate-900">₹{ord.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Saved Addresses quick card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 mt-6">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Saved Delivery Locations
            </h4>
            <div className="space-y-2 text-xs">
              {addresses.map((addr) => (
                <div key={addr.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-slate-800 text-[11px]">
                    <span>{addr.address_label}</span>
                    {addr.is_default && (
                      <span className="text-[10px] text-farm-800 bg-farm-100 px-1.5 rounded">Default</span>
                    )}
                  </div>
                  <p className="text-slate-600 text-[11px] truncate">{addr.address_line}</p>
                  <p className="text-slate-400 text-[10px]">
                    {addr.locality}, {addr.city} - {addr.postal_code}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Selected Order Details & Live Map Tracker */}
        <div className="lg:col-span-7 space-y-6">
          {selectedOrder ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-farm-800 bg-farm-100 px-2 py-0.5 rounded-full uppercase">
                    Order Details
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    #{selectedOrder.order_number}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Payment Method: <strong>{selectedOrder.payment_method.toUpperCase()}</strong> • Status:{' '}
                    <strong>{selectedOrder.payment_status}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {['pending', 'accepted'].includes(selectedOrder.status) && (
                    <button
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs border border-red-200 transition"
                    >
                      Cancel Order
                    </button>
                  )}
                  <button
                    onClick={() => handleReorder(selectedOrder)}
                    className="px-3.5 py-1.5 rounded-xl bg-farm-800 hover:bg-farm-900 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reorder Basket
                  </button>
                </div>
              </div>

              {/* Status Progress Timeline */}
              {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'rejected' ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Harvest & Delivery Progress
                  </h4>
                  <div className="relative flex justify-between items-center text-[11px] font-semibold text-slate-600">
                    {/* Connecting bar */}
                    <div className="absolute top-3 left-4 right-4 h-1 bg-slate-200 -z-0">
                      <div
                        className="h-full bg-farm-700 transition-all duration-500"
                        style={{
                          width: `${(Math.max(0, getStatusIndex(selectedOrder.status)) / (statusSteps.length - 1)) * 100}%`,
                        }}
                      />
                    </div>

                    {statusSteps.map((st, idx) => {
                      const isCompleted = getStatusIndex(selectedOrder.status) >= idx;
                      const isCurrent = selectedOrder.status === st;

                      return (
                        <div key={st} className="flex flex-col items-center text-center relative z-10 w-16">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                              isCompleted
                                ? 'bg-farm-800 text-white'
                                : 'bg-slate-200 text-slate-500'
                            } ${isCurrent ? 'ring-4 ring-farm-200 scale-110' : ''}`}
                          >
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <span
                            className={`mt-1.5 capitalize text-[10px] leading-tight ${
                              isCurrent ? 'font-bold text-farm-900' : 'text-slate-400'
                            }`}
                          >
                            {st.replace(/_/g, ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-semibold flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>This order has been {selectedOrder.status}. Any reserved stock has been refunded to inventory.</span>
                </div>
              )}

              {/* Leaflet OpenStreetMap Delivery Route */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-farm-700" />
                    <span>Harvest Origin to Doorstep Waypoint</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Centering Mira Bhayandar, MH</span>
                </div>
                <DeliveryMap
                  farmPoint={farmPoint}
                  deliveryPoint={deliveryPoint}
                  height="260px"
                  zoom={12}
                />
              </div>

              {/* Items Breakdown & Review Triggers */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Ordered Fresh Items
                </h4>
                <div className="divide-y divide-slate-100 text-xs">
                  {selectedOrder.items?.map((it: OrderItem) => (
                    <div key={it.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {it.product?.image_url && (
                          <img
                            src={it.product.image_url}
                            alt={it.product_name_snapshot}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                          />
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{it.product_name_snapshot}</p>
                          <p className="text-slate-500 text-[11px]">
                            ₹{it.unit_price} × {it.quantity}
                          </p>
                          <p className="text-[10px] text-farm-700">
                            Fulfillment: {it.farmer_fulfillment_status}
                          </p>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="font-extrabold text-slate-900">₹{it.line_total.toFixed(2)}</span>
                        {selectedOrder.status === 'delivered' && (
                          <div>
                            <button
                              onClick={() =>
                                setReviewItem({
                                  orderItemId: it.id,
                                  productId: it.product_id,
                                  productName: it.product_name_snapshot,
                                })
                              }
                              className="text-[10px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1"
                            >
                              <Star className="w-3 h-3 fill-amber-500" /> Rate Crop
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary total */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Direct Delivery Fee</span>
                  <span>₹{selectedOrder.delivery_fee.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-slate-900 text-sm">
                  <span>Total Billed</span>
                  <span className="text-farm-900">₹{selectedOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
              Select an order to view live timeline and details.
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Rate Harvest Freshness: {reviewItem.productName}
            </h3>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Star Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl transition ${
                        star <= rating ? 'text-amber-500 scale-110' : 'text-slate-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Feedback for Cultivator
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the crispness, taste, or aroma of this local harvest?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewItem(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2 rounded-xl bg-farm-800 text-white font-bold hover:bg-farm-900"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
