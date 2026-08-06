import React from 'react';
import { Check, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { DynamicPackage } from '../../types';

interface RegularPackageCardProps {
  pkg: DynamicPackage;
  onBook: (pkg: DynamicPackage) => void;
  onOpenDetails: (pkg: DynamicPackage) => void;
}

export const RegularPackageCard: React.FC<RegularPackageCardProps> = ({ pkg, onBook, onOpenDetails }) => {
  const isFeatured = pkg.isFeatured || pkg.badge === 'Most Popular' || pkg.badge === 'Best Value';
  const metadata = pkg.metadata || {};

  return (
    <div className={`relative group rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between ${
      isFeatured 
        ? 'bg-gradient-to-b from-blue-950/40 via-neutral-900 to-neutral-950 border-2 border-blue-500/50 shadow-blue-950/50' 
        : 'bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700'
    }`}>
      {/* Popular Badge */}
      {pkg.badge && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 backdrop-blur-md shadow-md">
            <Zap className="w-3 h-3 text-blue-400" />
            {pkg.badge}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">
        <div>
          <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase block mb-1">
            {metadata.validityPeriod || 'Studio Pass'}
          </span>
          <h3 className="text-2xl font-serif font-semibold text-white tracking-tight leading-tight">
            {pkg.title}
          </h3>
          {pkg.subtitle && (
            <p className="text-xs text-neutral-400 font-light mt-1">
              {pkg.subtitle}
            </p>
          )}
        </div>

        {/* Price display */}
        <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 flex items-baseline justify-between">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase block">Investment</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-white">
                {pkg.currency}{pkg.discountPrice || pkg.price}
              </span>
              {pkg.discountPrice && (
                <span className="text-sm line-through text-neutral-500">
                  {pkg.currency}{pkg.price}
                </span>
              )}
            </div>
          </div>
          {metadata.classCount && (
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 text-xs font-medium border border-blue-500/20">
              {metadata.classCount}
            </span>
          )}
        </div>

        <p className="text-sm text-neutral-300 font-light leading-relaxed">
          {pkg.description}
        </p>

        {/* Feature List */}
        {pkg.features && pkg.features.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Included Benefits</span>
            <ul className="space-y-2.5">
              {pkg.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300">
                  <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="p-6 pt-0 mt-2 space-y-3">
        <button
          onClick={() => onBook(pkg)}
          className={`w-full py-3.5 px-6 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 group ${
            isFeatured
              ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white shadow-lg shadow-blue-950/50'
              : 'bg-neutral-800 hover:bg-neutral-700 text-white'
          }`}
        >
          <span>Subscribe &amp; Start Pass</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="text-center">
          <button
            onClick={() => onOpenDetails(pkg)}
            className="text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            View terms &amp; full pass benefits
          </button>
        </div>
      </div>
    </div>
  );
};
