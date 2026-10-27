import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Clock,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { Address, DeliverySlot } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { user } = useAuth();
  const { cart, subtotal, deliveryFee, total, clearCart } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New address form state
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newName, setNewName] = useState(user?.full_name || '');
  const [newPhone, setNewPhone] = useState(user?.phone || '');
  const [newLine, setNewLine] = useState('');
  const [newLocality, setNewLocality] = useState('Mira Road East');
  const [newPostal, setNewPostal] = useState('401107');

  useEffect(() => {
    if (!isOpen || !user) return;
    loadCheckoutData();
  }, [isOpen, user]);

  const loadCheckoutData = async () => {
    try {
      if (!user) return;
      const [addrs, slots] = await Promise.all([
        api.getAddresses(user.id),
        api.getDeliverySlots(),
      ]);

      setAddresses(addrs);
      if (addrs.length > 0) {
        const def = addrs.find((a) => a.is_default) || addrs[0];
        setSelectedAddressId(def.id);
      }

      setDeliverySlots(slots);
      if (slots.length > 0) {
        setSelectedSlotId(slots[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize checkout data');
    }
  };

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const added = await api.createAddress({
        consumer_id: user.id,
        address_label: newLabel,
        recipient_name: newName,
        phone: newPhone,
        address_line: newLine,
        locality: newLocality,
        city: 'Mira Bhayandar',
        postal_code: newPostal,
        latitude: 19.2845 + (Math.random() - 0.5) * 0.02,
        longitude: 72.8682 + (Math.random() - 0.5) * 0.02,
        is_default: addresses.length === 0,
      });

      setAddresses([...addresses, added]);
      setSelectedAddressId(added.id);
      setShowNewAddress(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      setError('Please log in as a consumer to place an order.');
      return;
    }
    if (!selectedAddressId) {
      setError('Please select or add a delivery address.');
      return;
    }
    if (!selectedSlotId) {
      setError('Please select an upcoming delivery slot.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const itemsPayload = cart.map((c) => ({
        productId: c.product.id,
        quantity: c.quantity,
      }));

      const res = await api.placeOrder({
        consumerId: user.id,
        addressId: selectedAddressId,
        deliverySlotId: selectedSlotId,
        paymentMethod,
        notes,
        items: itemsPayload,
      });

      clearCart();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('farm2home:order_placed', { detail: { orderId: res.orderId } })
        );
      }
      onOrderSuccess(res.orderId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to complete order checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 360 }}
            className="relative z-10 bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-100"
          >
            {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-farm-50/50">
          <div>
            <h3 className="text-xl font-bold text-farm-950">Confirm Harvest Order</h3>
            <p className="text-xs text-slate-500">
              Direct from Mira Bhayandar farms • Same-day harvest guarantee
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Address Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-farm-700" />
                <span>1. Delivery Address (Mira Bhayandar)</span>
              </h4>
              {!showNewAddress && (
                <button
                  type="button"
                  onClick={() => setShowNewAddress(true)}
                  className="text-xs font-semibold text-farm-700 hover:text-farm-900 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New
                </button>
              )}
            </div>

            {showNewAddress ? (
              <form
                onSubmit={handleAddNewAddress}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Label</label>
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="Home, Office, etc."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Recipient Name</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+91 98200 00000"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Locality</label>
                    <select
                      value={newLocality}
                      onChange={(e) => setNewLocality(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="Mira Road East">Mira Road East (Shanti Nagar / Beverly)</option>
                      <option value="Bhayandar East">Bhayandar East (Navghar / Indralok)</option>
                      <option value="Bhayandar West">Bhayandar West (Maxus / 150ft Rd)</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs">
                  <label className="font-semibold text-slate-700 block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={newLine}
                    onChange={(e) => setNewLine(e.target.value)}
                    placeholder="Building name, flat number, street"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewAddress(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-farm-800 text-white hover:bg-farm-900"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition flex flex-col justify-between ${
                      selectedAddressId === addr.id
                        ? 'border-farm-700 bg-farm-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded-md bg-farm-100 text-farm-800 text-[10px] uppercase font-bold">
                          {addr.address_label}
                        </span>
                        {addr.recipient_name}
                      </span>
                      <input
                        type="radio"
                        name="address_choice"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="text-farm-700 focus:ring-farm-600"
                      />
                    </div>
                    <p className="text-slate-600 leading-snug">{addr.address_line}</p>
                    <p className="text-slate-400 text-[11px] mt-1">
                      {addr.locality}, {addr.city} - {addr.postal_code}
                    </p>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 2. Delivery Slot Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-farm-700" />
              <span>2. Select Harvest & Delivery Window</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deliverySlots.map((slot) => (
                <label
                  key={slot.id}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition flex flex-col justify-between ${
                    selectedSlotId === slot.id
                      ? 'border-farm-700 bg-farm-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">
                      {new Date(slot.delivery_date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    <input
                      type="radio"
                      name="slot_choice"
                      checked={selectedSlotId === slot.id}
                      onChange={() => setSelectedSlotId(slot.id)}
                      className="text-farm-700 focus:ring-farm-600"
                    />
                  </div>
                  <p className="text-farm-800 font-bold text-sm">
                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)} IST
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{slot.locality}</span>
                    <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {slot.remaining_capacity || slot.capacity} slots left
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-farm-700" />
              <span>3. Payment Method</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-2xl border text-xs cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'cod'
                    ? 'border-farm-700 bg-farm-50/70'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div>
                  <p className="font-bold text-slate-900">💵 Cash on Delivery (COD)</p>
                  <p className="text-slate-500 text-[11px]">Pay upon receiving freshly picked basket</p>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
              </label>

              <label
                className={`p-3.5 rounded-2xl border text-xs cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'upi'
                    ? 'border-farm-700 bg-farm-50/70'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div>
                  <p className="font-bold text-slate-900">📱 UPI on Delivery</p>
                  <p className="text-slate-500 text-[11px]">GPay, PhonePe, Paytm scanner at doorstep</p>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                />
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1 text-xs">
            <label className="font-semibold text-slate-700">Special Instructions / Landmarks</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Leave with building security if unavailable, or landmark near station"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          {/* Bill summary */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Items Total ({cart.length} produce lines)</span>
              <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Farm-to-Door Delivery Charge</span>
              <span className="font-semibold text-slate-900">₹{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Payable Amount</span>
              <span className="text-base text-farm-800">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-4">
          <div className="text-xs">
            <p className="text-slate-500">Payable Amount</p>
            <p className="text-lg font-black text-farm-900">₹{total.toFixed(2)}</p>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting || cart.length === 0}
            className="px-6 py-3.5 rounded-xl bg-farm-800 hover:bg-farm-900 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-farm-900/15 disabled:opacity-50 transition"
          >
            {isSubmitting ? (
              <span>Reserving Stock & Placing Order...</span>
            ) : (
              <>
                <span>Confirm & Place Order</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};
