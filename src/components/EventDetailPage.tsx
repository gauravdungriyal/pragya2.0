import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Check, ArrowRight, ShieldCheck, Sparkles, Clock, BarChart2, MapPin, Heart, CheckCircle2 } from 'lucide-react';
import { UpcomingEvent, BundleItem, PackageItem } from '../types';
import { getUpcomingEvents, toggleEventFavorite, getRelatedBundlesForPackage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FrequentlyBoughtTogether } from './FrequentlyBoughtTogether';

interface EventDetailPageProps {
  event: UpcomingEvent;
  onBack: () => void;
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  onSelectEvent?: (event: UpcomingEvent) => void;
}

const splitEventTitle = (fullTitle: string) => {
  if (!fullTitle) return { titlePrefix: 'Mastering the Art of', titleMain: 'YOG PRACTICE' };
  const cleaned = fullTitle.trim();
  const parts = cleaned.split(' ');
  if (parts.length <= 2) {
    return { titlePrefix: 'Mastering the Art of', titleMain: cleaned };
  }
  const prefix = parts.slice(0, Math.ceil(parts.length / 2)).join(' ');
  const main = parts.slice(Math.ceil(parts.length / 2)).join(' ');
  return { titlePrefix: prefix, titleMain: main };
};

export const EventDetailPage: React.FC<EventDetailPageProps> = ({ event, onBack, onOpenBooking, onSelectEvent }) => {
  const [otherEvents, setOtherEvents] = useState<UpcomingEvent[]>([]);
  const [bundles, setBundles] = useState<BundleItem[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    let isMounted = true;
    getUpcomingEvents()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : [];
        const filtered = list.filter((e: UpcomingEvent) => String(e.id) !== String(event.id));
        setOtherEvents(filtered.slice(0, 3));
      })
      .catch((err) => {
        console.error("Failed fetching other events", err);
      });

    getRelatedBundlesForPackage(event?.id, event?.title || event?.name).then((list) => {
      if (isMounted) {
        setBundles(list);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [event?.id, event?.title, event?.name]);

  const coverImage = event.image || event.banner_image?.url || "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1600&auto=format&fit=crop";
  const title = event.title || event.name || 'Pragya Yog Masterclass';
  const { titlePrefix, titleMain } = splitEventTitle(title);
  const displayLevel = event.level || 'All Levels';
  const displayDuration = event.duration || '60 - 90 min';
  const displayFocus = event.focus || event.category || 'Mindful Movement & Posture';
  const displayPrice = event.price || 'HK$ 680';
  const displayLocation = event.location || 'Pragya Yog Studio';

  const numericPrice = typeof event.amount === 'number' && event.amount > 0 
    ? event.amount 
    : parseFloat(String(displayPrice).replace(/[^0-9.]/g, '')) || 680;

  const handleReserveNow = () => {
    addToCart({
      id: event.id,
      title,
      price: numericPrice,
      category: event.category || 'Event',
      coverImage
    });
  };

  const cleanDescText = (event.description || '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/&ndash;/g, '–')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .trim();

  // Extract a clean 2-3 line summary for the hero header
  const getHeroSummary = (text: string) => {
    if (!text) return 'Join our expert-led yoga masterclass to strengthen your core, improve posture, and cultivate deep breath awareness in a peaceful sanctuary.';
    let firstPart = text.split(/What You'll Learn|Part 1 Schedule|Session 1|Week 1|Schedule:/i)[0].trim();
    if (firstPart.length > 240) {
      const endDot = firstPart.indexOf('.', 120);
      if (endDot !== -1 && endDot <= 240) {
        firstPart = firstPart.slice(0, endDot + 1);
      } else {
        firstPart = firstPart.slice(0, 240).trim() + '...';
      }
    }
    return firstPart;
  };

  const heroSummary = getHeroSummary(cleanDescText);

  return (
    <div style={{ backgroundColor: '#F5EFE5', minHeight: '100vh', color: '#21201E', paddingBottom: '110px' }}>
      
      {/* Top Fixed Back Button Bar */}
      <div
        className="edp-back-bar"
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '95px 16px 16px 16px'
        }}
      >
        <button
          onClick={onBack}
          style={{
            fontFamily: "'Neue Montreal', -apple-system, sans-serif",
            backgroundColor: '#FFFFFF',
            color: '#21201E',
            border: '1.5px solid rgba(0, 0, 0, 0.12)',
            borderRadius: '999px',
            padding: '9px 18px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
            transition: 'all 0.25s ease'
          }}
        >
          <ArrowLeft size={15} />
          <span>Back to All Events</span>
        </button>
      </div>

      <div className="edp-main-content" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* SECTION 1: HERO HEADER */}
        <section
          style={{
            textAlign: 'center',
            padding: '24px 0 40px 0',
            maxWidth: '900px',
            margin: '0 auto'
          }}
        >
          <span
            style={{
              fontFamily: "'Neue Montreal', sans-serif",
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.18em',
              color: '#944426',
              textTransform: 'uppercase',
              display: 'inline-block',
              marginBottom: '14px',
              backgroundColor: 'rgba(148, 68, 38, 0.08)',
              padding: '5px 14px',
              borderRadius: '999px',
              border: '1px solid rgba(148, 68, 38, 0.15)',
            }}
          >
            PRAGYA YOG SERIES · LEVEL: {displayLevel.toUpperCase()}
          </span>

          <h1 style={{ margin: '0 0 20px 0', lineHeight: 1.08 }}>
            <span
              style={{
                display: 'block',
                fontFamily: "var(--font-serif)",
                fontStyle: 'italic',
                fontSize: 'clamp(28px, 4vw, 50px)',
                fontWeight: 400,
                color: '#21201E',
                marginBottom: '4px'
              }}
            >
              {titlePrefix}
            </span>
            <span
              style={{
                display: 'block',
                fontFamily: "'Neue Montreal', sans-serif",
                fontSize: 'clamp(34px, 5.5vw, 72px)',
                fontWeight: 800,
                color: '#21201E',
                letterSpacing: '-0.02em',
                textTransform: 'uppercase'
              }}
            >
              {titleMain}
            </span>
          </h1>

          <p
            style={{
              fontFamily: "'Neue Montreal', sans-serif",
              fontSize: '15px',
              color: '#4A4540',
              lineHeight: 1.65,
              maxWidth: '680px',
              margin: '0 auto 28px auto',
              fontWeight: 400,
              padding: '0 8px'
            }}
          >
            {heroSummary}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '32px', fontWeight: 800, color: '#944426' }}>
              {displayPrice}
            </span>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
            <button
              onClick={handleReserveNow}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, #944426, #C05F2F)', color: '#fff',
                border: 'none', borderRadius: '999px', padding: '14px 32px',
                fontSize: '14px', fontWeight: 800, letterSpacing: '0.04em', cursor: 'pointer',
                boxShadow: '0 6px 24px rgba(148,68,38,0.3)', transition: 'all 0.2s ease',
              }}
            >
              <Sparkles size={16} />
              <span>Reserve Now</span>
            </button>
            {user && (
              <button
                onClick={async () => {
                  if (favLoading) return;
                  setFavLoading(true);
                  const toggled = await toggleEventFavorite(user.access_token, event.id);
                  if (toggled) setIsFavorited((prev) => !prev);
                  setFavLoading(false);
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: isFavorited ? 'rgba(148,68,38,0.12)' : '#fff',
                  color: isFavorited ? '#944426' : '#5A5854',
                  border: `1.5px solid ${isFavorited ? 'rgba(148,68,38,0.35)' : 'rgba(0,0,0,0.15)'}`,
                  borderRadius: '999px', padding: '13px 22px',
                  fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                  opacity: favLoading ? 0.7 : 1,
                }}
              >
                <Heart size={15} fill={isFavorited ? '#944426' : 'none'} />
                {isFavorited ? 'Saved to Favorites' : 'Save Event'}
              </button>
            )}
          </div>

          {/* 2x2 Hero Stats Box */}
          <div
            className="edp-hero-stats-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
              border: '1.5px solid rgba(0, 0, 0, 0.06)',
              overflow: 'hidden',
              maxWidth: '520px',
              margin: '0 auto',
            }}
          >
            {/* Top-Left: Session */}
            <div style={{ textAlign: 'center', borderRight: '1px solid rgba(0, 0, 0, 0.08)', borderBottom: '1px solid rgba(0, 0, 0, 0.08)', padding: '14px 12px' }}>
              <span style={{ display: 'block', fontFamily: "'Neue Montreal', sans-serif", fontSize: '18px', fontWeight: 700, color: '#21201E', lineHeight: 1.2 }}>1</span>
              <span style={{ fontSize: '10px', color: '#7A756F', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px', display: 'block', fontWeight: 600 }}>SESSION</span>
            </div>

            {/* Top-Right: Duration */}
            <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(0, 0, 0, 0.08)', padding: '14px 12px' }}>
              <span style={{ display: 'block', fontFamily: "'Neue Montreal', sans-serif", fontSize: '17px', fontWeight: 700, color: '#21201E', lineHeight: 1.2 }}>{displayDuration}</span>
              <span style={{ fontSize: '10px', color: '#7A756F', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px', display: 'block', fontWeight: 600 }}>DURATION</span>
            </div>

            {/* Bottom-Left: Level */}
            <div style={{ textAlign: 'center', borderRight: '1px solid rgba(0, 0, 0, 0.08)', padding: '14px 12px' }}>
              <span style={{ display: 'block', fontFamily: "'Neue Montreal', sans-serif", fontSize: '16px', fontWeight: 700, color: '#21201E', lineHeight: 1.2 }}>{displayLevel.toUpperCase()}</span>
              <span style={{ fontSize: '10px', color: '#7A756F', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px', display: 'block', fontWeight: 600 }}>LEVEL</span>
            </div>

            {/* Bottom-Right: Sanctuary */}
            <div style={{ textAlign: 'center', padding: '14px 12px' }}>
              <span style={{ display: 'block', fontFamily: "'Neue Montreal', sans-serif", fontSize: '16px', fontWeight: 700, color: '#21201E', lineHeight: 1.2 }}>IN-PERSON</span>
              <span style={{ fontSize: '10px', color: '#7A756F', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px', display: 'block', fontWeight: 600 }}>SANCTUARY</span>
            </div>
          </div>
        </section>

        {/* SECTION 2: WHAT'S INSIDE */}
        <section style={{ padding: '56px 0', borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '11px', fontWeight: 800, letterSpacing: '0.18em', color: '#944426', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
              WORKSHOP OVERVIEW · LEVEL: {displayLevel.toUpperCase()}
            </span>
            <h2 style={{ margin: 0, lineHeight: 1.08 }}>
              <span style={{ display: 'block', fontFamily: "var(--font-serif)", fontStyle: 'italic', fontSize: 'clamp(30px, 3.8vw, 44px)', fontWeight: 400, color: '#21201E' }}>What's</span>
              <span style={{ display: 'block', fontFamily: "'Neue Montreal', sans-serif", fontSize: 'clamp(34px, 4.8vw, 58px)', fontWeight: 800, color: '#21201E', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>INSIDE</span>
            </h2>
          </div>

          <div className="edp-inside-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
            {/* Image Container */}
            <div
              style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.06)',
                border: '1.5px solid rgba(0, 0, 0, 0.08)',
                backgroundColor: '#FAF6F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
              }}
            >
              <img
                src={coverImage}
                alt={title}
                style={{
                  width: '100%',
                  maxHeight: '520px',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  borderRadius: '16px',
                  display: 'block'
                }}
              />
            </div>

            {/* Key Takeaways Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { title: 'Master core postural alignment', desc: 'The essential foundation that elevates your posture and protects your spine.' },
                { title: 'Learn precise breathwork control', desc: 'To stabilize nervous system response and deepen mental focus.' },
                { title: 'Develop body awareness and equilibrium', desc: 'To eliminate tension, compensation, and sway.' },
                { title: 'Structured training sequences', desc: 'Designed to build long-term strength and grace.' },
                { title: 'Personalized cues & hands-on guidance', desc: 'From PhD research scholars and master faculty.' }
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    backgroundColor: '#FFFFFF',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(148, 68, 38, 0.1)',
                      color: '#944426',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 500, color: '#21201E' }}>
                      {item.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '13.5px', color: '#6A655F', lineHeight: 1.55 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: OBJECTIVES */}
        <section style={{ padding: '56px 0', borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '11px', fontWeight: 800, letterSpacing: '0.18em', color: '#944426', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
              WORKSHOP OBJECTIVES & GOALS
            </span>
            <h2 style={{ margin: 0, lineHeight: 1.08 }}>
              <span style={{ display: 'block', fontFamily: "var(--font-serif)", fontStyle: 'italic', fontSize: 'clamp(28px, 3.8vw, 42px)', fontWeight: 400, color: '#21201E' }}>By the End</span>
              <span style={{ display: 'block', fontFamily: "'Neue Montreal', sans-serif", fontSize: 'clamp(32px, 4.8vw, 54px)', fontWeight: 800, color: '#21201E', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>YOU WILL BE ABLE TO:</span>
            </h2>
          </div>
          <div className="edp-objectives-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[
              { t: 'ALIGN FREELY', d: 'Master core stabilization and micro-adjustments to hold your posture gracefully without tension.' },
              { t: 'DEEPEN BREATHWORK', d: 'Regulate respiratory flow to calm nervous system stress and sustain focus throughout your practice.' },
              { t: 'PRACTICE INDEPENDENTLY', d: 'Follow structured daily programs and self-assess your technique with lasting confidence.' }
            ].map((card, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '32px 24px',
                  textAlign: 'center',
                  border: '1.5px solid rgba(0, 0, 0, 0.06)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.03)',
                  transition: 'all 0.25s ease'
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#944426',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    boxShadow: '0 4px 12px rgba(148,68,38,0.25)'
                  }}
                >
                  <Check size={20} strokeWidth={2.5} />
                </div>
                <h3 style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '17px', fontWeight: 800, color: '#21201E', margin: '0 0 10px 0', letterSpacing: '0.04em' }}>{card.t}</h3>
                <p style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '13.5px', color: '#5A554F', lineHeight: 1.55, margin: 0 }}>{card.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: WHY CHOOSE */}
        <section style={{ padding: '56px 0', borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '11px', fontWeight: 800, letterSpacing: '0.18em', color: '#944426', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>THE PRAGYA YOG METHOD</span>
            <h2 style={{ margin: 0, lineHeight: 1.08 }}>
              <span style={{ display: 'block', fontFamily: "var(--font-serif)", fontStyle: 'italic', fontSize: 'clamp(28px, 3.8vw, 42px)', fontWeight: 400, color: '#21201E' }}>Why Choose</span>
              <span style={{ display: 'block', fontFamily: "'Neue Montreal', sans-serif", fontSize: 'clamp(32px, 4.8vw, 54px)', fontWeight: 800, color: '#21201E', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>THIS WORKSHOP?</span>
            </h2>
          </div>
          <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { t: 'Expert Master Instruction', d: 'Clear, concise guidance from PhD research scholars and seasoned yog masters.' },
              { t: 'Proven Ancient & Scientific Methodology', d: 'Based on a well-established approach uniting classical Hatha wisdom with modern anatomical alignment.' },
              { t: 'Inclusive & Flexible Learning', d: 'Structured for both beginners building foundation and advanced practitioners seeking posture refinement.' },
              { t: 'Tranquil Sanctuary Community', d: 'Connect with fellow wellness enthusiasts in a supportive, tranquil environment.' }
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  backgroundColor: '#FFFFFF',
                  padding: '20px 24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#944426', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <Check size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '16px', fontWeight: 700, color: '#21201E', margin: '0 0 4px 0' }}>{item.t}</h4>
                  <p style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '14px', color: '#5A554F', lineHeight: 1.55, margin: 0 }}>{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4.5: FREQUENTLY BOUGHT TOGETHER BUNDLES */}
        <FrequentlyBoughtTogether
          bundles={bundles}
          packageTitle={title}
          onSelectBundle={(bundle, selectedPackageIds) => {
            const packageIds = selectedPackageIds || (bundle.packages ? bundle.packages.map((p) => Number(p.id)) : []);
            onOpenBooking('bundle', bundle.name, {
              isBundleMode: true,
              bundleId: bundle.id,
              packageIds,
              title: bundle.name,
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

        {/* SECTION 5: CTA */}
        <section style={{ padding: '64px 0 48px 0', borderTop: '1px solid rgba(0, 0, 0, 0.08)', textAlign: 'center' }}>
          <span style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', color: '#944426', textTransform: 'uppercase', display: 'block', marginBottom: '14px' }}>RESERVE YOUR SPOT TODAY</span>
          <h2 style={{ margin: '0 0 24px 0', lineHeight: 1.08 }}>
            <span style={{ display: 'block', fontFamily: "var(--font-serif)", fontStyle: 'italic', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400, color: '#21201E' }}>Master the Art of</span>
            <span style={{ display: 'block', fontFamily: "'Neue Montreal', sans-serif", fontSize: 'clamp(34px, 5.5vw, 64px)', fontWeight: 800, color: '#21201E', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{titleMain}</span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '28px' }}>
            <span style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '32px', fontWeight: 800, color: '#944426' }}>{displayPrice}</span>
          </div>
          <button onClick={handleReserveNow} style={{ backgroundColor: '#944426', color: '#FFFFFF', border: 'none', borderRadius: '999px', padding: '16px 44px', fontSize: '14px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 10px 28px rgba(148, 68, 38, 0.35)', transition: 'all 0.3s ease' }}>RESERVE NOW</button>
        </section>

        {/* Other Events */}
        {otherEvents.length > 0 && (
          <section style={{ paddingTop: '56px', borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontStyle: 'italic', fontSize: '26px', fontWeight: 400, color: '#21201E', marginBottom: '28px', textAlign: 'center' }}>Explore Other Upcoming Events</h3>
            <div className="other-events-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {otherEvents.map((ev, idx) => (
                <div key={ev.id || idx} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(0, 0, 0, 0.08)', boxShadow: '0 4px 18px rgba(0, 0, 0, 0.03)' }}>
                  <div>
                    <span style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: '#944426', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>{ev.category || 'WORKSHOP'}</span>
                    <h4 style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '17px', fontWeight: 700, color: '#21201E', margin: '0 0 12px 0' }}>{ev.title || ev.name}</h4>
                  </div>
                  <button onClick={() => onSelectEvent ? onSelectEvent(ev) : window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ backgroundColor: 'transparent', color: '#21201E', border: '1.5px solid rgba(0, 0, 0, 0.15)', borderRadius: '999px', padding: '9px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
                    <span>VIEW EVENT</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Bottom Reserve Bar */}
      <div
        className="edp-sticky-bottom-bar"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 99,
          backgroundColor: 'rgba(245, 239, 229, 0.96)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 -6px 20px rgba(0, 0, 0, 0.08)'
        }}
      >
        <button
          onClick={handleReserveNow}
          style={{
            backgroundColor: '#944426',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '999px',
            padding: '14px 28px',
            fontSize: '14px',
            fontWeight: 800,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            maxWidth: '560px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 6px 20px rgba(148, 68, 38, 0.35)',
            transition: 'all 0.25s ease'
          }}
        >
          <Sparkles size={16} />
          <span>Reserve Now — {displayPrice}</span>
        </button>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .edp-inside-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .edp-objectives-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
        }
        @media (max-width: 640px) {
          .edp-back-bar { padding: 90px 16px 12px 16px !important; }
        }
      `}</style>
    </div>
  );
};

export default EventDetailPage;
