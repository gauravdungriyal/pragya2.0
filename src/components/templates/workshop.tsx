import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, MapPin, Calendar, Sparkles, CheckCircle2, Zap, Award, ShieldCheck, ShoppingBag, Heart } from 'lucide-react';
import { DynamicPackage, BundleItem } from '../../types';
import { getPackageDetail, getRelatedBundlesForPackage, cleanHtmlEntities, isTitleCompatible, toggleEventFavorite } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FrequentlyBoughtTogether } from '../FrequentlyBoughtTogether';

interface WorkshopTemplateProps {
  pkg: DynamicPackage;
  onBack: () => void;
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  isPreview?: boolean;
}

export const WorkshopTemplate: React.FC<WorkshopTemplateProps> = ({
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

  const rawPriceStr = String(activeAmount || '680')
    .replace(/₹|INR|Rs\.?/gi, '')
    .replace(/HK\$\s*/gi, '')
    .trim();
  const numericPrice = parseFloat(rawPriceStr.replace(/[^0-9.]/g, '')) || 680;
  const displayPrice = `HK$ ${numericPrice.toLocaleString()}`;

  const cleanDescription = cleanHtmlEntities(
    (isDetailMatching && packageDetail?.description) ? packageDetail.description : (pkg.description || 'Join our intensive masterclass workshop featuring posture diagnosis, hands-on manual adjustments, and personalized therapeutic sequences guided by senior masters.')
  );

  const coverImage = pkg.coverImage || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1600&auto=format&fit=crop';
  const displayVenue = pkg.metadata?.venue || pkg.metadata?.location || 'Pragya Sanctuary Studio, HK';
  const displayTime = (isDetailMatching && packageDetail?.duration_label) || pkg.metadata?.eventTime || (pkg as any).duration_label || '3 Hours Intensive Lab';
  const displayDate = pkg.metadata?.eventDate || 'Upcoming Weekend Workshop';

  const handleFavoriteClick = async () => {
    if (!user) {
      alert("Please login to save this workshop.");
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
      category: 'Workshop',
      coverImage
    });
  };

  const workshopAgenda = [
    {
      time: 'Phase 01',
      title: 'Postural & Biomechanical Assessment',
      duration: '45 mins',
      desc: 'Individual spinal screening, posture alignment check, and identifying muscle imbalances.'
    },
    {
      time: 'Phase 02',
      title: 'Therapeutic Adjustments & Prop Techniques',
      duration: '60 mins',
      desc: 'Hands-on manual adjustments using blocks, belts, and wall props for spine release.'
    },
    {
      time: 'Phase 03',
      title: 'Breath Synchronization & Nervous System Reset',
      duration: '45 mins',
      desc: 'Specialized Pranayama sequences designed to activate parasympathetic recovery.'
    },
    {
      time: 'Phase 04',
      title: 'Personalized Home Care Routine & Q&A',
      duration: '30 mins',
      desc: 'Take home custom 15-minute daily stretches tailored to your posture diagnostics.'
    }
  ];

  const featuresList = (isDetailMatching && packageDetail?.features) || pkg.features || [
    '1-on-1 Spine & Posture Assessment',
    'Hands-on Manual Adjustments',
    'Therapeutic Prop Usage Training',
    'Personalized Home Stretch Plan',
    'Pragya Workshop Attendance Certificate',
    'Post-Workshop Digital Manual'
  ];

  return (
    <div style={{ backgroundColor: '#FBF9F5', color: '#000000', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", minHeight: '100vh' }}>
      
      {isPreview && (
        <div className="sticky top-0 z-[1000] bg-gradient-to-r from-[#A84323] via-[#8B3519] to-[#A84323] text-white px-6 py-3.5 font-semibold text-xs sm:text-sm text-center shadow-xl flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center gap-2.5 mx-auto">
            <span><strong>WORKSHOP PREVIEW MODE</strong> — Custom Intensive Workshop Template.</span>
          </div>
          <button onClick={onBack} className="bg-stone-950 hover:bg-black text-amber-300 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow shrink-0">Close Preview</button>
        </div>
      )}

      {/* Top Header Navigation */}
      <nav style={{ backgroundColor: '#FAF6EE', borderBottom: '1px solid #EAE3D5', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 90, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#FFFFFF', color: '#000000',
              border: '1px solid #E5D5C5', borderRadius: '999px',
              padding: '8px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', transition: 'all 0.2s'
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
                width: '38px', height: '38px', borderRadius: '50%', border: '1px solid #E5D5C5',
                backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              title="Save Workshop"
            >
              <Heart size={18} fill={isFavorited ? "#A84323" : "none"} color={isFavorited ? "#A84323" : "#000000"} />
            </button>
          </div>
        </div>
      </nav>

      {/* Workshop Hero Section */}
      <section style={{ padding: '48px 24px 64px 24px', backgroundColor: '#FAF6EE', borderBottom: '1px solid #EAE3D5' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          
          {/* Left Column */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#A84323', color: '#FFFFFF', borderRadius: '8px', padding: '6px 14px', marginBottom: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              <Zap size={13} color="#FFFFFF" />
              <span>INTENSIVE WORKSHOP</span>
            </div>

            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 600, color: '#000000', margin: '0 0 20px 0', lineHeight: 1.15 }}>
              {displayTitle}
            </h1>

            <p style={{ fontSize: '16px', color: '#000000', lineHeight: 1.7, margin: '0 0 28px 0', fontWeight: 400 }}>
              {cleanDescription}
            </p>

            {/* Fast Facts Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: '1px solid #EADCD0', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: '#000000' }}>
                <Clock size={15} color="#A84323" />
                <span>{displayTime}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: '1px solid #EADCD0', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: '#000000' }}>
                <MapPin size={15} color="#A84323" />
                <span>{displayVenue}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: '1px solid #EADCD0', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: '#000000' }}>
                <Calendar size={15} color="#A84323" />
                <span>{displayDate}</span>
              </div>
            </div>

            {/* Investment Box with SINGLE Reserve Now button */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5D5C5', borderRadius: '20px', padding: '24px', boxShadow: '0 12px 30px rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, display: 'block' }}>WORKSHOP INVESTMENT</span>
                <span style={{ fontSize: '34px', fontWeight: 800, color: '#000000' }}>{displayPrice}</span>
              </div>

              <div>
                <button
                  onClick={handleReserveNow}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    backgroundColor: '#A84323', color: '#FFFFFF', border: 'none', borderRadius: '14px',
                    padding: '14px 32px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(168, 67, 35, 0.3)', transition: 'all 0.2s'
                  }}
                >
                  <ShoppingBag size={18} />
                  <span>Reserve Now</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: '28px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.12)', border: '6px solid #FFFFFF', position: 'relative' }}>
              <img
                src={coverImage}
                alt={displayTitle}
                style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />

              <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '16px 20px', border: '1px solid rgba(255,255,255,0.8)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.08em' }}>SANCTUARY CAPACITY</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#2E7D32', backgroundColor: '#E8F5E9', padding: '3px 10px', borderRadius: '999px' }}>LIMITED 15 SEATS</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#E0E0E0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: '75%', height: '100%', backgroundColor: '#A84323', borderRadius: '999px' }} />
                </div>
                <span style={{ fontSize: '11px', color: '#000000', marginTop: '6px', display: 'block', fontWeight: 500 }}>Small group size for personalized hands-on corrections.</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Specifications & Badges Bar */}
      {((isDetailMatching && packageDetail?.benefit) || (pkg as any).benefit) && (
        <section style={{ backgroundColor: '#FFFFFF', padding: '24px', borderBottom: '1px solid #EAE3D5' }}>
          <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#FAF6EE', padding: '16px 20px', borderRadius: '16px', border: '1px solid #EAE3D5' }}>
              <Award size={22} color="#A84323" />
              <div>
                <span style={{ fontSize: '11px', color: '#000000', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>BENEFIT</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#000000' }}>{(isDetailMatching && packageDetail?.benefit) || (pkg as any).benefit}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#FAF6EE', padding: '16px 20px', borderRadius: '16px', border: '1px solid #EAE3D5' }}>
              <ShieldCheck size={22} color="#A84323" />
              <div>
                <span style={{ fontSize: '11px', color: '#000000', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>CLASS ACCESS</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#000000' }}>{(isDetailMatching && packageDetail?.class_access) || (pkg as any).class_access || 'Workshop Sanctuary'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#FAF6EE', padding: '16px 20px', borderRadius: '16px', border: '1px solid #EAE3D5' }}>
              <Clock size={22} color="#A84323" />
              <div>
                <span style={{ fontSize: '11px', color: '#000000', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>DURATION</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#000000' }}>{(isDetailMatching && packageDetail?.duration_label) || (pkg as any).duration_label || '3 Hours Intensive'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#FAF6EE', padding: '16px 20px', borderRadius: '16px', border: '1px solid #EAE3D5' }}>
              <Sparkles size={22} color="#A84323" />
              <div>
                <span style={{ fontSize: '11px', color: '#000000', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>PASS TYPE</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#000000' }}>{(isDetailMatching && packageDetail?.access_label) || (pkg as any).access_label || 'Workshop Pass'}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Workshop Master Agenda & Breakdown */}
      <section style={{ padding: '64px 24px', maxWidth: '1180px', margin: '0 auto' }}>
        <div style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 700, color: '#000000', letterSpacing: '0.12em', marginBottom: '8px' }}>
          STRUCTURED CURRICULUM
        </div>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: '32px', fontWeight: 600, color: '#000000', margin: '0 0 36px 0' }}>
          Workshop Masterclass Breakdown
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          {workshopAgenda.map((item, idx) => (
            <div key={idx} style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAE3D5', borderRadius: '20px', padding: '28px', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#000000', backgroundColor: '#F5E8DF', padding: '4px 12px', borderRadius: '999px', textTransform: 'uppercase' }}>
                  {item.time}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#000000' }}>
                  {item.duration}
                </span>
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

      {/* What You Will Receive / Inclusions Checklist */}
      <section style={{ backgroundColor: '#FAF6EE', padding: '64px 24px', borderTop: '1px solid #EAE3D5', borderBottom: '1px solid #EAE3D5' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 700, color: '#000000', letterSpacing: '0.12em', marginBottom: '8px' }}>
            VERIFIED INCLUSIONS
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: '32px', fontWeight: 600, color: '#000000', margin: '0 0 36px 0' }}>
            What Is Included In Your Workshop Pass
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {featuresList.map((feat: string, idx: number) => (
              <div key={idx} style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAE3D5', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <CheckCircle2 size={22} color="#A84323" style={{ flexShrink: 0 }} />
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

      {/* Sticky Bottom Reserve Bar with SINGLE Reserve Now button */}
      <div style={{ position: 'sticky', bottom: 0, zIndex: 100, backgroundColor: '#FFFFFF', borderTop: '1px solid #EAE3D5', padding: '16px 24px', boxShadow: '0 -10px 30px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ color: '#000000', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', fontWeight: 700 }}>WORKSHOP PASS INVESTMENT</span>
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
                backgroundColor: '#A84323', color: '#FFFFFF',
                border: 'none', borderRadius: '999px', padding: '12px 32px',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(168, 67, 35, 0.3)'
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

export default WorkshopTemplate;
