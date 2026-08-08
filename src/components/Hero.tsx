import React, { useState, useEffect } from 'react';
import { getDailyQuote } from '../services/api';
import { DailyQuote } from '../types';

interface HeroProps {
  onOpenBooking: (type?: string, title?: string) => void;
  onNavigateSection?: (sectionId: string) => void;
  onViewChange?: (view: any) => void;
}

const HERO_DESKTOP_IMAGES = [
  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2000&auto=format&fit=crop',
  '/hero1.webp',
  '/hero3.webp?v=2'
];

export const Hero: React.FC<HeroProps> = ({ onOpenBooking, onNavigateSection, onViewChange }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dailyQuote, setDailyQuote] = useState<DailyQuote | null>(null);

  useEffect(() => {
    getDailyQuote().then((data) => {
      if (data) setDailyQuote(data);
    });

    // Preload desktop hero images for smooth transition
    HERO_DESKTOP_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % HERO_DESKTOP_IMAGES.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="hero"
      className="hero-section"
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        paddingTop: '140px',
        paddingBottom: '50px',
        backgroundColor: '#F5EFE5'
      }}
    >
      {/* Desktop Full-Screen Cover Background Image Layer (Auto-rotating Slideshow) */}
      {HERO_DESKTOP_IMAGES.map((imageSrc, index) => (
        <div
          key={imageSrc}
          className="hero-bg-desktop"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('${imageSrc}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            backgroundRepeat: 'no-repeat',
            zIndex: 1,
            opacity: currentImageIndex === index ? 1 : 0,
            transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'opacity'
          }}
        />
      ))}

      {/* Bottom White/Light Gradient Filter for desktop text legibility */}
      <div
        className="hero-bg-overlay-desktop"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, transparent 0%, transparent 35%, rgba(245, 239, 229, 0.65) 60%, rgba(245, 239, 229, 0.92) 82%, #F5EFE5 100%)',
          zIndex: 2,
          pointerEvents: 'none'
        }}
      />

      {/* Mobile Full-Screen Background Image Layer */}
      <div
        className="hero-bg-mobile"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('/heromobile.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
          zIndex: 1
        }}
      />

      {/* Main Top Title & CTA Section */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '0 24px',
          width: '100%'
        }}
      >
        {/* Title */}
        <h1
          className="hero-main-title"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 'clamp(36px, 5.2vw, 76px)',
            fontWeight: 400,
            lineHeight: 1.1,
            color: '#21201E',
            marginBottom: '16px',
            letterSpacing: '-0.02em'
          }}
        >
          Stronger Core, <span style={{ fontFamily: "var(--font-accent)", fontStyle: 'italic', fontWeight: 400 }}>Stronger You</span>
        </h1>

        {/* Subtitle Paragraph */}
        <p
          className="hero-subtitle"
          style={{
            fontFamily: "'Neue Montreal', -apple-system, sans-serif",
            fontSize: '15px',
            color: '#4A4640',
            maxWidth: '540px',
            margin: '0 auto 32px auto',
            lineHeight: 1.6,
            fontWeight: 400
          }}
        >
          Strengthen your body, calm your mind, and embrace mindful movement with our expert-led pilates sessions.
        </p>

        {/* CTA Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <button
            onClick={() => {
              if (onViewChange) {
                onViewChange('classes');
              } else if (onNavigateSection) {
                onNavigateSection('classes');
              } else {
                onOpenBooking('class', 'Book Your Session');
              }
            }}
            className="hero-cta-btn"
            style={{
              backgroundColor: '#944426',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '999px',
              padding: '16px 42px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              boxShadow: '0 10px 28px rgba(148, 68, 38, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
            }}
          >
            BOOK YOUR SESSION
          </button>
        </div>
      </div>

      {/* Mobile Pose Image Container (Matching User Reference Screenshot) */}
      <div className="hero-mobile-image-container">
        <img
          src="/heromobile.png"
          alt="Pragya Yog Mobile Hero Pose"
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '480px',
            objectFit: 'cover',
            objectPosition: 'center top',
            display: 'block'
          }}
        />
      </div>

      {/* Floating Left & Right Bottom Widgets Layer (Desktop) */}
      <div
        className="hero-widgets-layer"
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1360px',
          width: '100%',
          margin: '0 auto',
          padding: '0 48px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexGrow: 1
        }}
      >
        {/* Left Floating List Widget */}
        <div
          className="hero-left-widget"
          style={{
            maxWidth: '440px',
            width: '100%',
            marginBottom: '10px'
          }}
        >
          <p
            style={{
              fontSize: '16px',
              color: '#3A3632',
              marginBottom: '36px',
              fontWeight: 400,
              lineHeight: 1.4
            }}
          >
            We don't move to tire the body unnecessarily
          </p>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Item 01 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '20px',
                marginBottom: '20px',
                borderBottom: '1px solid rgba(0, 0, 0, 0.15)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#555555', fontSize: '15px', width: '48px', fontWeight: 400 }}>01</span>
                <span style={{ fontSize: '16px', color: '#21201E', fontWeight: 400 }}>Move gracefully in harmony.</span>
              </div>
              <div style={{ color: '#21201E', display: 'flex', alignItems: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 12C9.5 8 5.5 8 5.5 12C5.5 16 9.5 16 12 12Z"/>
                  <path d="M12 12C16 9.5 16 5.5 12 5.5C8 5.5 8 9.5 12 12Z"/>
                  <path d="M12 12C14.5 16 18.5 16 18.5 12C18.5 8 14.5 8 12 12Z"/>
                  <path d="M12 12C8 14.5 8 18.5 12 18.5C16 18.5 16 14.5 12 12Z"/>
                </svg>
              </div>
            </div>

            {/* Item 02 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '20px',
                marginBottom: '20px',
                borderBottom: '1px solid rgba(0, 0, 0, 0.15)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#555555', fontSize: '15px', width: '48px', fontWeight: 400 }}>02</span>
                <span style={{ fontSize: '16px', color: '#21201E', fontWeight: 400 }}>Breathe deeply in stillness.</span>
              </div>
              <div style={{ color: '#21201E', display: 'flex', alignItems: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"/>
                  <path d="M9 12h2l1 -2l2 4l1 -2h2"/>
                </svg>
              </div>
            </div>

            {/* Item 03 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '20px',
                borderBottom: '1px solid rgba(0, 0, 0, 0.15)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#555555', fontSize: '15px', width: '48px', fontWeight: 400 }}>03</span>
                <span style={{ fontSize: '16px', color: '#21201E', fontWeight: 400 }}>Embrace mindful resilience.</span>
              </div>
              <div style={{ color: '#21201E', display: 'flex', alignItems: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21c-4.5 0 -8 -3.5 -8 -8c0 -3 2.5 -6 8 -10c5.5 4 8 7 8 10c0 4.5 -3.5 8 -8 8z"/>
                  <path d="M12 21c-2.5 0 -5 -2.5 -5 -6c0 -2 1.5 -4.5 5 -7.5c3.5 3 5 5.5 5 7.5c0 3.5 -2.5 6 -5 6z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Right Floating Avatars & Stat Widget */}
        <div
          className="hero-right-widget"
          style={{
            marginBottom: '20px'
          }}
        >
          {/* Overlapping Avatars */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
              alt="Member 1"
              style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #FFFFFF', objectFit: 'cover' }}
            />
            <img
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop"
              alt="Member 2"
              style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #FFFFFF', objectFit: 'cover', marginLeft: '-14px' }}
            />
            <img
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop"
              alt="Member 3"
              style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #FFFFFF', objectFit: 'cover', marginLeft: '-14px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-accent)', fontSize: '38px', fontWeight: 400, color: '#21201E' }}>
              50+
            </span>
            <span style={{ fontSize: '13px', color: '#4A4640', maxWidth: '140px', lineHeight: 1.35 }}>
              Successful Body Transformations
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Quote Banner (Desktop Only - Rendered ONLY if quote from API is available) */}
      {dailyQuote && (
        <div
          className="hero-quote-banner-desktop"
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            backgroundColor: '#F5EFE5',
            color: '#21201E',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            marginTop: '36px',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)'
          }}
        >
          {/* 5 Star Rating */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', color: '#E5A93B' }}>
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>

          {/* Quote Text */}
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: 'italic',
              fontSize: '17px',
              letterSpacing: '0.01em',
              color: '#21201E',
              maxWidth: '780px',
              margin: '0 0 6px 0',
              lineHeight: 1.4,
              fontWeight: 400
            }}
          >
            "{dailyQuote.q}"
          </p>

          {/* Author / Location Attribution */}
          <p
            style={{
              fontFamily: "'Neue Montreal', -apple-system, sans-serif",
              fontSize: '12px',
              color: '#6B655D',
              letterSpacing: '0.04em',
              margin: 0,
              fontWeight: 400
            }}
          >
            — {dailyQuote.a}
          </p>
        </div>
      )}

      {/* Responsive Styles for Mobile Reference UI */}
      <style>{`
        .hero-bg-mobile {
          display: none;
        }
        .hero-mobile-image-container {
          display: none;
        }

        @media (max-width: 768px) {
          .hero-section {
            padding-top: 102px !important;
            padding-bottom: 24px !important;
            min-height: 100vh !important;
            min-height: 100dvh !important;
            justify-content: flex-start !important;
            background-color: #F5EFE5 !important;
            overflow: hidden !important;
          }
          .hero-bg-desktop, .hero-bg-overlay-desktop, .hero-quote-banner-desktop {
            display: none !important;
          }
          .hero-bg-mobile {
            display: block !important;
            position: absolute !important;
            inset: 0 !important;
            background-image: url('/heromobile.png') !important;
            background-size: cover !important;
            background-position: center bottom !important;
            background-repeat: no-repeat !important;
            z-index: 1 !important;
          }
          .hero-main-title {
            font-size: clamp(34px, 8.5vw, 46px) !important;
            line-height: 1.1 !important;
            margin-bottom: 12px !important;
            color: #21201E !important;
          }
          .hero-subtitle {
            font-size: 14px !important;
            max-width: 310px !important;
            margin-bottom: 20px !important;
            line-height: 1.5 !important;
            color: #4A4640 !important;
          }
          .hero-cta-btn {
            background-color: #21201E !important;
            color: #FFFFFF !important;
            padding: 14px 34px !important;
            font-size: 12px !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
            border-radius: 999px !important;
          }
          .hero-mobile-image-container {
            display: none !important;
          }
          .hero-widgets-layer {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
