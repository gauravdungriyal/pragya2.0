import React, { useEffect, useState } from 'react';
import { Zap, Sparkles, Heart, Users, ChevronRight } from 'lucide-react';
import { getSiteConfig, subscribeSiteConfig, SiteConfig } from '../services/siteConfig';
import { InteractiveSchedule } from './InteractiveSchedule';
import { ClassFinderModal } from './ClassFinderModal';

interface ClassesPageProps {
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  onNavigateSection?: (sectionId: string) => void;
  onOpenChat?: () => void;
}

export const ClassesPage: React.FC<ClassesPageProps> = ({ onOpenBooking, onNavigateSection, onOpenChat }) => {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(getSiteConfig());
  const [showClassFinder, setShowClassFinder] = useState<boolean>(false);

  useEffect(() => {
    return subscribeSiteConfig(setSiteConfig);
  }, []);

  return (
    <div style={{ backgroundColor: '#FAF6F0', color: '#21201E', minHeight: '100vh', width: '100%' }}>
      {/* Top Banner / Hero Header */}
      <section
        style={{
          width: '100%',
          backgroundColor: '#FAF6F0',
          padding: '80px 32px 40px 32px',
          borderBottom: '1px solid rgba(39, 39, 39, 0.08)'
        }}
      >
        <div
          className="ultrawide-container"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '32px',
            flexWrap: 'wrap'
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.2em',
                color: '#944426',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '12px'
              }}
            >
              — PRAGYA YOG SCHOOL —
            </span>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 'clamp(42px, 6vw, 68px)',
                fontWeight: 400,
                color: '#21201E',
                margin: 0,
                lineHeight: 1.05,
                letterSpacing: '-0.02em'
              }}
            >
              {siteConfig.classesPageConfig?.topTitle || 'Explore'}{' '}
              <span
                style={{
                  fontFamily: "var(--font-accent)",
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: '#21201E'
                }}
              >
                {siteConfig.classesPageConfig?.topTitleItalic || 'Our Classes'}
              </span>
              {siteConfig.classesPageConfig?.topSuffix ? ` ${siteConfig.classesPageConfig.topSuffix}` : ''}
            </h1>
          </div>

          <div>
            <p
              className="classes-top-subtitle"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: '16px',
                color: '#6B655F',
                lineHeight: 1.6,
                margin: 0,
                maxWidth: '480px'
              }}
            >
              {siteConfig.classesPageConfig?.topSubtitle || 'From calming flows to energizing practices, Pragya Yog School offers a variety of yoga classes designed to fit every lifestyle and level.'}
            </p>
          </div>
        </div>
      </section>

      {/* Discover Your Ideal Yog Practice Header & NEW TO PRAGYA Banner */}
      <section
        className="ultrawide-container"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '60px 32px 20px 32px'
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 'clamp(34px, 4.8vw, 54px)',
              fontWeight: 700,
              color: '#21201E',
              margin: '0 0 12px 0',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}
          >
            {siteConfig.classesPageConfig?.idealTitle || 'Discover Your'}{' '}
            <span style={{ fontFamily: "var(--font-accent)", fontStyle: 'italic', fontWeight: 400 }}>
              {siteConfig.classesPageConfig?.idealTitleItalic || 'Ideal'}
            </span>
            {siteConfig.classesPageConfig?.idealSuffix !== undefined
              ? (siteConfig.classesPageConfig.idealSuffix ? ` ${siteConfig.classesPageConfig.idealSuffix}` : '')
              : ' Yog Practice'}
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: '16px', color: '#6B655F', margin: '0 0 20px 0' }}>
            {siteConfig.classesPageConfig?.idealSubtitle || 'Join a class that matches your pace, your goals, and your lifestyle'}
          </p>

          {/* NEW TO PRAGYA Interactive Class Finder Banner */}
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', width: '100%' }}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowClassFinder(true);
              }}
              className="group class-finder-banner-btn"
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                borderRadius: '999px',
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(39, 39, 39, 0.12)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
                cursor: 'pointer',
                padding: '14px 24px',
                width: '100%',
                maxWidth: '840px',
                textAlign: 'left',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease'
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(148, 68, 38, 0.1)',
                  color: '#944426',
                  border: '1px solid rgba(148, 68, 38, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Sparkles size={18} color="#944426" className="group-hover:rotate-12 transition-transform" />
              </div>

              <div style={{ flex: 1, minWidth: 0, paddingLeft: '10px', paddingRight: '10px' }}>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    color: '#944426',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '2px'
                  }}
                >
                  NEW TO PRAGYA?
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: '14.5px',
                    fontWeight: 700,
                    color: '#21201E',
                    display: 'block',
                    lineHeight: 1.3
                  }}
                >
                  Not sure which class is right for you?
                </span>
              </div>

              <span
                className="class-finder-action-pill"
                style={{
                  backgroundColor: '#944426',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  flexShrink: 0,
                  padding: '10px 24px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 14px rgba(148, 68, 38, 0.35)',
                  boxSizing: 'border-box'
                }}
              >
                <span>Start Here</span>
                <ChevronRight size={16} color="#FFFFFF" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Single Unified Live Schedule Component */}
      <InteractiveSchedule
        onOpenBooking={onOpenBooking}
        onNavigateSection={onNavigateSection}
        onOpenChat={onOpenChat}
        showHeading={true}
      />

      {/* SECTION 2: The Gift of Yoga */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '96px auto 96px auto',
          padding: '0 32px',
          textAlign: 'center'
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto 56px auto' }}>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 400,
              color: '#21201E',
              margin: '0 0 14px 0',
              lineHeight: 1.12
            }}
          >
            {siteConfig.classesPageConfig?.giftTitle || 'The'}{' '}
            <span
              style={{
                fontFamily: "var(--font-accent)",
                fontStyle: 'italic',
                fontWeight: 400
              }}
            >
              {siteConfig.classesPageConfig?.giftTitleItalic || 'Gift'}
            </span>
            {siteConfig.classesPageConfig?.giftSuffix !== undefined
              ? (siteConfig.classesPageConfig.giftSuffix ? ` ${siteConfig.classesPageConfig.giftSuffix}` : '')
              : ' of Yoga'}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: '15.5px',
              color: '#6B655F',
              lineHeight: 1.6,
              margin: 0
            }}
          >
            {siteConfig.classesPageConfig?.giftSubtitle || "Yoga is more than a physical practice, it's a path toward wellness, balance, and inner peace"}
          </p>
        </div>

        {/* 4 Feature Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '32px'
          }}
        >
          {(siteConfig.classesPageConfig?.giftCards || []).map((card, idx) => {
            const icons = [<Zap size={26} color="#4A4540" />, <Sparkles size={26} color="#4A4540" />, <Heart size={26} color="#4A4540" />, <Users size={26} color="#4A4540" />];
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#EAE1D3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}
                >
                  {icons[idx % icons.length]}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#21201E',
                    margin: '0 0 8px 0'
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: '14px',
                    color: '#6B655F',
                    lineHeight: 1.5,
                    margin: 0
                  }}
                >
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Class Finder Modal */}
      <ClassFinderModal
        isOpen={showClassFinder}
        onClose={() => setShowClassFinder(false)}
        onSelectRecommendation={() => {
          setShowClassFinder(false);
          const el = document.getElementById('live-schedule');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenBooking={onOpenBooking}
        onOpenChat={onOpenChat}
      />
    </div>
  );
};

export default ClassesPage;
