import React, { useEffect, useState } from 'react';
import { Zap, Sparkles, Heart, Users } from 'lucide-react';
import { getSiteConfig, subscribeSiteConfig, SiteConfig } from '../services/siteConfig';

export const GiftOfYoga: React.FC = () => {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(getSiteConfig());

  useEffect(() => {
    return subscribeSiteConfig(setSiteConfig);
  }, []);

  const defaultGifts = [
    {
      icon: Zap,
      title: 'Physical Strength & Flexibility',
      description: 'Build endurance, improve posture, and move with more ease and confidence.',
    },
    {
      icon: Sparkles,
      title: 'Mental Clarity',
      description: 'Reduce stress, sharpen focus, and calm the mind through mindful movement and breathwork.',
    },
    {
      icon: Heart,
      title: 'Emotional Balance',
      description: 'Release tension, manage emotions, and create harmony between body and spirit.',
    },
    {
      icon: Users,
      title: 'Community Connection',
      description: 'Join a welcoming space where like-minded individuals grow and thrive together.',
    },
  ];

  const giftCards = siteConfig.classesPageConfig?.giftCards && siteConfig.classesPageConfig.giftCards.length > 0
    ? siteConfig.classesPageConfig.giftCards
    : defaultGifts;

  return (
    <section
      id="gift-of-yoga"
      style={{
        backgroundColor: '#F5EFE6',
        padding: '80px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Main Heading */}
        <h2
          style={{
            fontFamily: 'var(--font-serif, serif)',
            fontSize: 'clamp(32px, 4.5vw, 54px)',
            fontWeight: 400,
            color: '#1C1917',
            marginBottom: '14px',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
          }}
        >
          {siteConfig.classesPageConfig?.giftTitle || 'The'}{' '}
          <span style={{ fontStyle: 'italic', fontFamily: 'serif' }}>
            {siteConfig.classesPageConfig?.giftTitleItalic || 'Gift'}
          </span>
          {siteConfig.classesPageConfig?.giftSuffix ? ` ${siteConfig.classesPageConfig.giftSuffix}` : ' of Yoga'}
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(14px, 1.8vw, 16px)',
            color: '#66635F',
            maxWidth: '680px',
            margin: '0 auto 56px auto',
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          {siteConfig.classesPageConfig?.giftSubtitle || "Yoga is more than a physical practice, it's a path toward wellness, balance, and inner peace"}
        </p>

        {/* 4 Feature Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '36px 28px',
            alignItems: 'start',
          }}
        >
          {giftCards.map((item, index) => {
            const fallbackIcon = defaultGifts[index % defaultGifts.length]?.icon || Sparkles;
            const IconComponent = (item as any).icon || fallbackIcon;
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0 12px',
                }}
              >
                {/* Circle Icon Badge */}
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#EAE3D8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    color: '#4A453E',
                  }}
                >
                  <IconComponent size={24} strokeWidth={1.75} />
                </div>

                {/* Card Title */}
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#1C1917',
                    marginBottom: '10px',
                    lineHeight: 1.3,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  {item.title}
                </h3>

                {/* Card Description */}
                <p
                  style={{
                    fontSize: '14px',
                    color: '#66635F',
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
