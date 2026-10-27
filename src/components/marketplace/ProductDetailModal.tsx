import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, CheckCircle2, Star, ShoppingBag, Plus, Minus } from 'lucide-react';
import { Product, Review } from '../../types';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart, cart, updateQuantity } = useCart();
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!product) return;
    setQty(1);
    api.getReviewsForProduct(product.id).then(setReviews).catch(console.error);
  }, [product]);

  if (!product) return null;

  const cartItem = cart.find((item) => item.product.id === product.id);

  const handleAddToCart = () => {
    addToCart(product, qty);
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden shrink-0">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 px-2.5 py-1 rounded-full">
              {product.category?.name || 'Produce'}
            </span>
            <h2 className="text-2xl font-black mt-2 text-white">{product.name}</h2>
            <p className="text-xs text-slate-200 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{product.farmer?.farm_name || 'Local Farm'}, {product.farmer?.locality || 'Mira Bhayandar'}</span>
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* Price & Stock bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-farm-50/80 border border-farm-100">
            <div>
              <p className="text-slate-500 text-[11px]">Direct Cultivator Price</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-farm-900">₹{product.price}</span>
                <span className="text-slate-500 font-semibold">/ {product.unit}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-[11px]">Stock Available</p>
              <span className="inline-block mt-0.5 text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-full">
                {product.available_quantity} {product.unit} remaining
              </span>
            </div>
          </div>

          {/* Harvest & Origin Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-farm-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Harvest Date</p>
                <p className="text-slate-500 text-[11px]">
                  {new Date(product.harvest_date).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Purity Guarantee</p>
                <p className="text-slate-500 text-[11px]">Chemical-free ripening, picked same morning</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">About This Harvest</h4>
            <p className="text-slate-600 leading-relaxed text-xs">{product.description}</p>
          </div>

          {/* Farmer Card */}
          {product.farmer && (
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cultivator Details</p>
                  <h4 className="font-bold text-slate-900 text-sm">{product.farmer.farm_name}</h4>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Verified Local
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">{product.farmer.description}</p>
              <p className="text-slate-400 text-[10px]">
                📍 {product.farmer.address}
              </p>
            </div>
          )}

          {/* Reviews section */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>Consumer Reviews & Ratings</span>
              <span className="text-xs text-amber-600 font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                4.9 / 5.0
              </span>
            </h4>

            {reviews.length === 0 ? (
              <p className="text-slate-400 text-[11px] italic">
                No customer reviews yet for this harvest. Be the first to review after receiving your delivery!
              </p>
            ) : (
              <div className="space-y-2.5">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px]">{rev.consumer_name || 'Verified Buyer'}</span>
                      <div className="flex text-amber-500 text-[10px]">
                        {'★'.repeat(rev.rating)}
                      </div>
                    </div>
                    {rev.comment && <p className="text-slate-600 text-[11px]">{rev.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer with Quantity & Add to Cart */}
        <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="px-3 py-2 text-slate-600 hover:bg-slate-100"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-900">{qty}</span>
            <button
              onClick={() => setQty(Math.min(product.available_quantity, qty + 1))}
              disabled={qty >= product.available_quantity}
              className="px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => {
              handleAddToCart();
              onClose();
            }}
            disabled={product.available_quantity <= 0}
            className="flex-1 py-3 px-4 rounded-xl bg-farm-800 hover:bg-farm-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-farm-900/15 disabled:opacity-50 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add {qty} {product.unit} to Basket (₹{product.price * qty})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
