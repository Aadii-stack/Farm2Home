import React, { useState, useEffect } from 'react';
import {
  Users,
  Sprout,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, demoDb } from '../services/api';
import { Order, FarmerProfile, Product, DeliverySlot, OrderStatus } from '../types';

export const AdminDashboard: React.FC = () => {
  const { role } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'farmers' | 'products' | 'orders' | 'slots'>('overview');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [st, ords, prods, slots] = await Promise.all([
        api.getAdminStats(),
        api.getAllOrdersAdmin(),
        api.getProducts(),
        api.getDeliverySlots(),
      ]);
      setStats(st);
      setOrders(ords);
      setProducts(prods);
      setDeliverySlots(slots);
      setFarmers([...demoDb.farmers]);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleUpdateFarmerStatus = async (
    farmerId: string,
    status: 'pending' | 'verified' | 'rejected'
  ) => {
    try {
      await api.updateFarmerProfile(farmerId, { verification_status: status });
      setNotification(`Farmer verification updated to: ${status}`);
      loadAdminData();
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleProductStatus = async (productId: string, currentActive: boolean) => {
    try {
      await api.toggleProductActive(productId, !currentActive);
      setNotification(`Product listing visibility toggled.`);
      loadAdminData();
      setTimeout(() => setNotification(null), 2500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setNotification(`Order #${orderId} progressed to: ${newStatus}`);
      loadAdminData();
      setTimeout(() => setNotification(null), 2500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateSlotCapacity = (slotId: string, newCap: number) => {
    const slot = demoDb.deliverySlots.find((s: DeliverySlot) => s.id === slotId);
    if (slot) {
      slot.capacity = Math.max(1, newCap);
      demoDb.persist();
      setDeliverySlots([...demoDb.deliverySlots]);
      setNotification('Delivery slot capacity updated.');
      setTimeout(() => setNotification(null), 2500);
    }
  };

  if (role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-3">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Administrator Access Restricted</h2>
        <p className="text-xs text-slate-500">
          This panel requires administrative privileges. Please switch to the "Admin" role via the top navigation dropdown.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-bold">
            Platform Governance Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">Farm2Home Central Administration</h1>
          <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
            Monitoring Mira Bhayandar agricultural distribution, farmer approvals & order integrity.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-700" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition duration-150 motion-reduce:transition-none ${
            activeTab === 'overview'
              ? 'bg-farm-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          Executive Overview
        </button>
        <button
          onClick={() => setActiveTab('farmers')}
          className={`px-4 py-2 rounded-xl transition duration-150 motion-reduce:transition-none ${
            activeTab === 'farmers'
              ? 'bg-farm-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          Farmer Verification ({farmers.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl transition duration-150 motion-reduce:transition-none ${
            activeTab === 'products'
              ? 'bg-farm-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          Product Moderation ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl transition duration-150 motion-reduce:transition-none ${
            activeTab === 'orders'
              ? 'bg-farm-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          All Orders Oversight ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('slots')}
          className={`px-4 py-2 rounded-xl transition duration-150 motion-reduce:transition-none ${
            activeTab === 'slots'
              ? 'bg-farm-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          Delivery Slot Capacities
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-600 font-medium">Platform Gross Volume</p>
              <p className="text-2xl font-black text-slate-950 mt-1 tabular-nums tracking-tight">₹{stats.totalRevenue.toFixed(2)}</p>
              <p className="text-[10px] text-emerald-800 font-semibold mt-1">Across all completed checkouts</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-600 font-medium">Registered Farmers</p>
              <p className="text-2xl font-black text-farm-900 mt-1 tabular-nums tracking-tight">{stats.totalFarmers}</p>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Uttan, Dongri, Morva, Rai</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-600 font-medium">Registered Consumers</p>
              <p className="text-2xl font-black text-slate-950 mt-1 tabular-nums tracking-tight">{stats.totalConsumers}</p>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Mira Road & Bhayandar</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-600 font-medium">Total Orders Placed</p>
              <p className="text-2xl font-black text-slate-950 mt-1 tabular-nums tracking-tight">{stats.totalOrders}</p>
              <p className="text-[10px] text-emerald-800 font-semibold mt-1">
                {stats.completedOrders} Delivered • {stats.pendingOrders} Active
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FARMERS VERIFICATION */}
      {activeTab === 'farmers' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Registered Local Farmer Cooperatives</h3>
            <span className="text-xs text-slate-600">Only verified farmers are displayed on the public marketplace</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {farmers.map((farmer) => (
              <div key={farmer.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{farmer.farm_name}</h4>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                        farmer.verification_status === 'verified'
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : farmer.verification_status === 'rejected'
                          ? 'bg-red-50 text-red-900 border-red-200'
                          : 'bg-amber-50 text-amber-900 border-amber-200'
                      }`}
                    >
                      {farmer.verification_status === 'verified' ? '✓ Verified' : farmer.verification_status === 'rejected' ? '✕ Rejected' : '⏳ Pending'}
                    </span>
                  </div>
                  <p className="text-slate-700 mt-1">{farmer.description}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5 font-medium">
                    📍 {farmer.address} ({farmer.locality}) • Lat: {farmer.latitude.toFixed(4)}, Lng: {farmer.longitude.toFixed(4)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {farmer.verification_status !== 'verified' && (
                    <button
                      onClick={() => handleUpdateFarmerStatus(farmer.id, 'verified')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition"
                    >
                      Verify Farm
                    </button>
                  )}
                  {farmer.verification_status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateFarmerStatus(farmer.id, 'rejected')}
                      className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 font-bold text-xs transition"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCT MODERATION */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">All Published Crop Listings</h3>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {products.map((prod) => (
              <div key={prod.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900">{prod.name}</h4>
                    <p className="text-slate-600 text-[11px] font-medium">
                      Cultivator: {prod.farmer?.farm_name} • Price: ₹{prod.price} / {prod.unit} • Stock: {prod.available_quantity}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                      prod.is_active
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {prod.is_active ? '● Live' : '○ Hidden'}
                  </span>
                  <button
                    onClick={() => handleToggleProductStatus(prod.id, prod.is_active)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs transition"
                  >
                    {prod.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS OVERSIGHT */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">All Orders & Status Progression</h3>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {orders.map((ord) => (
              <div key={ord.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">#{ord.order_number}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-bold text-farm-900 tabular-nums">₹{ord.total_amount.toFixed(2)}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono uppercase border border-slate-200">
                      {ord.payment_method}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-1 font-medium">
                    Customer: {ord.address?.recipient_name} ({ord.address?.locality}) • Items: {ord.items?.length || 1}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-600 font-medium">Status:</span>
                  <select
                    value={ord.status}
                    onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-300 font-bold text-xs bg-slate-50 text-slate-800 focus:ring-2 focus:ring-farm-600 focus:outline-hidden"
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DELIVERY SLOTS */}
      {activeTab === 'slots' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Delivery Slot Capacity Configuration</h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
              Configure maximum order thresholds per window to prevent delivery route bottlenecks across Mira Bhayandar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {deliverySlots.map((slot) => (
              <div key={slot.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{slot.locality}</span>
                  <span className="font-bold text-farm-900 tabular-nums">
                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                  </span>
                </div>
                <p className="text-slate-600 font-medium">Date: {slot.delivery_date}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <label className="font-semibold text-slate-800">Max Order Capacity:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={slot.capacity}
                    onChange={(e) => handleUpdateSlotCapacity(slot.id, Number(e.target.value))}
                    className="w-20 px-2.5 py-1 rounded-lg border border-slate-300 text-center font-bold text-slate-900 bg-white focus:ring-2 focus:ring-farm-600 focus:outline-hidden"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
