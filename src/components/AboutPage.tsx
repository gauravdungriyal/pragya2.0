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
      name: 'Master Aarya',
      role: 'Head of School',
      avatar: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=200&auto=format&fit=crop'
    },
    {
      name: 'Dr. Yatendra',
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
      title: 'Awareness',
      description: 'Cultivating mindfulness, self-awareness, and a deeper understanding of oneself.',
      icon: Eye,
      color: '#620513'
    },
    {
      title: 'Education',
      description: 'Providing authentic, traditional, and scientifically-backed teachings to empower individuals.',
      icon: BookOpen,
      color: '#00381F'
    },
    {
      title: 'Scientific',
      description: 'Integrating modern research and knowledge to enhance the effectiveness of yog practices.',
      icon: Microscope,
      color: '#944426'
    },
    {
      title: 'Spirituality',
      description: 'Focus on personal growth, understanding of oneself and building deeper connections with others.',
      icon: Flame,
      color: '#D9AE29'
    }
  ];

  const pillars = [
    {
      tag: 'LIFE & HARMONY',
      title: 'Our Mission',
      description: 'To empower you to cultivate awareness, support you grow and progress to reach a greater level of harmony of the mind, body and soul.',
      icon: HeartPulse,
      badgeColor: '#944426',
      bgColor: '#FFFFFF'
    },
    {
      tag: 'CONSCIOUS LIVING',
      title: 'Our Vision',
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
    <div style={{ backgroundColor: '#F5EFE5', minHeight: '100vh', color: '#21201E', paddingBottom: 0 }}>
      {/* Top Banner Header */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '140px 32px 32px 32px'
        }}
      >
        <div
          className="about-header-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            alignItems: 'center'
          }}
        >
          {/* Main Display Title */}
          <div>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 'clamp(40px, 5.8vw, 72px)',
                fontWeight: 400,
                color: '#21201E',
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
                margin: 0
              }}
            >
              Pragya{' '}
              <span
                style={{
                  fontFamily: "'Canela', serif",
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: '#21201E'
                }}
              >
                Yog School
              </span>
            </h1>
          </div>

          {/* Top Description */}
          <div>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: '16px',
                color: '#6B655F',
                lineHeight: 1.6,
                margin: 0,
                maxWidth: '480px'
              }}
            >
              A premier wellness sanctuary combining traditional Hatha & Ashtanga lineage with modern science, dedicated to nurturing holistic well-being, harmony, and inner transformation.
            </p>
          </div>
        </div>
      </section>

      {/* Main Full-Width Hero Image Banner */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto 64px auto',
          padding: '0 32px'
        }}
      >
        <div
          style={{
            width: '100%',
            height: 'clamp(320px, 45vw, 540px)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 12px 36px rgba(33, 32, 30, 0.08)'
          }}
        >
          <img
            src="/about.png"
            alt="Pragya Yog School Sanctuary practitioner in serene pose"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 35%',
              display: 'block'
            }}
          />
        </div>
      </section>

      {/* 2-Column Content Section: About & Benefits + Card Box */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto 96px auto',
          padding: '0 32px'
        }}
      >
        <div
          className="about-content-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: '64px',
            alignItems: 'start'
          }}
        >
          {/* Left Column: Narrative & Benefits */}
          <div>
            {/* About the School Section */}
            <div style={{ marginBottom: '48px' }}>
              <h2
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: '26px',
                  fontWeight: 700,
                  color: '#21201E',
                  marginBottom: '16px',
                  letterSpacing: '-0.01em'
                }}
              >
                About Pragya Yog School
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: '15.5px',
                  color: '#5A554F',
                  lineHeight: 1.7,
                  margin: 0,
                  maxWidth: '720px'
                }}
              >
                Pragya Yog School is a holistic sanctuary dedicated to traditional Hatha, Ashtanga, Yin Yoga, and therapeutic sound healing. Guided by ancient lineage and modern physiological science, our sanctuary empowers students to cultivate awareness, deepen their practice, and experience true mind-body harmony.
              </p>
            </div>

            {/* Benefits Section */}
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: '26px',
                  fontWeight: 700,
                  color: '#21201E',
                  marginBottom: '24px',
                  letterSpacing: '-0.01em'
                }}
              >
                Benefit
              </h2>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {benefits.map((item, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      fontFamily: "var(--font-sans)",
                      fontSize: '15px',
                      color: '#4A4540',
                      lineHeight: 1.4
                    }}
                  >
                    {/* Rounded Circular Check Icon */}
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: '#EAE1D3',
                        border: '1px solid rgba(33, 32, 30, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Check size={12} color="#21201E" strokeWidth={2.5} />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Key Details Card Box */}
          <div
            style={{
              backgroundColor: '#EAE1D3',
              borderRadius: '20px',
              padding: '36px 32px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}
          >
            {/* Level */}
            <div>
              <div style={{ fontSize: '12px', color: '#7A756F', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Level
              </div>
              <div style={{ fontSize: '15.5px', fontWeight: 700, color: '#21201E' }}>
                Beginner
              </div>
            </div>

            {/* Schedule */}
            <div>
              <div style={{ fontSize: '12px', color: '#7A756F', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Schedule
              </div>
              <div style={{ fontSize: '15.5px', fontWeight: 700, color: '#21201E' }}>
                Mon, Wed, Fri
              </div>
            </div>

            {/* Duration */}
            <div>
              <div style={{ fontSize: '12px', color: '#7A756F', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Duration
              </div>
              <div style={{ fontSize: '15.5px', fontWeight: 700, color: '#21201E' }}>
                60 minutes
              </div>
            </div>

            {/* Type */}
            <div>
              <div style={{ fontSize: '12px', color: '#7A756F', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Type
              </div>
              <div style={{ fontSize: '15.5px', fontWeight: 700, color: '#21201E' }}>
                Restorative & Meditative
              </div>
            </div>

            {/* Coaches */}
            <div>
              <div style={{ fontSize: '12px', color: '#7A756F', fontWeight: 500, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Coaches
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {coaches.map((coach, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '999px',
                      padding: '4px 14px 4px 4px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                    }}
                  >
                    <img
                      src={coach.avatar}
                      alt={coach.name}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#21201E' }}>
                      {coach.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Book Now Action Button */}
            <button
              onClick={() => onOpenBooking('class', 'Yin Yoga Session')}
              style={{
                marginTop: '12px',
                width: '100%',
                backgroundColor: '#21201E',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '999px',
                padding: '14px 24px',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#944426';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#21201E';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>BOOK THIS CLASS</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* NEW SECTION 1: Our Elements */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto 96px auto',
          padding: '0 32px'
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 56px auto' }}>
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
            — CORE PILLARS —
          </span>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 400,
              color: '#21201E',
              margin: '0 0 14px 0',
              lineHeight: 1.15
            }}
          >
            Our Elements
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: '15px', color: '#6B655F', lineHeight: 1.6, margin: 0 }}>
            Rooted in ancient yogic philosophy and refined through modern research to support your transformational journey.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px'
          }}
        >
          {elements.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="element-card"
                style={{
                  backgroundColor: '#EAE1D3',
                  borderRadius: '20px',
                  padding: '32px',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
                  }}
                >
                  <IconComp size={22} color={item.color} />
                </div>

                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#21201E',
                      margin: '0 0 8px 0'
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: '14.5px',
                      color: '#5A554F',
                      lineHeight: 1.65,
                      margin: 0
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* NEW SECTION 2: Our Mission, Vision and Goal */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 32px'
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 56px auto' }}>
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
            — PURPOSE & DIRECTION —
          </span>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 400,
              color: '#21201E',
              margin: 0,
              lineHeight: 1.15
            }}
          >
            Our Mission, Vision and Goal
          </h2>
        </div>

        {/* 3 Featured Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '32px'
          }}
        >
          {pillars.map((pillar, idx) => {
            const IconComp = pillar.icon;
            return (
              <div
                key={idx}
                className="pillar-card"
                style={{
                  backgroundColor: pillar.bgColor,
                  borderRadius: '24px',
                  padding: '40px 36px',
                  boxShadow: '0 10px 30px rgba(33, 32, 30, 0.05)',
                  border: '1px solid rgba(39, 39, 39, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '24px',
                  transition: 'all 0.3s ease'
                }}
              >
                <div>
                  {/* Top Tag & Icon Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        color: pillar.badgeColor,
                        backgroundColor: '#F5EFE5',
                        padding: '6px 14px',
                        borderRadius: '999px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {pillar.tag}
                    </span>

                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: '#F5EFE5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <IconComp size={20} color={pillar.badgeColor} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: '32px',
                      fontWeight: 400,
                      color: '#21201E',
                      margin: '0 0 16px 0'
                    }}
                  >
                    {pillar.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: '15px',
                      color: '#5A554F',
                      lineHeight: 1.7,
                      margin: 0
                    }}
                  >
                    {pillar.description}
                  </p>
                </div>

                <div style={{ height: '3px', width: '48px', backgroundColor: pillar.badgeColor, borderRadius: '2px' }} />
              </div>
            );
          })}
        </div>
      </section>

      {/* NEW SECTION 3: Pre-Footer Call to Action Banner */}
      <section
        style={{
          width: '100%',
          marginTop: '96px',
          marginBottom: 0,
          position: 'relative',
          minHeight: '440px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Background Image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2000&auto=format&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 35%',
            zIndex: 0
          }}
        />

        {/* Dark Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(25, 23, 20, 0.45) 0%, rgba(20, 18, 15, 0.65) 100%)',
            zIndex: 1
          }}
        />

        {/* Content Container */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '820px',
            textAlign: 'center',
            padding: '64px 24px',
            color: '#FFFFFF'
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 'clamp(36px, 5.5vw, 64px)',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: '0 0 16px 0',
              lineHeight: 1.15,
              letterSpacing: '-0.02em'
            }}
          >
            Ready to{' '}
            <span
              style={{
                fontFamily: "'Canela', serif",
                fontStyle: 'italic',
                fontWeight: 400
              }}
            >
              Embrace
            </span>{' '}
            Stillness?
          </h2>

          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 'clamp(14.5px, 1.8vw, 17px)',
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.88)',
              maxWidth: '560px',
              margin: '0 auto 36px auto',
              lineHeight: 1.6
            }}
          >
            Join our Yin Yoga class and experience the deep release, calm, and balance your body and mind deserve.
          </p>

          <button
            onClick={() => onOpenBooking('class', 'Book Your Spot - Yin Yoga')}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#21201E',
              border: 'none',
              borderRadius: '999px',
              padding: '16px 36px',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.25s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F5EFE5';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
            }}
          >
            <span>Book Your Spot</span>
          </button>
        </div>
      </section>

      {/* Responsive Layout & Hover CSS */}
      <style>{`
        .element-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.06);
          background-color: #E6DDD0 !important;
        }
        .pillar-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08);
          border-color: rgba(148, 68, 38, 0.2) !important;
        }
        @media (max-width: 900px) {
          .about-header-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .about-content-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
