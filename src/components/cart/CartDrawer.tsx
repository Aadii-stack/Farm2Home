import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    total,
  } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 pointer-events-none">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col pointer-events-auto"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-farm-50/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-farm-800 text-white flex items-center justify-center shadow-xs">
                    <ShoppingBag className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Your Harvest Basket</h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {cart.length} {cart.length === 1 ? 'produce item' : 'produce items'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-95"
                  aria-label="Close harvest basket"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

          {/* Cart Items List */}
          <div data-lenis-prevent className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="w-16 h-16 rounded-2xl bg-farm-50 flex items-center justify-center text-farm-600 mb-4 border border-farm-100">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Your basket is empty</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Discover crisp leafy greens, fresh coastal coconuts and seasonal vegetables direct from Uttan & Morva farmers.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 px-6 py-3 rounded-xl bg-farm-800 hover:bg-farm-900 text-white text-xs font-bold transition shadow-sm active:scale-95 min-h-[44px] flex items-center justify-center"
                >
                  Explore Marketplace
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center text-xs text-slate-500 pb-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-700">Direct Farm Harvests</span>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 min-h-[44px] px-2 flex items-center gap-1.5 font-semibold transition active:scale-95"
                    aria-label="Clear all items from basket"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                </div>

                {cart.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex gap-3.5 items-center hover:border-farm-200 transition"
                  >
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{product.name}</h4>
                      <p className="text-[11px] text-farm-800 font-medium truncate mt-0.5">
                        {product.farmer?.farm_name || 'Local Farm'}
                      </p>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-sm font-extrabold text-slate-950">
                          ₹{product.price * quantity}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          (₹{product.price}/{product.unit})
                        </span>
                      </div>
                    </div>

                    {/* Quantity controls & Delete with accessible 44x44px touch targets */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden shadow-xs">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center text-slate-700 hover:bg-slate-200/70 transition active:scale-90"
                          aria-label={`Decrease quantity of ${product.name}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-900 select-none">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.available_quantity}
                          className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center text-slate-700 hover:bg-slate-200/70 disabled:opacity-30 transition active:scale-90"
                          aria-label={`Increase quantity of ${product.name}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="min-w-[40px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-red-600 transition active:scale-90 rounded-lg p-1"
                        aria-label={`Remove ${product.name} from basket`}
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer & Checkout with Thumb-Friendly Safe Area Spacing */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-white space-y-4 shadow-lg pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Harvest Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Direct Farm-to-Door Delivery</span>
                  <span className="font-semibold text-slate-900">₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                  <span>Payable at Door</span>
                  <span className="text-lg font-black text-farm-900">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-emerald-950 border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Harvested same-day in Uttan/Morva. No mandi holding delays.</span>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-farm-800 hover:bg-farm-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-farm-900/15 transition active:scale-[0.98] group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )}
</AnimatePresence>
  );
};
