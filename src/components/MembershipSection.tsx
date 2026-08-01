import React, { useEffect, useState } from 'react';
import { Check, RefreshCw } from 'lucide-react';
import { getPackages } from '../services/api';
import { PackageItem } from '../types';

interface MembershipSectionProps {
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
}

export const MembershipSection: React.FC<MembershipSectionProps> = ({ onOpenBooking }) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiPlans, setApiPlans] = useState<any[]>([]);

  const defaultPlans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      monthlyPrice: 49,
      annualPrice: 39,
      description: 'Perfect for beginners joining 2 classes weekly.',
      isFeatured: false,
      features: [
        'Access to group classes',
        'Studio equipment included',
        'Flexible class scheduling'
      ]
    },
    {
      id: 'standard',
      name: 'Standard Plan',
      badge: 'MOST POPULAR',
      monthlyPrice: 79,
      annualPrice: 65,
      description: 'Ideal for regular practitioners with unlimited classes.',
      isFeatured: true,
      features: [
        'Unlimited classes every week',
        'Free trial workshop access',
        'Priority booking for members'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      monthlyPrice: 129,
      annualPrice: 105,
      description: 'Best for members seeking full access and perks.',
      isFeatured: false,
      features: [
        'Access all pilates sessions.',
        'One private class monthly.',
        'Access to private events.'
      ]
    }
  ];

  useEffect(() => {
    let isMounted = true;
    getPackages().then((data) => {
      if (!isMounted) return;
      if (data && typeof data === 'object') {
        // Extract membership items or flatten categories
        const unlimitedCategory = data['Unlimited Memberships'] || [];
        const allItems: PackageItem[] = Object.values(data).flat();

        if (allItems.length > 0) {
          const mapped = [
            {
              id: allItems[0]?.id || '1',
              name: allItems[0]?.title || 'Basic Plan',
              monthlyPrice: allItems[0]?.amount ? Math.round(allItems[0].amount / 2) : 49,
              annualPrice: allItems[0]?.amount ? Math.round(allItems[0].amount / 2 * 0.8) : 39,
              description: allItems[0]?.description || 'Perfect for beginners joining 2 classes weekly.',
              isFeatured: false,
              features: allItems[0]?.features || [
                'Access to group classes',
                'Studio equipment included',
                'Flexible class scheduling'
              ],
              raw: allItems[0]
            },
            {
              id: unlimitedCategory[0]?.id || allItems[1]?.id || '2',
              name: unlimitedCategory[0]?.title || allItems[1]?.title || 'Standard Plan',
              badge: 'MOST POPULAR',
              monthlyPrice: unlimitedCategory[0]?.amount || allItems[1]?.amount || 79,
              annualPrice: unlimitedCategory[0]?.amount ? Math.round(unlimitedCategory[0].amount * 0.8) : 65,
              description: unlimitedCategory[0]?.description || allItems[1]?.description || 'Ideal for regular practitioners with unlimited classes.',
              isFeatured: true,
              features: unlimitedCategory[0]?.features || allItems[1]?.features || [
                'Unlimited classes every week',
                'Free trial workshop access',
                'Priority booking for members'
              ],
              raw: unlimitedCategory[0] || allItems[1]
            },
            {
              id: allItems[2]?.id || '3',
              name: allItems[2]?.title || 'Premium Plan',
              monthlyPrice: allItems[2]?.amount ? Math.round(allItems[2].amount * 1.6) : 129,
              annualPrice: allItems[2]?.amount ? Math.round(allItems[2].amount * 1.3) : 105,
              description: allItems[2]?.description || 'Best for members seeking full access and perks.',
              isFeatured: false,
              features: allItems[2]?.features || [
                'Access all pilates sessions.',
                'One private class monthly.',
                'Access to private events.'
              ],
              raw: allItems[2]
            }
          ];
          setApiPlans(mapped);
        } else {
          setApiPlans(defaultPlans);
        }
      } else {
        setApiPlans(defaultPlans);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const displayPlans = apiPlans.length > 0 ? apiPlans : defaultPlans;

  return (
    <section
      id="membership"
      style={{
        backgroundColor: '#FFFFFF',
        padding: '84px 0',
        color: '#21201E',
        position: 'relative'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px'
        }}
      >
        {/* Header Tag & Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {/* Pink Accent Circle */}
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: '2px solid #E879F9',
              margin: '0 auto 8px auto'
            }}
          />

          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              letterSpacing: '0.16em',
              color: '#944426',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '10px'
            }}
          >
            — MEMBERSHIP —
          </span>

          <h2
            style={{
              fontFamily: "'BNCringeSerif', 'Canela', Georgia, serif",
              fontSize: 'clamp(34px, 4.5vw, 56px)',
              fontWeight: 400,
              color: '#21201E',
              lineHeight: 1.15,
              marginBottom: '12px'
            }}
          >
            Join the Movement, Feel the Change
          </h2>

          <p style={{ fontSize: '15px', color: '#757069', margin: 0 }}>
            Flexible options to support your wellness journey.
          </p>
        </div>



        {/* Outer Warm Beige Container for 3 Cards */}
        <div
          style={{
            backgroundColor: '#EFEAE0',
            borderRadius: '32px',
            padding: '48px 36px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.03)'
          }}
          className="membership-cards-container"
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#944426' }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', display: 'block' }} />
              <p style={{ color: '#757069' }}>Loading real membership packages...</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
                alignItems: 'stretch'
              }}
              className="membership-grid"
            >
              {displayPlans.map((plan) => {
                const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;

                return (
                  <div
                    key={plan.id || plan.name}
                    style={{
                      backgroundColor: plan.isFeatured ? '#00381F' : 'transparent',
                      color: plan.isFeatured ? '#FFFFFF' : '#21201E',
                      borderRadius: plan.isFeatured ? '24px' : '0px',
                      padding: plan.isFeatured ? '36px 30px' : '32px 24px',
                      boxShadow: plan.isFeatured ? '0 20px 45px rgba(0, 56, 31, 0.25)' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative'
                    }}
                    className="plan-card-item"
                  >
                    <div>
                      {/* Title Header Row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: '20px',
                            fontWeight: 700,
                            color: plan.isFeatured ? '#FFFFFF' : '#21201E',
                            margin: 0
                          }}
                        >
                          {plan.name}
                        </h3>

                        {plan.badge && (
                          <span
                            style={{
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: '999px',
                              padding: '3px 12px',
                              fontSize: '10px',
                              fontWeight: 700,
                              letterSpacing: '0.06em',
                              color: '#FFFFFF'
                            }}
                          >
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px' }}>
                        <span
                          style={{
                            fontFamily: 'Canela, "Cormorant Garamond", Georgia, serif',
                            fontSize: '44px',
                            fontWeight: 400,
                            lineHeight: 1
                          }}
                        >
                          ${price}
                        </span>
                        <span style={{ fontSize: '13px', color: plan.isFeatured ? 'rgba(255, 255, 255, 0.65)' : '#757069' }}>
                          /month
                        </span>
                      </div>

                      {/* Description Subtitle */}
                      <p
                        style={{
                          fontSize: '13.5px',
                          color: plan.isFeatured ? 'rgba(255, 255, 255, 0.75)' : '#757069',
                          lineHeight: 1.5,
                          marginBottom: '28px',
                          minHeight: '40px'
                        }}
                      >
                        {plan.description}
                      </p>

                      {/* Divider Line */}
                      <div
                        style={{
                          borderBottom: plan.isFeatured ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #DFD9CF',
                          marginBottom: '28px'
                        }}
                      />

                      {/* Features List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '36px' }}>
                        {plan.features.map((feat: string) => (
                          <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13.5px' }}>
                            <div
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: plan.isFeatured ? '#FFFFFF' : '#21201E',
                                color: plan.isFeatured ? '#21201E' : '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <Check size={12} strokeWidth={3} />
                            </div>
                            <span style={{ color: plan.isFeatured ? '#FFFFFF' : '#3A3834' }}>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Choose Plan Button */}
                    <button
                      onClick={() => onOpenBooking('membership', plan.name, { ...plan, price, isAnnual })}
                      style={{
                        width: '100%',
                        padding: '14px 20px',
                        borderRadius: '999px',
                        backgroundColor: plan.isFeatured ? '#FFFFFF' : 'transparent',
                        color: plan.isFeatured ? '#21201E' : '#21201E',
                        border: plan.isFeatured ? 'none' : '1px solid #21201E',
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease'
                      }}
                      className="choose-plan-btn"
                    >
                      CHOOSE YOUR PLAN
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .choose-plan-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.08);
        }
        @media (max-width: 900px) {
          .membership-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .membership-cards-container {
            padding: 32px 20px !important;
          }
        }
      `}</style>
    </section>
  );
};
