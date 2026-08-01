import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Tag, User, Sparkles, CheckCircle2, ShieldCheck, Share2, ArrowUpRight, Check } from 'lucide-react';
import { UpcomingEvent } from '../types';
import { getUpcomingEvents } from '../services/api';

interface EventDetailPageProps {
  event: UpcomingEvent;
  onBack: () => void;
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  onSelectEvent?: (event: UpcomingEvent) => void;
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({ event, onBack, onOpenBooking, onSelectEvent }) => {
  const [otherEvents, setOtherEvents] = useState<UpcomingEvent[]>([]);

  useEffect(() => {
    let isMounted = true;
    getUpcomingEvents()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : [];
        // Filter out current event and pick 3 other events
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

  // Clean raw HTML or render description safely
  const cleanDescriptionHtml = (event.description || '')
    .replace(/&ndash;/g, '–')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');

  return (
    <div style={{ backgroundColor: '#F5EFE5', minHeight: '100vh', color: '#21201E', paddingBottom: '100px' }}>
      
      {/* Top Fixed / Floating Back Button Bar */}
      <div
        style={{
          maxWidth: '1280px',
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
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '999px',
            padding: '10px 22px',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
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
          <ArrowLeft size={16} />
          <span>Back to All Events</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
        
        {/* Event Hero Banner Section (Matches Reference Design) */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '520px',
            borderRadius: '28px',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
            marginBottom: '40px',
            display: 'flex',
            alignItems: 'flex-end'
          }}
        >
          {/* Hero Background Image */}
          <img
            src={coverImage}
            alt={event.title}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block'
            }}
          />

          {/* Dark Warm Overlay Gradient */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(18, 14, 12, 0.88) 0%, rgba(18, 14, 12, 0.65) 55%, rgba(18, 14, 12, 0.35) 100%)'
            }}
          />

          {/* Hero Text & Actions Overlay */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              padding: '60px 48px',
              maxWidth: '920px'
            }}
          >
            {/* Category Upper Tag */}
            <div
              style={{
                fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.22em',
                color: 'rgba(255, 255, 255, 0.78)',
                textTransform: 'uppercase',
                marginBottom: '14px'
              }}
            >
              {event.category ? `${event.category.toUpperCase()} WORKSHOP` : 'PRAGYA SANCTUARY IMMERSION'}
            </div>

            {/* Main Title */}
            <h1
              style={{
                fontFamily: "'BNCringeSerif', 'Canela', Georgia, serif",
                fontSize: 'clamp(36px, 4.5vw, 54px)',
                fontWeight: 400,
                color: '#FFFFFF',
                margin: '0 0 18px 0',
                lineHeight: 1.14
              }}
            >
              {event.title || event.name}
            </h1>

            {/* Date & Location Subtitle */}
            <div
              style={{
                fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.85)',
                fontWeight: 500,
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap'
              }}
            >
              <span>{event.date || event.starts_at || '29 August – 14 November 2026'}</span>
              <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>•</span>
              <span>{event.location || 'Pragya Sanctuary Studio'}</span>
            </div>

            {/* Action Buttons Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => onOpenBooking('event', event.title || event.name, event)}
                style={{
                  fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                  backgroundColor: '#C86D51',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '14px 34px',
                  fontSize: '13px',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(200, 109, 81, 0.35)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#B25B40';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#C86D51';
                }}
              >
                BOOK SESSION NOW
              </button>

              <button
                onClick={() => {
                  const footerElem = document.getElementById('contact');
                  if (footerElem) {
                    footerElem.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    onOpenBooking('contact', 'Contact Pragya Sanctuary', event);
                  }
                }}
                style={{
                  fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                  backgroundColor: 'transparent',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: '999px',
                  padding: '14px 34px',
                  fontSize: '13px',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.borderColor = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                }}
              >
                CONTACT US
              </button>
            </div>
          </div>
        </div>

        {/* Event Key Details & Description Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '28px',
            padding: '48px 40px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(0, 0, 0, 0.04)'
          }}
        >
          {/* Event Key Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
              backgroundColor: '#F5EFE5',
              borderRadius: '20px',
              padding: '28px 32px',
              marginBottom: '44px'
            }}
          >
            <div>
              <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#944426', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                Date & Schedule
              </div>
              <div style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '15.5px', fontWeight: 700, color: '#21201E' }}>
                {event.date || event.starts_at || 'Upcoming Season'}
              </div>
              <div style={{ fontSize: '13px', color: '#7A756F', marginTop: '2px' }}>
                Full Immersion Schedule
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#944426', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                Sanctuary Location
              </div>
              <div style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '15.5px', fontWeight: 700, color: '#21201E' }}>
                {event.location || 'Pragya Sanctuary Studio'}
              </div>
              <div style={{ fontSize: '13px', color: '#7A756F', marginTop: '2px' }}>
                Hong Kong & Global Venues
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#944426', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                Investment Fee
              </div>
              <div style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '20px', fontWeight: 800, color: '#944426' }}>
                {event.price || 'HK$ 450'}
              </div>
              <div style={{ fontSize: '13px', color: '#7A756F', marginTop: '2px' }}>
                Includes Props & Amenities
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <button
                onClick={() => onOpenBooking('event', event.title || event.name, event)}
                style={{
                  fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                  backgroundColor: '#944426',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '14px 28px',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 18px rgba(148, 68, 38, 0.3)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#21201E';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#944426';
                }}
              >
                <span>RESERVE YOUR SPOT</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>

          {/* Difficulty Tags & Badges */}
          {((event.difficulty_tags && event.difficulty_tags.length > 0) || (event.benefits && event.benefits.length > 0)) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
              {event.difficulty_tags?.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  style={{
                    fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                    backgroundColor: 'rgba(148, 68, 38, 0.08)',
                    color: '#944426',
                    borderRadius: '999px',
                    padding: '6px 16px',
                    fontSize: '13px',
                    fontWeight: 700
                  }}
                >
                  ✦ {tag}
                </span>
              ))}
              {event.benefits?.map((ben, bIdx) => (
                <span
                  key={bIdx}
                  style={{
                    fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                    backgroundColor: '#F5EFE5',
                    color: '#4A4540',
                    borderRadius: '999px',
                    padding: '6px 16px',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  ✓ {ben.label}
                </span>
              ))}
            </div>
          )}

          {/* Section 1: Overview & About */}
          <div style={{ marginBottom: '48px' }}>
            <div
              style={{
                fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.1em',
                color: '#944426',
                textTransform: 'uppercase',
                marginBottom: '10px'
              }}
            >
              Overview & Immersion Highlights
            </div>
            <h2
              style={{
                fontFamily: "'BNCringeSerif', 'Canela', Georgia, serif",
                fontSize: '32px',
                fontWeight: 400,
                color: '#21201E',
                margin: '0 0 20px 0',
                lineHeight: 1.25
              }}
            >
              About This Experience
            </h2>

            <div
              className="event-rich-description"
              style={{
                fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                fontSize: '16.5px',
                lineHeight: 1.8,
                color: '#4A4540'
              }}
              dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml }}
            />
          </div>

          {/* Section 2: Package Includes & Benefits Grid */}
          <div
            style={{
              backgroundColor: '#F8FAF9',
              borderRadius: '24px',
              padding: '36px 32px',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              marginBottom: '48px'
            }}
          >
            <div
              style={{
                fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.1em',
                color: '#944426',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}
            >
              What is Included
            </div>
            <h3
              style={{
                fontFamily: "'BNCringeSerif', 'Canela', Georgia, serif",
                fontSize: '26px',
                fontWeight: 400,
                color: '#21201E',
                margin: '0 0 24px 0'
              }}
            >
              Immersion Privileges & Amenities
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {[
                { title: 'Certified Guidance', desc: 'Led by internationally certified master teachers with over 15+ years of practice.' },
                { title: 'Luxury Props Provided', desc: 'Complimentary eco-mats, cork blocks, organic bolsters, and sanitized linen towels.' },
                { title: 'Hydrotherapy Privileges', desc: 'Access to hydrotherapy saunas, relaxation lounges, and organic herbal infusions.' },
                { title: 'Intimate Group Capacity', desc: 'Strictly limited sanctuary capacity ensuring individualized posture correction.' },
                { title: 'Post-Retreat Integration', desc: 'Access to guided pranayama audio tracks and post-session reflection workbook.' },
                { title: 'Sanctuary Certification', desc: 'Official certificate of completion issued upon workshop immersion end.' }
              ].map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '20px 22px',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'flex-start'
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(148, 68, 38, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <CheckCircle2 size={15} color="#944426" />
                  </div>
                  <div>
                    <h4 style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '15px', fontWeight: 700, color: '#21201E', margin: '0 0 4px 0' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '13.5px', color: '#6B655F', margin: 0, lineHeight: 1.5 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Sample Itinerary Schedule */}
          <div style={{ marginBottom: '48px' }}>
            <div
              style={{
                fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.1em',
                color: '#944426',
                textTransform: 'uppercase',
                marginBottom: '10px'
              }}
            >
              Session Flow
            </div>
            <h3
              style={{
                fontFamily: "'BNCringeSerif', 'Canela', Georgia, serif",
                fontSize: '26px',
                fontWeight: 400,
                color: '#21201E',
                margin: '0 0 24px 0'
              }}
            >
              Immersion Schedule & Flow
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { time: '08:00 AM – 09:15 AM', title: 'Opening Flow & Mindful Pranayama', desc: 'Solar activation practices and oceanfront breathing exercises.' },
                { time: '09:30 AM – 11:30 AM', title: 'Alignment, Biomechanics & Asana Workshop', desc: 'Deconstructing peak posture alignment with hands-on adjustments.' },
                { time: '11:45 AM – 01:00 PM', title: 'Organic Nourishment & Hydrotherapy', desc: 'Cold-pressed botanical juices, sauna relaxation, and reflection.' }
              ].map((sch, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    backgroundColor: '#F5EFE5',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ backgroundColor: '#944426', color: '#FFFFFF', borderRadius: '10px', padding: '6px 14px', fontSize: '13px', fontWeight: 800 }}>
                      {sch.time}
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '16px', fontWeight: 700, color: '#21201E', margin: '0 0 2px 0' }}>
                        {sch.title}
                      </h4>
                      <div style={{ fontSize: '13.5px', color: '#6B655F' }}>{sch.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Lead Faculty Profile Box */}
          {event.instructor ? (
            <div
              style={{
                padding: '32px',
                backgroundColor: '#F5EFE5',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                flexWrap: 'wrap'
              }}
            >
              {event.instructor.image && (
                <img
                  src={event.instructor.image}
                  alt={event.instructor.name || 'Instructor'}
                  style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #944426' }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#944426', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                  Guided by Master Faculty
                </div>
                <h3 style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '22px', fontWeight: 700, color: '#21201E', margin: '0 0 4px 0' }}>
                  {event.instructor.name || 'Master Aarya Kuldeep'}
                </h3>
                {event.instructor.title && (
                  <div style={{ fontSize: '14px', color: '#944426', fontWeight: 600, marginBottom: '8px' }}>{event.instructor.title}</div>
                )}
                <p style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '14px', color: '#5A554F', margin: 0, lineHeight: 1.55 }}>
                  {(event.instructor as any).bio || 'Internationally acclaimed yoga master specializing in authentic Hatha flow, posture alignment, and deep sound bath meditation.'}
                </p>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '32px',
                backgroundColor: '#F5EFE5',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                flexWrap: 'wrap'
              }}
            >
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  backgroundColor: '#944426',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: 800
                }}
              >
                P
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#944426', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                  Guided by Certified Master Faculty
                </div>
                <h3 style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '22px', fontWeight: 700, color: '#21201E', margin: '0 0 4px 0' }}>
                  Pragya Master Faculty Team
                </h3>
                <p style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '14px', color: '#5A554F', margin: 0, lineHeight: 1.55 }}>
                  Lead by senior resident teachers holding Yoga Alliance E-RYT 500 credentials with extensive international teaching backgrounds.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Explore Other Events Section */}
        {otherEvents.length > 0 && (
          <div style={{ marginTop: '64px' }}>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div
                style={{
                  fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: '#944426',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}
              >
                PRAGYA SANCTUARY CALENDAR
              </div>
              <h2
                style={{
                  fontFamily: "'BNCringeSerif', 'Canela', Georgia, serif",
                  fontSize: 'clamp(28px, 3.5vw, 40px)',
                  fontWeight: 400,
                  color: '#21201E',
                  margin: 0
                }}
              >
                Explore Other Upcoming Events
              </h2>
            </div>

            <div
              className="other-events-cards-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
              }}
            >
              {otherEvents.map((ev, idx) => {
                const cleanDescText = (ev.description || '')
                  .replace(/<[^>]*>?/gm, '')
                  .replace(/&ndash;/g, '–')
                  .replace(/&rsquo;/g, "'")
                  .replace(/&lsquo;/g, "'")
                  .replace(/&amp;/g, '&')
                  .replace(/&nbsp;/g, ' ')
                  .trim();

                return (
                  <div
                    key={ev.id || idx}
                    className="other-event-card"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '20px',
                      padding: '24px 24px 20px 24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      boxShadow: '0 4px 18px rgba(0, 0, 0, 0.03)',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                    }}
                  >
                    <div>
                      {/* Top Row: Category Pill Tag */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span
                          style={{
                            fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                            fontSize: '11px',
                            fontWeight: 800,
                            letterSpacing: '0.06em',
                            color: '#1E40AF',
                            backgroundColor: '#EBF5FF',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            textTransform: 'uppercase'
                          }}
                        >
                          {ev.category || 'SPECIAL WORKSHOP'}
                        </span>
                        {ev.spots_label && (
                          <span style={{ fontSize: '11.5px', color: '#944426', fontWeight: 700 }}>
                            {ev.spots_label}
                          </span>
                        )}
                      </div>

                      {/* Event Title */}
                      <h3
                        style={{
                          fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                          fontSize: '18px',
                          fontWeight: 700,
                          color: '#21201E',
                          margin: '0 0 12px 0',
                          lineHeight: 1.3
                        }}
                      >
                        {ev.title || ev.name}
                      </h3>

                      {/* Price & Date Rounded Box */}
                      <div
                        style={{
                          backgroundColor: '#F8FAF9',
                          border: '1px solid rgba(0, 0, 0, 0.05)',
                          borderRadius: '10px',
                          padding: '8px 12px',
                          textAlign: 'center',
                          fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#21201E',
                          marginBottom: '14px'
                        }}
                      >
                        {ev.price || 'HK$ 450'} &nbsp;|&nbsp; {ev.date || ev.starts_at || 'Upcoming Season'}
                      </div>

                      {/* Description Preview */}
                      <p
                        style={{
                          fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                          fontSize: '13px',
                          color: '#6B655F',
                          lineHeight: 1.5,
                          margin: '0 0 20px 0',
                          minHeight: '38px'
                        }}
                      >
                        {cleanDescText.length > 110 ? cleanDescText.slice(0, 110) + '...' : cleanDescText}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        onClick={() => {
                          if (onSelectEvent) {
                            onSelectEvent(ev);
                          } else {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        style={{
                          flex: 1,
                          fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                          backgroundColor: '#93C5FD',
                          color: '#1E40AF',
                          border: 'none',
                          borderRadius: '999px',
                          padding: '10px 14px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.25s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#60A5FA';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#93C5FD';
                          e.currentTarget.style.color = '#1E40AF';
                        }}
                      >
                        READ MORE
                      </button>

                      <button
                        onClick={() => onOpenBooking('event', ev.title || ev.name, ev)}
                        style={{
                          flex: 1.2,
                          fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                          backgroundColor: '#21201E',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '999px',
                          padding: '10px 14px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.25s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#944426';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#21201E';
                        }}
                      >
                        <Calendar size={13} />
                        <span>BOOK SESSION</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailPage;
