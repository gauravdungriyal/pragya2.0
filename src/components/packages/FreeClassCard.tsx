import React from 'react';
import { Gift, Check, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { DynamicPackage } from '../../types';

interface FreeClassCardProps {
  pkg: DynamicPackage;
  onBook: (pkg: DynamicPackage) => void;
  onOpenDetails: (pkg: DynamicPackage) => void;
}

export const FreeClassCard: React.FC<FreeClassCardProps> = ({ pkg, onBook, onOpenDetails }) => {
  const metadata = pkg.metadata || {};

  return (
    <div className="relative group bg-gradient-to-b from-emerald-950/30 via-neutral-900/90 to-neutral-950 border-2 border-emerald-500/50 hover:border-emerald-400 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
      {/* Top Banner Tag */}
      <div className="absolute top-4 right-4 z-10">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500 text-neutral-950 shadow-lg shadow-emerald-500/30 animate-pulse">
          <Gift className="w-3.5 h-3.5" />
          {pkg.badge || '100% Free Trial'}
        </span>
      </div>

      <div>
        {/* Header Banner */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={pkg.coverImage || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1000&q=80'}
            alt={pkg.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />

          <div className="absolute bottom-4 left-6 right-6">
            <span className="text-emerald-400 text-xs font-semibold tracking-widest uppercase flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Complimentary Welcome Offer
            </span>
            <h3 className="text-2xl font-serif font-semibold text-white tracking-tight leading-tight">
              {pkg.title}
            </h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {metadata.eligibilityText && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{metadata.eligibilityText}</span>
            </div>
          )}

          <p className="text-sm text-neutral-300 font-light leading-relaxed">
            {pkg.description}
          </p>

          {/* Features */}
          {pkg.features && pkg.features.length > 0 && (
            <ul className="space-y-2.5">
              {pkg.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-200">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 pt-0 border-t border-emerald-500/10 mt-4 space-y-4">
        <div className="flex items-baseline justify-between pt-4">
          <div>
            <span className="text-xs uppercase text-neutral-400 block">Trial Price</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-emerald-400">
                FREE
              </span>
              <span className="text-xs text-neutral-400">
                ($0.00)
              </span>
            </div>
          </div>

          <button
            onClick={() => onOpenDetails(pkg)}
            className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
          >
            Pass Details
          </button>
        </div>

        <button
          onClick={() => onBook(pkg)}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-neutral-950 font-bold text-sm shadow-xl shadow-emerald-950/60 hover:shadow-emerald-400/20 transition-all flex items-center justify-center gap-2 group"
        >
          <span>Claim Free Trial Pass</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
