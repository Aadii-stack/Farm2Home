import React, { useState, useEffect } from 'react';
import {
  Sprout,
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Star,
  Users,
  MapPin,
  ShoppingBag,
} from 'lucide-react';
import { api } from '../services/api';
import { Product, FarmerProfile, Category } from '../types';
import { useCart } from '../context/CartContext';

interface HomePageProps {
  onNavigate: (tab: string, filterParams?: any) => void;
  onOpenProductDetail: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenProductDetail }) => {
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const [prods, farmlist, cats] = await Promise.all([
        api.getProducts({ onlyActiveStock: true }),
        api.getFarmers(),
        api.getCategories(),
      ]);
      setFeaturedProducts(prods.slice(0, 6));
      setFarmers(farmlist);
      setCategories(cats);
    } catch (err) {
      console.error('Error loading home data:', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('marketplace', { search: searchQuery.trim() });
    } else {
      onNavigate('marketplace');
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-farm-900 via-farm-800 to-farm-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 rounded-b-[2.5rem] shadow-2xl">
        {/* Subtle decorative background blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-earth-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Search */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-farm-700/80 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>Direct from Mira Bhayandar Farmlands</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                Fresh from Local Farms, <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-lime-200 to-emerald-400">
                  Delivered to Your Home.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-farm-100/90 max-w-2xl leading-relaxed">
                Connect directly with traditional agrarian cultivators in Uttan, Dongri, and Morva. Same-day morning harvests delivered to Mira Road & Bhayandar without mandi middlemen or storage delays.
              </p>

              {/* Quick Search */}
              <form
                onSubmit={handleSearchSubmit}
                className="max-w-xl mx-auto lg:mx-0 flex items-center bg-white p-2 rounded-2xl shadow-xl border border-white/20"
              >
                <div className="pl-3 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search fresh spinach, methi, papayas, coconut..."
                  className="w-full px-3 py-2 text-sm text-slate-900 bg-transparent placeholder-slate-400 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-farm-800 hover:bg-farm-900 text-white font-bold text-xs transition shrink-0"
                >
                  Find Fresh
                </button>
              </form>

              {/* Key Trust Metrics */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-farm-700/60 max-w-lg mx-auto lg:mx-0">
                <div>
                  <p className="text-2xl font-black text-white">0%</p>
                  <p className="text-[11px] text-farm-200 font-medium">Broker Markups</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">4-6 Hrs</p>
                  <p className="text-[11px] text-farm-200 font-medium">Harvest to Door</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">100%</p>
                  <p className="text-[11px] text-farm-200 font-medium">Fair Farmer Payout</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80"
                  alt="Local Indian farmer harvesting fresh produce"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold">
                      Picked at 5:30 AM Today
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Bhaskar Patil's Coastal Farm</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Uttan, Bhayandar West • Organic sweet potatoes, leafy greens & tender coconuts
                  </p>
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-xs font-semibold text-emerald-200">
                      ★ 4.9 Verified Cultivator
                    </span>
                    <button
                      onClick={() => onNavigate('marketplace')}
                      className="text-xs font-bold bg-white text-farm-900 px-3.5 py-1.5 rounded-full hover:bg-emerald-50 transition"
                    >
                      Shop Harvest
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-farm-700 bg-farm-100 px-3 py-1 rounded-full">
            Transparent Supply Chain
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            How Farm2Home Works
          </h2>
          <p className="text-sm text-slate-600">
            Eliminating 4 layers of APMC middlemen to guarantee fresher food for consumers and direct fair earnings for local cultivators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="relative p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-farm-100 text-farm-800 flex items-center justify-center font-black text-xl shadow-xs">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Farmers List Daily Harvests</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cultivators in Uttan, Dongri, and Morva publish actual available quantities each morning based on what has ripened naturally in their fields.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs text-farm-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero chemical ripening</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-earth-100 text-earth-800 flex items-center justify-center font-black text-xl shadow-xs">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Consumers Book Delivery Slots</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apartment residents across Mira Road and Bhayandar choose preferred morning (7-10 AM) or evening slots with full visibility into which farm harvested their basket.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs text-earth-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-earth-600" />
              <span>Real capacity limits prevent delays</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xl shadow-xs">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Direct Doorstep Fulfillment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Produce is packed straight into eco-friendly bags and dispatched across Mira Bhayandar within 4-6 hours of harvest. Pay easily via Cash or UPI at your door.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Cash & UPI on delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Fresh Harvests */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-farm-700">Today's Harvest Picks</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Fresh from Mira Bhayandar Soil
            </h2>
          </div>
          <button
            onClick={() => onNavigate('marketplace')}
            className="inline-flex items-center gap-1 text-xs font-bold text-farm-800 hover:text-farm-900 hover:underline"
          >
            <span>View All Produce</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((prod) => (
            <div
              key={prod.id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-farm-300 transition duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges */}
                <div
                  onClick={() => onOpenProductDetail(prod)}
                  className="relative h-52 overflow-hidden cursor-pointer"
                >
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-farm-900 shadow-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-farm-700" />
                    <span>{prod.farmer?.locality || 'Mira Bhayandar'}</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-farm-900/90 text-white px-2.5 py-1 rounded-full text-[10px] font-medium backdrop-blur-md">
                    Harvested: {new Date(prod.harvest_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-farm-800 bg-farm-50 px-2 py-0.5 rounded-md border border-farm-200/60">
                      {prod.category?.name || 'Produce'}
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
                    className="text-base font-bold text-slate-900 group-hover:text-farm-800 transition cursor-pointer line-clamp-1"
                  >
                    {prod.name}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>

                  <div className="pt-2 flex items-center gap-1.5 text-[11px] text-slate-600 border-t border-slate-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    <span className="truncate">Cultivated by <strong>{prod.farmer?.farm_name || 'Local Farm'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Price & Add to Cart */}
              <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-950">₹{prod.price}</span>
                    <span className="text-xs text-slate-500 font-medium">/{prod.unit}</span>
                  </div>
                </div>
                <button
                  onClick={() => addToCart(prod, 1)}
                  className="px-4 py-2 rounded-xl bg-farm-800 hover:bg-farm-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 focus-visible:ring-2 focus-visible:ring-farm-600 focus-visible:outline-hidden"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Basket</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Featured Local Farmers Section */}
      <section className="bg-farm-50/70 border-y border-farm-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-farm-700">Meet Your Cultivators</span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              The Families Behind Your Food
            </h2>
            <p className="text-sm text-slate-600">
              Honest farmers near Mira Bhayandar practicing sustainable, eco-friendly crop cultivation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {farmers.map((farmer) => (
              <div
                key={farmer.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-farm-800 text-white flex items-center justify-center font-bold text-lg">
                      {farmer.farm_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{farmer.farm_name}</h4>
                      <p className="text-xs text-farm-700 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{farmer.locality}, Mira Bhayandar</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {farmer.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                    ✓ Verified Cultivator
                  </span>
                  <button
                    onClick={() => onNavigate('marketplace', { farmerId: farmer.id })}
                    className="text-xs font-bold text-farm-800 hover:text-farm-900 hover:underline"
                  >
                    View Harvests →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Sustainability & Socioeconomic Impact */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Socioeconomic Impact
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Rebuilding Mira Bhayandar's Local Food Economy
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Urban expansion often forces local peri-urban farmers off their ancestral lands. By connecting consumers in Mira Road and Bhayandar directly with cultivators in Uttan and Morva, Farm2Home provides stable, dignified agricultural livelihoods while cutting cold chain emissions.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-emerald-300">
                <span>🌱 0 Intermediary Commissions</span>
                <span>🚛 Less than 8 km food transit</span>
                <span>🌾 Zero chemical preserving baths</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                <p className="text-3xl font-black text-emerald-400">42%</p>
                <p className="text-xs text-slate-300 mt-1">Average Income Increase for Local Farmers</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                <p className="text-3xl font-black text-emerald-400">18+ Hrs</p>
                <p className="text-xs text-slate-300 mt-1">Fresher than Mandi Supply Chains</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                <p className="text-3xl font-black text-emerald-400">100%</p>
                <p className="text-xs text-slate-300 mt-1">Pesticide Disclosures</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                <p className="text-3xl font-black text-emerald-400">COD/UPI</p>
                <p className="text-xs text-slate-300 mt-1">Transparent Doorstep Payment</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-farm-700">Community Feedback</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            What Mira Bhayandar Residents Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex text-amber-500 gap-1 text-sm">★★★★★</div>
            <p className="text-xs text-slate-600 italic leading-relaxed">
              "The Palak and Methi arrived still cool from the morning dewdrops! You can immediately taste the difference compared to vegetables sitting in market stalls for days."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Pooja Dave</span>
              <span className="text-slate-400">Shanti Nagar, Sector 4</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex text-amber-500 gap-1 text-sm">★★★★★</div>
            <p className="text-xs text-slate-600 italic leading-relaxed">
              "Ordered tender coconuts and papayas from Uttan Coastal Agro. Arrived right on schedule in the 7-10 AM morning window. It feels great supporting our local farmers directly."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Vikramaditya Jain</span>
              <span className="text-slate-400">Kanakia Park, Mira Road</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex text-amber-500 gap-1 text-sm">★★★★★</div>
            <p className="text-xs text-slate-600 italic leading-relaxed">
              "The Wada Kolam rice and ridge gourd (turai) were exceptional quality. Transparent pricing in rupees, no artificial surges, and friendly delivery."
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Sneha Patil</span>
              <span className="text-slate-400">Navghar, Bhayandar East</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-farm-700" />
              <span className="font-extrabold text-lg text-slate-900">Farm2Home</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Direct farm-to-home fresh produce logistics connecting Mira Bhayandar, Maharashtra.
            </p>
            <p className="text-xs text-slate-400 font-mono">
              Designed for College Idea Lab Innovation
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900">Delivery Corridors</h4>
            <p className="text-slate-500">Mira Road (East & West)</p>
            <p className="text-slate-500">Bhayandar West (Maxus / 150ft Rd)</p>
            <p className="text-slate-500">Bhayandar East (Indralok / Navghar)</p>
            <p className="text-slate-500">Harvest Zones: Uttan, Dongri, Morva, Rai</p>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900">Platform Links</h4>
            <p>
              <button onClick={() => onNavigate('marketplace')} className="text-slate-500 hover:text-farm-800">
                Marketplace Produce
              </button>
            </p>
            <p>
              <button onClick={() => onNavigate('farmers')} className="text-slate-500 hover:text-farm-800">
                Verified Farmers
              </button>
            </p>
            <p>
              <button onClick={() => onNavigate('how-it-works')} className="text-slate-500 hover:text-farm-800">
                Harvest-to-Door Logistics
              </button>
            </p>
            <p>
              <button onClick={() => onNavigate('auth')} className="text-slate-500 hover:text-farm-800">
                Register as Cultivator
              </button>
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900">Customer Support & FAQs</h4>
            <p className="text-slate-500">Support Desk: +91 98200 00001</p>
            <p className="text-slate-500">Email: help@farm2home-mirabhayandar.in</p>
            <p className="text-slate-500">Payments: Cash on Delivery & Doorstep UPI</p>
          </div>
        </div>

        <div className="border-t border-slate-100 py-6 text-center text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© 2026 Farm2Home. All rights reserved. Thane District, Maharashtra.</span>
          <span>OpenStreetMap & Supabase PostgreSQL Powered</span>
        </div>
      </footer>
    </div>
  );
};
