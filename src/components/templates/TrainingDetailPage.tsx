import React, { useState } from 'react';
import {
  ArrowLeft,
  Award,
  Calendar,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Users,
  ShieldCheck,
  Bookmark
} from 'lucide-react';
import { DynamicPackage } from '../../types';

interface TrainingDetailPageProps {
  pkg: DynamicPackage;
  onBack: () => void;
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  isPreview?: boolean;
}

export const TrainingDetailPage: React.FC<TrainingDetailPageProps> = ({
  pkg,
  onBack,
  onOpenBooking,
  isPreview = false
}) => {
  const [expandedModule, setExpandedModule] = useState<number | null>(0);
  const [saved, setSaved] = useState(false);

  const { metadata = {} } = pkg;
  const syllabus = metadata.syllabus ?? [
    { moduleTitle: 'Module 1: Asana Alignment & Kinesiology', topics: ['Biomechanical Principles', 'Structural Adjustments', 'Injury Prevention & Safety'] },
    { moduleTitle: 'Module 2: Pranayama & Subtle Energy Science', topics: ['Nadi Shodhana & Breath Dynamics', 'Chakra Anatomy', 'Bandhas & Energy Locks'] },
    { moduleTitle: 'Module 3: Philosophy & Patanjali Yoga Sutras', topics: ['Eight Limbs Breakdown', 'Yogic Ethics in Modern Teaching', 'Sanskrit Pronunciation & Chanting'] }
  ];

  const priceFormatted = `${pkg.currency || 'HK$'} ${pkg.price.toLocaleString()}`;
  const discountFormatted = pkg.discountPrice ? `${pkg.currency || 'HK$'} ${pkg.discountPrice.toLocaleString()}` : null;
  const coverImage = pkg.coverImage || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1600&auto=format&fit=crop';

  return (
    <div className="min-h-screen bg-[#F5EFE5] text-[#21201E] pb-28 sm:pb-36">
      
      {/* Admin Preview Banner */}
      {isPreview && (
        <div className="sticky top-0 z-[1000] bg-gradient-to-r from-[#944426] via-[#B85732] to-[#944426] text-white px-6 py-3.5 font-semibold text-xs sm:text-sm shadow-xl flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center gap-2.5 mx-auto">
            <Award size={18} className="text-amber-300" />
            <span><strong>TEACHER TRAINING PREVIEW MODE</strong> — Displayed in RYT Accreditation Layout.</span>
          </div>
          <button
            onClick={onBack}
            className="bg-stone-950 hover:bg-black text-amber-300 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow shrink-0"
          >
            Close Preview
          </button>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isPreview ? 'pt-8' : 'pt-24 sm:pt-28'} pb-6 flex items-center justify-between`}>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#944426] hover:text-[#7B351B] uppercase tracking-widest transition-all group py-2 px-3 rounded-xl hover:bg-[#944426]/10"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Courses</span>
        </button>

        <button
          onClick={() => setSaved(!saved)}
          className={`p-3 rounded-2xl border transition-all ${
            saved ? 'bg-[#944426] text-white border-[#944426] shadow-md' : 'bg-white text-stone-600 border-stone-300 hover:border-stone-400'
          }`}
          title={saved ? 'Bookmarked' : 'Bookmark Course'}
        >
          <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
        
        {/* ── Terracotta Hero Banner Card ─────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#1E3A2B] via-[#11241A] to-[#3B1A10] text-[#F5EFE5] border border-[#C5A059]/40 p-6 sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Main Details Column */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              
              {/* Accreditations & Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40 backdrop-blur-sm">
                  <Award size={15} />
                  {metadata.certification || 'Yoga Alliance RYT Certified'}
                </span>
                {pkg.badge && (
                  <span className="px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#944426] text-white shadow-lg">
                    {pkg.badge}
                  </span>
                )}
              </div>

              {/* Course Title & Subtitle */}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-6 border-t border-b border-amber-500/20 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] uppercase tracking-wider font-semibold mb-0.5">Total Duration</span>
                    <span className="font-bold text-stone-100 text-sm sm:text-base">{metadata.totalHours ? `${metadata.totalHours} Hours` : '200 Hours RYT'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar size={20} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] uppercase tracking-wider font-semibold mb-0.5">Upcoming Batch</span>
                    <span className="font-bold text-stone-100 text-sm sm:text-base">{metadata.batchDates || 'Oct 15 – Nov 12, 2026'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users size={20} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] uppercase tracking-wider font-semibold mb-0.5">Lead Faculty</span>
                    <span className="font-bold text-stone-100 text-sm sm:text-base">{metadata.instructorName || 'Master Teachers'}</span>
                  </div>
                </div>
              </div>

              {/* Price & CTA Action Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <span className="text-xs text-stone-400 uppercase tracking-widest font-semibold block mb-1">Course Tuition</span>
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
                  className="w-full sm:w-auto bg-gradient-to-r from-[#944426] via-[#B85732] to-[#944426] hover:from-[#7B351B] hover:to-[#944426] text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 text-sm sm:text-base flex items-center justify-center gap-2.5 border border-amber-500/30"
                >
                  <Sparkles size={20} className="text-amber-300" />
                  <span>Apply & Reserve Seat</span>
                </button>
              </div>

            </div>

            {/* Right Media Column */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden border border-amber-500/30 aspect-4/3 sm:aspect-16/10 lg:aspect-square shadow-2xl relative">
                <img src={coverImage} alt={pkg.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-5 left-5 right-5 bg-black/75 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs sm:text-sm text-white flex items-center gap-3 shadow-lg">
                  <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
                  <span className="font-medium">Internationally Recognized Yoga Alliance Certificate</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Main Content & Sidebar Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main 8-Cols Content Column */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Description Card */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-stone-200/90 space-y-6">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E3A2B] flex items-center gap-3 border-b border-stone-200/80 pb-4">
                <BookOpen size={24} className="text-[#944426]" /> Course Overview & Vision
              </h2>
              <div className="text-stone-700 leading-relaxed text-base sm:text-lg font-normal whitespace-pre-line space-y-4">
                {pkg.description}
              </div>
            </div>

            {/* Syllabus Accordion Modules */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-stone-200/90 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E3A2B]">Comprehensive Curriculum</h3>
                <span className="text-xs bg-[#944426]/10 text-[#944426] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                  {syllabus.length} Modules
                </span>
              </div>

              <div className="space-y-4 pt-2">
                {syllabus.map((mod, idx) => {
                  const isOpen = expandedModule === idx;
                  return (
                    <div key={idx} className="border border-stone-200/90 rounded-2xl overflow-hidden transition-colors">
                      <button
                        onClick={() => setExpandedModule(isOpen ? null : idx)}
                        className="w-full p-5 sm:p-6 text-left font-semibold text-stone-900 bg-stone-50/70 hover:bg-amber-50/50 flex justify-between items-center transition-colors"
                      >
                        <span className="flex items-center gap-3.5 text-base sm:text-lg font-serif">
                          <span className="w-8 h-8 rounded-xl bg-[#944426] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow">
                            {idx + 1}
                          </span>
                          {mod.moduleTitle}
                        </span>
                        {isOpen ? <ChevronUp size={20} className="text-[#944426]" /> : <ChevronDown size={20} className="text-stone-400" />}
                      </button>

                      {isOpen && mod.topics && mod.topics.length > 0 && (
                        <div className="p-6 bg-white border-t border-stone-200/80 space-y-3.5">
                          {mod.topics.map((top, tIdx) => (
                            <div key={tIdx} className="flex items-center gap-3 text-sm sm:text-base text-stone-700">
                              <span className="w-2 h-2 rounded-full bg-[#944426] shrink-0"></span>
                              <span className="font-medium">{top}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inclusions Card */}
            {pkg.features && pkg.features.length > 0 && (
              <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-stone-200/90 space-y-6">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E3A2B] border-b border-stone-200/80 pb-4">What's Included in Tuition</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {pkg.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3.5 bg-stone-50/80 p-5 rounded-2xl border border-stone-200/60">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={16} strokeWidth={2.5} />
                      </div>
                      <span className="text-sm sm:text-base text-stone-800 font-medium leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar 4-Cols Sticky Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-stone-200/90 space-y-6 sticky top-28">
              <h3 className="font-serif font-bold text-xl text-[#1E3A2B] border-b border-stone-200 pb-3">Enrollment Summary</h3>

              <div className="space-y-4 text-sm border-b border-stone-200 pb-6">
                <div className="flex justify-between items-center text-stone-700">
                  <span className="text-stone-500">Accreditation</span>
                  <span className="font-bold text-stone-900">Yoga Alliance RYT</span>
                </div>
                <div className="flex justify-between items-center text-stone-700">
                  <span className="text-stone-500">Tuition Fee</span>
                  <span className="font-bold text-stone-900">{priceFormatted}</span>
                </div>
                {discountFormatted && (
                  <div className="flex justify-between items-center text-stone-700">
                    <span className="text-stone-500">Special Offer</span>
                    <span className="font-extrabold text-emerald-700">{discountFormatted}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-stone-700">
                  <span className="text-stone-500">Studio Location</span>
                  <span className="font-bold text-stone-900">{metadata.location || 'Central Studio HK'}</span>
                </div>
              </div>

              <button
                onClick={() => onOpenBooking(pkg.type, pkg.title, pkg)}
                className="w-full bg-[#944426] hover:bg-[#7B351B] text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg text-sm sm:text-base flex items-center justify-center gap-2.5"
              >
                <Sparkles size={18} /> Apply for Teacher Training
              </button>

              <p className="text-xs text-stone-500 text-center leading-relaxed">
                Flexible installment plans available upon request.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Mobile Fixed Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#11241A] text-white p-4 sm:p-5 border-t border-amber-500/30 sm:hidden flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[11px] text-stone-400 uppercase tracking-wider block font-semibold">Tuition</span>
          <span className="font-serif font-bold text-xl text-amber-300">{discountFormatted || priceFormatted}</span>
        </div>
        <button
          onClick={() => onOpenBooking(pkg.type, pkg.title, pkg)}
          className="bg-[#944426] text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg active:scale-95"
        >
          <Sparkles size={16} /> Apply Now
        </button>
      </div>

    </div>
  );
};
