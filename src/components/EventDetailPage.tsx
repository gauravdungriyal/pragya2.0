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
        className="edp-back-bar"
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
      <div className="edp-main-content" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
        
        {/* Event Hero Banner Section (Clean Poster Image) */}
        <div
          className="edp-hero-banner"
          style={{
            position: 'relative',
            width: '100%',
            borderRadius: '28px',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
            marginBottom: '28px',
            backgroundColor: '#21201E'
          }}
        >
          {/* Hero Clean Background Poster Image */}
          <img
            src={coverImage}
            alt={event.title || event.name || 'Event Banner'}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '620px',
              objectFit: 'contain',
              objectPosition: 'center',
              display: 'block',
              margin: '0 auto'
            }}
          />
        </div>

        {/* Action Buttons Row */}
        <div className="edp-hero-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
          <button
            onClick={() => onOpenBooking('event', event.title || event.name, event)}
            style={{
              fontFamily: "'Neue Montreal', -apple-system, sans-serif",
              backgroundColor: '#C86D51',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '999px',
              padding: '16px 40px',
              fontSize: '14px',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(200, 109, 81, 0.35)',
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
              backgroundColor: '#21201E',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '999px',
              padding: '16px 40px',
              fontSize: '14px',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(33, 32, 30, 0.2)',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#C86D51';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#21201E';
            }}
          >
            CONTACT US
          </button>
        </div>

        {/* Event Key Details & Description Card */}
        <div
          className="edp-details-card"
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
            className="edp-key-details"
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

            <div className="edp-key-cta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
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
                fontFamily: "var(--font-serif)",
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
                fontFamily: "var(--font-serif)",
                fontSize: '26px',
                fontWeight: 400,
                color: '#21201E',
                margin: '0 0 24px 0'
              }}
            >
              Immersion Privileges & Amenities
            </h3>

            <div className="edp-amenities-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
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
                fontFamily: "var(--font-serif)",
                fontSize: '26px',
                fontWeight: 400,
                color: '#21201E',
                margin: '0 0 24px 0'
              }}
            >
              Immersion Schedule & Flow
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { time: '08:00 AM – 09:15 AM', title: 'Opening Flow & Mindful Pranayama', desc: 'Solar activation practices and oceanfront breathing exercises.' },
                { time: '09:30 AM – 11:30 AM', title: 'Alignment, Biomechanics & Asana Workshop', desc: 'Deconstructing peak posture alignment with hands-on adjustments.' },
                { time: '11:45 AM – 01:00 PM', title: 'Organic Nourishment & Hydrotherapy', desc: 'Cold-pressed botanical juices, sauna relaxation, and reflection.' }
              ].map((sch, sIdx) => {
                const [startTime, endTime] = sch.time.split('–').map(t => t.trim());
                return (
                  <div
                    key={sIdx}
                    className="itinerary-row"
                    style={{
                      backgroundColor: '#F5EFE5',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'stretch',
                      gap: '16px',
                      borderLeft: '4px solid #944426'
                    }}
                  >
                    {/* Step Number */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flexShrink: 0
                    }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: '#944426',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        {sIdx + 1}
                      </div>
                    </div>

                    {/* Time + Title + Desc */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Time range: two compact pills */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          backgroundColor: '#944426',
                          color: '#FFFFFF',
                          borderRadius: '6px',
                          padding: '3px 10px',
                          fontSize: '12px',
                          fontWeight: 800,
                          whiteSpace: 'nowrap'
                        }}>
                          {startTime}
                        </span>
                        <span style={{ color: '#944426', fontWeight: 800, fontSize: '13px' }}>→</span>
                        <span style={{
                          backgroundColor: 'rgba(148, 68, 38, 0.12)',
                          color: '#944426',
                          borderRadius: '6px',
                          padding: '3px 10px',
                          fontSize: '12px',
                          fontWeight: 800,
                          whiteSpace: 'nowrap'
                        }}>
                          {endTime}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 style={{
                        fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#21201E',
                        margin: '0 0 4px 0',
                        lineHeight: 1.3
                      }}>
                        {sch.title}
                      </h4>

                      {/* Description */}
                      <div style={{ fontSize: '13px', color: '#6B655F', lineHeight: 1.5 }}>
                        {sch.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
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

        {/* Sticky Mobile CTA */}
        <div className="edp-sticky-mobile-cta">
          <button
            onClick={() => onOpenBooking('event', event.title || event.name, event)}
            style={{
              width: '100%',
              fontFamily: "'Neue Montreal', -apple-system, sans-serif",
              backgroundColor: '#944426',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '999px',
              padding: '16px',
              fontSize: '15px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(148, 68, 38, 0.35)'
            }}
          >
            <Calendar size={18} />
            <span>RESERVE YOUR SPOT</span>
          </button>
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
                  fontFamily: "var(--font-serif)",
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
                            color: '#C86D51',
                            backgroundColor: 'rgba(200, 109, 81, 0.14)',
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
                          backgroundColor: 'rgba(200, 109, 81, 0.14)',
                          color: '#C86D51',
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
                          e.currentTarget.style.backgroundColor = '#C86D51';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(200, 109, 81, 0.14)';
                          e.currentTarget.style.color = '#C86D51';
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

      <style>{`
        /* ── Mobile responsive overrides for EventDetailPage ── */
        @media (max-width: 768px) {

          /* Back bar */
          .edp-back-bar {
            padding: 96px 16px 16px 16px !important;
          }

          /* Main content horizontal padding */
          .edp-main-content {
            padding: 0 16px !important;
          }

          /* Hero banner */
          .edp-hero-banner {
            min-height: 320px !important;
            border-radius: 20px !important;
            margin-bottom: 20px !important;
          }

          /* Hero overlay — top-to-bottom on mobile */
          .edp-hero-overlay {
            background: linear-gradient(
              to top,
              rgba(18, 14, 12, 0.95) 0%,
              rgba(18, 14, 12, 0.55) 55%,
              rgba(18, 14, 12, 0.1) 100%
            ) !important;
          }

          /* Hero content padding */
          .edp-hero-content {
            padding: 24px 20px !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          /* Hero title */
          .edp-hero-content h1 {
            font-size: 26px !important;
            margin-bottom: 10px !important;
          }

          /* Date/location line */
          .edp-hero-content > div[style*='marginBottom: 32px'] {
            font-size: 13px !important;
            margin-bottom: 20px !important;
          }

          /* Hero action buttons — stack on mobile */
          .edp-hero-actions {
            gap: 10px !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .edp-hero-actions button {
            width: 100% !important;
            text-align: center !important;
            justify-content: center !important;
            padding: 13px 20px !important;
            font-size: 12px !important;
          }

          /* Details card */
          .edp-details-card {
            padding: 24px 18px !important;
            border-radius: 20px !important;
            margin-bottom: 0 !important;
          }

          /* Key details grid → single column */
          .edp-key-details {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
            padding: 20px 18px !important;
            margin-bottom: 28px !important;
            border-radius: 16px !important;
          }

          /* Hide the desktop CTA inside the key-details box */
          .edp-key-cta {
            display: none !important;
          }

          /* Description text */
          .event-rich-description {
            font-size: 14.5px !important;
            line-height: 1.7 !important;
          }

          /* Section headings */
          .edp-details-card h2 {
            font-size: 24px !important;
          }
          .edp-details-card h3 {
            font-size: 20px !important;
          }

          /* Amenities grid → single column */
          .edp-amenities-grid {
            grid-template-columns: 1fr !important;
          }

          /* Itinerary rows → stack time + content vertically */
          .edp-details-card > div[style*='marginBottom: 48px'] > div > div[style*='display: flex'][style*='alignItems: center'][style*='justifyContent: space-between'] {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
          }

          /* Instructor box → vertical on mobile */
          .edp-details-card > div[style*='padding: 32px'] {
            flex-direction: column !important;
            padding: 20px 18px !important;
            gap: 16px !important;
          }

          /* Other events section */
          .other-events-cards-grid {
            grid-template-columns: 1fr !important;
          }

          /* Other event card description — truncate shorter */
          .other-event-card p {
            -webkit-line-clamp: 2 !important;
          }

          /* Sticky bottom CTA bar — shown only on mobile */
          .edp-sticky-mobile-cta {
            display: flex !important;
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            background: rgba(245, 239, 229, 0.96) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            padding: 14px 20px calc(14px + env(safe-area-inset-bottom)) 20px !important;
            border-top: 1px solid rgba(0,0,0,0.08) !important;
            z-index: 500 !important;
            box-shadow: 0 -8px 24px rgba(0,0,0,0.08) !important;
          }

          /* Extra bottom padding so content doesn't hide behind the sticky bar */
          .edp-main-content {
            padding-bottom: 100px !important;
          }
        }

        /* Desktop — hide the sticky mobile CTA */
        @media (min-width: 769px) {
          .edp-sticky-mobile-cta {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EventDetailPage;
