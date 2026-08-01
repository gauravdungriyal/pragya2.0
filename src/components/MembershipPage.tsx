import React, { useEffect, useState } from 'react';
import { Check, Sparkles, RefreshCw, Zap, ShieldCheck, Heart, Award, ArrowUpRight, Calendar, Tag, Info } from 'lucide-react';
import { getPackages } from '../services/api';
import { PackageItem } from '../types';

interface MembershipPageProps {
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const MembershipPage: React.FC<MembershipPageProps> = ({ onOpenBooking }) => {
  const [packagesData, setPackagesData] = useState<Record<string, PackageItem[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Fallback high quality packages
  const fallbackPackages: Record<string, PackageItem[]> = {
    "Unlimited Memberships": [
      {
        id: 101,
        packageID: "MEM-UNLIM-1M",
        title: "Sanctuary Unlimited Monthly",
        payment_type: 1,
        amount: 280,
        frequency: 1,
        period: "month",
        duration_type: 2,
        duration_length: 1,
        category: "Membership",
        description: "Unlimited access to all studio yoga, pilates, and meditation classes with exclusive luxury sanctuary amenities.",
        features: [
          "Unlimited Mat & Reformer Classes",
          "Complimentary Hydrotherapy Access",
          "1 Monthly Private 1-on-1 Session",
          "15% Off Workshops & Retreats",
          "2 Complimentary Guest Passes / Month"
        ]
      },
      {
        id: 102,
        packageID: "MEM-ANNUAL",
        title: "Pragya Master Annual Pass",
        payment_type: 1,
        amount: 2600,
        discount_type: "fixed",
        discount: "400",
        discount_remarks: "Annual Savings",
        frequency: 12,
        period: "year",
        duration_type: 2,
        duration_length: 12,
        category: "Membership",
        description: "Our signature annual commitment for dedicated practitioners seeking complete holistic transformation.",
        features: [
          "Unlimited Access to All Studio Locations",
          "Personalized Health & Ayurvedic Consult",
          "Unlimited Guest Passes",
          "VIP Concierge & Preferred Booking Window",
          "Complimentary Mat, Towel & Locker Service"
        ]
      }
    ],
    "Private Sessions": [
      {
        id: 12795,
        packageID: "PRIV-HEALTH-1",
        title: "1-on-1 Health Consult with Master Faculty",
        payment_type: 2,
        amount: 150,
        frequency: 1,
        period: "session",
        duration_type: 1,
        duration_length: 1,
        category: "Private",
        description: "Personalized 90-minute bio-individual health, postural, and yogic science consultation.",
        features: [
          "Comprehensive Postural & Bio-Analysis",
          "Customized Daily Asana & Pranayama Plan",
          "Ayurvedic Lifestyle Assessment",
          "Direct Q&A with Master Teacher"
        ]
      },
      {
        id: 12796,
        packageID: "PRIV-5PACK",
        title: "Private Movement & Sound Immersion (5 Sessions)",
        payment_type: 2,
        amount: 650,
        discount_type: "bundle",
        discount: "100",
        frequency: 5,
        period: "package",
        duration_type: 1,
        duration_length: 5,
        category: "Private",
        description: "Five dedicated 75-minute sessions tailored to your physical goals, injury recovery, or advanced practice.",
        features: [
          "1-on-1 Asana Alignment & Modification",
          "Personalized Sound & Breathwork Reset",
          "Flexible Schedule Priority Booking",
          "Private Sanctuary Suite Access"
        ]
      }
    ],
    "Class Packs": [
      {
        id: 201,
        packageID: "PACK-10",
        title: "10-Class Sanctuary Pass",
        payment_type: 1,
        amount: 220,
        frequency: 10,
        period: "3 months",
        duration_type: 1,
        duration_length: 10,
        category: "Group",
        description: "Flexible class pack valid for all morning, afternoon, and evening group sessions.",
        features: [
          "Valid for 3 Full Months",
          "Shareable with 1 Friend or Family Member",
          "Priority Waitlist Elevation",
          "Full Mat & Prop Amenities Included"
        ]
      }
    ]
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getPackages().then((data) => {
      if (!isMounted) return;
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        setPackagesData(data);
      } else {
        setPackagesData(fallbackPackages);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const dataToUse = Object.keys(packagesData).length > 0 ? packagesData : fallbackPackages;
  const categoriesList = ['ALL', ...Object.keys(dataToUse)];

  // Flatten packages list based on filter category
  const allFlattenedPackages: (PackageItem & { groupCategory: string })[] = [];
  Object.entries(dataToUse).forEach(([categoryKey, pkgItems]) => {
    if (Array.isArray(pkgItems)) {
      pkgItems.forEach((pkg) => {
        allFlattenedPackages.push({
          ...pkg,
          groupCategory: categoryKey
        });
      });
    }
  });

  const filteredPackages = activeCategory === 'ALL'
    ? allFlattenedPackages
    : allFlattenedPackages.filter((p) => p.groupCategory === activeCategory);

  // Live currentDate string formatted from local date
  const currentDateStr = new Date('2026-08-01').toLocaleDateString('en-US', {
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
                  fontFamily: "'BNCringeSerif', 'Canela', Georgia, serif",
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

      {/* Why Explore Our Packages Section (Matches Reference Design) */}
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
            Why Explore Our Packages?
          </h2>

          {/* Delicate Black Accent Line with Diamond */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '36px' }}>
            <div style={{ width: '60px', height: '1px', backgroundColor: '#21201E', opacity: 0.3 }} />
            <div style={{ color: '#21201E', fontSize: '10px' }}>◆</div>
            <div style={{ width: '60px', height: '1px', backgroundColor: '#21201E', opacity: 0.3 }} />
          </div>

          {/* 4 Points List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', textAlign: 'left' }}>
            <div>
              <p style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '15px', color: '#5A554F', lineHeight: 1.65, margin: 0 }}>
                <strong style={{ color: '#21201E', fontWeight: 800 }}>Importance of Daily Practice & Mindful Breaks.</strong> In today's fast-paced world, taking dedicated time on the mat to breathe, decompress, and reconnect with your inner self is essential for long-term physical health, mental clarity, and emotional harmony.
              </p>
            </div>

            <div>
              <p style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '15px', color: '#5A554F', lineHeight: 1.65, margin: 0 }}>
                <strong style={{ color: '#21201E', fontWeight: 800 }}>Benefits of Authentic Yogic Science.</strong> Regular practice of authentic asanas, pranayama, and meditation stimulates circulation, enhances flexibility and core strength, balances nervous system function, and lowers stress — leaving you renewed and centered.
              </p>
            </div>

            <div>
              <p style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '15px', color: '#5A554F', lineHeight: 1.65, margin: 0 }}>
                <strong style={{ color: '#21201E', fontWeight: 800 }}>Tailored Personal Guidance & Practice.</strong> Every membership tier and package is crafted to meet you at your unique stage of practice. Whether you seek dynamic vinyasa flows, therapeutic alignment, or restorative sound bath resets, our master faculty customize your sanctuary journey.
              </p>
            </div>

            <div>
              <p style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '15px', color: '#5A554F', lineHeight: 1.65, margin: 0 }}>
                <strong style={{ color: '#21201E', fontWeight: 800 }}>Transparent Luxury Sanctuary Value.</strong> Our curated package tiers deliver world-class instruction, hydrotherapy amenities, and personalized care at accessible, transparent rates — empowering a sustainable, lifelong yoga practice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Packages & Filter Section */}
      <section
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
            <p
              style={{
                fontFamily: "'BNCringeSerif', 'Canela', Georgia, serif",
                fontStyle: 'italic',
                fontSize: '20px',
                color: '#6B655F',
                maxWidth: '560px',
                margin: '0 auto 8px auto',
                lineHeight: 1.45
              }}
            >
              “Yog is the journey of the self, through the self, to the self.”
            </p>
            <span style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '13px', color: '#944426', fontWeight: 700, letterSpacing: '0.04em' }}>
              — The Bhagavad Gita
            </span>
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
              const numericAmount = typeof pkg.amount === 'number' ? pkg.amount : parseFloat(String(pkg.amount)) || 0;
              const periodText = pkg.period ? ` / ${pkg.period}` : ' / month';
              
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
                    boxShadow: isPopular ? '0 12px 32px rgba(96, 165, 250, 0.15)' : '0 6px 24px rgba(0, 0, 0, 0.04)',
                    border: isPopular ? '2px solid #60A5FA' : '1px solid rgba(0, 0, 0, 0.08)',
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
                          backgroundColor: isPopular ? '#93C5FD' : 'rgba(255, 255, 255, 0.92)',
                          color: isPopular ? '#1E40AF' : '#21201E',
                          borderRadius: '999px',
                          padding: '4px 14px',
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        {isPopular ? 'POPULAR RITUAL' : pkg.groupCategory || 'CLASSIC CHOICE'}
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
                          color: '#60A5FA',
                          textTransform: 'uppercase',
                          marginBottom: '6px'
                        }}
                      >
                        {pkg.groupCategory === 'Membership' ? 'SIGNATURE SANCTUARY MEMBERSHIP' : 'PRAGYA YOG SPECIAL BUNDLE'}
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
                        ${numericAmount} {periodText} {pkg.discount ? `| Save $${pkg.discount}` : ''}
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
                        {pkg.description || 'Access luxury yoga sanctuary amenities and expert guided classes.'}
                      </p>

                      {/* Package Includes Subheading & List */}
                      <div>
                        <div
                          style={{
                            fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                            fontSize: '11px',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            color: '#60A5FA',
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
                                  backgroundColor: 'rgba(96, 165, 250, 0.12)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                              >
                                <Check size={11} color="#60A5FA" strokeWidth={3} />
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

                  {/* Action Button */}
                  <div className="package-card-button-box" style={{ padding: '0 24px 24px 24px' }}>
                    <button
                      onClick={() => onOpenBooking('package', pkg.title, pkg)}
                      style={{
                        width: '100%',
                        backgroundColor: isPopular ? '#21201E' : '#21201E',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '999px',
                        padding: '13px 26px',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 16px rgba(33, 32, 30, 0.12)',
                        transition: 'all 0.25s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#944426';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#21201E';
                      }}
                    >
                      <span>Select {pkg.groupCategory === 'Membership' ? 'Membership' : 'Package'}</span>
                      <ArrowUpRight size={16} />
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
