import React from 'react';
import { Calendar, Clock, MapPin, Sparkles, Music, Check, ArrowRight } from 'lucide-react';
import { DynamicPackage } from '../../types';

interface EventCardProps {
  pkg: DynamicPackage;
  onBook: (pkg: DynamicPackage) => void;
  onOpenDetails: (pkg: DynamicPackage) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ pkg, onBook, onOpenDetails }) => {
  const metadata = pkg.metadata || {};

  return (
    <div className="relative group bg-gradient-to-b from-purple-950/20 via-neutral-900/90 to-neutral-950 border border-purple-500/30 hover:border-purple-400 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
      {/* Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 backdrop-blur-md shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          {pkg.badge || 'Community Gathering'}
        </span>
      </div>

      <div>
        {/* Cover Header */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={pkg.coverImage || 'https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?auto=format&fit=crop&w=1000&q=80'}
            alt={pkg.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

          <div className="absolute bottom-4 left-6 right-6">
            <span className="text-purple-300 text-xs font-semibold tracking-widest uppercase flex items-center gap-1 mb-1">
              <Music className="w-3.5 h-3.5 text-purple-400" />
              Special Sanctuary Event
            </span>
            <h3 className="text-2xl font-serif font-semibold text-white tracking-tight leading-tight">
              {pkg.title}
            </h3>
            {pkg.subtitle && (
              <p className="text-xs text-purple-200/80 font-light mt-1">
                {pkg.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs">
            {metadata.eventDate && (
              <div className="flex items-center gap-2 text-purple-200">
                <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="truncate">{metadata.eventDate}</span>
              </div>
            )}
            {metadata.eventTime && (
              <div className="flex items-center gap-2 text-purple-200">
                <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="truncate">{metadata.eventTime}</span>
              </div>
            )}
          </div>

          {metadata.venue && (
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span>{metadata.venue}</span>
            </div>
          )}

          <p className="text-sm text-neutral-300 font-light leading-relaxed">
            {pkg.description}
          </p>

          {pkg.features && pkg.features.length > 0 && (
            <ul className="space-y-2">
              {pkg.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-neutral-200">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 pt-0 border-t border-purple-500/10 mt-4 space-y-4">
        <div className="flex items-baseline justify-between pt-4">
          <div>
            <span className="text-xs uppercase text-neutral-400 block">Ticket Price</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-purple-300">
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
            className="text-xs text-purple-400 hover:text-purple-300 underline underline-offset-4"
          >
            View Details
          </button>
        </div>

        <button
          onClick={() => onBook(pkg)}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-purple-950/50 hover:shadow-purple-500/20 transition-all flex items-center justify-center gap-2 group"
        >
          <span>Get Event Pass</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
