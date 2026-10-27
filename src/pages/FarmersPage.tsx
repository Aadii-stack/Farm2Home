import React, { useState, useEffect } from 'react';
import { MapPin, Sprout, ShieldCheck, ArrowRight, Phone } from 'lucide-react';
import { api } from '../services/api';
import { FarmerProfile } from '../types';
import { DeliveryMap } from '../components/common/DeliveryMap';

interface FarmersPageProps {
  onNavigateToFarmerProducts: (farmerId: string) => void;
}

export const FarmersPage: React.FC<FarmersPageProps> = ({ onNavigateToFarmerProducts }) => {
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);

  useEffect(() => {
    api.getFarmers().then(setFarmers).catch(console.error);
  }, []);

  const mapPoints = farmers.map((f) => ({
    lat: f.latitude,
    lng: f.longitude,
    label: f.farm_name,
    type: 'farm' as const,
    details: `${f.locality}, Mira Bhayandar`,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-farm-700 bg-farm-100 px-3 py-1 rounded-full">
          Verified Mira Bhayandar Cultivators
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Our Local Farming Partners
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Meet the genuine agrarian families cultivating coastal vegetables, sweet potatoes, organic leafy greens, and native fruits across Uttan, Dongri, Morva, and Rai.
        </p>
      </div>

      {/* Map of All Cultivator Origins */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-farm-700" />
            <span>Farmland Geographic Corridor</span>
          </span>
          <span className="text-slate-400">Centering Uttan, Dongri & Morva Fields</span>
        </div>
        <DeliveryMap additionalPoints={mapPoints} height="320px" zoom={12} />
      </div>

      {/* Farmers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {farmers.map((farmer) => (
          <div
            key={farmer.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-lg transition space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-farm-800 to-farm-900 text-white flex items-center justify-center font-black text-xl shadow-md">
                  {farmer.farm_name.charAt(0)}
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">{farmer.farm_name}</h3>
                <p className="text-xs text-farm-700 font-semibold mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{farmer.locality}, Mira Bhayandar</span>
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {farmer.description}
              </p>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Farm Location:</p>
                <p className="text-slate-500">{farmer.address}</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Coordinates: {farmer.latitude.toFixed(4)}° N, {farmer.longitude.toFixed(4)}° E
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateToFarmerProducts(farmer.id)}
              className="w-full py-3 px-4 rounded-xl bg-farm-800 hover:bg-farm-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition group"
            >
              <span>Explore Farm's Produce</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
