import React from 'react';
import { Calendar, Clock, MapPin, User, Users, Check, ArrowRight, Zap } from 'lucide-react';
import { DynamicPackage } from '../../types';

interface WorkshopCardProps {
  pkg: DynamicPackage;
  onBook: (pkg: DynamicPackage) => void;
  onOpenDetails: (pkg: DynamicPackage) => void;
}

export const WorkshopCard: React.FC<WorkshopCardProps> = ({ pkg, onBook, onOpenDetails }) => {
  const metadata = pkg.metadata || {};
  const totalSeats = metadata.totalSeats || 20;
  const bookedSeats = metadata.bookedSeats || 0;
  const remainingSeats = Math.max(0, totalSeats - bookedSeats);
  const seatPercentage = Math.min(100, Math.round((bookedSeats / totalSeats) * 100));

  return (
    <div className="relative group bg-gradient-to-b from-emerald-950/20 via-neutral-900/90 to-neutral-950 border border-emerald-500/30 hover:border-emerald-400 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
      {/* Top Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md shadow-lg">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          {pkg.badge || 'Intensive Workshop'}
        </span>
      </div>

      <div>
        {/* Cover Header */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={pkg.coverImage || 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80'}
            alt={pkg.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />

          <div className="absolute bottom-4 left-6 right-6">
            <span className="text-emerald-400/90 text-xs font-semibold tracking-widest uppercase flex items-center gap-1 mb-1">
              Skill Masterclass
            </span>
            <h3 className="text-2xl font-serif font-semibold text-white tracking-tight leading-tight">
              {pkg.title}
            </h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Date, Time & Venue */}
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-neutral-300">
            {metadata.eventDate && (
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-medium text-white">{metadata.eventDate}</span>
              </div>
            )}
            {metadata.eventTime && (
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{metadata.eventTime}</span>
              </div>
            )}
            {metadata.venue && (
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="truncate">{metadata.venue}</span>
              </div>
            )}
            {metadata.instructorName && (
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Led by <strong className="text-emerald-200">{metadata.instructorName}</strong></span>
              </div>
            )}
          </div>

          {/* Seat Capacity Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-neutral-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                Seat Capacity
              </span>
              <span className="text-emerald-400">
                {remainingSeats > 0 ? `${remainingSeats} spots left` : 'Sold Out'}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${seatPercentage}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-neutral-300 font-light leading-relaxed">
            {pkg.description}
          </p>

          {/* Features */}
          {pkg.features && pkg.features.length > 0 && (
            <ul className="space-y-2">
              {pkg.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-neutral-200">
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
            <span className="text-xs uppercase text-neutral-400 block">Workshop Fee</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-emerald-300">
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
            className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
          >
            View Details
          </button>
        </div>

        <button
          onClick={() => onBook(pkg)}
          disabled={remainingSeats === 0}
          className={`w-full py-3.5 px-6 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 group ${
            remainingSeats === 0
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-neutral-950 shadow-lg shadow-emerald-950/50 hover:shadow-emerald-500/20'
          }`}
        >
          <span>{remainingSeats === 0 ? 'Workshop Full' : 'Reserve Workshop Seat'}</span>
          {remainingSeats > 0 && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>
      </div>
    </div>
  );
};
