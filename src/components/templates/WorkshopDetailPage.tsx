import React, { useEffect, useState } from 'react';
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
import { DynamicPackage, BundleItem, PackageItem } from '../../types';
import { getRelatedBundlesForPackage } from '../../services/api';
import { FrequentlyBoughtTogether } from '../FrequentlyBoughtTogether';
import { useCart } from '../../context/CartContext';

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
  const [bundles, setBundles] = useState<BundleItem[]>([]);
  const { addToCart } = useCart();
  const { metadata = {} } = pkg;

  useEffect(() => {
    let isMounted = true;
    getRelatedBundlesForPackage(pkg?.id, pkg?.title).then((list) => {
      if (isMounted) {
        setBundles(list);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [pkg?.id, pkg?.title]);

  const totalSeats = metadata.totalSeats || 20;
  const bookedSeats = metadata.bookedSeats || 16;
  const remainingSeats = Math.max(0, totalSeats - bookedSeats);
  const progressPercent = Math.min(100, Math.round((bookedSeats / totalSeats) * 100));

  const priceFormatted = `${pkg.currency || 'HK$'} ${pkg.price.toLocaleString()}`;
  const discountFormatted = pkg.discountPrice ? `${pkg.currency || 'HK$'} ${pkg.discountPrice.toLocaleString()}` : null;
  const coverImage = pkg.coverImage || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1600&auto=format&fit=crop';

  return (
    <div className="min-h-screen bg-[#F5EFE5] text-[#21201E] pb-28 sm:pb-36">
      
      {/* Admin Preview Banner */}
      {isPreview && (
        <div className="sticky top-0 z-[1000] bg-gradient-to-r from-[#00381F] via-emerald-800 to-[#00381F] text-white px-6 py-3.5 font-semibold text-xs sm:text-sm text-center shadow-xl flex items-center justify-between border-b border-emerald-400/30">
          <div className="flex items-center gap-2.5 mx-auto">
            <Zap size={18} className="text-amber-400" />
            <span><strong>WORKSHOP PREVIEW MODE</strong> — Displayed in Specialist Masterclass Layout.</span>
          </div>
          <button onClick={onBack} className="bg-stone-950 hover:bg-black text-amber-300 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow shrink-0">Close Preview</button>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isPreview ? 'pt-8' : 'pt-24 sm:pt-28'} pb-6 flex items-center justify-between`}>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#00381F] hover:text-emerald-800 uppercase tracking-widest transition-all group py-2 px-3 rounded-xl hover:bg-[#00381F]/10"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Workshops</span>
        </button>

        <button
          onClick={() => setSaved(!saved)}
          className={`p-3 rounded-2xl border transition-all ${
            saved ? 'bg-[#00381F] text-white border-[#00381F] shadow-md' : 'bg-white text-stone-600 border-stone-300 hover:border-stone-400'
          }`}
          title={saved ? 'Bookmarked' : 'Bookmark Workshop'}
        >
          <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Hero Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
        
        {/* Forest Green Hero Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#00381F] via-[#11241A] to-[#0A1811] text-[#F5EFE5] border border-emerald-500/30 p-6 sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 backdrop-blur-sm">
                  <Zap size={15} />
                  Specialist Masterclass
                </span>
                {pkg.badge && (
                  <span className="px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-600 text-stone-950 shadow-lg">
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

              {/* Live Seats Progress Bar */}
              <div className="bg-emerald-950/80 border border-emerald-500/30 p-5 rounded-2xl space-y-2.5">
                <div className="flex justify-between text-xs sm:text-sm font-semibold">
                  <span className="text-emerald-300 flex items-center gap-2">
                    <Users size={16} /> Seat Capacity Status
                  </span>
                  <span className="text-amber-300 font-bold">
                    {remainingSeats > 0 ? `Only ${remainingSeats} Seats Left!` : 'Sold Out!'}
                  </span>
                </div>
                <div className="w-full bg-emerald-900/60 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>

              {/* Meta Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-6 border-t border-emerald-500/20 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <Calendar size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] uppercase tracking-wider font-semibold mb-0.5">Date & Time</span>
                    <span className="font-bold text-stone-100 text-sm sm:text-base">{metadata.eventDate || 'Saturday Workshop'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] uppercase tracking-wider font-semibold mb-0.5">Duration</span>
                    <span className="font-bold text-stone-100 text-sm sm:text-base">{metadata.eventTime || '3 Hours Intensive'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] uppercase tracking-wider font-semibold mb-0.5">Venue</span>
                    <span className="font-bold text-stone-100 text-sm sm:text-base">{metadata.venue || 'Central Studio HK'}</span>
                  </div>
                </div>
              </div>

              {/* Price & CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <span className="text-xs text-stone-400 uppercase tracking-widest font-semibold block mb-1">Workshop Fee</span>
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
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-stone-950 font-bold px-8 py-4 rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 text-sm sm:text-base flex items-center justify-center gap-2.5"
                >
                  <Sparkles size={20} />
                  <span>Reserve Workshop Seat</span>
                </button>
              </div>

            </div>

            {/* Right Media */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden border border-emerald-500/30 aspect-4/3 sm:aspect-16/10 lg:aspect-square shadow-2xl relative">
                <img src={coverImage} alt={pkg.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-5 left-5 right-5 bg-black/75 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs sm:text-sm text-white flex items-center gap-3 shadow-lg">
                  <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
                  <span className="font-medium">Led by Senior Master Practitioner</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-stone-200/90 space-y-6">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#00381F] border-b border-stone-200/80 pb-4">Workshop Details & Agenda</h2>
              <div className="text-stone-700 leading-relaxed text-base sm:text-lg whitespace-pre-line space-y-4">
                {pkg.description}
              </div>
            </div>

            {pkg.features && pkg.features.length > 0 && (
              <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-stone-200/90 space-y-6">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#00381F] border-b border-stone-200/80 pb-4">Key Masterclass Takeaways</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {pkg.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3.5 bg-stone-50/80 p-5 rounded-2xl border border-stone-200/60">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 size={16} strokeWidth={2.5} />
                      </div>
                      <span className="text-sm sm:text-base text-stone-800 font-medium leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Frequently Bought Together Bundle Section */}
            {bundles && bundles.length > 0 && (
              <FrequentlyBoughtTogether
                bundles={bundles}
                packageTitle={pkg.title}
                  onSelectBundle={(bundle, selectedPackageIds) => {
                    onOpenBooking('bundle', bundle.name, {
                      bundle_id: bundle.id,
                      package_ids: selectedPackageIds,
                      price: bundle.final_price || bundle.discounted_price,
                    });
                  }}
                  onAddToCartBundle={(bundle, selectedItems) => {
                    const packageIds = (selectedItems && selectedItems.length > 0)
                      ? selectedItems.map((p) => p.id)
                      : (bundle.packages || []).map((p) => p.id);

                    const allPkgs = bundle.packages || [];
                    const selPkgs = allPkgs.filter((p) => packageIds.map(String).includes(String(p.id)));
                    const origPriceSum = selPkgs.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
                    const isAllSel = selPkgs.length === allPkgs.length && allPkgs.length > 0;
                    const bDiscount = Number(bundle.bundle_discount || bundle.discount_value || bundle.savings || 0);

                    const finalPrice = (isAllSel && bDiscount > 0)
                      ? Math.max(0, origPriceSum - bDiscount)
                      : (bundle.final_price || bundle.discounted_price || origPriceSum);

                    addToCart({
                      id: `bundle-${bundle.id}`,
                      title: `${bundle.name} (Special Bundle)`,
                      price: Number(finalPrice) || 0,
                      originalPrice: (isAllSel && bDiscount > 0 && origPriceSum > finalPrice) ? origPriceSum : undefined,
                      bundle_id: bundle.id,
                      package_ids: packageIds,
                      category: 'Special Bundles',
                      coverImage: selPkgs[0]?.coverImage || selPkgs[0]?.image || bundle.image,
                    });
                  }}
                />
              )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-stone-200/90 space-y-6 sticky top-28">
              <h3 className="font-serif font-bold text-xl text-[#00381F] border-b border-stone-200 pb-3">Workshop Summary</h3>

              <div className="space-y-4 text-sm border-b border-stone-200 pb-6">
                <div className="flex justify-between items-center text-stone-700">
                  <span className="text-stone-500">Instructor</span>
                  <span className="font-bold text-stone-900">{metadata.instructorName || 'Senior Master'}</span>
                </div>
                <div className="flex justify-between items-center text-stone-700">
                  <span className="text-stone-500">Workshop Fee</span>
                  <span className="font-bold text-stone-900">{priceFormatted}</span>
                </div>
                <div className="flex justify-between items-center text-stone-700">
                  <span className="text-stone-500">Capacity</span>
                  <span className="font-extrabold text-emerald-700">{remainingSeats} Seats Left</span>
                </div>
              </div>

              <button
                onClick={() => onOpenBooking(pkg.type, pkg.title, pkg)}
                className="w-full bg-[#00381F] hover:bg-emerald-900 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg text-sm sm:text-base flex items-center justify-center gap-2.5"
              >
                <Sparkles size={18} /> Book Workshop Seat
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A1811] text-white p-4 sm:p-5 border-t border-emerald-500/30 sm:hidden flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[11px] text-stone-400 uppercase tracking-wider block font-semibold">Workshop Fee</span>
          <span className="font-serif font-bold text-xl text-amber-300">{discountFormatted || priceFormatted}</span>
        </div>
        <button
          onClick={() => onOpenBooking(pkg.type, pkg.title, pkg)}
          className="bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg active:scale-95"
        >
          <Sparkles size={16} /> Book Seat
        </button>
      </div>

    </div>
  );
};
