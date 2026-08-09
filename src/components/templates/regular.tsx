import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, MapPin, Calendar, Sparkles, CheckCircle2, Zap, Award, ShieldCheck, ShoppingBag, Heart, Sun, Layers } from 'lucide-react';
import { DynamicPackage, BundleItem } from '../../types';
import { getPackageDetail, getRelatedBundlesForPackage, cleanHtmlEntities, isTitleCompatible, toggleEventFavorite } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FrequentlyBoughtTogether } from '../FrequentlyBoughtTogether';

interface RegularTemplateProps {
  pkg: DynamicPackage;
  onBack: () => void;
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  isPreview?: boolean;
}

export const RegularTemplate: React.FC<RegularTemplateProps> = ({
  pkg,
  onBack,
  onOpenBooking,
  isPreview = false
}) => {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [packageDetail, setPackageDetail] = useState<any>(null);
  const [bundles, setBundles] = useState<BundleItem[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);

  // Official Brand Palette Colors
  const COLORS = {
    detail1: '#944426',    // Terracotta / Rust
    sectionBg: '#9D9D48',  // Earthy Sage Green
    detail2: '#620513',    // Deep Burgundy
    deepBg: '#00381F',     // Deep Forest Green
    mainBg: '#F5EFE5',     // Warm Vanilla Cream
    textColor: '#000000',  // Black Text
    highlight: '#FFFFFF'   // Pure White Text & Icons
  };

  useEffect(() => {
    let isMounted = true;

    if (pkg?.id) {
      getPackageDetail(pkg.id).then((data) => {
        if (isMounted && data) {
          setPackageDetail(data);
          if (data.frequently_bought_together && Array.isArray(data.frequently_bought_together)) {
            setBundles(data.frequently_bought_together);
          }
        }
      }).catch((err) => console.error("getPackageDetail error:", err));

      getRelatedBundlesForPackage(pkg.id, pkg.title).then((list) => {
        if (isMounted) {
          setBundles((prev) => (prev && prev.length > 0 ? prev : list));
        }
      }).catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [pkg?.id, pkg?.title]);

  const isDetailMatching = Boolean(
    packageDetail &&
    packageDetail.title &&
    isTitleCompatible(pkg.title, packageDetail.title)
  );

  const displayTitle = isDetailMatching && packageDetail?.title ? packageDetail.title : pkg.title;
  const activeAmount = isDetailMatching && packageDetail?.amount ? packageDetail.amount : ((pkg as any).amount || pkg.price);

  const rawPriceStr = String(activeAmount || '800')
    .replace(/₹|INR|Rs\.?/gi, '')
    .replace(/HK\$\s*/gi, '')
    .trim();
  const numericPrice = parseFloat(rawPriceStr.replace(/[^0-9.]/g, '')) || 800;
  const displayPrice = `HK$ ${numericPrice.toLocaleString()}`;

  const cleanDescription = cleanHtmlEntities(
    (isDetailMatching && packageDetail?.description) ? packageDetail.description : (pkg.description || 'Flexible regular sanctuary class pass for daily yoga, posture alignment, and breathwork sessions. Suitable for all practitioners.')
  );

  const coverImage = pkg.coverImage || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1600&auto=format&fit=crop';
  const displayVenue = pkg.metadata?.venue || pkg.metadata?.location || 'Pragya Main Sanctuary Studio, HK';
  const displayTime = (isDetailMatching && packageDetail?.duration_label) || (pkg as any).duration_label || 'Flexible Class Schedule';

  const handleFavoriteClick = async () => {
    if (!user) {
      alert("Please login to save this class pass.");
      return;
    }
    setIsFavoriting(true);
    try {
      const token = (user as any).token || (user as any).jwt || '';
      const res = await toggleEventFavorite(token, String(pkg.id));
      if (res?.success) {
        setIsFavorited(!isFavorited);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleReserveNow = () => {
    addToCart({
      id: pkg.id,
      title: displayTitle,
      price: numericPrice,
      category: 'Regular',
      coverImage
    });
  };

  const regularClassHighlights = [
    {
      title: 'Daily Posture & Asana Flow',
      desc: 'Structured daily classes focused on spinal decompression, posture alignment, and mobility.'
    },
    {
      title: 'Breathwork & Pranayama Labs',
      desc: 'Guided breath control practices to reduce daily stress and rebalance the nervous system.'
    },
    {
      title: 'Flexible Class Scheduling',
      desc: 'Book morning or evening sanctuary slots at your convenience with valid pass duration.'
    },
    {
      title: 'All Skill Levels Welcome',
      desc: 'Personalized modifications provided for beginners to advanced practitioners by master instructors.'
    }
  ];

  const featuresList = (isDetailMatching && packageDetail?.features) || pkg.features || [
    'Access to regular daily yoga & posture classes',
    'Morning & evening flexible sanctuary slots',
    'Guided by certified senior yoga masters',
    'Sanctuary props, mats, and studio amenities included',
    'Valid for studio in-person & online live sessions',
    'Easy class rescheduling via student portal'
  ];

  return (
    <div style={{ backgroundColor: COLORS.mainBg, color: '#000000', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", minHeight: '100vh' }}>
      
      {isPreview && (
        <div className="sticky top-0 z-[1000] text-white px-6 py-3.5 font-semibold text-xs sm:text-sm text-center shadow-xl flex items-center justify-between border-b" style={{ backgroundColor: COLORS.deepBg, borderColor: COLORS.highlight }}>
          <div className="flex items-center gap-2.5 mx-auto">
            <span><strong>REGULAR CLASS PREVIEW MODE</strong> — Official Regular Sanctuary Template.</span>
          </div>
          <button onClick={onBack} className="bg-stone-950 hover:bg-black text-amber-300 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow shrink-0">Close Preview</button>
        </div>
      )}

      {/* Top Header Navigation */}
      <nav style={{ backgroundColor: COLORS.mainBg, borderBottom: `1px solid rgba(157, 157, 72, 0.25)`, padding: '16px 24px', position: 'sticky', top: '100px', marginTop: '100px', zIndex: 90, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#FFFFFF', color: '#000000',
              border: `1px solid ${COLORS.sectionBg}`, borderRadius: '999px',
              padding: '8px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', transition: 'all 0.2s'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleFavoriteClick}
              disabled={isFavoriting}
              style={{
                width: '38px', height: '38px', borderRadius: '50%', border: `1px solid ${COLORS.sectionBg}`,
                backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              title="Save Regular Pass"
            >
              <Heart size={18} fill={isFavorited ? COLORS.detail1 : "none"} color={isFavorited ? COLORS.detail1 : "#000000"} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '48px 24px 64px 24px', backgroundColor: COLORS.mainBg }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          
          {/* Left Column */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: COLORS.deepBg, color: COLORS.highlight, borderRadius: '8px', padding: '6px 14px', marginBottom: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              <Sun size={14} color={COLORS.highlight} />
              <span>REGULAR DAILY PRACTICE</span>
            </div>

            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 600, color: '#000000', margin: '0 0 20px 0', lineHeight: 1.15 }}>
              {displayTitle}
            </h1>

            <p style={{ fontSize: '16px', color: '#000000', lineHeight: 1.7, margin: '0 0 28px 0', fontWeight: 400 }}>
              {cleanDescription}
            </p>

            {/* Fast Fact Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: `1px solid ${COLORS.sectionBg}`, padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: '#000000' }}>
                <Clock size={15} color={COLORS.detail1} />
                <span>{displayTime}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: `1px solid ${COLORS.sectionBg}`, padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: '#000000' }}>
                <MapPin size={15} color={COLORS.detail1} />
                <span>{displayVenue}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: `1px solid ${COLORS.sectionBg}`, padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: '#000000' }}>
                <Layers size={15} color={COLORS.detail1} />
                <span>Sanctuary + Online Pass</span>
              </div>
            </div>

            {/* Investment Box with SINGLE Reserve Now button */}
            <div style={{ backgroundColor: '#FFFFFF', border: `2px solid ${COLORS.sectionBg}`, borderRadius: '20px', padding: '24px', boxShadow: '0 12px 30px rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, display: 'block' }}>CLASS PASS INVESTMENT</span>
                <span style={{ fontSize: '36px', fontWeight: 800, color: '#000000' }}>{displayPrice}</span>
              </div>

              <div>
                <button
                  onClick={handleReserveNow}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    backgroundColor: COLORS.deepBg, color: COLORS.highlight, border: 'none', borderRadius: '14px',
                    padding: '14px 32px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(0, 56, 31, 0.25)', transition: 'all 0.2s'
                  }}
                >
                  <ShoppingBag size={18} />
                  <span>Reserve Now</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column Cover Card */}
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: '28px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)', border: `6px solid #FFFFFF`, position: 'relative' }}>
              <img
                src={coverImage}
                alt={displayTitle}
                style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 60%)' }} />

              <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', backgroundColor: 'rgba(245, 239, 229, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '18px 20px', border: `1px solid ${COLORS.sectionBg}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.08em' }}>DAILY SANCTUARY ACCESS</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', backgroundColor: COLORS.detail1, padding: '3px 10px', borderRadius: '999px' }}>ACTIVE PASS</span>
                </div>
                <span style={{ fontSize: '12px', color: '#000000', fontWeight: 500 }}>Enjoy unlimited flexibility to attend morning & evening sanctuary yoga classes.</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Specifications & Badges Bar */}
      {((isDetailMatching && packageDetail?.benefit) || (pkg as any).benefit) && (
        <section style={{ backgroundColor: '#FFFFFF', padding: '24px', borderTop: `1px solid rgba(157, 157, 72, 0.25)`, borderBottom: `1px solid rgba(157, 157, 72, 0.25)` }}>
          <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: COLORS.mainBg, padding: '16px 20px', borderRadius: '16px', border: `1px solid ${COLORS.sectionBg}` }}>
              <Award size={22} color={COLORS.detail1} />
              <div>
                <span style={{ fontSize: '11px', color: '#000000', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>BENEFIT</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#000000' }}>{(isDetailMatching && packageDetail?.benefit) || (pkg as any).benefit}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: COLORS.mainBg, padding: '16px 20px', borderRadius: '16px', border: `1px solid ${COLORS.sectionBg}` }}>
              <ShieldCheck size={22} color={COLORS.detail1} />
              <div>
                <span style={{ fontSize: '11px', color: '#000000', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>CLASS ACCESS</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#000000' }}>{(isDetailMatching && packageDetail?.class_access) || (pkg as any).class_access || 'Regular Sanctuary'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: COLORS.mainBg, padding: '16px 20px', borderRadius: '16px', border: `1px solid ${COLORS.sectionBg}` }}>
              <Clock size={22} color={COLORS.detail1} />
              <div>
                <span style={{ fontSize: '11px', color: '#000000', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>DURATION</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#000000' }}>{(isDetailMatching && packageDetail?.duration_label) || (pkg as any).duration_label || '1 Month Pass'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: COLORS.mainBg, padding: '16px 20px', borderRadius: '16px', border: `1px solid ${COLORS.sectionBg}` }}>
              <Sparkles size={22} color={COLORS.detail1} />
              <div>
                <span style={{ fontSize: '11px', color: '#000000', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>PASS TYPE</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#000000' }}>{(isDetailMatching && packageDetail?.access_label) || (pkg as any).access_label || 'Regular Pass'}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Regular Practice Highlights Grid */}
      <section style={{ padding: '64px 24px', maxWidth: '1180px', margin: '0 auto' }}>
        <div style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 700, color: '#000000', letterSpacing: '0.12em', marginBottom: '8px' }}>
          REGULAR PRACTICE BENEFITS
        </div>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: '32px', fontWeight: 600, color: '#000000', margin: '0 0 36px 0' }}>
          Why Join Pragya Regular Classes
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          {regularClassHighlights.map((item, idx) => (
            <div key={idx} style={{ backgroundColor: '#FFFFFF', border: `1px solid ${COLORS.sectionBg}`, borderRadius: '20px', padding: '28px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(157, 157, 72, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <CheckCircle2 size={20} color="#000000" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#000000', margin: '0 0 12px 0', lineHeight: 1.35 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#000000', lineHeight: 1.6, margin: 0, fontWeight: 400 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Inclusions Checklist */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '64px 24px', borderTop: `1px solid rgba(157, 157, 72, 0.25)`, borderBottom: `1px solid rgba(157, 157, 72, 0.25)` }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 700, color: '#000000', letterSpacing: '0.12em', marginBottom: '8px' }}>
            WHAT IS INCLUDED
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: '32px', fontWeight: 600, color: '#000000', margin: '0 0 36px 0' }}>
            Regular Pass Features & Sanctuary Access
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {featuresList.map((feat: string, idx: number) => (
              <div key={idx} style={{ backgroundColor: COLORS.mainBg, border: `1px solid ${COLORS.sectionBg}`, borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <CheckCircle2 size={22} color={COLORS.deepBg} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '15px', fontWeight: 500, color: '#000000' }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Bought Together Bundles */}
      {bundles && bundles.length > 0 && (
        <section style={{ padding: '64px 24px', maxWidth: '1180px', margin: '0 auto' }}>
          <FrequentlyBoughtTogether
            bundles={bundles}
            packageTitle={displayTitle}
            onSelectBundle={(b) => onOpenBooking('bundle', b.name, b)}
            onAddToCartBundle={(b) => {
              addToCart({
                id: `bundle-${b.id}`,
                title: b.name,
                price: b.final_price || b.discounted_price || b.original_price,
                category: 'Bundle',
                coverImage
              });
            }}
          />
        </section>
      )}

      {/* Sticky Bottom Booking Bar with SINGLE Reserve Now button */}
      <div style={{ position: 'sticky', bottom: 0, zIndex: 100, backgroundColor: '#FFFFFF', borderTop: `1px solid ${COLORS.sectionBg}`, padding: '16px 24px', boxShadow: '0 -10px 30px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ color: '#000000', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', fontWeight: 700 }}>REGULAR SANCTUARY CLASS PASS</span>
            <span style={{ color: '#000000', fontSize: '18px', fontWeight: 700 }}>{displayTitle}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#000000' }}>
              {displayPrice}
            </span>
            <button
              onClick={handleReserveNow}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                backgroundColor: COLORS.deepBg, color: COLORS.highlight,
                border: 'none', borderRadius: '999px', padding: '12px 32px',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0, 56, 31, 0.3)'
              }}
            >
              <ShoppingBag size={16} />
              <span>Reserve Now</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RegularTemplate;
