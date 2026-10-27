import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Package,
  Clock,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Calendar,
  Save,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, demoDb } from '../services/api';
import { Product, Order, OrderItem, Category, FarmerProfile } from '../types';

export const FarmerDashboard: React.FC = () => {
  const { user, farmerProfile, refreshFarmerProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'schedule' | 'profile'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [farmerOrders, setFarmerOrders] = useState<{ order: Order; item: OrderItem }[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // New/Edit Product form state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(30);
  const [prodUnit, setProdUnit] = useState('500g');
  const [prodStock, setProdStock] = useState<number>(20);
  const [prodHarvestDate, setProdHarvestDate] = useState(new Date().toISOString().slice(0, 10));
  const [prodDesc, setProdDesc] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');

  // Profile form state
  const [farmName, setFarmName] = useState(farmerProfile?.farm_name || '');
  const [farmLocality, setFarmLocality] = useState(farmerProfile?.locality || 'Uttan');
  const [farmAddress, setFarmAddress] = useState(farmerProfile?.address || '');
  const [farmDesc, setFarmDesc] = useState(farmerProfile?.description || '');

  useEffect(() => {
    loadFarmerData();
  }, [farmerProfile]);

  const loadFarmerData = async () => {
    if (!farmerProfile) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [prods, ords, cats] = await Promise.all([
        api.getProducts({ farmerId: farmerProfile.id }),
        api.getOrdersForFarmer(farmerProfile.id),
        api.getCategories(),
      ]);
      setProducts(prods);
      setFarmerOrders(ords);
      setCategories(cats);
      if (cats.length > 0) setProdCategory(cats[0].id);

      setFarmName(farmerProfile.farm_name);
      setFarmLocality(farmerProfile.locality);
      setFarmAddress(farmerProfile.address);
      setFarmDesc(farmerProfile.description);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProdName('');
    setProdPrice(35);
    setProdUnit('500g');
    setProdStock(25);
    setProdHarvestDate(new Date().toISOString().slice(0, 10));
    setProdDesc('');
    setProdImageUrl('https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=600&q=80');
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdName(prod.name);
    setProdCategory(prod.category_id);
    setProdPrice(prod.price);
    setProdUnit(prod.unit);
    setProdStock(prod.available_quantity);
    setProdHarvestDate(prod.harvest_date);
    setProdDesc(prod.description);
    setProdImageUrl(prod.image_url);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerProfile) return;

    try {
      if (editingProductId) {
        await api.updateProduct(editingProductId, {
          name: prodName,
          category_id: prodCategory,
          price: Number(prodPrice),
          unit: prodUnit,
          available_quantity: Number(prodStock),
          harvest_date: prodHarvestDate,
          description: prodDesc,
          image_url: prodImageUrl,
        });
        setMessage('Product updated successfully.');
      } else {
        await api.createProduct({
          farmer_id: farmerProfile.id,
          category_id: prodCategory,
          name: prodName,
          price: Number(prodPrice),
          unit: prodUnit,
          available_quantity: Number(prodStock),
          harvest_date: prodHarvestDate,
          description: prodDesc,
          image_url: prodImageUrl,
          is_active: true,
        });
        setMessage('New harvest product listed successfully.');
      }
      setShowProductModal(false);
      loadFarmerData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleToggleProductActive = async (id: string, currentActive: boolean) => {
    try {
      await api.toggleProductActive(id, !currentActive);
      loadFarmerData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateItemStatus = async (
    orderItemId: string,
    newStatus: 'pending' | 'accepted' | 'rejected' | 'preparing' | 'ready'
  ) => {
    try {
      await api.updateFarmerItemStatus(orderItemId, newStatus);
      setMessage(`Fulfillment status updated to: ${newStatus}`);
      loadFarmerData();
      setTimeout(() => setMessage(null), 2500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerProfile) return;
    try {
      await api.updateFarmerProfile(farmerProfile.id, {
        farm_name: farmName,
        locality: farmLocality,
        address: farmAddress,
        description: farmDesc,
      });
      await refreshFarmerProfile();
      setMessage('Farmer profile updated successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!farmerProfile) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <Sprout className="w-12 h-12 text-farm-700 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">No Farmer Profile Linked</h2>
        <p className="text-xs text-slate-500">
          You are currently logged in as a consumer or unassociated account. Please switch to a Farmer account from the top right role switcher.
        </p>
      </div>
    );
  }

  // Calculate Farmer Metrics
  const totalSales = farmerOrders
    .filter((o) => o.item.farmer_fulfillment_status !== 'rejected')
    .reduce((sum, o) => sum + o.item.line_total, 0);

  const pendingCount = farmerOrders.filter((o) =>
    ['pending', 'accepted', 'preparing'].includes(o.item.farmer_fulfillment_status)
  ).length;

  const completedCount = farmerOrders.filter((o) => o.item.farmer_fulfillment_status === 'ready').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-farm-900 via-farm-800 to-farm-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-bold">
              Cultivator Portal
            </span>
            <span className="text-xs text-farm-200">📍 {farmerProfile.locality}, Mira Bhayandar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">{farmerProfile.farm_name}</h1>
          <p className="text-xs text-farm-200 mt-0.5">
            Managed by {user?.full_name} • Phone: {user?.phone}
          </p>
        </div>

        <button
          onClick={handleOpenAddProduct}
          className="px-4 py-2.5 rounded-xl bg-white text-farm-900 hover:bg-emerald-50 font-bold text-xs flex items-center gap-1.5 shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>List Today's Harvest</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-t-xl transition ${
            activeTab === 'overview'
              ? 'border-b-2 border-farm-800 text-farm-900 bg-white'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-t-xl transition flex items-center gap-1.5 ${
            activeTab === 'products'
              ? 'border-b-2 border-farm-800 text-farm-900 bg-white'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Produce Listings</span>
          <span className="bg-farm-100 text-farm-800 px-1.5 py-0.2 rounded-full text-[10px]">
            {products.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-t-xl transition flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'border-b-2 border-farm-800 text-farm-900 bg-white'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Incoming Orders</span>
          {pendingCount > 0 && (
            <span className="bg-earth-500 text-white px-1.5 py-0.2 rounded-full text-[10px] animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-t-xl transition ${
            activeTab === 'schedule'
              ? 'border-b-2 border-farm-800 text-farm-900 bg-white'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Delivery Schedule
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-t-xl transition ${
            activeTab === 'profile'
              ? 'border-b-2 border-farm-800 text-farm-900 bg-white'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Farm Profile
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <p className="text-xs text-slate-500 font-medium">Realized Farm Earnings</p>
              <p className="text-2xl font-black text-slate-900 mt-1">₹{totalSales.toFixed(2)}</p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-1">100% direct, zero mandi cuts</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <p className="text-xs text-slate-500 font-medium">Active Harvest Listings</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {products.filter((p) => p.is_active).length}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Out of {products.length} total crops</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <p className="text-xs text-slate-500 font-medium">Pending Harvest Tasks</p>
              <p className="text-2xl font-black text-earth-600 mt-1">{pendingCount}</p>
              <p className="text-[10px] text-slate-400 mt-1">Awaiting packing or ready handoff</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <p className="text-xs text-slate-500 font-medium">Ready for Pickup</p>
              <p className="text-2xl font-black text-farm-800 mt-1">{completedCount}</p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-1">Packed in eco-bags</p>
            </div>
          </div>

          {/* Recent Orders quick preview */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Recent Harvest Orders to Fulfill</h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs text-farm-800 font-semibold hover:underline"
              >
                View all orders →
              </button>
            </div>

            {farmerOrders.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No customer orders placed yet for your farm.</p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {farmerOrders.slice(0, 4).map(({ order, item }) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-900">{item.product_name_snapshot}</p>
                      <p className="text-slate-500 text-[11px]">
                        Order #{order.order_number} • Qty: {item.quantity} (₹{item.line_total})
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        item.farmer_fulfillment_status === 'ready'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.farmer_fulfillment_status === 'preparing'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.farmer_fulfillment_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS INVENTORY */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Crop Inventory & Available Quantities</h3>
              <p className="text-xs text-slate-500">
                Update stock before morning harvest to ensure accurate consumer ordering.
              </p>
            </div>
            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2 rounded-xl bg-farm-800 hover:bg-farm-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs p-4 flex flex-col justify-between space-y-3"
              >
                <div className="flex gap-3">
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-farm-700 uppercase">
                        {prod.category?.name || 'Produce'}
                      </span>
                      <button
                        onClick={() => handleToggleProductActive(prod.id, prod.is_active)}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          prod.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {prod.is_active ? 'Active' : 'Deactivated'}
                      </button>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm truncate mt-0.5">{prod.name}</h4>
                    <p className="text-xs font-black text-slate-900 mt-1">
                      ₹{prod.price} <span className="text-[10px] text-slate-500 font-normal">/ {prod.unit}</span>
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Stock: <strong>{prod.available_quantity} {prod.unit}</strong>
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">
                    Harvest: {new Date(prod.harvest_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                  <button
                    onClick={() => handleOpenEditProduct(prod)}
                    className="p-1.5 text-slate-600 hover:text-farm-800 hover:bg-slate-100 rounded-lg transition"
                    title="Edit Product"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INCOMING ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Customer Harvest Orders</h3>

          {farmerOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500">
              <p className="text-xs">No orders received yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {farmerOrders.map(({ order, item }) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-farm-800 bg-farm-100 px-2 py-0.5 rounded-full">
                        Order #{order.order_number}
                      </span>
                      <h4 className="text-base font-black text-slate-900 mt-1">
                        {item.product_name_snapshot}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Qty: <strong>{item.quantity}</strong> • Line Total: <strong>₹{item.line_total}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          item.farmer_fulfillment_status === 'ready'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.farmer_fulfillment_status === 'preparing'
                            ? 'bg-amber-100 text-amber-800'
                            : item.farmer_fulfillment_status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        Status: {item.farmer_fulfillment_status}
                      </span>
                    </div>
                  </div>

                  {/* Destination Info & Slot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                    <div>
                      <p className="font-bold text-slate-800">Delivery Destination</p>
                      <p className="text-slate-600 mt-0.5">{order.address?.recipient_name} ({order.address?.locality})</p>
                      <p className="text-slate-400 text-[11px]">{order.address?.address_line}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Delivery Time Slot</p>
                      <p className="text-slate-600 mt-0.5">
                        {order.delivery_slot?.delivery_date} ({order.delivery_slot?.start_time.slice(0, 5)} - {order.delivery_slot?.end_time.slice(0, 5)} IST)
                      </p>
                      <p className="text-slate-400 text-[11px]">Payment: {order.payment_method.toUpperCase()}</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    {item.farmer_fulfillment_status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateItemStatus(item.id, 'accepted')}
                          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" /> Accept Harvest Request
                        </button>
                        <button
                          onClick={() => handleUpdateItemStatus(item.id, 'rejected')}
                          className="px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 font-bold transition flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" /> Reject (Out of Stock)
                        </button>
                      </>
                    )}

                    {item.farmer_fulfillment_status === 'accepted' && (
                      <button
                        onClick={() => handleUpdateItemStatus(item.id, 'preparing')}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition"
                      >
                        Start Picking & Washing (Mark Preparing)
                      </button>
                    )}

                    {item.farmer_fulfillment_status === 'preparing' && (
                      <button
                        onClick={() => handleUpdateItemStatus(item.id, 'ready')}
                        className="px-4 py-2 rounded-xl bg-farm-800 hover:bg-farm-900 text-white font-bold transition flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" /> Packed & Ready for Vehicle Pickup
                      </button>
                    )}

                    {item.farmer_fulfillment_status === 'ready' && (
                      <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                        ✓ Produce packed in designated crate. Awaiting delivery runner.
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DELIVERY SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Upcoming Delivery Batches & Run Windows</h3>
          <p className="text-xs text-slate-500">
            Coordinated pickup times arranged for Mira Bhayandar coastal logistics.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-farm-900 text-sm">Morning Harvest Batch (07:00 - 10:00 AM)</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Active Run
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Dispatches to: <strong>Mira Road East, Shanti Nagar, Beverly Park</strong>
              </p>
              <p className="text-[11px] text-slate-400">
                Carrier vehicle arrives at farm gate at 06:45 AM. Ensure leafy bundles are shaded.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-farm-900 text-sm">Evening Batch (04:30 - 07:30 PM)</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                  Upcoming
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Dispatches to: <strong>Bhayandar West (Maxus / 150ft Rd), Navghar</strong>
              </p>
              <p className="text-[11px] text-slate-400">
                Carrier vehicle arrives at farm gate at 04:00 PM.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: FARM PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 max-w-2xl">
          <h3 className="text-base font-bold text-slate-900">Edit Farm & Cultivator Profile</h3>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-700">Farm Name</label>
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Locality</label>
              <select
                value={farmLocality}
                onChange={(e) => setFarmLocality(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Uttan">Uttan Coastal Belts</option>
                <option value="Dongri">Dongri Hillside</option>
                <option value="Rai & Morva">Rai & Morva</option>
                <option value="Bhayandar West">Bhayandar West</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Verification Status</label>
              <input
                type="text"
                value="Verified Cultivator"
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-700">Detailed Farm Address / Survey No.</label>
            <input
              type="text"
              value={farmAddress}
              onChange={(e) => setFarmAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              required
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-700">Farm Bio & Crop Specialization</label>
            <textarea
              rows={3}
              value={farmDesc}
              onChange={(e) => setFarmDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              required
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-farm-800 hover:bg-farm-900 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition"
          >
            <Save className="w-4 h-4" /> Save Profile Details
          </button>
        </form>
      )}

      {/* Add/Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingProductId ? 'Edit Produce Listing' : 'List New Fresh Harvest'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Produce Name</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Desi Organic Palak (Spinach)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Harvest Date</label>
                  <input
                    type="date"
                    value={prodHarvestDate}
                    onChange={(e) => setProdHarvestDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    min="1"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit</label>
                  <input
                    type="text"
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    placeholder="kg, bunch, 500g"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Available Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Photo Image URL</label>
                <input
                  type="url"
                  value={prodImageUrl}
                  onChange={(e) => setProdImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Describe freshness, aroma, or organic methods used"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-farm-800 text-white font-bold hover:bg-farm-900"
                >
                  {editingProductId ? 'Update Listing' : 'Publish Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
