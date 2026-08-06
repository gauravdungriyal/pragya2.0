import React, { useState } from 'react';
import {
  ArrowLeft,
  Compass,
  Calendar,
  Clock,
  MapPin,
  Check,
  Sparkles,
  Bookmark,
  BedDouble,
  ShieldCheck
} from 'lucide-react';
import { DynamicPackage } from '../../types';

interface RetreatDetailPageProps {
  pkg: DynamicPackage;
  onBack: () => void;
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  isPreview?: boolean;
}

export const RetreatDetailPage: React.FC<RetreatDetailPageProps> = ({
  pkg,
  onBack,
  onOpenBooking,
  isPreview = false
}) => {
  const [saved, setSaved] = useState(false);
  const [selectedRoomIdx, setSelectedRoomIdx] = useState<number>(0);
  const { metadata = {} } = pkg;

  const roomOptions = metadata.roomOptions ?? [
    { name: 'Shared Deluxe Twin Room', price: pkg.price },
    { name: 'Private Executive Suite', price: Math.round(pkg.price * 1.35) }
  ];

  const itinerary = metadata.itinerary ?? [
    { day: 'Day 1', title: 'Arrival & Sanctuary Welcome Ceremony', detail: 'Check-in, orientation tea, evening restorative yoga & sound bath.' },
    { day: 'Day 2', title: 'Sunrise Hatha & Mountain Nature Immersion', detail: 'Pranayama, organic breakfast, guided trail walk & evening meditation.' },
    { day: 'Day 3', title: 'Deep Alignment & Closing Gratitude Ritual', detail: 'Morning vinyasa flow, philosophy discussion & farewell circle.' }
  ];

  const currentRoom = roomOptions[selectedRoomIdx] || roomOptions[0];
  const priceFormatted = `${pkg.currency || 'HK$'} ${currentRoom.price.toLocaleString()}`;
  const discountFormatted = pkg.discountPrice ? `${pkg.currency || 'HK$'} ${pkg.discountPrice.toLocaleString()}` : null;
  const coverImage = pkg.coverImage || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1600&auto=format&fit=crop';

  return (
    <div className="min-h-screen bg-[#F5EFE5] text-[#21201E] pb-28 sm:pb-36">
      
      {/* Optional Admin Preview Banner */}
      {isPreview && (
        <div className="sticky top-0 z-[1000] bg-gradient-to-r from-[#9D9D48] via-[#7B7B34] to-[#9D9D48] text-white px-4 py-3 font-semibold text-xs sm:text-sm text-center shadow-lg flex items-center justify-between">
          <div className="flex items-center justify-center gap-2 mx-auto">
            <Compass size={16} />
            <span><strong>RETREAT PREVIEW MODE</strong> — Displayed in Luxury Destination Layout.</span>
          </div>
          <button onClick={onBack} className="bg-stone-950 text-amber-300 text-xs px-3 py-1.5 rounded-lg">Close Preview</button>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#666624] hover:text-[#4A4A1A] uppercase tracking-widest transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Retreats</span>
        </button>

        <button
          onClick={() => setSaved(!saved)}
          className={`p-2.5 rounded-full border transition-all ${
            saved ? 'bg-[#7B7B34] text-white border-[#7B7B34]' : 'bg-white text-stone-600 border-stone-300'
          }`}
        >
          <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#2D3017] via-[#1E210E] to-[#121408] text-[#F5EFE5] border border-[#9D9D48]/40 p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  <Compass size={14} />
                  Luxury Destination Retreat
                </span>
                {pkg.badge && (
                  <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#9D9D48] text-stone-950 shadow">
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

              {/* Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-amber-500/20 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5">
                  <MapPin size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] uppercase tracking-wider">Location</span>
                    <span className="font-medium text-stone-100">{metadata.location || 'Niseko, Japan'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] uppercase tracking-wider">Retreat Dates</span>
                    <span className="font-medium text-stone-100">{metadata.eventDate || metadata.batchDates || 'Upcoming Dates'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] uppercase tracking-wider">Duration</span>
                    <span className="font-medium text-stone-100">{metadata.sessionDuration || '4 Days / 3 Nights'}</span>
                  </div>
                </div>
              </div>

              {/* Price & Booking Button */}
              <div className="pt-4 flex flex-wrap items-center gap-6">
                <div>
                  <span className="text-xs text-stone-400 uppercase tracking-wider block">Selected Package Rate</span>
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif font-bold text-3xl sm:text-4xl text-amber-300">
                      {priceFormatted}
                    </span>
                    {discountFormatted && (
                      <span className="text-sm text-stone-400 line-through">{discountFormatted}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onOpenBooking(pkg.type, pkg.title, { ...pkg, selectedRoom: currentRoom })}
                  className="bg-gradient-to-r from-[#9D9D48] via-amber-500 to-[#9D9D48] hover:scale-105 active:scale-95 text-stone-950 font-bold px-8 py-4 rounded-2xl transition-all shadow-xl text-sm sm:text-base flex items-center gap-2"
                >
                  <Sparkles size={18} />
                  <span>Reserve Retreat Experience</span>
                </button>
              </div>

            </div>

            {/* Media */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden border border-[#9D9D48]/40 aspect-4/3 sm:aspect-16/10 lg:aspect-square shadow-2xl relative">
                <img src={coverImage} alt={pkg.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/20 text-xs text-white flex items-center gap-2">
                  <ShieldCheck size={16} className="text-amber-400 shrink-0" />
                  <span>Includes Organic Cuisine & All Daily Practices</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          <div className="lg:col-span-8 space-y-8">
            
            {/* Overview */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200/80 space-y-4">
              <h2 className="font-serif text-2xl font-bold text-[#2D3017]">Sanctuary Retreat Experience</h2>
              <div className="text-stone-700 leading-relaxed text-sm sm:text-base whitespace-pre-line space-y-4">
                {pkg.description}
              </div>
            </div>

            {/* Room Option Selector */}
            {roomOptions.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200/80 space-y-6">
                <h3 className="font-serif text-2xl font-bold text-[#2D3017] flex items-center gap-2">
                  <BedDouble size={22} className="text-[#9D9D48]" /> Select Accommodations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {roomOptions.map((rm, idx) => {
                    const isSelected = selectedRoomIdx === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedRoomIdx(idx)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#9D9D48] bg-amber-50/60 shadow-md'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-serif font-bold text-base text-stone-900">{rm.name}</span>
                          <span className="w-5 h-5 rounded-full border-2 border-[#9D9D48] flex items-center justify-center shrink-0">
                            {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-[#9D9D48]"></span>}
                          </span>
                        </div>
                        <span className="font-bold text-amber-900 text-sm">
                          {pkg.currency || 'HK$'} {rm.price.toLocaleString()} / guest
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Daily Itinerary Timeline */}
            {itinerary.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200/80 space-y-6">
                <h3 className="font-serif text-2xl font-bold text-[#2D3017]">Daily Retreat Itinerary</h3>
                <div className="space-y-4">
                  {itinerary.map((item, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-stone-200 bg-stone-50/60 flex items-start gap-4">
                      <div className="px-3 py-1.5 bg-[#2D3017] text-amber-300 font-bold text-xs rounded-xl shrink-0">
                        {item.day}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 mb-1 font-serif">{item.title}</h4>
                        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features & Inclusions */}
            {pkg.features && pkg.features.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200/80 space-y-6">
                <h3 className="font-serif text-xl font-bold text-[#2D3017]">Retreat Inclusions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pkg.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/60">
                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} />
                      </div>
                      <span className="text-xs sm:text-sm text-stone-800 font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-stone-200/80 space-y-6 sticky top-28">
              <h3 className="font-serif font-bold text-lg text-[#2D3017]">Retreat Summary</h3>

              <div className="space-y-4 text-xs sm:text-sm border-t border-b border-stone-200 py-4">
                <div className="flex justify-between items-center text-stone-700">
                  <span className="text-stone-500">Destination</span>
                  <span className="font-semibold text-stone-900">{metadata.location || 'Sanctuary'}</span>
                </div>
                <div className="flex justify-between items-center text-stone-700">
                  <span className="text-stone-500">Selected Room</span>
                  <span className="font-semibold text-stone-900 truncate max-w-[140px]">{currentRoom.name}</span>
                </div>
                <div className="flex justify-between items-center text-stone-700">
                  <span className="text-stone-500">Total Investment</span>
                  <span className="font-bold text-amber-900">{priceFormatted}</span>
                </div>
              </div>

              <button
                onClick={() => onOpenBooking(pkg.type, pkg.title, { ...pkg, selectedRoom: currentRoom })}
                className="w-full bg-[#2D3017] hover:bg-[#1E210E] text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-md text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Sparkles size={16} /> Reserve Sanctuary Spot
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#121408] text-white p-4 border-t border-[#9D9D48]/30 sm:hidden flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] text-stone-400 uppercase block">{currentRoom.name}</span>
          <span className="font-serif font-bold text-lg text-amber-300">{priceFormatted}</span>
        </div>
        <button
          onClick={() => onOpenBooking(pkg.type, pkg.title, { ...pkg, selectedRoom: currentRoom })}
          className="bg-amber-500 text-stone-950 font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 shadow"
        >
          <Sparkles size={14} /> Book Retreat
        </button>
      </div>

    </div>
  );
};
