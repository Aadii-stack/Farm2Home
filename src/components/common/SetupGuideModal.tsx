import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Database, Key, ExternalLink, ShieldCheck } from 'lucide-react';
import { demoDb } from '../../services/api';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const envSample = `# Supabase Environment Configuration
# Obtain these from your Supabase Project Settings -> API
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;

  const migrationCommand = `-- 1. Open Supabase Dashboard -> SQL Editor
-- 2. Run the complete migration script located at:
--    supabase/migrations/20261027_init_farm2home.sql
--
-- This creates all 10 tables, indexes, RLS policies, and
-- transactional RPC functions:
--   - create_order_transactional()
--   - cancel_order_restore_stock()`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-farm-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-farm-800 text-emerald-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Supabase PostgreSQL Configuration Guide</h3>
              <p className="text-xs text-farm-200">
                Switch seamlessly between Demo Mode and Live Production Database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-farm-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* Status info */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-950 text-sm">Interactive Demo Mode is Currently Active</h4>
              <p className="text-emerald-800 mt-1">
                The application is running with an in-browser transactional database containing authentic Mira Bhayandar sample farmers (Uttan, Dongri, Morva), real crop listings, live cart checkout, and Leaflet maps. All features are fully functional.
              </p>
              <button
                onClick={() => {
                  demoDb.resetToSeed();
                  window.location.reload();
                }}
                className="mt-2.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold shadow-xs transition"
              >
                Reset Demo Data to Default Seed
              </button>
            </div>
          </div>

          {/* Step 1: Create Supabase Project */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-farm-800 text-white flex items-center justify-center text-[11px]">1</span>
                Create Free Supabase Project
              </h4>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="text-farm-700 hover:underline flex items-center gap-1 font-semibold"
              >
                supabase.com <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-600">
              Sign up at Supabase and create a new project. Choose region <strong>South Asia (Mumbai - ap-south-1)</strong> for lowest latency in Mira Bhayandar and Maharashtra.
            </p>
          </div>

          {/* Step 2: Apply Migration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-farm-800 text-white flex items-center justify-center text-[11px]">2</span>
                Execute SQL Migration
              </h4>
              <button
                onClick={() => handleCopy(migrationCommand, 'migration')}
                className="text-farm-700 hover:underline flex items-center gap-1 font-semibold"
              >
                {copiedSection === 'migration' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copy SQL Command
              </button>
            </div>
            <p className="text-slate-600">
              Navigate to the <strong>SQL Editor</strong> tab in your Supabase dashboard and run the entire file:
            </p>
            <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto">
              <code>supabase/migrations/20261027_init_farm2home.sql</code>
            </div>
          </div>

          {/* Step 3: Environment Variables */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-farm-800 text-white flex items-center justify-center text-[11px]">3</span>
                Set Environment Variables (.env)
              </h4>
              <button
                onClick={() => handleCopy(envSample, 'env')}
                className="text-farm-700 hover:underline flex items-center gap-1 font-semibold"
              >
                {copiedSection === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copy .env Template
              </button>
            </div>
            <p className="text-slate-600">
              Create a file named <code>.env</code> in the project root:
            </p>
            <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre">
              {envSample}
            </pre>
          </div>

          {/* Step 4: Vercel Deployment Instructions */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-farm-800 text-white flex items-center justify-center text-[11px]">4</span>
              Vercel Deployment
            </h4>
            <p className="text-slate-600">
              To deploy frontend to Vercel:
            </p>
            <div className="bg-slate-100 p-3 rounded-xl space-y-1 font-mono text-[11px] text-slate-800">
              <p>1. Import repository in Vercel Dashboard</p>
              <p>2. Set Framework Preset: Vite</p>
              <p>3. Add environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</p>
              <p>4. Hit Deploy!</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-farm-800 text-white font-bold text-xs hover:bg-farm-900 transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
