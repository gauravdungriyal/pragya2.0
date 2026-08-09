import React, { useEffect, useState } from 'react';
import { ArrowLeft, Award, BookOpen, Clock, GraduationCap, Heart, MapPin, Sparkles, CheckCircle2, ShieldCheck, ShoppingBag } from 'lucide-react';
import { DynamicPackage, BundleItem } from '../../types';
import { getPackageDetail, getRelatedBundlesForPackage, cleanHtmlEntities, isTitleCompatible, toggleEventFavorite } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FrequentlyBoughtTogether } from '../FrequentlyBoughtTogether';

interface TeacherTrainingProps {
  pkg: DynamicPackage;
  onBack: () => void;
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  isPreview?: boolean;
}

export const TeacherTraining: React.FC<TeacherTrainingProps> = ({
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

  const rawPriceStr = String(activeAmount || '1850')
    .replace(/₹|INR|Rs\.?/gi, '')
    .replace(/HK\$\s*/gi, '')
    .trim();
  const numericPrice = parseFloat(rawPriceStr.replace(/[^0-9.]/g, '')) || 1850;
  const displayPrice = `HK$ ${numericPrice.toLocaleString()}`;

  const cleanDescription = cleanHtmlEntities(
    (isDetailMatching && packageDetail?.description) ? packageDetail.description : (pkg.description || 'Embark on a transformative teacher training immersion with PhD research scholars and master faculty. Certified by Yoga Alliance USA.')
  );

  const coverImage = pkg.coverImage || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1600&q=80';

  const handleFavoriteClick = async () => {
    if (!user) {
      alert("Please login to save this program.");
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
      category: 'TTC',
      coverImage
    });
  };

  const syllabusModules = [
    {
      module: 'MODULE 01',
      title: 'Asana Biomechanics, Alignment & Anatomy',
      hours: '60 Hours',
      desc: 'Master the biomechanics of 84+ classical postures, structural alignment adjustments, spine safety, kinesiology, and injury prevention.'
    },
    {
      module: 'MODULE 02',
      title: 'Pranayama Science, Bandhas & Subtle Energy',
      hours: '40 Hours',
      desc: 'Deepen respiratory mastery with advanced Bandhas, Nadi Shodhana, Shatkarmas (Kriyas), Chakras, and subtle body physiology.'
    },
    {
      module: 'MODULE 03',
      title: 'Yoga Sutras, Philosophy & Ethical Lifestyle',
      hours: '50 Hours',
      desc: 'Study Patanjali’s 8 Limbs of Yoga, Bhagavad Gita insights, Yamas & Niyamas, and modern ethical practices for professional yoga teachers.'
    },
    {
      module: 'MODULE 04',
      title: 'Teaching Methodology, Cueing & Practicum',
      hours: '50 Hours',
      desc: 'Develop confident voice modulation, intelligent class sequencing, hands-on adjustments, student observation, and live teaching practice.'
    }
  ];

  const featuresList = (isDetailMatching && packageDetail?.features) || pkg.features || [
    'Yoga Alliance USA Accredited RYT Certificate',
    'Comprehensive 300-Page Teacher Training Manual',
    'Hands-on Postural & Adjustment Workshops',
    '1-on-1 Mentorship Session with PhD Faculty',
    'Lifetime Access to Pragya Alumni Network',
    'Sanctuary Mat & Practice Lab Access'
  ];

  return (
    <div style={{ backgroundColor: '#FAF8F5', color: '#000000', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", minHeight: '100vh' }}>
      
      {isPreview && (
        <div className="sticky top-0 z-[1000] bg-amber-600 text-white px-6 py-3.5 font-semibold text-xs sm:text-sm text-center shadow-xl flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center gap-2.5 mx-auto">
            <span><strong>TEACHER TRAINING PREVIEW MODE</strong> — Official Light TTC Certification Template.</span>
          </div>
          <button onClick={onBack} className="bg-stone-950 hover:bg-black text-amber-300 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow shrink-0">Close Preview</button>
        </div>
      )}

      {/* Light Hero Header */}
      <section style={{ backgroundColor: '#F5EFE5', borderBottom: '1px solid #EADCB0', padding: '48px 24px 64px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          {/* Back Navigation Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <button
              onClick={onBack}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                backgroundColor: '#FFFFFF', color: '#000000',
                border: '1px solid #E5D5C5', borderRadius: '999px',
                padding: '8px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
              }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <button
              onClick={handleFavoriteClick}
              disabled={isFavoriting}
              style={{
                width: '38px', height: '38px', borderRadius: '50%', border: '1px solid #E5D5C5',
                backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Save Program"
            >
              <Heart size={18} fill={isFavorited ? "#B8860B" : "none"} color={isFavorited ? "#B8860B" : "#000000"} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center' }}>
            <div>
              {/* Accreditation Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: '1.5px solid #C29219', borderRadius: '999px', padding: '6px 16px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(194, 146, 25, 0.1)' }}>
                <Award size={16} color="#C29219" />
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', color: '#000000', textTransform: 'uppercase' }}>
                  YOGA ALLIANCE USA ACCREDITED (RYS 200/300/500)
                </span>
              </div>

              {/* Title */}
              <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 600, color: '#000000', margin: '0 0 16px 0', lineHeight: 1.15 }}>
                {displayTitle}
              </h1>

              {/* Subtitle / Focus */}
              <p style={{ fontSize: '16px', color: '#000000', lineHeight: 1.7, margin: '0 0 28px 0', fontWeight: 400 }}>
                {cleanDescription}
              </p>

              {/* Price & Action Box with SINGLE Reserve Now button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1.5px solid #EADCB0', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', fontWeight: 700 }}>CERTIFICATION INVESTMENT</span>
                  <span style={{ fontSize: '36px', fontWeight: 800, color: '#000000' }}>
                    {displayPrice}
                  </span>
                </div>

                <div>
                  <button
                    onClick={handleReserveNow}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '10px',
                      backgroundColor: '#C29219', color: '#FFFFFF',
                      border: 'none', borderRadius: '14px', padding: '14px 32px',
                      fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 6px 20px rgba(194, 146, 25, 0.3)'
                    }}
                  >
                    <ShoppingBag size={18} />
                    <span>Reserve Now</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column Cover Card */}
            <div>
              <div style={{ borderRadius: '24px', overflow: 'hidden', border: '6px solid #FFFFFF', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', position: 'relative' }}>
                <img src={coverImage} alt={displayTitle} style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '16px 20px', border: '1px solid #EADCB0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>INTERNATIONAL ACCREDITATION</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#000000' }}>RYT 200/300/500 Registered Yoga Teacher Status worldwide.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4 Key Statistics Cards */}
      <section style={{ padding: '36px 24px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #EADCB0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          
          <div style={{ backgroundColor: '#FAF6EE', border: '1px solid #EADCB0', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <GraduationCap size={28} color="#C29219" />
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#000000', textTransform: 'uppercase' }}>ACCREDITATION</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#000000', display: 'block' }}>Yoga Alliance USA</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#FAF6EE', border: '1px solid #EADCB0', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Clock size={28} color="#C29219" />
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#000000', textTransform: 'uppercase' }}>DURATION</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#000000', display: 'block' }}>{(isDetailMatching && packageDetail?.duration_label) || (pkg as any).duration_label || '200 Hours Intensive'}</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#FAF6EE', border: '1px solid #EADCB0', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <BookOpen size={28} color="#C29219" />
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#000000', textTransform: 'uppercase' }}>CURRICULUM</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#000000', display: 'block' }}>84 Postures & Sutras</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#FAF6EE', border: '1px solid #EADCB0', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <MapPin size={28} color="#C29219" />
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#000000', textTransform: 'uppercase' }}>CAMPUS</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#000000', display: 'block' }}>HK Sanctuary & Online</span>
            </div>
          </div>

        </div>
      </section>

      {/* Master Syllabus Section */}
      <section style={{ padding: '64px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 700, color: '#000000', letterSpacing: '0.12em', marginBottom: '8px' }}>
          COMPREHENSIVE MASTER SYLLABUS
        </div>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: '32px', fontWeight: 600, color: '#000000', margin: '0 0 36px 0' }}>
          Curriculum & Core Learning Modules
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          {syllabusModules.map((mod, idx) => (
            <div key={idx} style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #EADCB0', borderRadius: '20px', padding: '28px', boxShadow: '0 6px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#000000', backgroundColor: '#FAF6EE', padding: '4px 12px', borderRadius: '999px', border: '1px solid #EADCB0' }}>
                  {mod.module}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#000000' }}>
                  {mod.hours}
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#000000', margin: '0 0 12px 0', lineHeight: 1.35 }}>
                {mod.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#000000', lineHeight: 1.6, margin: 0, fontWeight: 400 }}>
                {mod.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Inclusions Checklist */}
      <section style={{ backgroundColor: '#F5EFE5', padding: '64px 24px', borderTop: '1px solid #EADCB0', borderBottom: '1px solid #EADCB0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 700, color: '#000000', letterSpacing: '0.12em', marginBottom: '8px' }}>
            VERIFIED INCLUSIONS
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: '32px', fontWeight: 600, color: '#000000', margin: '0 0 36px 0' }}>
            What Is Included In Your Certification Package
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {featuresList.map((feat: string, idx: number) => (
              <div key={idx} style={{ backgroundColor: '#FFFFFF', border: '1px solid #EADCB0', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <CheckCircle2 size={22} color="#C29219" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '15px', fontWeight: 500, color: '#000000' }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Bought Together Bundles */}
      {bundles && bundles.length > 0 && (
        <section style={{ padding: '64px 24px', maxWidth: '1100px', margin: '0 auto' }}>
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

      {/* Sticky Bottom Bar with SINGLE Reserve Now button */}
      <div style={{ position: 'sticky', bottom: 0, zIndex: 100, backgroundColor: '#FFFFFF', borderTop: '1.5px solid #EADCB0', padding: '16px 24px', boxShadow: '0 -10px 30px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ color: '#000000', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', fontWeight: 700 }}>TEACHER TRAINING IMMERSION</span>
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
                backgroundColor: '#C29219', color: '#FFFFFF',
                border: 'none', borderRadius: '999px', padding: '12px 32px',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(194, 146, 25, 0.3)'
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

export default TeacherTraining;
