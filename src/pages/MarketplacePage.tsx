import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Sprout,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';
import { Product, Category, FarmerProfile, CartItem } from '../types';
import { useCart } from '../context/CartContext';
import { StaggerList, StaggerItem } from '../components/common/Motion';

interface MarketplacePageProps {
  initialSearch?: string;
  initialFarmerId?: string;
  onOpenProductDetail: (product: Product) => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  initialSearch = '',
  initialFarmerId = '',
  onOpenProductDetail,
}) => {
  const { cart, addToCart, updateQuantity } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocality, setSelectedLocality] = useState<string>('all');
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>(initialFarmerId);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [onlyInStock, setOnlyInStock] = useState(true);

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, selectedLocality, selectedFarmerId, sortBy, onlyInStock]);

  const loadFilters = async () => {
    try {
      const [cats, farmlist] = await Promise.all([api.getCategories(), api.getFarmers()]);
      setCategories(cats);
      setFarmers(farmlist);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProducts({
        categorySlug: selectedCategory,
        farmerId: selectedFarmerId || undefined,
        locality: selectedLocality,
        search: search.trim() || undefined,
        sortBy: sortBy,
        onlyActiveStock: onlyInStock,
      });
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedLocality('all');
    setSelectedFarmerId('');
    setSortBy('newest');
    setOnlyInStock(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-farm-700 bg-farm-100 px-3 py-1 rounded-full">
            Local Produce Hub
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2">
            Mira Bhayandar Fresh Marketplace
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse pesticide-free vegetables, fruits, herbs & grains harvested by local coastal farmers.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search spinach, papaya, farmer..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-xs text-slate-900 bg-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-farm-600 shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
            selectedCategory === 'all'
              ? 'bg-farm-800 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === cat.slug
                ? 'bg-farm-800 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Filter & Sorting Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Locality Filter */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-farm-700" />
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-hidden"
            >
              <option value="all">All Farmlands</option>
              <option value="Uttan">Uttan Coastal Belts</option>
              <option value="Dongri">Dongri Hillside Orchards</option>
              <option value="Rai">Rai & Morva Natural Farms</option>
              <option value="Bhayandar West">Bhayandar West</option>
            </select>
          </div>

          {/* Farmer Specific Filter */}
          <div className="flex items-center gap-1.5">
            <Sprout className="w-4 h-4 text-farm-700" />
            <select
              value={selectedFarmerId}
              onChange={(e) => setSelectedFarmerId(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-hidden"
            >
              <option value="">All Cultivators</option>
              {farmers.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.farm_name} ({f.locality})
                </option>
              ))}
            </select>
          </div>

          {/* In-Stock Only checkbox */}
          <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-700">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="rounded text-farm-700 focus:ring-farm-600"
            />
            <span>In Stock Only</span>
          </label>
        </div>

        {/* Sort & Reset */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:outline-hidden"
            >
              <option value="newest">Fresh Harvests (Newest)</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {(selectedCategory !== 'all' ||
            selectedLocality !== 'all' ||
            selectedFarmerId ||
            search ||
            sortBy !== 'newest') && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-slate-500 hover:text-red-600 font-medium p-1.5"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-12">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="rounded-3xl bg-white border border-slate-200 p-4 space-y-3 animate-pulse">
              <div className="w-full h-48 bg-slate-200 rounded-2xl" />
              <div className="h-4 bg-slate-200 rounded-md w-3/4" />
              <div className="h-3 bg-slate-200 rounded-md w-1/2" />
              <div className="h-8 bg-slate-200 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-farm-50 text-farm-700 flex items-center justify-center mx-auto">
            <Sprout className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No produce matches your filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, selecting "All Farmlands", or resetting filters to view all fresh harvests.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-farm-800 text-white font-bold text-xs hover:bg-farm-900 transition shadow-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((prod) => {
            const inCart = cart.find((i: CartItem) => i.product.id === prod.id);

            return (
              <StaggerItem key={prod.id}>
                <div
                  className="group h-full bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-farm-400 transition-all duration-200 flex flex-col justify-between"
                >
                <div>
                  {/* Image & Tags */}
                  <div
                    onClick={() => onOpenProductDetail(prod)}
                    className="relative h-48 overflow-hidden cursor-pointer bg-slate-100"
                  >
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-farm-900 shadow-xs flex items-center gap-1 border border-slate-100">
                      <MapPin className="w-3 h-3 text-farm-700" />
                      <span>{prod.farmer?.locality || 'Mira Bhayandar'}</span>
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 bg-farm-950/90 text-white px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-md border border-white/10 shadow-xs">
                      Harvest: {new Date(prod.harvest_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-farm-800 bg-farm-50 px-2 py-0.5 rounded-md border border-farm-200/60">
                        {prod.category?.name}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          prod.available_quantity <= 10
                            ? 'bg-amber-50 text-amber-900 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        {prod.available_quantity} {prod.unit} left
                      </span>
                    </div>

                    <h3
                      onClick={() => onOpenProductDetail(prod)}
                      className="text-sm font-bold text-slate-900 group-hover:text-farm-800 transition cursor-pointer line-clamp-1"
                    >
                      {prod.name}
                    </h3>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>

                    <div className="pt-1.5 flex items-center gap-1.5 text-[10px] text-slate-600 font-medium truncate border-t border-slate-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span className="truncate">{prod.farmer?.farm_name || 'Local Farm'}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-slate-950">₹{prod.price}</span>
                      <span className="text-[11px] text-slate-500 font-medium">/{prod.unit}</span>
                    </div>
                  </div>

                  {inCart ? (
                    <div className="flex items-center border border-farm-700 rounded-xl bg-farm-50 overflow-hidden shadow-xs">
                      <button
                        onClick={() => updateQuantity(prod.id, inCart.quantity - 1)}
                        className="px-2.5 py-1 text-farm-800 hover:bg-farm-100 transition active:scale-90"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-farm-900">{inCart.quantity}</span>
                      <button
                        onClick={() => updateQuantity(prod.id, inCart.quantity + 1)}
                        disabled={inCart.quantity >= prod.available_quantity}
                        className="px-2.5 py-1 text-farm-800 hover:bg-farm-100 disabled:opacity-30 transition active:scale-90"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(prod, 1)}
                      disabled={prod.available_quantity <= 0}
                      className="px-4 py-2 rounded-xl bg-farm-800 hover:bg-farm-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-farm-600 focus-visible:outline-hidden"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerList>
      )}
    </div>
  );
};
