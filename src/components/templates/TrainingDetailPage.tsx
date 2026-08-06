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
    { moduleTitle: 'Module 1: Alignment & Biomechanics', topics: ['Asana Postures', 'Hands-on Adjustments', 'Injury Prevention'] },
    { moduleTitle: 'Module 2: Pranayama & Subtle Energy', topics: ['Breath Control', 'Nadis & Chakras', 'Bandhas'] },
    { moduleTitle: 'Module 3: Yogic Philosophy & Ethics', topics: ['Patanjali Yoga Sutras', 'Bhagavad Gita Study', 'Teaching Methodology'] }
  ];

  const priceFormatted = `${pkg.currency || 'HK$'} ${pkg.price.toLocaleString()}`;
  const discountFormatted = pkg.discountPrice ? `${pkg.currency || 'HK$'} ${pkg.discountPrice.toLocaleString()}` : null;
  const coverImage = pkg.coverImage || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1600&auto=format&fit=crop';

  return (
    <div className="min-h-screen bg-[#F5EFE5] text-[#21201E] pb-28 sm:pb-36">
      
      {/* Optional Admin Preview Banner */}
      {isPreview && (
        <div className="sticky top-0 z-[1000] bg-gradient-to-r from-[#944426] via-[#B85732] to-[#944426] text-white px-4 py-3 font-semibold text-xs sm:text-sm text-center shadow-lg flex items-center justify-between">
          <div className="flex items-center justify-center gap-2 mx-auto">
            <Award size={16} />
            <span><strong>TEACHER TRAINING PREVIEW MODE</strong> — Displayed in RYT Accreditation Layout.</span>
          </div>
          <button onClick={onBack} className="bg-stone-950 text-amber-300 text-xs px-3 py-1.5 rounded-lg">Close Preview</button>
        </div>
      )}

      {/* Navigation Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#944426] hover:text-[#7B351B] uppercase tracking-widest transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Courses</span>
        </button>

        <button
          onClick={() => setSaved(!saved)}
          className={`p-2.5 rounded-full border transition-all ${
            saved ? 'bg-[#944426] text-white border-[#944426]' : 'bg-white text-stone-600 border-stone-300'
          }`}
        >
          <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* ── Terracotta Hero Banner ──────────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#1E3A2B] via-[#11241A] to-[#3B1A10] text-[#F5EFE5] border border-[#C5A059]/40 p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Accreditations & Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  <Award size={14} />
                  {metadata.certification || 'Yoga Alliance RYT Certification'}
                </span>
                {pkg.badge && (
                  <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#944426] text-white shadow">
                    {pkg.badge}
                  </span>
                )}
              </div>

              {/* Course Title */}
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

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-amber-500/20 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5">
                  <Clock size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] uppercase tracking-wider">Total Duration</span>
                    <span className="font-medium text-stone-100">{metadata.totalHours ? `${metadata.totalHours} Hours` : '200 Hours RYT'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] uppercase tracking-wider">Upcoming Batch</span>
                    <span className="font-medium text-stone-100">{metadata.batchDates || 'Oct 15 – Nov 12, 2026'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Users size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] uppercase tracking-wider">Faculty</span>
                    <span className="font-medium text-stone-100">{metadata.instructorName || 'Master Teachers'}</span>
                  </div>
                </div>
              </div>

              {/* Price & CTA */}
              <div className="pt-4 flex flex-wrap items-center gap-6">
                <div>
                  <span className="text-xs text-stone-400 uppercase tracking-wider block">Course Tuition</span>
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
                  className="bg-gradient-to-r from-[#944426] to-[#B85732] hover:from-[#7B351B] hover:to-[#944426] text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 text-sm sm:text-base flex items-center gap-2"
                >
                  <Sparkles size={18} />
                  <span>Apply & Reserve Seat</span>
                </button>
              </div>

            </div>

            {/* Right Media */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden border border-amber-500/30 aspect-4/3 sm:aspect-16/10 lg:aspect-square shadow-2xl relative">
                <img src={coverImage} alt={pkg.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/20 text-xs text-white flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                  <span>Internationally Recognized Yoga Alliance Certificate</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Content Grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main 8 Cols */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Description */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200/80 space-y-4">
              <h2 className="font-serif text-2xl font-bold text-[#1E3A2B] flex items-center gap-2">
                <BookOpen size={20} className="text-[#944426]" /> Course Overview & Vision
              </h2>
              <div className="text-stone-700 leading-relaxed text-sm sm:text-base whitespace-pre-line space-y-4">
                {pkg.description}
              </div>
            </div>

            {/* Syllabus Accordion Modules */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200/80 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl font-bold text-[#1E3A2B]">Comprehensive Curriculum</h3>
                <span className="text-xs bg-[#944426]/10 text-[#944426] font-bold px-3 py-1 rounded-full uppercase">
                  {syllabus.length} Modules
                </span>
              </div>

              <div className="space-y-3">
                {syllabus.map((mod, idx) => {
                  const isOpen = expandedModule === idx;
                  return (
                    <div key={idx} className="border border-stone-200 rounded-2xl overflow-hidden transition-colors">
                      <button
                        onClick={() => setExpandedModule(isOpen ? null : idx)}
                        className="w-full p-4 sm:p-5 text-left font-semibold text-stone-900 bg-stone-50 hover:bg-amber-50/50 flex justify-between items-center"
                      >
                        <span className="flex items-center gap-3 text-sm sm:text-base font-serif">
                          <span className="w-7 h-7 rounded-xl bg-[#944426] text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {idx + 1}
                          </span>
                          {mod.moduleTitle}
                        </span>
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>

                      {isOpen && mod.topics && mod.topics.length > 0 && (
                        <div className="p-5 bg-white border-t border-stone-200 space-y-2.5">
                          {mod.topics.map((top, tIdx) => (
                            <div key={tIdx} className="flex items-center gap-2.5 text-xs sm:text-sm text-stone-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#944426]"></span>
                              <span>{top}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inclusions */}
            {pkg.features && pkg.features.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200/80 space-y-6">
                <h3 className="font-serif text-xl font-bold text-[#1E3A2B]">What's Included in Tuition</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pkg.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/60">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} />
                      </div>
                      <span className="text-xs sm:text-sm text-stone-800 font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-stone-200/80 space-y-6 sticky top-28">
              <h3 className="font-serif font-bold text-lg text-[#1E3A2B]">Enrollment Summary</h3>

              <div className="space-y-4 text-xs sm:text-sm border-t border-b border-stone-200 py-4">
                <div className="flex justify-between items-center text-stone-700">
                  <span className="text-stone-500">Accreditation</span>
                  <span className="font-semibold text-stone-900">Yoga Alliance RYT</span>
                </div>
                <div className="flex justify-between items-center text-stone-700">
                  <span className="text-stone-500">Tuition Fee</span>
                  <span className="font-semibold text-stone-900">{priceFormatted}</span>
                </div>
                {discountFormatted && (
                  <div className="flex justify-between items-center text-stone-700">
                    <span className="text-stone-500">Special Discount</span>
                    <span className="font-semibold text-emerald-700">{discountFormatted}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-stone-700">
                  <span className="text-stone-500">Location</span>
                  <span className="font-semibold text-stone-900">{metadata.location || 'Central Studio HK'}</span>
                </div>
              </div>

              <button
                onClick={() => onOpenBooking(pkg.type, pkg.title, pkg)}
                className="w-full bg-[#944426] hover:bg-[#7B351B] text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-md text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Sparkles size={16} /> Apply for Teacher Training
              </button>

              <p className="text-[11px] text-stone-500 text-center leading-relaxed">
                Flexible installment payment plans available upon request.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Mobile Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#11241A] text-white p-4 border-t border-amber-500/20 sm:hidden flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] text-stone-400 uppercase block">Tuition</span>
          <span className="font-serif font-bold text-lg text-amber-300">{discountFormatted || priceFormatted}</span>
        </div>
        <button
          onClick={() => onOpenBooking(pkg.type, pkg.title, pkg)}
          className="bg-[#944426] text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 shadow"
        >
          <Sparkles size={14} /> Apply Now
        </button>
      </div>

    </div>
  );
};
