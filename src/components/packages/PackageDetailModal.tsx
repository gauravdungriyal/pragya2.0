import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Award, Check, Compass, Users, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { DynamicPackage } from '../../types';

interface PackageDetailModalProps {
  pkg: DynamicPackage | null;
  onClose: () => void;
  onBook: (pkg: DynamicPackage) => void;
}

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({ pkg, onClose, onBook }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!pkg) return null;

  const metadata = pkg.metadata || {};
  const gallery = pkg.gallery || (pkg.coverImage ? [pkg.coverImage] : []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-neutral-950/70 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto p-6 md:p-8 space-y-8 flex-1">
          {/* Header & Main Image */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pkg.type.replace('_', ' ')}
              </span>
              {pkg.badge && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {pkg.badge}
                </span>
              )}
            </div>

            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-white tracking-tight">
              {pkg.title}
            </h2>

            {pkg.subtitle && (
              <p className="text-sm md:text-base text-neutral-300 font-light">
                {pkg.subtitle}
              </p>
            )}

            {/* Main Cover Image */}
            <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden border border-neutral-800">
              <img
                src={selectedImage || pkg.coverImage || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80'}
                alt={pkg.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Gallery Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      (selectedImage || pkg.coverImage) === img ? 'border-amber-400 scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 text-xs">
            {metadata.batchDates && (
              <div className="space-y-1">
                <span className="text-neutral-500 uppercase text-[10px] block">Dates / Schedule</span>
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {metadata.batchDates}
                </span>
              </div>
            )}
            {metadata.eventDate && (
              <div className="space-y-1">
                <span className="text-neutral-500 uppercase text-[10px] block">Event Date</span>
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {metadata.eventDate}
                </span>
              </div>
            )}
            {metadata.location && (
              <div className="space-y-1">
                <span className="text-neutral-500 uppercase text-[10px] block">Location</span>
                <span className="text-white font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {metadata.location}
                </span>
              </div>
            )}
            {metadata.certification && (
              <div className="space-y-1">
                <span className="text-neutral-500 uppercase text-[10px] block">Certification</span>
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  {metadata.certification}
                </span>
              </div>
            )}
          </div>

          {/* Detailed Overview */}
          <div className="space-y-3">
            <h3 className="text-lg font-serif font-semibold text-white">About this Offering</h3>
            <p className="text-sm text-neutral-300 font-light leading-relaxed whitespace-pre-line">
              {pkg.description}
            </p>
          </div>

          {/* Included Features */}
          {pkg.features && pkg.features.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-serif font-semibold text-white">What is Included</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pkg.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-950/40 border border-neutral-800 text-xs text-neutral-200">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Itinerary Section if available */}
          {metadata.itinerary && metadata.itinerary.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-serif font-semibold text-white">Day-by-Day Itinerary</h3>
              <div className="space-y-3">
                {metadata.itinerary.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase text-[10px]">{item.day}</span>
                      <span className="font-semibold text-white text-sm">{item.title}</span>
                    </div>
                    <p className="text-neutral-400 font-light pl-1">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Syllabus Section if available */}
          {metadata.syllabus && metadata.syllabus.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-serif font-semibold text-white">Full Curriculum Syllabus</h3>
              <div className="space-y-3">
                {metadata.syllabus.map((mod, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-2 text-xs">
                    <span className="font-semibold text-amber-300 text-sm block">{mod.moduleTitle}</span>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pl-4 list-disc text-neutral-300">
                      {mod.topics.map((t, tidx) => (
                        <li key={tidx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-6 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase text-neutral-400 block">Total Investment</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-white">
                {pkg.currency}{pkg.discountPrice || pkg.price}
              </span>
              {pkg.discountPrice && (
                <span className="text-sm line-through text-neutral-500">
                  {pkg.currency}{pkg.price}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-sm font-medium transition-colors"
            >
              Close
            </button>

            <button
              onClick={() => {
                onClose();
                onBook(pkg);
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-semibold text-sm shadow-lg shadow-amber-950/50 flex items-center gap-2"
            >
              <span>Book / Reserve Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
