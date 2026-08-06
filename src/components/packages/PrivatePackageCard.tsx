import React from 'react';
import { UserCheck, Clock, Target, Check, ArrowRight, Shield } from 'lucide-react';
import { DynamicPackage } from '../../types';

interface PrivatePackageCardProps {
  pkg: DynamicPackage;
  onBook: (pkg: DynamicPackage) => void;
  onOpenDetails: (pkg: DynamicPackage) => void;
}

export const PrivatePackageCard: React.FC<PrivatePackageCardProps> = ({ pkg, onBook, onOpenDetails }) => {
  const metadata = pkg.metadata || {};

  return (
    <div className="relative group bg-gradient-to-b from-teal-950/20 via-neutral-900/90 to-neutral-950 border border-teal-500/30 hover:border-teal-400 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
      {/* Top Tag */}
      <div className="absolute top-4 right-4 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40 backdrop-blur-md shadow-lg">
          <UserCheck className="w-3.5 h-3.5 text-teal-400" />
          {pkg.badge || '1-on-1 Personal'}
        </span>
      </div>

      <div>
        {/* Cover Image Header */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={pkg.coverImage || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=80'}
            alt={pkg.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />

          <div className="absolute bottom-4 left-6 right-6">
            <span className="text-teal-300 text-xs font-semibold tracking-widest uppercase flex items-center gap-1 mb-1">
              Private Consultation
            </span>
            <h3 className="text-2xl font-serif font-semibold text-white tracking-tight leading-tight">
              {pkg.title}
            </h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-teal-950/30 border border-teal-500/20 text-xs">
            {metadata.sessionDuration && (
              <div className="flex items-center gap-2 text-teal-200">
                <Clock className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>{metadata.sessionDuration}</span>
              </div>
            )}
            {metadata.assignedInstructor && (
              <div className="flex items-center gap-2 text-teal-200">
                <Shield className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span className="truncate">{metadata.assignedInstructor}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-neutral-300 font-light leading-relaxed">
            {pkg.description}
          </p>

          {/* Focus Areas */}
          {metadata.focusAreas && metadata.focusAreas.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-400/80 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-teal-400" />
                Specialized Focus Areas
              </span>
              <div className="flex flex-wrap gap-1.5">
                {metadata.focusAreas.map((area, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 text-[11px] border border-teal-500/20">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Deliverables */}
          {pkg.features && pkg.features.length > 0 && (
            <ul className="space-y-2">
              {pkg.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-neutral-200">
                  <Check className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 pt-0 border-t border-teal-500/10 mt-4 space-y-4">
        <div className="flex items-baseline justify-between pt-4">
          <div>
            <span className="text-xs uppercase text-neutral-400 block">Session Fee</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-teal-300">
                {pkg.currency}{pkg.discountPrice || pkg.price}
              </span>
              {pkg.discountPrice && (
                <span className="text-sm line-through text-neutral-500">
                  {pkg.currency}{pkg.price}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onOpenDetails(pkg)}
            className="text-xs text-teal-400 hover:text-teal-300 underline underline-offset-4"
          >
            Session Details
          </button>
        </div>

        <button
          onClick={() => onBook(pkg)}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-neutral-950 font-semibold text-sm shadow-lg shadow-teal-950/50 hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-2 group"
        >
          <span>Book Private 1-on-1</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
