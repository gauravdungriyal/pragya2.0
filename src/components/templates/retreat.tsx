import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, MapPin, Calendar, Sparkles, CheckCircle2, Award, ShieldCheck, ShoppingBag, Heart, Compass, Utensils, Home, Sun } from 'lucide-react';
import { DynamicPackage, BundleItem } from '../../types';
import { getPackageDetail, getRelatedBundlesForPackage, cleanHtmlEntities, isTitleCompatible, toggleEventFavorite } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FrequentlyBoughtTogether } from '../FrequentlyBoughtTogether';

interface RetreatTemplateProps {
  pkg: DynamicPackage;
  onBack: () => void;
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  isPreview?: boolean;
}

export const RetreatTemplate: React.FC<RetreatTemplateProps> = ({
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
    burgundy: '#620513',   // Deep Wine Burgundy
    deepBg: '#00381F',     // Deep Forest Green
    mainBg: '#FAF4F4',     // Soft Rose Vanilla Cream
    textColor: '#000000',  // Black Text
    highlight: '#D9AE29'   // Golden Amber
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

  const rawPriceStr = String(activeAmount || '4500')
    .replace(/₹|INR|Rs\.?/gi, '')
    .replace(/HK\$\s*/gi, '')
    .trim();
  const numericPrice = parseFloat(rawPriceStr.replace(/[^0-9.]/g, '')) || 4500;
  const displayPrice = `HK$ ${numericPrice.toLocaleString()}`;

  const cleanDescription = cleanHtmlEntities(
    (isDetailMatching && packageDetail?.description) ? packageDetail.description : (pkg.description || 'Immerse yourself in a transformative 3-day sanctuary wellness retreat with organic gourmet meals, daily meditation, spinal alignment labs, and nature sound baths.')
  );

  const coverImage = pkg.coverImage || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1600&auto=format&fit=crop';
  const displayVenue = pkg.metadata?.venue || pkg.metadata?.location || 'Himalayan Sanctuary Resort';
  const displayTime = (isDetailMatching && packageDetail?.duration_label) || (pkg as any).duration_label || '3 Days / 2 Nights All-Inclusive';

  const handleFavoriteClick = async () => {
    if (!user) {
      alert("Please login to save this retreat.");
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
      category: 'Retreat',
      coverImage
    });
  };

  const retreatItinerary = [
    {
      day: 'DAY 01',
      title: 'Arrival & Welcome Sunset Ceremony',
      desc: 'Sanctuary check-in, organic welcome dinner, opening chanting circle, and gentle restorative evening yoga.'
    },
    {
      day: 'DAY 02',
      title: 'Spinal Alignment & Nature Sound Bath',
      desc: 'Sunrise Pranayama, intensive posture diagnostics lab, herbal lunch, and evening Himalayan bowl sound bath.'
    },
    {
      day: 'DAY 03',
      title: 'Himalayan Gratitude Practice & Closing',
      desc: 'Dawn breathwork, personal stretch routine consultation, closing ceremony, and graduation certificate presentation.'
    }
  ];

  const featuresList = (isDetailMatching && packageDetail?.features) || pkg.features || [
    'Luxury eco-lodge accommodation included',
    'Organic gourmet sattvic meals & herbal teas',
    'Daily sunrise & sunset meditation sessions',
    'Postural alignment & spinal therapy labs',
    'Sound bath healing & nature walks',
    '1-on-1 personalized wellness consultation'
  ];

  return (
    <div style={{ backgroundColor: COLORS.mainBg, color: '#000000', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", minHeight: '100vh' }}>
      
      {isPreview && (
        <div className="sticky top-0 z-[1000] text-white px-6 py-3.5 font-semibold text-xs sm:text-sm text-center shadow-xl flex items-center justify-between border-b" style={{ backgroundColor: COLORS.burgundy, borderColor: COLORS.highlight }}>
          <div className="flex items-center gap-2.5 mx-auto">
            <span><strong>RETREAT PREVIEW MODE</strong> — Official Light Wellness Immersion Template.</span>
          </div>
          <button onClick={onBack} className="bg-stone-950 hover:bg-black text-amber-300 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow shrink-0">Close Preview</button>
        </div>
      )}

      {/* Top Header Navigation */}
      <nav style={{ backgroundColor: '#FFFFFF', borderBottom: `1px solid #EAD5D8`, padding: '16px 24px', position: 'sticky', top: 0, zIndex: 90, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#FAF4F4', color: '#000000',
              border: `1px solid #EAD5D8`, borderRadius: '999px',
              padding: '8px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s'
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
                width: '38px', height: '38px', borderRadius: '50%', border: `1px solid #EAD5D8`,
                backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              title="Save Retreat"
            >
              <Heart size={18} fill={isFavorited ? COLORS.burgundy : "none"} color={isFavorited ? COLORS.burgundy : "#000000"} />
            </button>
          </div>
        </div>
      </nav>

      {/* Light Sanctuary Hero Header */}
      <section style={{ backgroundColor: '#FAF4F4', borderBottom: '1px solid #EAD5D8', padding: '48px 24px 64px 24px' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          
          {/* Left Column */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: `1.5px solid ${COLORS.burgundy}`, color: '#000000', borderRadius: '999px', padding: '6px 16px', marginBottom: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', boxShadow: '0 2px 10px rgba(98, 5, 19, 0.08)' }}>
              <Compass size={15} color={COLORS.burgundy} />
              <span>ALL-INCLUSIVE SANCTUARY IMMERSION</span>
            </div>

            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 'clamp(34px, 4.5vw, 52px)', fontWeight: 600, color: '#000000', margin: '0 0 20px 0', lineHeight: 1.15 }}>
              {displayTitle}
            </h1>

            <p style={{ fontSize: '16px', color: '#000000', lineHeight: 1.7, margin: '0 0 28px 0', fontWeight: 400 }}>
              {cleanDescription}
            </p>

            {/* Fast Fact Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: '1px solid #EAD5D8', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: '#000000' }}>
                <Clock size={15} color={COLORS.burgundy} />
                <span>{displayTime}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: '1px solid #EAD5D8', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: '#000000' }}>
                <MapPin size={15} color={COLORS.burgundy} />
                <span>{displayVenue}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: '1px solid #EAD5D8', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: '#000000' }}>
                <Utensils size={15} color={COLORS.burgundy} />
                <span>Organic Dining</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: '1px solid #EAD5D8', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: '#000000' }}>
                <Home size={15} color={COLORS.burgundy} />
                <span>Eco-Lodge Included</span>
              </div>
            </div>

            {/* Investment Box with SINGLE Reserve Now button */}
            <div style={{ backgroundColor: '#FFFFFF', border: `1.5px solid ${COLORS.burgundy}`, borderRadius: '20px', padding: '24px', boxShadow: '0 12px 30px rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, display: 'block' }}>RETREAT INVESTMENT</span>
                <span style={{ fontSize: '36px', fontWeight: 800, color: '#000000' }}>{displayPrice}</span>
              </div>

              <div>
                <button
                  onClick={handleReserveNow}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    backgroundColor: COLORS.burgundy, color: '#FFFFFF', border: 'none', borderRadius: '14px',
                    padding: '14px 32px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(98, 5, 19, 0.3)', transition: 'all 0.2s'
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
            <div style={{ borderRadius: '28px', overflow: 'hidden', border: '6px solid #FFFFFF', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', position: 'relative' }}>
              <img
                src={coverImage}
                alt={displayTitle}
                style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)', borderRadius: '18px', padding: '18px 20px', border: '1px solid #EAD5D8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <Sun size={18} color={COLORS.burgundy} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.06em' }}>SANCTUARY IMMERSION</span>
                </div>
                <span style={{ fontSize: '12px', color: '#000000', lineHeight: 1.5, display: 'block', fontWeight: 500 }}>
                  3-day luxury eco-lodge wellness experience with sound bath healing & 1-on-1 posture therapy.
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Specifications & Badges Bar */}
      {((isDetailMatching && packageDetail?.benefit) || (pkg as any).benefit) && (
        <section style={{ backgroundColor: '#FFFFFF', padding: '24px', borderBottom: '1px solid #EAD5D8' }}>
          <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#FAF4F4', padding: '16px 20px', borderRadius: '16px', border: '1px solid #EAD5D8' }}>
              <Award size={22} color={COLORS.burgundy} />
              <div>
                <span style={{ fontSize: '11px', color: '#000000', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>RETREAT BENEFIT</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#000000' }}>{(isDetailMatching && packageDetail?.benefit) || (pkg as any).benefit}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#FAF4F4', padding: '16px 20px', borderRadius: '16px', border: '1px solid #EAD5D8' }}>
              <ShieldCheck size={22} color={COLORS.burgundy} />
              <div>
                <span style={{ fontSize: '11px', color: '#000000', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>CLASS ACCESS</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#000000' }}>{(isDetailMatching && packageDetail?.class_access) || (pkg as any).class_access || 'Retreat Sanctuary'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#FAF4F4', padding: '16px 20px', borderRadius: '16px', border: '1px solid #EAD5D8' }}>
              <Clock size={22} color={COLORS.burgundy} />
              <div>
                <span style={{ fontSize: '11px', color: '#000000', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>DURATION</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#000000' }}>{(isDetailMatching && packageDetail?.duration_label) || (pkg as any).duration_label || '3 Days / 2 Nights'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#FAF4F4', padding: '16px 20px', borderRadius: '16px', border: '1px solid #EAD5D8' }}>
              <Sparkles size={22} color={COLORS.burgundy} />
              <div>
                <span style={{ fontSize: '11px', color: '#000000', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>PASS TYPE</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#000000' }}>{(isDetailMatching && packageDetail?.access_label) || (pkg as any).access_label || 'Retreat Pass'}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Retreat Daily Itinerary Grid */}
      <section style={{ padding: '64px 24px', maxWidth: '1180px', margin: '0 auto' }}>
        <div style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 700, color: '#000000', letterSpacing: '0.14em', marginBottom: '8px' }}>
          IMMERSION ITINERARY
        </div>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: '32px', fontWeight: 600, color: '#000000', margin: '0 0 36px 0' }}>
          Retreat Schedule & Daily Flow
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {retreatItinerary.map((item, idx) => (
            <div key={idx} style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAD5D8', borderRadius: '20px', padding: '28px', boxShadow: '0 6px 20px rgba(0,0,0,0.03)' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', backgroundColor: COLORS.burgundy, padding: '4px 14px', borderRadius: '999px', textTransform: 'uppercase', display: 'inline-block', marginBottom: '16px' }}>
                {item.day}
              </span>
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
      <section style={{ backgroundColor: '#FFFFFF', padding: '64px 24px', borderTop: '1px solid #EAD5D8', borderBottom: '1px solid #EAD5D8' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 700, color: '#000000', letterSpacing: '0.14em', marginBottom: '8px' }}>
            ALL-INCLUSIVE EXPERIENCE
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: '32px', fontWeight: 600, color: '#000000', margin: '0 0 36px 0' }}>
            Everything Included In Your Retreat Pass
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {featuresList.map((feat: string, idx: number) => (
              <div key={idx} style={{ backgroundColor: '#FAF4F4', border: '1px solid #EAD5D8', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <CheckCircle2 size={22} color={COLORS.burgundy} style={{ flexShrink: 0 }} />
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
      <div style={{ position: 'sticky', bottom: 0, zIndex: 100, backgroundColor: '#FFFFFF', borderTop: '1.5px solid #EAD5D8', padding: '16px 24px', boxShadow: '0 -10px 30px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ color: '#000000', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', fontWeight: 700 }}>WELLNESS IMMERSION RETREAT</span>
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
                backgroundColor: COLORS.burgundy, color: '#FFFFFF',
                border: 'none', borderRadius: '999px', padding: '12px 32px',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(98, 5, 19, 0.3)'
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

export default RetreatTemplate;
