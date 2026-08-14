import React, { useEffect, useState } from 'react';
import { Check, Sparkles, RefreshCw, Zap, ShieldCheck, Heart, Award, ArrowUpRight, Calendar, Tag, Info, ShoppingBag, ArrowRight } from 'lucide-react';
import { getPackages, getBundleList, trackBundleEvent, getDailyQuote, cleanHtmlEntities } from '../services/api';
import { PackageItem, BundleItem, DailyQuote } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getSiteConfig, subscribeSiteConfig, SiteConfig } from '../services/siteConfig';
import { MembershipFinderWidget } from './MembershipFinderWidget';

interface MembershipPageProps {
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  onNavigateSection?: (sectionId: string) => void;
  onOpenPackageDetail?: (pkg: any) => void;
  initialCategory?: string;
}

export const MembershipPage: React.FC<MembershipPageProps> = ({
  onOpenBooking,
  onOpenPackageDetail,
  initialCategory = 'Special Bundles'
}) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(getSiteConfig());
  const [packagesData, setPackagesData] = useState<Record<string, PackageItem[]>>({});
  const [bundlesList, setBundlesList] = useState<BundleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [dailyQuote, setDailyQuote] = useState<DailyQuote | null>(null);

  useEffect(() => {
    return subscribeSiteConfig(setSiteConfig);
  }, []);

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getDailyQuote().then((q) => {
      if (isMounted && q) setDailyQuote(q);
    });

    Promise.all([
      getPackages().catch(() => ({})),
      getBundleList(user?.access_token).catch(() => []),
    ]).then(([pkgData, bundles]) => {
      if (!isMounted) return;
      if (pkgData && typeof pkgData === 'object') {
        setPackagesData(pkgData as Record<string, PackageItem[]>);
      }

      if (Array.isArray(bundles) && bundles.length > 0) {
        setBundlesList(bundles);
        // Record view analytics for bundles
        bundles.forEach((b) => {
          if (b?.id) trackBundleEvent(b.id, 'view', user?.access_token).catch(() => { });
        });
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [user?.access_token]);

  // Fixed category tabs specified by API & design: Private, Regular, TTC, Workshop, Event, Retreat
  const categoriesList = ['ALL', 'Special Bundles', 'Private', 'Regular', 'TTC', 'Workshop', 'Event', 'Retreat'];

  // Deduplicate and flatten packages across all categories
  const packageMap = new Map<string | number, PackageItem & { groupCategory: string }>();
  Object.entries(packagesData).forEach(([categoryKey, pkgItems]) => {
    if (Array.isArray(pkgItems)) {
      pkgItems.forEach((pkg) => {
        const uniqueKey = pkg.id || pkg.packageID || `${categoryKey}-${pkg.title}`;
        if (!packageMap.has(uniqueKey)) {
          packageMap.set(uniqueKey, {
            ...pkg,
            groupCategory: categoryKey
          });
        }
      });
    }
  });

  const allFlattenedPackages = Array.from(packageMap.values());

  const isCategoryMatch = (p: PackageItem & { groupCategory: string }, activeTab: string): boolean => {
    const active = activeTab.trim().toLowerCase();
    const group = (p.groupCategory || '').trim().toLowerCase();
    const direct = (p.category || '').trim().toLowerCase();
    const pType = (p.type || '').trim().toLowerCase();

    if (active === 'ttc') {
      return (
        group === 'ttc' || group === 'teacher training' || group === 'teacher_training' || group.includes('ttc') || group.includes('teacher') ||
        direct === 'ttc' || direct === 'teacher training' || direct === 'teacher_training' || direct.includes('ttc') || direct.includes('teacher') ||
        pType === 'teacher_training'
      );
    }

    if (active === 'regular') {
      return (
        group === 'regular' || group === 'membership' || group.includes('unlimited') || group.includes('regular') ||
        direct === 'regular' || direct === 'membership' || direct.includes('regular') ||
        pType === 'regular'
      );
    }

    if (active === 'private') {
      return (
        group === 'private' || group.includes('private') ||
        direct === 'private' || direct.includes('private') ||
        pType === 'private'
      );
    }

    if (active === 'workshop') {
      return group.includes('workshop') || direct.includes('workshop') || pType === 'workshop';
    }

    if (active === 'event') {
      return group.includes('event') || direct.includes('event') || pType === 'event';
    }

    if (active === 'retreat') {
      return group.includes('retreat') || direct.includes('retreat') || pType === 'retreat';
    }

    return group === active || direct === active || pType === active;
  };

  const getCategoryBadgeLabel = (p: PackageItem & { groupCategory?: string }): string => {
    const cat = (p.groupCategory || p.category || '').trim().toLowerCase();
    const type = (p.type || '').trim().toLowerCase();

    if (cat === 'private' || cat.includes('private') || type === 'private') return 'Private';
    if (cat === 'regular' || cat === 'membership' || cat.includes('unlimited') || cat.includes('regular') || type === 'regular') return 'Regular';
    if (cat === 'ttc' || cat.includes('ttc') || cat.includes('teacher') || type === 'teacher_training') return 'TTC';
    if (cat === 'workshop' || cat.includes('workshop') || type === 'workshop') return 'Workshop';
    if (cat === 'event' || cat.includes('event') || type === 'event') return 'Event';
    if (cat === 'retreat' || cat.includes('retreat') || type === 'retreat') return 'Retreat';

    return p.groupCategory || p.category || 'Regular';
  };

  const filteredPackages = activeCategory === 'ALL'
    ? allFlattenedPackages
    : allFlattenedPackages.filter((p) => isCategoryMatch(p, activeCategory));

  // Live currentDate string formatted from local date
  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div style={{ backgroundColor: '#F5EFE5', minHeight: '100vh', color: '#21201E' }}>

      {/* Top Banner Header */}
      <section
        className="membership-top-banner"
        style={{
          backgroundColor: '#F5EFE5',
          color: '#21201E',
          padding: '140px 32px 64px 32px'
        }}
      >
        <div
          className="membership-header-grid"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            alignItems: 'center'
          }}
        >
          <div>
            <h1
              className="membership-top-title"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 'clamp(44px, 6.5vw, 76px)',
                fontWeight: 400,
                color: '#21201E',
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
                margin: 0
              }}
            >
              Membership &{' '}
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: '#21201E'
                }}
              >
                Packages
              </span>
            </h1>
          </div>

          <div>
            <p
              className="membership-top-subtitle"
              style={{
                fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                fontSize: '16px',
                color: '#6B655F',
                lineHeight: 1.6,
                margin: 0,
                maxWidth: '480px'
              }}
            >
              Choose a tier designed to fit your practice, schedule, and spiritual journey. Enjoy unlimited sanctuary access, hydrotherapy amenities, and private master sessions.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Membership Finder Widget */}
      <section style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <MembershipFinderWidget
          onSelectUnlimited={() => {
            setActiveCategory('Unlimited Memberships');
            const el = document.getElementById('packages-grid');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onExploreFlexible={() => {
            setActiveCategory('ALL');
            const el = document.getElementById('packages-grid');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />
      </section>

      {/* Why Explore Our Packages Section (Matches Reference Design & Editable via Admin) */}
      <section
        style={{
          backgroundColor: '#F5EFE5',
          padding: '64px 24px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center' }}>
          {/* Title */}
          <h2
            style={{
              fontFamily: "'Neue Montreal', -apple-system, sans-serif",
              fontSize: 'clamp(28px, 4vw, 38px)',
              fontWeight: 700,
              color: '#21201E',
              margin: '0 0 16px 0',
              lineHeight: 1.2
            }}
          >
            {siteConfig.whyExplorePackages?.title || 'Why Explore Our Packages?'}
          </h2>

          {/* Delicate Black Accent Line with Diamond */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '36px' }}>
            <div style={{ width: '60px', height: '1px', backgroundColor: '#21201E', opacity: 0.3 }} />
            <div style={{ color: '#21201E', fontSize: '10px' }}>◆</div>
            <div style={{ width: '60px', height: '1px', backgroundColor: '#21201E', opacity: 0.3 }} />
          </div>

          {/* Points List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', textAlign: 'left' }}>
            {(siteConfig.whyExplorePackages?.points || []).map((pt, idx) => (
              <div key={idx}>
                <p style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '15px', color: '#5A554F', lineHeight: 1.65, margin: 0 }}>
                  <strong style={{ color: '#21201E', fontWeight: 800 }}>{pt.boldTitle}</strong> {pt.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Packages & Filter Section */}
      <section
        id="packages-grid"
        className="membership-main-section"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '64px 32px 100px 32px'
        }}
      >
        {/* Category Filter Tabs Bar */}
        <div
          className="membership-filter-tabs-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '48px'
          }}
        >
          {categoriesList.map((catKey) => {
            const isActive = activeCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setActiveCategory(catKey)}
                style={{
                  fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                  backgroundColor: isActive ? '#21201E' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#4A4540',
                  border: isActive ? 'none' : '1px solid rgba(39, 39, 39, 0.12)',
                  borderRadius: '999px',
                  padding: '10px 24px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 4px 16px rgba(33, 32, 30, 0.15)' : 'none',
                  transition: 'all 0.25s ease'
                }}
              >
                {catKey === 'ALL' ? 'All Plans' : catKey}
              </button>
            );
          })}
        </div>

        {/* Packages Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#944426' }}>
            <RefreshCw size={26} className="animate-spin" style={{ margin: '0 auto 16px auto', display: 'block' }} />
            {dailyQuote ? (
              <>
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: 'italic',
                    fontSize: '20px',
                    color: '#6B655F',
                    maxWidth: '560px',
                    margin: '0 auto 8px auto',
                    lineHeight: 1.45
                  }}
                >
                  “{dailyQuote.q}”
                </p>
                <span style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '13px', color: '#944426', fontWeight: 700, letterSpacing: '0.04em' }}>
                  — {dailyQuote.a}
                </span>
              </>
            ) : (
              <p
                style={{
                  fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                  fontSize: '15px',
                  color: '#6B655F',
                  margin: '0 auto'
                }}
              >
                Loading membership packages...
              </p>
            )}
          </div>
        ) : activeCategory === 'Special Bundles' ? (
          <div>
            {bundlesList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#FFFFFF', borderRadius: '20px', color: '#7A756F' }}>
                No active special bundles currently available. Check back soon!
              </div>
            ) : (
              <div
                className="membership-cards-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                  gap: '32px'
                }}
              >
                {bundlesList.map((bundle) => {
                  const origPrice = Number(bundle.original_price || 0);
                  const finalPrice = Number(bundle.final_price || bundle.discounted_price || 0);
                  const savings = Number(bundle.savings || (origPrice - finalPrice) || 0);
                  const packageIds = bundle.packages ? bundle.packages.map((p) => Number(p.id)) : [];

                  return (
                    <div
                      key={bundle.id}
                      className="package-card-box"
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        boxShadow: '0 8px 28px rgba(148, 68, 38, 0.12)',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                      }}
                    >
                      <div>
                        {/* Cover image area */}
                        <div className="package-card-img-box" style={{ width: '100%', height: '180px', overflow: 'hidden', position: 'relative' }}>
                          <img
                            src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800&auto=format&fit=crop"
                            alt={bundle.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              top: '16px',
                              right: '16px',
                              backgroundColor: '#944426',
                              color: '#FFFFFF',
                              borderRadius: '999px',
                              padding: '4px 14px',
                              fontSize: '11px',
                              fontWeight: 800,
                              letterSpacing: '0.04em',
                              textTransform: 'uppercase',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}
                          >
                            {savings > 0 ? `SAVE HK$${savings.toFixed(0)}` : 'SPECIAL BUNDLE'}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="package-card-inner" style={{ padding: '24px 24px 20px 24px' }}>
                          <div
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              letterSpacing: '0.08em',
                              color: '#944426',
                              textTransform: 'uppercase',
                              marginBottom: '6px'
                            }}
                          >
                            PRAGYA BUNDLE VALUE PASS
                          </div>

                          <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#21201E', margin: '0 0 16px 0', lineHeight: 1.25 }}>
                            {bundle.name}
                          </h3>

                          {/* Pricing Pill */}
                          <div
                            style={{
                              backgroundColor: '#FAF6F0',
                              border: '1px solid #EBE4D8',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              textAlign: 'center',
                              marginBottom: '20px'
                            }}
                          >
                            {origPrice > finalPrice && (
                              <span style={{ fontSize: '13px', color: '#8A8580', textDecoration: 'line-through', marginRight: '8px' }}>
                                HK${origPrice.toFixed(2)}
                              </span>
                            )}
                            <span style={{ fontSize: '18px', fontWeight: 800, color: '#944426' }}>
                              HK${finalPrice.toFixed(2)}
                            </span>
                            {savings > 0 && (
                              <div style={{ fontSize: '11.5px', color: '#00B594', fontWeight: 700, marginTop: '2px' }}>
                                You save HK${savings.toFixed(2)}
                              </div>
                            )}
                          </div>

                          {/* Included Packages */}
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', color: '#944426', textTransform: 'uppercase', marginBottom: '10px' }}>
                              INCLUDED PACKAGES:
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {bundle.packages && bundle.packages.map((pkg, pIdx) => (
                                <li key={pkg.id || pIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#21201E' }}>
                                  <Check size={14} color="#00B594" strokeWidth={3} />
                                  <span>{pkg.title}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Action button */}
                      <div className="package-card-button-box" style={{ padding: '0 24px 24px 24px' }}>
                        <button
                          onClick={() => {
                            trackBundleEvent(bundle.id, 'click', user?.access_token).catch(() => { });
                            addToCart({
                              id: `bundle-${bundle.id}`,
                              title: `${bundle.name} (Special Bundle)`,
                              price: finalPrice,
                              originalPrice: origPrice > finalPrice ? origPrice : undefined,
                              bundle_id: bundle.id,
                              package_ids: packageIds,
                              category: 'Special Bundles',
                            });
                          }}
                          style={{
                            width: '100%',
                            backgroundColor: '#D9A726',
                            color: '#21201E',
                            border: 'none',
                            borderRadius: '999px',
                            padding: '14px 20px',
                            fontSize: '14px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 16px rgba(217, 167, 38, 0.3)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <ShoppingBag size={17} />
                          <span>Add Bundle to Cart</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : filteredPackages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#FFFFFF', borderRadius: '20px', color: '#7A756F' }}>
            No package plans available under this category. Please select another filter option.
          </div>
        ) : (
          <div
            className="membership-cards-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '32px'
            }}
          >
            {filteredPackages.map((pkg, idx) => {
              const isPopular = idx === 1 || Boolean(pkg.packageID && pkg.packageID.includes('ANNUAL'));
              const rawAmountStr = String(pkg.amount || (pkg as any).price || 0)
                .replace(/₹|INR|Rs\.?/gi, '')
                .replace(/HK\$\s*/gi, '')
                .trim();
              const numericAmount = typeof pkg.amount === 'number' && pkg.amount > 0 
                ? pkg.amount 
                : parseFloat(rawAmountStr) || 0;

              const periodText = pkg.period 
                ? ` / ${pkg.period}` 
                : (pkg.duration_label ? ` · ${pkg.duration_label}` : (pkg.access_label ? ` · ${pkg.access_label}` : ''));

              const cardImages = [
                "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop"
              ];
              const cardCoverImg = cardImages[idx % cardImages.length];

              return (
                <div
                  key={pkg.id || idx}
                  className="package-card-box"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.04)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                >
                  <div>
                    {/* Top Cover Image with Pill Tag */}
                    <div className="package-card-img-box" style={{ width: '100%', height: '190px', overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={cardCoverImg}
                        alt={pkg.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      {/* Top Right Tag Badge Overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          color: '#21201E',
                          borderRadius: '999px',
                          padding: '4px 14px',
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        {getCategoryBadgeLabel(pkg)}
                      </div>
                    </div>

                    {/* Card Inner Content Area */}
                    <div className="package-card-inner" style={{ padding: '24px 24px 20px 24px' }}>

                      {/* Sub-Category Upper Label */}
                      <div
                        style={{
                          fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '0.08em',
                          color: '#C66C50',
                          textTransform: 'uppercase',
                          marginBottom: '6px'
                        }}
                      >
                        {getCategoryBadgeLabel(pkg)}
                      </div>

                      {/* Card Title */}
                      <h3
                        style={{
                          fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                          fontSize: '22px',
                          fontWeight: 700,
                          color: '#21201E',
                          margin: '0 0 16px 0',
                          lineHeight: 1.25
                        }}
                      >
                        {pkg.title}
                      </h3>

                      {/* Rounded Price Pill Box */}
                      <div
                        style={{
                          backgroundColor: '#F8FAF9',
                          border: '1px solid rgba(0, 0, 0, 0.05)',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          textAlign: 'center',
                          fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                          fontSize: '14.5px',
                          fontWeight: 700,
                          color: '#21201E',
                          marginBottom: '20px'
                        }}
                      >
                        HK$ {numericAmount.toLocaleString()} {periodText} {pkg.discount ? `| Save HK$ ${pkg.discount}` : ''}
                      </div>

                      {/* Description */}
                      <p
                        style={{
                          fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                          fontSize: '14px',
                          color: '#5A554F',
                          lineHeight: 1.55,
                          marginBottom: '24px',
                          minHeight: '44px'
                        }}
                      >
                        {cleanHtmlEntities(pkg.description) || 'Access luxury yoga sanctuary amenities and expert guided classes.'}
                      </p>

                      {/* Package Includes Subheading & List */}
                      <div>
                        <div
                          style={{
                            fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                            fontSize: '11px',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            color: '#C66C50',
                            textTransform: 'uppercase',
                            marginBottom: '12px'
                          }}
                        >
                          PACKAGE INCLUDES:
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {(pkg.features && pkg.features.length > 0 ? pkg.features : [
                            "Unlimited Mat & Reformer Group Classes",
                            "Hydrotherapy Sauna & Lounge Privileges",
                            "1-on-1 Monthly Private Alignment Session",
                            "Complimentary Eco-mat & Sanitized Linens"
                          ]).map((feat, fIdx) => (
                            <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  backgroundColor: 'rgba(198, 108, 80, 0.14)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                              >
                                <Check size={11} color="#C66C50" strokeWidth={3} />
                              </div>
                              <span style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '13.5px', color: '#4A4540', fontWeight: 500 }}>
                                {feat}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: View Details & Add To Cart */}
                  <div className="package-card-button-box" style={{ padding: '0 24px 24px 24px', display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => {
                        if (onOpenPackageDetail) {
                          onOpenPackageDetail({
                            ...pkg,
                            id: String(pkg.id),
                            type: 'event',
                            title: pkg.title,
                            coverImage: cardCoverImg,
                            description: pkg.description,
                            price: pkg.amount,
                            currency: pkg.currency || 'HK$',
                            badge: getCategoryBadgeLabel(pkg)
                          });
                        }
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: '#FFFFFF',
                        color: '#21201E',
                        border: '1.5px solid #21201E',
                        borderRadius: '999px',
                        padding: '12px 10px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        letterSpacing: '0.01em',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.25s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#21201E';
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.color = '#21201E';
                      }}
                    >
                      <Info size={14} />
                      <span>View Details</span>
                    </button>

                    <button
                      onClick={() => addToCart({ id: pkg.id, title: pkg.title, price: pkg.amount, category: pkg.category || pkg.groupCategory })}
                      style={{
                        flex: 1,
                        backgroundColor: '#21201E',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '999px',
                        padding: '12px 10px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        letterSpacing: '0.01em',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 16px rgba(33, 32, 30, 0.12)',
                        transition: 'all 0.25s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#944426'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#21201E'; }}
                    >
                      <ShoppingBag size={14} />
                      <span>Add To Cart</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Component Styles & Mobile Responsive CSS */}
      <style>{`
        .package-card-box:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08) !important;
        }
        .membership-filter-tabs-bar::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 768px) {
          .membership-top-banner {
            padding: 96px 18px 24px 18px !important;
          }
          .membership-header-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .membership-top-title {
            font-size: 34px !important;
            line-height: 1.15 !important;
          }
          .membership-top-subtitle {
            font-size: 14px !important;
            line-height: 1.5 !important;
          }
          .membership-main-section {
            padding: 24px 16px 60px 16px !important;
          }
          .membership-filter-tabs-bar {
            justify-content: flex-start !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            padding-bottom: 8px !important;
            margin-bottom: 28px !important;
            -webkit-overflow-scrolling: touch;
            width: 100% !important;
            scroll-snap-type: x mandatory;
          }
          .membership-filter-tabs-bar button {
            flex-shrink: 0 !important;
            padding: 8px 18px !important;
            font-size: 12.5px !important;
            scroll-snap-align: start;
          }
          .membership-cards-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .package-card-box {
            border-radius: 20px !important;
          }
          .package-card-img-box {
            height: 165px !important;
          }
          .package-card-inner {
            padding: 18px 18px 16px 18px !important;
          }
          .package-card-button-box {
            padding: 0 18px 18px 18px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MembershipPage;
