import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Check, ArrowRight, ShieldCheck, Sparkles, Clock, BarChart2, MapPin } from 'lucide-react';
import { UpcomingEvent } from '../types';
import { getUpcomingEvents } from '../services/api';

interface EventDetailPageProps {
  event: UpcomingEvent;
  onBack: () => void;
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  onSelectEvent?: (event: UpcomingEvent) => void;
}

const splitEventTitle = (fullTitle: string) => {
  if (!fullTitle) return { titlePrefix: 'Mastering the Art of', titleMain: 'YOG PRACTICE' };
  const cleaned = fullTitle.trim();
  const parts = cleaned.split(' ');
  if (parts.length <= 2) {
    return { titlePrefix: 'Mastering the Art of', titleMain: cleaned };
  }
  const prefix = parts.slice(0, Math.ceil(parts.length / 2)).join(' ');
  const main = parts.slice(Math.ceil(parts.length / 2)).join(' ');
  return { titlePrefix: prefix, titleMain: main };
};

export const EventDetailPage: React.FC<EventDetailPageProps> = ({ event, onBack, onOpenBooking, onSelectEvent }) => {
  const [otherEvents, setOtherEvents] = useState<UpcomingEvent[]>([]);

  useEffect(() => {
    let isMounted = true;
    getUpcomingEvents()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : [];
        const filtered = list.filter((e: UpcomingEvent) => String(e.id) !== String(event.id));
        setOtherEvents(filtered.slice(0, 3));
      })
      .catch((err) => {
        console.error("Failed fetching other events", err);
      });

    return () => {
      isMounted = false;
    };
  }, [event.id]);

  const coverImage = event.image || event.banner_image?.url || "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1600&auto=format&fit=crop";
  const title = event.title || event.name || 'Pragya Yog Masterclass';
  const { titlePrefix, titleMain } = splitEventTitle(title);
  const displayLevel = event.level || 'All Levels';
  const displayDuration = event.duration || '60 - 90 min';
  const displayFocus = event.focus || event.category || 'Mindful Movement & Posture';
  const displayPrice = event.price || 'HK$ 680';
  const displayLocation = event.location || 'Pragya Yog Studio';

  const cleanDescText = (event.description || '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/&ndash;/g, '–')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .trim();

  // Extract a clean 2-3 line summary for the hero header (matching reference 2)
  const getHeroSummary = (text: string) => {
    if (!text) return 'Join our expert-led yoga masterclass to strengthen your core, improve posture, and cultivate deep breath awareness in a peaceful sanctuary.';
    let firstPart = text.split(/What You'll Learn|Part 1 Schedule|Session 1|Week 1|Schedule:/i)[0].trim();
    if (firstPart.length > 240) {
      const endDot = firstPart.indexOf('.', 120);
      if (endDot !== -1 && endDot <= 240) {
        firstPart = firstPart.slice(0, endDot + 1);
      } else {
        firstPart = firstPart.slice(0, 240).trim() + '...';
      }
    }
    return firstPart;
  };

  const heroSummary = getHeroSummary(cleanDescText);

  return (
    <div style={{ backgroundColor: '#F5EFE5', minHeight: '100vh', color: '#21201E', paddingBottom: '120px' }}>
      
      {/* Top Fixed Back Button Bar */}
      <div
        className="edp-back-bar"
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '110px 32px 24px 32px'
        }}
      >
        <button
          onClick={onBack}
          style={{
            fontFamily: "'Neue Montreal', -apple-system, sans-serif",
            backgroundColor: '#FFFFFF',
            color: '#21201E',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            borderRadius: '999px',
            padding: '10px 22px',
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
            transition: 'all 0.25s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#944426';
            e.currentTarget.style.borderColor = '#944426';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.12)';
            e.currentTarget.style.color = '#21201E';
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to All Events</span>
        </button>
      </div>

      <div className="edp-main-content" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 32px' }}>
        
        {/* SECTION 1: HERO HEADER */}
        <section
          style={{
            textAlign: 'center',
            padding: '40px 0 60px 0',
            maxWidth: '900px',
            margin: '0 auto'
          }}
        >
          <span
            style={{
              fontFamily: "'Neue Montreal', sans-serif",
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: '#944426',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '16px'
            }}
          >
            PRAGYA YOG SERIES · LEVEL: {displayLevel.toUpperCase()}
          </span>

          <h1 style={{ margin: '0 0 24px 0', lineHeight: 1.08 }}>
            <span
              style={{
                display: 'block',
                fontFamily: "var(--font-serif)",
                fontStyle: 'italic',
                fontSize: 'clamp(32px, 4vw, 52px)',
                fontWeight: 400,
                color: '#21201E',
                marginBottom: '4px'
              }}
            >
              {titlePrefix}
            </span>
            <span
              style={{
                display: 'block',
                fontFamily: "'Neue Montreal', sans-serif",
                fontSize: 'clamp(40px, 5.8vw, 76px)',
                fontWeight: 800,
                color: '#21201E',
                letterSpacing: '-0.02em',
                textTransform: 'uppercase'
              }}
            >
              {titleMain}
            </span>
          </h1>

          <p
            style={{
              fontFamily: "'Neue Montreal', sans-serif",
              fontSize: '16px',
              color: '#4A4540',
              lineHeight: 1.65,
              maxWidth: '680px',
              margin: '0 auto 32px auto',
              fontWeight: 400
            }}
          >
            {heroSummary}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '48px' }}>
            <span style={{ fontSize: '18px', color: '#8A857F', textDecoration: 'line-through' }}>
              HK$ 1,200
            </span>
            <span style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '36px', fontWeight: 800, color: '#944426' }}>
              {displayPrice}
            </span>
          </div>

          <div
            className="edp-hero-stats-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
              padding: '24px 0',
              borderTop: '1px solid rgba(0, 0, 0, 0.08)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
              border: '1px solid rgba(0, 0, 0, 0.06)'
            }}
          >
            <div style={{ textAlign: 'center', borderRight: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <span style={{ display: 'block', fontFamily: "'Neue Montreal', sans-serif", fontSize: '24px', fontWeight: 800, color: '#21201E' }}>1</span>
              <span style={{ fontSize: '11px', color: '#7A756F', letterSpacing: '0.12em', textTransform: 'uppercase' }}>SESSION</span>
            </div>
            <div style={{ textAlign: 'center', borderRight: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <span style={{ display: 'block', fontFamily: "'Neue Montreal', sans-serif", fontSize: '24px', fontWeight: 800, color: '#21201E' }}>{displayDuration}</span>
              <span style={{ fontSize: '11px', color: '#7A756F', letterSpacing: '0.12em', textTransform: 'uppercase' }}>DURATION</span>
            </div>
            <div style={{ textAlign: 'center', borderRight: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <span style={{ display: 'block', fontFamily: "'Neue Montreal', sans-serif", fontSize: '24px', fontWeight: 800, color: '#21201E' }}>{displayLevel.toUpperCase()}</span>
              <span style={{ fontSize: '11px', color: '#7A756F', letterSpacing: '0.12em', textTransform: 'uppercase' }}>LEVEL</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ display: 'block', fontFamily: "'Neue Montreal', sans-serif", fontSize: '24px', fontWeight: 800, color: '#21201E' }}>IN-PERSON</span>
              <span style={{ fontSize: '11px', color: '#7A756F', letterSpacing: '0.12em', textTransform: 'uppercase' }}>SANCTUARY</span>
            </div>
          </div>
        </section>

        {/* SECTION 2: WHAT'S INSIDE */}
        <section style={{ padding: '72px 0', borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', color: '#944426', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
              WORKSHOP OVERVIEW · LEVEL: {displayLevel.toUpperCase()}
            </span>
            <h2 style={{ margin: 0, lineHeight: 1.08 }}>
              <span style={{ display: 'block', fontFamily: "var(--font-serif)", fontStyle: 'italic', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, color: '#21201E' }}>What's</span>
              <span style={{ display: 'block', fontFamily: "'Neue Montreal', sans-serif", fontSize: 'clamp(38px, 5vw, 64px)', fontWeight: 800, color: '#21201E', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>INSIDE</span>
            </h2>
          </div>
          <div className="edp-inside-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px', alignItems: 'center' }}>
            <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 16px 40px rgba(0, 0, 0, 0.08)', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
              <img src={coverImage} alt={title} style={{ width: '100%', height: '460px', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { title: 'Master core postural alignment', desc: 'The essential foundation that elevates your posture and protects your spine.' },
                { title: 'Learn precise breathwork control', desc: 'To stabilize nervous system response and deepen mental focus.' },
                { title: 'Develop body awareness and equilibrium', desc: 'To eliminate tension, compensation, and sway.' },
                { title: 'Structured training sequences', desc: 'Designed to build long-term strength and grace.' },
                { title: 'Personalized cues & hands-on guidance', desc: 'From PhD research scholars and master faculty.' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', paddingBottom: i < 4 ? '16px' : '0', borderBottom: i < 4 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none' }}>
                  <span style={{ color: '#944426', fontSize: '18px', lineHeight: 1 }}>•</span>
                  <p style={{ margin: 0, fontSize: '15px', color: '#4A4540', lineHeight: 1.6 }}>
                    <strong style={{ color: '#21201E', fontWeight: 700 }}>{item.title}</strong> — {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: OBJECTIVES */}
        <section style={{ padding: '72px 0', borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', color: '#944426', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>WORKSHOP OBJECTIVES & GOALS</span>
            <h2 style={{ margin: 0, lineHeight: 1.08 }}>
              <span style={{ display: 'block', fontFamily: "var(--font-serif)", fontStyle: 'italic', fontSize: 'clamp(30px, 3.8vw, 44px)', fontWeight: 400, color: '#21201E' }}>By the End</span>
              <span style={{ display: 'block', fontFamily: "'Neue Montreal', sans-serif", fontSize: 'clamp(36px, 4.8vw, 60px)', fontWeight: 800, color: '#21201E', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>YOU WILL BE ABLE TO:</span>
            </h2>
          </div>
          <div className="edp-objectives-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
            {[
              { t: 'ALIGN FREELY', d: 'Master core stabilization and micro-adjustments to hold your posture gracefully without tension.' },
              { t: 'DEEPEN BREATHWORK', d: 'Regulate respiratory flow to calm nervous system stress and sustain focus throughout your practice.' },
              { t: 'PRACTICE INDEPENDENTLY', d: 'Follow structured daily programs and self-assess your technique with lasting confidence.' }
            ].map((card, i) => (
              <div key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '40px 32px', textAlign: 'center', border: '1px solid rgba(0, 0, 0, 0.06)', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#944426', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}><Check size={22} /></div>
                <h3 style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '18px', fontWeight: 800, color: '#21201E', margin: '0 0 12px 0', letterSpacing: '0.04em' }}>{card.t}</h3>
                <p style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '14px', color: '#4A4540', lineHeight: 1.55, margin: 0 }}>{card.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: WHY CHOOSE */}
        <section style={{ padding: '72px 0', borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', color: '#944426', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>THE PRAGYA YOG METHOD</span>
            <h2 style={{ margin: 0, lineHeight: 1.08 }}>
              <span style={{ display: 'block', fontFamily: "var(--font-serif)", fontStyle: 'italic', fontSize: 'clamp(30px, 3.8vw, 44px)', fontWeight: 400, color: '#21201E' }}>Why Choose</span>
              <span style={{ display: 'block', fontFamily: "'Neue Montreal', sans-serif", fontSize: 'clamp(36px, 4.8vw, 60px)', fontWeight: 800, color: '#21201E', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>THIS WORKSHOP?</span>
            </h2>
          </div>
          <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[
              { t: 'Expert Master Instruction', d: 'Clear, concise guidance from PhD research scholars and seasoned yog masters.' },
              { t: 'Proven Ancient & Scientific Methodology', d: 'Based on a well-established approach uniting classical Hatha wisdom with modern anatomical alignment.' },
              { t: 'Inclusive & Flexible Learning', d: 'Structured for both beginners building foundation and advanced practitioners seeking posture refinement.' },
              { t: 'Tranquil Sanctuary Community', d: 'Connect with fellow wellness enthusiasts in a supportive, tranquil environment.' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', paddingBottom: i < 3 ? '24px' : '0', borderBottom: i < 3 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#944426', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Check size={18} /></div>
                <div>
                  <h4 style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '18px', fontWeight: 700, color: '#21201E', margin: '0 0 6px 0' }}>{item.t}</h4>
                  <p style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '14.5px', color: '#4A4540', lineHeight: 1.6, margin: 0 }}>{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: CTA */}
        <section style={{ padding: '80px 0 60px 0', borderTop: '1px solid rgba(0, 0, 0, 0.08)', textAlign: 'center' }}>
          <span style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: '#944426', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>RESERVE YOUR SPOT TODAY</span>
          <h2 style={{ margin: '0 0 28px 0', lineHeight: 1.08 }}>
            <span style={{ display: 'block', fontFamily: "var(--font-serif)", fontStyle: 'italic', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 400, color: '#21201E' }}>Master the Art of</span>
            <span style={{ display: 'block', fontFamily: "'Neue Montreal', sans-serif", fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 800, color: '#21201E', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{titleMain}</span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '36px' }}>
            <span style={{ fontSize: '18px', color: '#8A857F', textDecoration: 'line-through' }}>HK$ 1,200</span>
            <span style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '36px', fontWeight: 800, color: '#944426' }}>{displayPrice}</span>
          </div>
          <button onClick={() => onOpenBooking('event', title, event)} style={{ backgroundColor: '#944426', color: '#FFFFFF', border: 'none', borderRadius: '999px', padding: '18px 48px', fontSize: '14px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 10px 28px rgba(148, 68, 38, 0.35)', transition: 'all 0.3s ease' }}>BOOK SESSION NOW</button>
        </section>

        {/* Other Events */}
        {otherEvents.length > 0 && (
          <section style={{ paddingTop: '64px', borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontStyle: 'italic', fontSize: '28px', fontWeight: 400, color: '#21201E', marginBottom: '32px', textAlign: 'center' }}>Explore Other Upcoming Events</h3>
            <div className="other-events-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {otherEvents.map((ev, idx) => (
                <div key={ev.id || idx} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(0, 0, 0, 0.08)', boxShadow: '0 4px 18px rgba(0, 0, 0, 0.03)' }}>
                  <div>
                    <span style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: '#944426', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>{ev.category || 'WORKSHOP'}</span>
                    <h4 style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '18px', fontWeight: 700, color: '#21201E', margin: '0 0 12px 0' }}>{ev.title || ev.name}</h4>
                  </div>
                  <button onClick={() => onSelectEvent ? onSelectEvent(ev) : window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ backgroundColor: 'transparent', color: '#21201E', border: '1px solid rgba(0, 0, 0, 0.15)', borderRadius: '8px', padding: '10px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
                    <span>VIEW EVENT</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="edp-sticky-bottom-bar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99, backgroundColor: 'rgba(245, 239, 229, 0.96)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderTop: '1px solid rgba(0, 0, 0, 0.08)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.08)' }}>
        <button onClick={() => onOpenBooking('event', title, event)} style={{ backgroundColor: '#944426', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '14px 48px', fontSize: '14px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', maxWidth: '640px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 6px 20px rgba(148, 68, 38, 0.35)', transition: 'all 0.25s ease' }}>
          <span>Enroll</span>
          <span style={{ opacity: 0.5, textDecoration: 'line-through', fontSize: '13px' }}>HK$ 1,200</span>
          <span>{displayPrice}</span>
        </button>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .edp-inside-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .edp-objectives-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          .edp-hero-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; }
          .edp-hero-stats-grid > div { border-right: none !important; }
        }
      `}</style>
    </div>
  );
};

export default EventDetailPage;
