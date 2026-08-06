import React, { useState } from 'react';
import {
  ArrowLeft,
  Zap,
  Calendar,
  Clock,
  MapPin,
  Check,
  Users,
  Sparkles,
  ShieldCheck,
  Bookmark,
  CheckCircle2
} from 'lucide-react';
import { DynamicPackage } from '../../types';

interface WorkshopDetailPageProps {
  pkg: DynamicPackage;
  onBack: () => void;
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  isPreview?: boolean;
}

export const WorkshopDetailPage: React.FC<WorkshopDetailPageProps> = ({
  pkg,
  onBack,
  onOpenBooking,
  isPreview = false
}) => {
  const [saved, setSaved] = useState(false);
  const { metadata = {} } = pkg;

  const totalSeats = metadata.totalSeats || 20;
  const bookedSeats = metadata.bookedSeats || 16;
  const remainingSeats = Math.max(0, totalSeats - bookedSeats);
  const progressPercent = Math.min(100, Math.round((bookedSeats / totalSeats) * 100));

  const priceFormatted = `${pkg.currency || 'HK$'} ${pkg.price.toLocaleString()}`;
  const discountFormatted = pkg.discountPrice ? `${pkg.currency || 'HK$'} ${pkg.discountPrice.toLocaleString()}` : null;
  const coverImage = pkg.coverImage || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1600&auto=format&fit=crop';

  return (
    <div className="min-h-screen bg-[#F5EFE5] text-[#21201E] pb-28 sm:pb-36">
      
      {/* Optional Admin Preview Banner */}
      {isPreview && (
        <div className="sticky top-0 z-[1000] bg-gradient-to-r from-[#00381F] via-emerald-800 to-[#00381F] text-white px-4 py-3 font-semibold text-xs sm:text-sm text-center shadow-lg flex items-center justify-between">
          <div className="flex items-center justify-center gap-2 mx-auto">
            <Zap size={16} className="text-amber-400" />
            <span><strong>WORKSHOP PREVIEW MODE</strong> — Displayed in Specialist Masterclass Layout.</span>
          </div>
          <button onClick={onBack} className="bg-stone-950 text-amber-300 text-xs px-3 py-1.5 rounded-lg">Close Preview</button>
        </div>
      )}

      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#00381F] hover:text-emerald-800 uppercase tracking-widest transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Workshops</span>
        </button>

        <button
          onClick={() => setSaved(!saved)}
          className={`p-2.5 rounded-full border transition-all ${
            saved ? 'bg-[#00381F] text-white border-[#00381F]' : 'bg-white text-stone-600 border-stone-300'
          }`}
        >
          <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Hero Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Forest Green Hero */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#00381F] via-[#11241A] to-[#0A1811] text-[#F5EFE5] border border-emerald-500/30 p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  <Zap size={14} />
                  Specialist Masterclass
                </span>
                {pkg.badge && (
                  <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-600 text-stone-950 shadow">
                    {pkg.badge}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-amber-100 leading-tight">
                  {pkg.title}
                </h1>
                {pkg.subtitle && (
                  <p className="text-base sm:text-lg text-stone-300 font-light leading-relaxed">
                    {pkg.subtitle}
                  </p>
                )}
              </div>

              {/* Live Seats Progress Bar */}
              <div className="bg-emerald-950/80 border border-emerald-500/30 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-emerald-300 flex items-center gap-1.5">
                    <Users size={14} /> Seat Capacity Status
                  </span>
                  <span className="text-amber-300 font-bold">
                    {remainingSeats > 0 ? `Only ${remainingSeats} Seats Left!` : 'Sold Out!'}
                  </span>
                </div>
                <div className="w-full bg-emerald-900/60 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-emerald-500/20 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5">
                  <Calendar size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] uppercase tracking-wider">Date & Time</span>
                    <span className="font-medium text-stone-100">{metadata.eventDate || 'Saturday Workshop'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] uppercase tracking-wider">Duration</span>
                    <span className="font-medium text-stone-100">{metadata.eventTime || '3 Hours Intensive'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] uppercase tracking-wider">Venue</span>
                    <span className="font-medium text-stone-100">{metadata.venue || 'Central Studio HK'}</span>
                  </div>
                </div>
              </div>

              {/* Price & CTA */}
              <div className="pt-4 flex flex-wrap items-center gap-6">
                <div>
                  <span className="text-xs text-stone-400 uppercase tracking-wider block">Workshop Fee</span>
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif font-bold text-3xl sm:text-4xl text-amber-300">
                      {discountFormatted || priceFormatted}
                    </span>
                    {discountFormatted && (
                      <span className="text-sm text-stone-400 line-through">{priceFormatted}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onOpenBooking(pkg.type, pkg.title, pkg)}
                  className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-stone-950 font-bold px-8 py-4 rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 text-sm sm:text-base flex items-center gap-2"
                >
                  <Sparkles size={18} />
                  <span>Reserve Workshop Seat</span>
                </button>
              </div>

            </div>

            {/* Right Media */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden border border-emerald-500/30 aspect-4/3 sm:aspect-16/10 lg:aspect-square shadow-2xl relative">
                <img src={coverImage} alt={pkg.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/20 text-xs text-white flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                  <span>Led by Senior Master Practitioner</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          <div className="lg:col-span-8 space-y-8">
            
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200/80 space-y-4">
              <h2 className="font-serif text-2xl font-bold text-[#00381F]">Workshop Details & Description</h2>
              <div className="text-stone-700 leading-relaxed text-sm sm:text-base whitespace-pre-line space-y-4">
                {pkg.description}
              </div>
            </div>

            {pkg.features && pkg.features.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200/80 space-y-6">
                <h3 className="font-serif text-xl font-bold text-[#00381F]">Key Masterclass Takeaways</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pkg.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/60">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 size={14} />
                      </div>
                      <span className="text-xs sm:text-sm text-stone-800 font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-stone-200/80 space-y-6 sticky top-28">
              <h3 className="font-serif font-bold text-lg text-[#00381F]">Workshop Summary</h3>

              <div className="space-y-4 text-xs sm:text-sm border-t border-b border-stone-200 py-4">
                <div className="flex justify-between items-center text-stone-700">
                  <span className="text-stone-500">Instructor</span>
                  <span className="font-semibold text-stone-900">{metadata.instructorName || 'Senior Master'}</span>
                </div>
                <div className="flex justify-between items-center text-stone-700">
                  <span className="text-stone-500">Workshop Fee</span>
                  <span className="font-semibold text-stone-900">{priceFormatted}</span>
                </div>
                <div className="flex justify-between items-center text-stone-700">
                  <span className="text-stone-500">Available Seats</span>
                  <span className="font-bold text-emerald-700">{remainingSeats} Seats Left</span>
                </div>
              </div>

              <button
                onClick={() => onOpenBooking(pkg.type, pkg.title, pkg)}
                className="w-full bg-[#00381F] hover:bg-emerald-900 text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-md text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Sparkles size={16} /> Book Workshop Seat Now
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A1811] text-white p-4 border-t border-emerald-500/20 sm:hidden flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] text-stone-400 uppercase block">Workshop Fee</span>
          <span className="font-serif font-bold text-lg text-amber-300">{discountFormatted || priceFormatted}</span>
        </div>
        <button
          onClick={() => onOpenBooking(pkg.type, pkg.title, pkg)}
          className="bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 shadow"
        >
          <Sparkles size={14} /> Book Seat
        </button>
      </div>

    </div>
  );
};
