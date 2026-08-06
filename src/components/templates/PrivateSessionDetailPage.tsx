import React, { useState } from 'react';
import {
  ArrowLeft,
  UserCheck,
  Clock,
  MapPin,
  Check,
  Sparkles,
  Bookmark,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { DynamicPackage } from '../../types';

interface PrivateSessionDetailPageProps {
  pkg: DynamicPackage;
  onBack: () => void;
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  isPreview?: boolean;
}

export const PrivateSessionDetailPage: React.FC<PrivateSessionDetailPageProps> = ({
  pkg,
  onBack,
  onOpenBooking,
  isPreview = false
}) => {
  const [saved, setSaved] = useState(false);
  const { metadata = {} } = pkg;

  const focusAreas = metadata.focusAreas ?? [
    'Spine & Posture Rehabilitation',
    'Chronic Back / Neck Relief',
    'Stress & Anxiety Therapy',
    'Personalized Asana Alignment'
  ];

  const priceFormatted = `${pkg.currency || 'HK$'} ${pkg.price.toLocaleString()}`;
  const discountFormatted = pkg.discountPrice ? `${pkg.currency || 'HK$'} ${pkg.discountPrice.toLocaleString()}` : null;
  const coverImage = pkg.coverImage || 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=80&w=1600&auto=format&fit=crop';

  return (
    <div className="min-h-screen bg-[#F5EFE5] text-[#21201E] pb-28 sm:pb-36">
      
      {/* Admin Preview Banner */}
      {isPreview && (
        <div className="sticky top-0 z-[1000] bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white px-6 py-3.5 font-semibold text-xs sm:text-sm text-center shadow-xl flex items-center justify-between border-b border-blue-400/30">
          <div className="flex items-center gap-2.5 mx-auto">
            <UserCheck size={18} className="text-[#FCD34D]" />
            <span><strong>PRIVATE 1-ON-1 SESSION PREVIEW MODE</strong> — Displayed in Personal Therapy Layout.</span>
          </div>
          <button onClick={onBack} className="bg-stone-950 hover:bg-black text-amber-300 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow shrink-0">Close Preview</button>
        </div>
      )}

      {/* Top Bar */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isPreview ? 'pt-8' : 'pt-24 sm:pt-28'} pb-6 flex items-center justify-between`}>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-bold text-blue-900 hover:text-blue-950 uppercase tracking-widest transition-all group py-2 px-3 rounded-xl hover:bg-blue-800/10"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Private Sessions</span>
        </button>

        <button
          onClick={() => setSaved(!saved)}
          className={`p-3 rounded-2xl border transition-all ${
            saved ? 'bg-blue-800 text-white border-blue-800 shadow-md' : 'bg-white text-stone-600 border-stone-300 hover:border-stone-400'
          }`}
          title={saved ? 'Bookmarked' : 'Bookmark Session'}
        >
          <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Hero Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
        
        {/* Royal Blue Hero Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#0F2A4A] via-[#163A63] to-[#0A1B30] text-[#F5EFE5] border border-blue-400/40 p-6 sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/40 backdrop-blur-sm">
                  <UserCheck size={15} />
                  Private 1-on-1 Personal Session
                </span>
                {pkg.badge && (
                  <span className="px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-500 text-stone-950 shadow-lg">
                    {pkg.badge}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-amber-100 leading-[1.15]">
                  {pkg.title}
                </h1>
                {pkg.subtitle && (
                  <p className="text-base sm:text-lg text-stone-300 font-light leading-relaxed max-w-2xl">
                    {pkg.subtitle}
                  </p>
                )}
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-6 border-t border-b border-blue-500/20 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-blue-300 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] uppercase tracking-wider font-semibold mb-0.5">Session Length</span>
                    <span className="font-bold text-stone-100 text-sm sm:text-base">{metadata.sessionDuration || '90 Minutes'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <UserCheck size={20} className="text-blue-300 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] uppercase tracking-wider font-semibold mb-0.5">Assigned Therapist</span>
                    <span className="font-bold text-stone-100 text-sm sm:text-base">{metadata.assignedInstructor || 'Dr. Yatendra Amoli'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-blue-300 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] uppercase tracking-wider font-semibold mb-0.5">Location</span>
                    <span className="font-bold text-stone-100 text-sm sm:text-base">{metadata.location || 'Private Studio Suite'}</span>
                  </div>
                </div>
              </div>

              {/* Price & CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <span className="text-xs text-stone-400 uppercase tracking-widest font-semibold block mb-1">Session Fee</span>
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-amber-300">
                      {discountFormatted || priceFormatted}
                    </span>
                    {discountFormatted && (
                      <span className="text-base text-stone-400 line-through font-light">{priceFormatted}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onOpenBooking(pkg.type, pkg.title, pkg)}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-blue-500 to-amber-500 hover:scale-105 active:scale-95 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl text-sm sm:text-base flex items-center justify-center gap-2.5"
                >
                  <Sparkles size={20} />
                  <span>Book 1-on-1 Consultation</span>
                </button>
              </div>

            </div>

            {/* Media */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden border border-blue-400/40 aspect-4/3 sm:aspect-16/10 lg:aspect-square shadow-2xl relative">
                <img src={coverImage} alt={pkg.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-5 left-5 right-5 bg-black/75 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs sm:text-sm text-white flex items-center gap-3 shadow-lg">
                  <ShieldCheck size={20} className="text-blue-300 shrink-0" />
                  <span className="font-medium">100% Customized Postural & Wellness Plan</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-stone-200/90 space-y-6">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F2A4A] border-b border-stone-200/80 pb-4">Private Therapy Overview</h2>
              <div className="text-stone-700 leading-relaxed text-base sm:text-lg whitespace-pre-line space-y-4 font-normal">
                {pkg.description}
              </div>
            </div>

            {/* Therapy Focus Areas Grid */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-stone-200/90 space-y-6">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F2A4A] flex items-center gap-3 border-b border-stone-200/80 pb-4">
                <Activity size={24} className="text-blue-600" /> Key Therapy Focus Areas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {focusAreas.map((area, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow">
                      {idx + 1}
                    </div>
                    <span className="font-semibold text-sm sm:text-base text-stone-800">{area}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            {pkg.features && pkg.features.length > 0 && (
              <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-stone-200/90 space-y-6">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F2A4A] border-b border-stone-200/80 pb-4">Session Inclusions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {pkg.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3.5 bg-stone-50/80 p-5 rounded-2xl border border-stone-200/60">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={16} strokeWidth={2.5} />
                      </div>
                      <span className="text-sm sm:text-base text-stone-800 font-medium leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-stone-200/90 space-y-6 sticky top-28">
              <h3 className="font-serif font-bold text-xl text-[#0F2A4A] border-b border-stone-200 pb-3">Booking Summary</h3>

              <div className="space-y-4 text-sm border-b border-stone-200 pb-6">
                <div className="flex justify-between items-center text-stone-700">
                  <span className="text-stone-500">Duration</span>
                  <span className="font-bold text-stone-900">{metadata.sessionDuration || '90 Min'}</span>
                </div>
                <div className="flex justify-between items-center text-stone-700">
                  <span className="text-stone-500">Therapist</span>
                  <span className="font-bold text-stone-900">{metadata.assignedInstructor || 'Lead Master'}</span>
                </div>
                <div className="flex justify-between items-center text-stone-700">
                  <span className="text-stone-500">Session Rate</span>
                  <span className="font-extrabold text-blue-900">{priceFormatted}</span>
                </div>
              </div>

              <button
                onClick={() => onOpenBooking(pkg.type, pkg.title, pkg)}
                className="w-full bg-[#0F2A4A] hover:bg-[#0A1B30] text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg text-sm sm:text-base flex items-center justify-center gap-2.5"
              >
                <Sparkles size={18} /> Book Private Session
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A1B30] text-white p-4 sm:p-5 border-t border-blue-500/30 sm:hidden flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[11px] text-stone-400 uppercase tracking-wider block font-semibold">Private Session</span>
          <span className="font-serif font-bold text-xl text-amber-300">{discountFormatted || priceFormatted}</span>
        </div>
        <button
          onClick={() => onOpenBooking(pkg.type, pkg.title, pkg)}
          className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg active:scale-95"
        >
          <Sparkles size={16} /> Book Session
        </button>
      </div>

    </div>
  );
};
