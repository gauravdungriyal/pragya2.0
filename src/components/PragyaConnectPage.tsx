import React, { useState } from 'react';
import {
  Users,
  ExternalLink,
  MessageSquare,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Heart,
  Calendar
} from 'lucide-react';

interface PragyaConnectPageProps {
  onOpenBooking?: (type?: string, title?: string, details?: any) => void;
}

export const PragyaConnectPage: React.FC<PragyaConnectPageProps> = ({ onOpenBooking }) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [loading, setLoading] = useState(true);

  const connectUrl = 'https://pragya-connect.vercel.app/';

  const handleRefresh = () => {
    setLoading(true);
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#F5EFE5] text-[#21201E] pt-24 sm:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        {/* ── Community Hero Header ────────────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#11241A] via-[#0A1811] to-[#1E3A2B] text-[#F5EFE5] border border-emerald-500/30 p-6 sm:p-10 lg:p-12">
          <div className="max-w-3xl space-y-4">
            
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                <Users size={14} />
                Official Sangha Community
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-500 text-stone-950">
                Pragya Connect Portal
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-100 leading-tight">
              Connect & Grow with Our Global Yogic Sangha
            </h1>

            <p className="text-sm sm:text-base text-stone-300 font-light leading-relaxed">
              Welcome to <strong>Pragya Connect</strong> — your dedicated community space to engage with fellow practitioners, share practice insights, coordinate group events, and connect with master teachers.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs sm:text-sm text-stone-300">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <MessageSquare size={15} className="text-amber-400" />
                <span>Community Forums</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <Calendar size={15} className="text-emerald-400" />
                <span>Event RSVPs</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <Heart size={15} className="text-rose-400" />
                <span>Peer Support</span>
              </div>
            </div>

            {/* Launch Standalone App Action */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href={connectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-xl hover:scale-105 text-xs sm:text-sm flex items-center gap-2"
              >
                <span>Open Standalone App</span>
                <ExternalLink size={16} />
              </a>

              <button
                onClick={handleRefresh}
                className="bg-white/10 hover:bg-white/20 text-stone-200 font-semibold px-4 py-3 rounded-2xl transition-colors text-xs sm:text-sm flex items-center gap-2 border border-white/20"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>Reload Portal</span>
              </button>
            </div>

          </div>
        </div>

        {/* ── Interactive Web App Embed Container ─────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-xl border border-stone-200/90 overflow-hidden space-y-0">
          
          {/* Embed Header Bar */}
          <div className="bg-stone-900 text-stone-300 px-5 py-3.5 flex items-center justify-between border-b border-stone-800 text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              </div>
              <span className="text-stone-400 truncate max-w-[200px] sm:max-w-none">
                https://pragya-connect.vercel.app/
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold">
                ● Live Connected
              </span>
            </div>
          </div>

          {/* Embedded iFrame */}
          <div className="relative w-full h-[650px] sm:h-[750px] lg:h-[820px] bg-stone-50">
            {loading && (
              <div className="absolute inset-0 z-10 bg-stone-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin"></div>
                <p className="font-serif text-lg font-bold text-amber-200">Connecting to Pragya Sangha Portal...</p>
              </div>
            )}

            <iframe
              key={iframeKey}
              src={connectUrl}
              title="Pragya Connect Community Portal"
              onLoad={() => setLoading(false)}
              className="w-full h-full border-0"
              allow="camera; microphone; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>

        </div>

        {/* ── Community Guidelines & Benefits Card ──────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200/80 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900">Safe & Mindful Space</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              A private, distraction-free environment for authentic yoga discussion and shared growth.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200/80 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mb-3">
              <Users size={20} />
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900">Practitioner Directory</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Connect with practitioners from past teacher trainings, retreats, and workshops worldwide.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200/80 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center mb-3">
              <Sparkles size={20} />
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900">Exclusive Gatherings</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Get early invitation access to upcoming community satsangs, retreats, and guest workshops.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
