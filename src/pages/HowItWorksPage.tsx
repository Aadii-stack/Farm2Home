import React from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Sprout,
  HeartHandshake,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface HowItWorksPageProps {
  onNavigate: (tab: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-farm-700 bg-farm-100 px-3 py-1 rounded-full">
          From Soil to Kitchen Counter
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          The Direct Harvest-to-Door Journey
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Traditional retail vegetables in Mumbai and Mira Bhayandar pass through at least four middlemen over 48 to 72 hours. Farm2Home replaces this with an 4-to-6 hour direct farm dispatch cycle.
        </p>
      </div>

      {/* Comparison: Mandi Intermediary vs Farm2Home */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Traditional Middleman Mandi System */}
        <div className="p-8 rounded-3xl bg-red-50/40 border border-red-200/80 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-100 text-red-700">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-950">Traditional Middleman Model</h3>
              <p className="text-xs text-red-600">Old Mandi broker distribution chain</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="flex items-start gap-2.5">
              <span className="text-red-500 font-bold">✕</span>
              <span><strong>48-72 Hours transit:</strong> Harvested, hauled to wholesale APMC mandi, sold to sub-brokers, stored, then retailed.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-red-500 font-bold">✕</span>
              <span><strong>Chemical preservation:</strong> Waxing, cold immersion baths, or carbide ripening used to survive long transit.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-red-500 font-bold">✕</span>
              <span><strong>Unfair farmer realization:</strong> Cultivators receive only 25% to 35% of the final retail price you pay.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-red-500 font-bold">✕</span>
              <span><strong>High food waste:</strong> Nearly 30% of leafy greens spoil during multi-tiered handling.</span>
            </div>
          </div>
        </div>

        {/* Farm2Home Model */}
        <div className="p-8 rounded-3xl bg-farm-50/70 border border-farm-200 space-y-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-farm-800 text-emerald-300">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-farm-950">Farm2Home Direct Model</h3>
              <p className="text-xs text-farm-700">Direct Mira Bhayandar farm-to-consumer</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="flex items-start gap-2.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>4-6 Hours harvest-to-door:</strong> Picked at dawn in Uttan/Dongri/Morva, delivered to Mira Road & Bhayandar same morning.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Zero chemical baths:</strong> Clean, natural produce with full moisture, fragrance, and bio-nutrients intact.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Direct fair earnings:</strong> Farmers receive 100% of their listed farm-gate price without mandi deductions.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Transparent OpenStreetMap tracking:</strong> Know exactly which farmer and village cultivated your produce.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Harvest Timeline */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">A Day in the Life of a Harvest Basket</h2>
          <p className="text-xs text-slate-500 mt-1">Scheduled, predictable delivery windows prevent perishable spoilage</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-farm-100 text-farm-800 flex items-center justify-center font-bold text-sm">
              05:00
            </div>
            <h4 className="text-sm font-bold text-slate-900">1. Daybreak Picking</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cultivators pick leafy greens (palak, methi, kothimbir) while dew is still fresh on the leaves to preserve cellular crispness.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-farm-100 text-farm-800 flex items-center justify-center font-bold text-sm">
              06:30
            </div>
            <h4 className="text-sm font-bold text-slate-900">2. Cooperative Packing</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Harvested crops are weighed, sorted into individual customer baskets, and labeled with order numbers.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-farm-100 text-farm-800 flex items-center justify-center font-bold text-sm">
              07:30
            </div>
            <h4 className="text-sm font-bold text-slate-900">3. Direct Local Dispatch</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Delivery batches travel straight from Uttan/Dongri/Morva farms to apartment complexes in Mira Road and Bhayandar.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-farm-100 text-farm-800 flex items-center justify-center font-bold text-sm">
              08:30+
            </div>
            <h4 className="text-sm font-bold text-slate-900">4. Doorstep Handoff</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              You inspect the basket freshness and pay via Cash or UPI scanner right at your door.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-farm-800 to-farm-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Experience the Farm2Home Difference</h3>
          <p className="text-xs text-farm-200 max-w-lg">
            Support local cultivators in your own neighborhood while treating your family to genuinely farm-fresh nutrition.
          </p>
        </div>
        <button
          onClick={() => onNavigate('marketplace')}
          className="px-6 py-3.5 rounded-xl bg-white text-farm-900 hover:bg-emerald-50 font-bold text-xs shadow-lg transition shrink-0"
        >
          Explore Fresh Produce
        </button>
      </div>
    </div>
  );
};
