import React, { useState } from 'react';
import { Compass, MapPin, Sun, Calendar, Check, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { DynamicPackage } from '../../types';

interface RetreatCardProps {
  pkg: DynamicPackage;
  onBook: (pkg: DynamicPackage) => void;
  onOpenDetails: (pkg: DynamicPackage) => void;
}

export const RetreatCard: React.FC<RetreatCardProps> = ({ pkg, onBook, onOpenDetails }) => {
  const [showItinerary, setShowItinerary] = useState(false);
  const metadata = pkg.metadata || {};

  return (
    <div className="relative group bg-gradient-to-b from-rose-950/20 via-neutral-900/90 to-neutral-950 border border-rose-500/30 hover:border-rose-400 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
      {/* Top Destination Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md shadow-lg">
          <Compass className="w-3.5 h-3.5 text-rose-400" />
          {pkg.badge || 'Luxury Retreat'}
        </span>
      </div>

      <div>
        {/* Cover Image Header */}
        <div className="relative h-60 overflow-hidden">
          <img
            src={pkg.coverImage || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1000&q=80'}
            alt={pkg.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

          <div className="absolute bottom-4 left-6 right-6">
            {metadata.location && (
              <span className="text-rose-300 text-xs font-semibold tracking-widest uppercase flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                {metadata.location}
              </span>
            )}
            <h3 className="text-2xl font-serif font-semibold text-white tracking-tight leading-tight">
              {pkg.title}
            </h3>
            {pkg.subtitle && (
              <p className="text-xs text-rose-200/80 font-light mt-1">
                {pkg.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-neutral-300 font-light leading-relaxed">
            {pkg.description}
          </p>

          {/* Included Perks */}
          {pkg.features && pkg.features.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400/80">All-Inclusive Sanctuary Perks</span>
              <ul className="space-y-2">
                {pkg.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-200">
                    <Check className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Room Options */}
          {metadata.roomOptions && metadata.roomOptions.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/20 text-xs space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-rose-400 font-semibold block">Accommodation Pricing</span>
              <div className="grid grid-cols-2 gap-2">
                {metadata.roomOptions.map((room, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-neutral-900/80 border border-rose-500/10">
                    <span className="text-neutral-300 block text-[11px] font-medium">{room.name}</span>
                    <span className="text-rose-300 font-serif font-bold">{pkg.currency}{room.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Itinerary Accordion */}
          {metadata.itinerary && metadata.itinerary.length > 0 && (
            <div className="border-t border-rose-500/20 pt-4">
              <button
                onClick={() => setShowItinerary(!showItinerary)}
                className="w-full flex items-center justify-between text-xs font-medium text-rose-300 hover:text-rose-200 transition-colors"
              >
                <span>View Itinerary Timeline ({metadata.itinerary.length} Days)</span>
                {showItinerary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showItinerary && (
                <div className="mt-3 space-y-2.5 animate-fadeIn">
                  {metadata.itinerary.map((day, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-neutral-900/80 border border-rose-500/10 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase">{day.day}</span>
                        <span className="font-medium text-white">{day.title}</span>
                      </div>
                      <p className="text-neutral-400 text-[11px] leading-relaxed pl-1">{day.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pricing & Footer */}
      <div className="p-6 pt-0 border-t border-rose-500/10 mt-4 space-y-4">
        <div className="flex items-baseline justify-between pt-4">
          <div>
            <span className="text-xs uppercase text-neutral-400 block">Starting From</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-rose-300">
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
            className="text-xs text-rose-400 hover:text-rose-300 underline underline-offset-4"
          >
            Full Retreat Info
          </button>
        </div>

        <button
          onClick={() => onBook(pkg)}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-neutral-950 font-semibold text-sm shadow-lg shadow-rose-950/50 hover:shadow-rose-500/20 transition-all flex items-center justify-center gap-2 group"
        >
          <span>Book Retreat Experience</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
