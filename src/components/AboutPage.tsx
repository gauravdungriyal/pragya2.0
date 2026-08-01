import React from 'react';
import { 
  Check, 
  ArrowRight, 
  Sparkles, 
  Compass, 
  Eye, 
  BookOpen, 
  Microscope, 
  Flame, 
  Activity, 
  Target, 
  Sun,
  HeartPulse
} from 'lucide-react';

interface AboutPageProps {
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenBooking }) => {
  const benefits = [
    'Enhances flexibility and joint mobility',
    'Improves circulation and energy flow',
    'Promotes relaxation and stress relief',
    'Increases mindfulness and self-awareness',
    'Balances the nervous system for better sleep and calmness'
  ];

  const coaches = [
    {
      name: 'Daniel Lee',
      role: 'Master Instructor',
      avatar: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=200&auto=format&fit=crop'
    },
    {
      name: 'Harper James',
      role: 'Mindfulness Specialist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
    },
    {
      name: 'Chloe Bennett',
      role: 'Yin & Restorative Guide',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
    }
  ];

  const elements = [
    {
      title: 'Holistic Well-being',
      description: 'Embracing the ancient wisdom and practices of yog to nurture holistic well-being.',
      icon: Sparkles,
      color: '#944426'
    },
    {
      title: 'Harmony',
      description: 'Bridging mind, body, and spirit for a harmonious and balanced life.',
      icon: Compass,
      color: '#9D9D48'
    },
    {
      title: 'Self-Discovery',
      description: 'Encouraging self-exploration and mindfulness to awaken your true potential.',
      icon: Eye,
      color: '#944426'
    },
    {
      title: 'Continuous Growth',
      description: 'Fostering continuous learning and personal development through yogic practices.',
      icon: BookOpen,
      color: '#9D9D48'
    }
  ];

  const pillars = [
    {
      tag: 'BODY & MIND ACCURACY',
      title: 'Biomechanical Precision',
      description: 'Every posture is taught with deep anatomical awareness and alignment to ensure maximum safety, physical longevity, and joint protection.',
      icon: Microscope,
      badgeColor: '#944426',
      bgColor: '#FFFFFF'
    },
    {
      tag: 'ANCIENT LINEAGE',
      title: 'Traditional Roots',
      description: 'We preserve the sacred integrity of traditional Hatha & Ashtanga Vinyasa yoga while adapting practices to modern lifestyle needs.',
      icon: Flame,
      badgeColor: '#00381F',
      bgColor: '#FFFFFF'
    },
    {
      tag: 'AUTONOMIC HEALING',
      title: 'Nervous System Regulation',
      description: 'Integrating targeted pranayama breathwork and restorative sound baths to lower cortisol, calm autonomic arousal, and restore deep sleep.',
      icon: HeartPulse,
      badgeColor: '#D9AE29',
      bgColor: '#FFFFFF'
    },
    {
      tag: 'COMMUNITY & GUIDANCE',
      title: 'Personalized Mentorship',
      description: 'Small class sizes ensure every practitioner receives individualized feedback, hands-on adjustments, and continuous guidance.',
      icon: Activity,
      badgeColor: '#944426',
      bgColor: '#FFFFFF'
    },
    {
      tag: 'PURPOSE & PASSION',
      title: 'Our Mission',
      description: 'To guide you to embrace conscious living through the transformative power of yog by igniting your passion and curiosity for yog and let you experience the wisdom of yog and harness the transformative energy of yog for vitality.',
      icon: Sun,
      badgeColor: '#00381F',
      bgColor: '#FFFFFF'
    },
    {
      tag: 'SCIENCE MEETS SPIRITUALITY',
      title: 'Our Goal',
      description: 'We aim at being the most comprehensive and authentic yog institute where science meets spirituality.',
      icon: Target,
      badgeColor: '#D9AE29',
      bgColor: '#FFFFFF'
    }
  ];

  return (
    <div className="about-page-wrapper" style={{ backgroundColor: '#F5EFE5', minHeight: '100vh', color: '#21201E', paddingBottom: 0 }}>
      
      {/* Top Section Header: Title & Subtitle */}
      <section className="about-top-section">
        <div className="about-top-container">
          {/* Title: Brand Name with Bold Sans + Italic Serif Brand Fonts */}
          <h1 className="about-hero-title">
            Pragya <span className="title-serif-italic">Yog School</span>
          </h1>

          {/* Subtitle */}
          <p className="about-hero-subtitle">
            A meditative practice of stillness and deep stretches designed to release tension, restore balance, and calm the mind.
          </p>

          {/* Full-Width Featured Image */}
          <div className="about-hero-img-box">
            <img
              src="/about.png"
              alt="Yin Yoga practitioner in serene pose at Pragya Yog School"
              className="about-hero-img"
            />
          </div>
        </div>
      </section>

      {/* 2-Column Main Layout Section */}
      <section className="about-main-section">
        <div className="about-content-grid">
          
          {/* Left Column: About the Class & Benefit */}
          <div className="about-left-col">
            {/* About Pragya Yog School */}
            <div className="about-block">
              <h2 className="block-title">About Pragya Yog School</h2>
              <p className="block-desc">
                Pragya Yog School is a holistic sanctuary dedicated to traditional Hatha, Ashtanga, Yin Yoga, and therapeutic sound healing. Guided by ancient lineage and modern physiological science, our sanctuary empowers students to cultivate awareness, deepen their practice, and experience true mind-body harmony.
              </p>
            </div>

            {/* Benefit List */}
            <div className="benefit-block">
              <h2 className="block-title">Benefit</h2>

              <ul className="benefit-list">
                {benefits.map((item, idx) => (
                  <li key={idx} className="benefit-item">
                    <div className="check-badge">
                      <Check size={13} color="#21201E" strokeWidth={2.5} />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Spec Key Details Card Box */}
          <div className="about-spec-card">
            <div className="spec-table-grid">
              <div className="spec-label">Level</div>
              <div className="spec-value">Beginner</div>

              <div className="spec-label">Schedule</div>
              <div className="spec-value">Mon, Wed, Fri</div>

              <div className="spec-label">Duration</div>
              <div className="spec-value">60 minutes</div>

              <div className="spec-label">Type</div>
              <div className="spec-value">Restorative & Meditative</div>

              <div className="spec-label label-coaches">Coaches</div>
              <div className="coaches-pills-list">
                {coaches.map((coach, idx) => (
                  <div key={idx} className="coach-pill">
                    <img src={coach.avatar} alt={coach.name} className="coach-avatar" />
                    <span className="coach-name">{coach.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => onOpenBooking('class', 'Yin Yoga Session')}
              className="about-book-btn"
            >
              <span>BOOK THIS CLASS</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 2: Our Elements */}
      <section className="about-elements-section">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: '#944426',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '10px'
            }}
          >
            — CORE VALUES —
          </span>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 'clamp(28px, 3.8vw, 42px)',
              fontWeight: 400,
              color: '#21201E',
              margin: 0,
              lineHeight: 1.15
            }}
          >
            Guided by Wisdom & Purpose
          </h2>
        </div>

        <div className="elements-grid">
          {elements.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} className="element-card">
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#EAE1D3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    color: item.color
                  }}
                >
                  <IconComponent size={22} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#21201E', marginBottom: '10px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#6B655F', lineHeight: 1.6, margin: 0 }}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: Pillars & Philosophy Grid */}
      <section className="about-pillars-section">
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 48px auto' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: '#00381F',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '10px'
            }}
          >
            — OUR FOUNDATION —
          </span>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 'clamp(28px, 3.8vw, 42px)',
              fontWeight: 400,
              color: '#21201E',
              margin: 0,
              lineHeight: 1.15
            }}
          >
            Pillars of Pragya Sanctuary
          </h2>
        </div>

        <div className="pillars-grid">
          {pillars.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} className="pillar-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      color: item.badgeColor,
                      textTransform: 'uppercase'
                    }}
                  >
                    {item.tag}
                  </span>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#F5EFE5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.badgeColor
                    }}
                  >
                    <IconComponent size={18} />
                  </div>
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#21201E', marginBottom: '12px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '14.5px', color: '#5A554F', lineHeight: 1.6, margin: 0 }}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner with Rich Serene Background Image */}
      <section className="about-bottom-cta">
        <div className="about-bottom-cta-overlay" />
        <div className="about-bottom-cta-content">
          <h2 className="cta-heading">
            Ready to <span className="cta-italic">Embrace</span><br />Stillness?
          </h2>
          <p className="cta-subtext">
            Join Pragya Yog School and experience the deep release, calm, and balance your body and mind deserve.
          </p>

          <button
            onClick={() => onOpenBooking('class', 'Book Your Spot - Pragya Yog School')}
            className="cta-book-btn"
          >
            <span>Book Your Spot</span>
          </button>
        </div>
      </section>

      {/* Component Styles & Mobile Responsive Specs Matching Reference Screenshot */}
      <style>{`
        .about-top-section {
          max-width: 1280px;
          margin: 0 auto;
          padding: 130px 32px 32px 32px;
        }
        .about-hero-title {
          font-family: 'Neue Montreal', -apple-system, sans-serif;
          font-size: clamp(38px, 5.5vw, 64px);
          font-weight: 700;
          color: #21201E;
          line-height: 1.08;
          margin: 0 0 16px 0;
          letter-spacing: -0.02em;
        }
        .title-serif-italic {
          font-family: var(--font-serif);
          font-style: italic;
          font-weight: 400;
        }
        .about-hero-subtitle {
          font-family: var(--font-sans);
          font-size: 16px;
          color: #6B655F;
          line-height: 1.6;
          margin: 0 0 32px 0;
          max-width: 620px;
        }
        .about-hero-img-box {
          width: 100%;
          height: clamp(260px, 42vw, 500px);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 12px 36px rgba(33, 32, 30, 0.08);
          margin-bottom: 48px;
        }
        .about-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 35%;
          display: block;
        }
        .about-main-section {
          max-width: 1280px;
          margin: 0 auto 84px auto;
          padding: 0 32px;
        }
        .about-content-grid {
          display: grid;
          gridTemplateColumns: 1fr 380px;
          gap: 64px;
          align-items: start;
        }
        .block-title {
          font-family: var(--font-serif);
          font-size: 28px;
          font-weight: 400;
          color: #21201E;
          margin: 0 0 16px 0;
          letter-spacing: -0.01em;
        }
        .block-desc {
          font-family: var(--font-sans);
          font-size: 15.5px;
          color: #5A554F;
          line-height: 1.7;
          margin: 0 0 40px 0;
          max-width: 720px;
        }
        .benefit-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .benefit-item {
          display: flex;
          align-items: center;
          gap: 14px;
          font-family: var(--font-sans);
          font-size: 15px;
          color: #4A4540;
          line-height: 1.4;
        }
        .check-badge {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #EAE1D3;
          border: 1px solid rgba(33, 32, 30, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .about-spec-card {
          background-color: #EAE1D3;
          border-radius: 20px;
          padding: 36px 32px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .spec-table-grid {
          display: grid;
          grid-template-columns: 100px 1fr;
          row-gap: 20px;
          align-items: center;
        }
        .spec-label {
          font-size: 14px;
          color: #7A756F;
          font-weight: 500;
        }
        .label-coaches {
          align-self: start;
          padding-top: 6px;
        }
        .spec-value {
          font-size: 15px;
          font-weight: 700;
          color: #21201E;
        }
        .coaches-pills-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
        }
        .coach-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: #FFFFFF;
          border-radius: 999px;
          padding: 4px 14px 4px 4px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        }
        .coach-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          object-fit: cover;
        }
        .coach-name {
          font-size: 13.5px;
          font-weight: 600;
          color: #21201E;
        }
        .about-book-btn {
          margin-top: 12px;
          width: 100%;
          background-color: #21201E;
          color: #FFFFFF;
          border: none;
          border-radius: 999px;
          padding: 14px 24px;
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .about-book-btn:hover {
          background-color: #944426;
          transform: translateY(-1px);
        }
        .about-elements-section {
          max-width: 1280px;
          margin: 0 auto 96px auto;
          padding: 0 32px;
        }
        .elements-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .element-card {
          background-color: #EAE1D3;
          border-radius: 20px;
          padding: 32px 24px;
          transition: all 0.3s ease;
        }
        .about-pillars-section {
          max-width: 1280px;
          margin: 0 auto 96px auto;
          padding: 0 32px;
        }
        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .pillar-card {
          background-color: #FFFFFF;
          border-radius: 20px;
          padding: 36px 28px;
          border: 1px solid rgba(33, 32, 30, 0.08);
          transition: all 0.3s ease;
        }
        .about-bottom-cta {
          position: relative;
          background-image: url('https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1600&auto=format&fit=crop');
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          padding: 120px 32px;
          margin-top: 64px;
          overflow: hidden;
        }
        .about-bottom-cta-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(20, 18, 16, 0.42) 0%, rgba(255, 255, 255, 0.22) 42%, rgba(255, 255, 255, 0.82) 78%, #FFFFFF 100%);
          z-index: 1;
        }
        .about-bottom-cta-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 720px;
          margin: 0 auto;
        }
        .cta-heading {
          font-family: 'Neue Montreal', -apple-system, sans-serif;
          font-size: clamp(38px, 5.2vw, 62px);
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 20px;
          line-height: 1.15;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }
        .cta-italic {
          font-family: var(--font-serif);
          font-style: italic;
          font-weight: 400;
        }
        .cta-subtext {
          font-size: 16px;
          color: #21201E;
          font-weight: 500;
          max-width: 580px;
          margin: 0 auto 36px auto;
          line-height: 1.6;
          font-family: 'Neue Montreal', -apple-system, sans-serif;
        }
        .cta-book-btn {
          background-color: #21201E;
          color: #FFFFFF;
          border: none;
          border-radius: 999px;
          padding: 16px 42px;
          font-size: 14.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(33, 32, 30, 0.2);
          transition: all 0.25s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .cta-book-btn:hover {
          background-color: #000000;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
        }

        /* Mobile View - Premium Responsive Layout matching Yog Sanctuary aesthetics */
        @media (max-width: 768px) {
          .about-top-section {
            padding: 104px 20px 20px 20px !important;
          }
          .about-hero-title {
            font-size: 40px !important;
            margin-bottom: 14px !important;
          }
          .about-hero-subtitle {
            font-size: 14.5px !important;
            margin-bottom: 24px !important;
            line-height: 1.55 !important;
            color: #6B655F !important;
          }
          .about-hero-img-box {
            height: 230px !important;
            border-radius: 12px !important;
            margin-bottom: 32px !important;
          }
          .about-main-section {
            padding: 0 20px !important;
            margin-bottom: 56px !important;
          }
          .about-content-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .block-title {
            font-size: 22px !important;
            margin-bottom: 12px !important;
          }
          .block-desc {
            font-size: 14px !important;
            line-height: 1.6 !important;
            margin-bottom: 32px !important;
          }
          .benefit-list {
            gap: 14px !important;
          }
          .benefit-item {
            font-size: 13.5px !important;
          }
          .about-spec-card {
            padding: 24px 20px !important;
            border-radius: 18px !important;
            background-color: #EAE4D9 !important;
            margin-top: 12px !important;
          }
          .spec-table-grid {
            grid-template-columns: 90px 1fr !important;
            row-gap: 18px !important;
          }
          .spec-label {
            font-size: 13.5px !important;
          }
          .spec-value {
            font-size: 14px !important;
          }
          .about-elements-section, .about-pillars-section {
            padding: 0 20px !important;
            margin-bottom: 56px !important;
          }
          .elements-grid, .pillars-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .element-card {
            padding: 24px 20px !important;
            border-radius: 18px !important;
          }
          .pillar-card {
            padding: 24px 20px !important;
            border-radius: 18px !important;
          }
          .pillar-card h3 {
            font-size: 18px !important;
            margin-bottom: 8px !important;
          }
          .pillar-card p {
            font-size: 13.5px !important;
            line-height: 1.55 !important;
          }
          .about-bottom-cta {
            padding: 56px 20px !important;
            margin-top: 48px !important;
          }
          .about-bottom-cta h2 {
            font-size: 32px !important;
            line-height: 1.15 !important;
            margin-bottom: 16px !important;
          }
          .about-bottom-cta p {
            font-size: 14px !important;
            line-height: 1.55 !important;
            margin-bottom: 28px !important;
          }
          .cta-book-btn {
            width: 100% !important;
            padding: 16px 24px !important;
            font-size: 14px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
