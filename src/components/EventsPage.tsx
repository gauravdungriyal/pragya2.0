import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Tag, ArrowUpRight, RefreshCw, Sparkles, Filter, Search, Check } from 'lucide-react';
import { getUpcomingEvents } from '../services/api';
import { UpcomingEvent } from '../types';

interface EventsPageProps {
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  onOpenEventDetail: (event: UpcomingEvent) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({ onOpenBooking, onOpenEventDetail }) => {
  const [eventsList, setEventsList] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeMonth, setActiveMonth] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const eventImages: Record<string, string> = {
    "1": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop",
    "2": "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1200&auto=format&fit=crop",
    "3": "https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=80&w=1200&auto=format&fit=crop",
    "4": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop"
  };

  const defaultEvents: UpcomingEvent[] = [
    {
      id: "1",
      title: "Sun-Kissed + Centered: Morning Beach Reset",
      name: "Sun-Kissed + Centered: Morning Beach Reset",
      description: "Step away from the city hustle and give yourself the ultimate weekend recharge. Dynamic oceanfront Hatha flow followed by sound bath and organic cold-pressed juices.",
      date: "Saturday, August 8 • 07:00 AM - 08:30 AM",
      starts_at: "2026-08-08 07:00:00",
      location: "Private Oceanfront Lawn, Repulse Bay",
      price: "HK$ 350",
      category: "Outdoor Reset"
    },
    {
      id: "2",
      title: "Himalayan Breathwork & Sound Immersion Workshop",
      name: "Himalayan Breathwork & Sound Immersion Workshop",
      description: "Master ancient Pranayama techniques to reset the central nervous system. Guided by Master Aarya with live acoustic Tibetan singing bowls.",
      date: "Sunday, August 16 • 04:00 PM - 06:30 PM",
      starts_at: "2026-08-16 16:00:00",
      location: "Main Sanctuary Studio",
      price: "HK$ 580",
      category: "Master Workshop"
    },
    {
      id: "3",
      title: "Sacred Serenity Nepal Retreat 2026 – Yog & Spiritual Journey",
      name: "Sacred Serenity Nepal Retreat 2026 – Yog & Spiritual Journey",
      description: "Escape to the Himalayas for a transformative 7-day retreat in Pokhara & Bandipur, Nepal. Join Pragya Yog School for daily yoga, meditation, cultural immersion, and breathtaking mountain views.",
      date: "September 25 - October 4, 2026",
      starts_at: "2026-09-25 16:00:00",
      location: "Pokhara & Bandipur, Nepal",
      price: "HK$ 19,125",
      category: "Retreat",
      spots_label: "9 users already booked"
    },
    {
      id: "4",
      title: "200-Hour International Yoga Teacher Training 2026",
      name: "200-Hour International Yoga Teacher Training 2026",
      description: "Transform your relationship with yoga and earn an internationally recognized certification accredited by Yoga Alliance. Comprehensive coverage of Asana, Pranayama, Anatomy, and Philosophy.",
      date: "October 15, 2026",
      starts_at: "2026-10-15 09:00:00",
      location: "Pragya Academy Center",
      price: "HK$ 24,000",
      category: "Teacher Training"
    }
  ];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getUpcomingEvents().then((data) => {
      if (!isMounted) return;
      if (Array.isArray(data) && data.length > 0) {
        setEventsList(data);
      } else {
        setEventsList(defaultEvents);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const dataToUse = eventsList.length > 0 ? eventsList : defaultEvents;

  // Extract Month helper function
  const getEventMonthKey = (ev: UpcomingEvent): string => {
    if (ev.starts_at) {
      try {
        const d = new Date(ev.starts_at.replace(' ', 'T'));
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
      } catch (e) {}
    }
    if (ev.date) {
      if (ev.date.includes('September') || ev.date.includes('Sep')) return 'September 2026';
      if (ev.date.includes('October') || ev.date.includes('Oct')) return 'October 2026';
      if (ev.date.includes('August') || ev.date.includes('Aug')) return 'August 2026';
      if (ev.date.includes('November') || ev.date.includes('Nov')) return 'November 2026';
    }
    return 'Upcoming';
  };

  // Build Month Filter Pills
  const monthSet = new Set<string>();
  dataToUse.forEach((ev) => {
    monthSet.add(getEventMonthKey(ev));
  });
  const monthsList = ['ALL', ...Array.from(monthSet)];

  // Filter events by selected month & search query
  const filteredEvents = dataToUse.filter((event) => {
    const eventMonth = getEventMonthKey(event);
    const matchesMonth = activeMonth === 'ALL' || eventMonth === activeMonth;
    const matchesSearch = searchQuery === '' ||
      (event.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMonth && matchesSearch;
  });

  return (
    <div style={{ backgroundColor: '#F5EFE5', minHeight: '100vh', color: '#21201E' }}>
      
      {/* Top Banner Header */}
      <section
        className="events-top-banner"
        style={{
          backgroundColor: '#F5EFE5',
          color: '#21201E',
          padding: '140px 32px 48px 32px'
        }}
      >
        <div
          className="events-header-grid"
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
              className="events-top-title"
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
              Events &{' '}
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: '#21201E'
                }}
              >
                Workshops
              </span>
            </h1>
          </div>

          <div>
            <p
              className="events-top-subtitle"
              style={{
                fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                fontSize: '16px',
                color: '#6B655F',
                lineHeight: 1.6,
                margin: 0,
                maxWidth: '520px'
              }}
            >
              Explore our sanctuary events, oceanfront resets, sound bath immersions, and international retreats. Filter by month to find your next journey.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content: Controls & Alternating Event Rows */}
      <section
        className="events-main-section"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '40px 32px 100px 32px'
        }}
      >
        {/* Controls Row: Month Filter Pills & Search Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap',
            marginBottom: '48px'
          }}
        >
          {/* Filter By Month Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '13px', fontWeight: 800, color: '#944426', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '4px' }}>
              Filter Month:
            </span>
            {monthsList.map((monthKey) => {
              const isActive = activeMonth === monthKey;
              return (
                <button
                  key={monthKey}
                  onClick={() => setActiveMonth(monthKey)}
                  style={{
                    fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                    backgroundColor: isActive ? '#21201E' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#4A4540',
                    border: isActive ? 'none' : '1px solid rgba(39, 39, 39, 0.12)',
                    borderRadius: '999px',
                    padding: '9px 22px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 4px 16px rgba(33, 32, 30, 0.15)' : 'none',
                    transition: 'all 0.25s ease'
                  }}
                >
                  {monthKey === 'ALL' ? 'All Months' : monthKey}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div
            style={{
              position: 'relative',
              minWidth: '260px',
              maxWidth: '340px',
              width: '100%'
            }}
          >
            <Search size={16} color="#8A8580" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search event or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                fontSize: '14px',
                padding: '10px 16px 10px 42px',
                borderRadius: '999px',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                backgroundColor: '#FFFFFF',
                color: '#21201E',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            />
          </div>
        </div>

        {/* Loading / Alternating Rows Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#944426' }}>
            <RefreshCw size={26} className="animate-spin" style={{ margin: '0 auto 16px auto', display: 'block' }} />
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: 'italic',
                fontSize: '20px',
                color: '#6B655F',
                maxWidth: '560px',
                margin: '0 auto 8px auto',
                lineHeight: 1.45
              }}
            >
              “Yoga is the artwork of awareness on the canvas of body, mind and soul.”
            </p>
            <span style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '13px', color: '#944426', fontWeight: 700, letterSpacing: '0.04em' }}>
              — B.K.S. Iyengar
            </span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 24px', backgroundColor: '#FFFFFF', borderRadius: '24px', color: '#7A756F' }}>
            No upcoming events found for this month or search filter. Please try another month.
          </div>
        ) : (
          <div
            className="events-cards-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '32px'
            }}
          >
            {filteredEvents.map((ev, idx) => {
              const coverImg = ev.image || ev.banner_image?.url || eventImages[ev.id] || eventImages[String((idx % 4) + 1)];
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
                  className="event-card-box"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.04)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                >
                  <div>
                    {/* Top Cover Image Box with Overlay Tags */}
                    <div style={{ width: '100%', height: '220px', overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={coverImg}
                        alt={ev.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                      />

                      {/* Category Pill Tag Overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          backgroundColor: 'rgba(200, 109, 81, 0.15)',
                          color: '#C86D51',
                          borderRadius: '999px',
                          padding: '4px 14px',
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        {ev.category || 'SPECIAL EVENT'}
                      </div>

                      {/* Social Proof Badge Overlay */}
                      {ev.spots_label && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '16px',
                            left: '16px',
                            backgroundColor: 'rgba(33, 32, 30, 0.85)',
                            color: '#FFFFFF',
                            borderRadius: '999px',
                            padding: '4px 12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <Sparkles size={12} color="#D9AE29" />
                          <span>{ev.spots_label}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Body Area */}
                    <div style={{ padding: '24px 24px 16px 24px' }}>
                      {/* Sub-Category Upper Label */}
                      <div
                        style={{
                          fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '0.08em',
                          color: '#C86D51',
                          textTransform: 'uppercase',
                          marginBottom: '6px'
                        }}
                      >
                        {ev.category ? `${ev.category.toUpperCase()} WORKSHOP` : 'PRAGYA SANCTUARY IMMERSION'}
                      </div>

                      {/* Event Title */}
                      <h3
                        style={{
                          fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                          fontSize: '21px',
                          fontWeight: 700,
                          color: '#21201E',
                          margin: '0 0 14px 0',
                          lineHeight: 1.25
                        }}
                      >
                        {ev.title || ev.name}
                      </h3>

                      {/* Price & Date Rounded Box */}
                      <div
                        style={{
                          backgroundColor: '#F8FAF9',
                          border: '1px solid rgba(0, 0, 0, 0.05)',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          textAlign: 'center',
                          fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#21201E',
                          marginBottom: '16px'
                        }}
                      >
                        {ev.price || 'HK$ 450'} &nbsp;|&nbsp; {ev.date || ev.starts_at || 'Upcoming Season'}
                      </div>

                      {/* Location Badge Line */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px',
                          color: '#7A756F',
                          fontWeight: 600,
                          marginBottom: '12px'
                        }}
                      >
                        <MapPin size={14} color="#944426" />
                        <span>{ev.location || 'Pragya Sanctuary Studio'}</span>
                      </div>

                      {/* Description Preview */}
                      <p
                        style={{
                          fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                          fontSize: '13.5px',
                          color: '#5A554F',
                          lineHeight: 1.55,
                          margin: '0 0 20px 0',
                          minHeight: '42px'
                        }}
                      >
                        {cleanDescText.length > 160 ? cleanDescText.slice(0, 160) + '...' : cleanDescText}
                      </p>

                      {/* Included Highlights List */}
                      <div>
                        <div
                          style={{
                            fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                            fontSize: '11px',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            color: '#C86D51',
                            textTransform: 'uppercase',
                            marginBottom: '10px'
                          }}
                        >
                          EVENT HIGHLIGHTS:
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4A4540', fontWeight: 500 }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'rgba(200, 109, 81, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Check size={10} color="#C86D51" strokeWidth={3} />
                            </div>
                            <span>Guided by Internationally Certified Faculty</span>
                          </li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4A4540', fontWeight: 500 }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'rgba(200, 109, 81, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Check size={10} color="#C86D51" strokeWidth={3} />
                            </div>
                            <span>Complimentary Eco-Mats & Hydrotherapy Access</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div style={{ padding: '0 24px 24px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => onOpenEventDetail(ev)}
                      style={{
                        flex: 1,
                        fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                        backgroundColor: 'rgba(200, 109, 81, 0.14)',
                        color: '#C86D51',
                        border: 'none',
                        borderRadius: '999px',
                        padding: '11px 16px',
                        fontSize: '12.5px',
                        fontWeight: 800,
                        letterSpacing: '0.02em',
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
                        padding: '11px 16px',
                        fontSize: '12.5px',
                        fontWeight: 800,
                        letterSpacing: '0.02em',
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
                      <Calendar size={14} />
                      <span>BOOK SESSION</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Responsive CSS */}
      <style>{`
        .event-row-card:hover .event-card-img {
          transform: scale(1.04);
        }
        @media (max-width: 900px) {
          .event-row-card {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
            margin-bottom: 48px !important;
          }
          .event-row-img-box {
            order: 1 !important;
            height: 260px !important;
          }
          .event-row-content {
            order: 2 !important;
          }
          .events-top-banner {
            padding: 104px 20px 24px 20px !important;
          }
          .events-header-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .events-top-title {
            font-size: 38px !important;
          }
          .events-main-section {
            padding: 32px 20px 60px 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EventsPage;
