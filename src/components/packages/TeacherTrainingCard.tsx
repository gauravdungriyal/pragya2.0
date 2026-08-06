import React, { useState } from 'react';
import { Award, Calendar, BookOpen, Check, ArrowRight, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { DynamicPackage } from '../../types';

interface TeacherTrainingCardProps {
  pkg: DynamicPackage;
  onBook: (pkg: DynamicPackage) => void;
  onOpenDetails: (pkg: DynamicPackage) => void;
}

export const TeacherTrainingCard: React.FC<TeacherTrainingCardProps> = ({ pkg, onBook, onOpenDetails }) => {
  const [showSyllabus, setShowSyllabus] = useState(false);
  const metadata = pkg.metadata || {};

  return (
    <div className="relative group bg-gradient-to-b from-amber-950/20 via-neutral-900/90 to-neutral-950 border border-amber-500/30 hover:border-amber-400 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
      {/* Top Banner Tag */}
      <div className="absolute top-4 right-4 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-lg">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          {pkg.badge || metadata.certification || 'Certified TTC'}
        </span>
      </div>

      <div>
        {/* Cover Image Header */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={pkg.coverImage || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1000&q=80'}
            alt={pkg.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
          
          <div className="absolute bottom-4 left-6 right-6">
            <span className="text-amber-400/90 text-xs font-semibold tracking-widest uppercase flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Teacher Training Program
            </span>
            <h3 className="text-2xl font-serif font-semibold text-white tracking-tight leading-tight">
              {pkg.title}
            </h3>
            {pkg.subtitle && (
              <p className="text-xs text-amber-200/80 font-light mt-1">
                {pkg.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Batch Dates & Hours info bar */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/20 text-xs">
            <div className="flex items-center gap-2 text-amber-200">
              <Calendar className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <span className="block text-[10px] uppercase text-amber-400/70">Batch Dates</span>
                <span className="font-medium text-white">{metadata.batchDates || 'Upcoming Intake'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-amber-200">
              <BookOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <span className="block text-[10px] uppercase text-amber-400/70">Accreditation</span>
                <span className="font-medium text-white">{metadata.totalHours || 200} Hours RYT</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-neutral-300 font-light leading-relaxed">
            {pkg.description}
          </p>

          {/* Key Deliverables */}
          {pkg.features && pkg.features.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/80">Program Highlights</span>
              <ul className="space-y-2">
                {pkg.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-200">
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Syllabus Expandable Section */}
          {metadata.syllabus && metadata.syllabus.length > 0 && (
            <div className="border-t border-amber-500/20 pt-4">
              <button
                onClick={() => setShowSyllabus(!showSyllabus)}
                className="w-full flex items-center justify-between text-xs font-medium text-amber-300 hover:text-amber-200 transition-colors"
              >
                <span>Curriculum &amp; Modules ({metadata.syllabus.length} Modules)</span>
                {showSyllabus ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showSyllabus && (
                <div className="mt-3 space-y-2.5 animate-fadeIn">
                  {metadata.syllabus.map((mod, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-neutral-900/80 border border-amber-500/10 text-xs">
                      <span className="font-medium text-amber-200 block mb-1">{mod.moduleTitle}</span>
                      <ul className="pl-3 space-y-1 list-disc text-neutral-400 text-[11px]">
                        {mod.topics.map((t, tidx) => (
                          <li key={tidx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pricing & Footer Actions */}
      <div className="p-6 pt-0 border-t border-amber-500/10 mt-4 space-y-4">
        <div className="flex items-baseline justify-between pt-4">
          <div>
            <span className="text-xs uppercase text-neutral-400 block">Course Tuition</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-amber-300">
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
            className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-4"
          >
            View Details
          </button>
        </div>

        <button
          onClick={() => onBook(pkg)}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-neutral-950 font-semibold text-sm shadow-lg shadow-amber-950/50 hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 group"
        >
          <span>Apply for Teacher Training</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
