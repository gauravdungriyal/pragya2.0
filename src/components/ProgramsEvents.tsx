import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, BarChart2, Clock, Target, ArrowUpRight, RefreshCw } from 'lucide-react';
import { getUpcomingEvents } from '../services/api';

interface ProgramsEventsProps {
  onOpenBooking: (type?: string, title?: string) => void;
}

const cleanText = (str: string) => {
  if (!str) return '';
  return str
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]*>?/gm, '')
    .trim();
};

export const ProgramsEvents: React.FC<ProgramsEventsProps> = ({ onOpenBooking }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const defaultEvents = [
    {
      id: '1',
      title: 'Mat Pilates',
      level: 'Beginner',
      duration: '45 min',
      focus: 'Core Strength & Breathing',
      description: 'Gentle mat exercises focused on core activation and controlled breathing.',
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: '2',
      title: 'Reformer Pilates',
      level: 'Intermediate',
      duration: '60 min',
      focus: 'Strength & Posture',
      description: 'Equipment-based training designed to tone muscles and improve posture.',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: '3',
      title: 'Pilates for Athletes',
      level: 'Advanced',
      duration: '60 min',
      focus: 'Peak Performance',
      description: 'Performance-driven sessions targeting strength, balance, and endurance.',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: '4',
      title: 'Himalayan Breathwork & Sound',
      level: 'All Levels',
      duration: '90 min',
      focus: 'Nerve Science & Sound',
      description: 'Ancient Pranayama techniques to reset the nervous system coupled with live acoustic singing bowls.',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop'
    }
  ];

  useEffect(() => {
    getUpcomingEvents().then((data) => {
      if (data && data.length > 0) {
        const mapped = data.map((item, idx) => ({
          id: String(item.id || idx + 1),
          title: cleanText(item.title || defaultEvents[idx % defaultEvents.length].title),
          level: idx === 0 ? 'Beginner' : idx === 1 ? 'Intermediate' : idx === 2 ? 'Advanced' : 'All Levels',
          duration: idx === 0 ? '45 min' : idx === 1 ? '60 min' : '90 min',
          focus: idx === 0 ? 'Core Strength & Breathing' : idx === 1 ? 'Strength & Posture' : 'Peak Performance',
          description: cleanText(item.description || defaultEvents[idx % defaultEvents.length].description),
          image: defaultEvents[idx % defaultEvents.length].image
        }));
        setEvents(mapped);
      } else {
        setEvents(defaultEvents);
      }
      setLoading(false);
    });
  }, []);

  const displayList = events.length > 0 ? events : defaultEvents;
  const total = displayList.length;

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  return (
    <section
      id="programs"
      className="programs-section reveal-on-scroll"
      style={{
        backgroundColor: '#FFFFFF',
        padding: '84px 0',
        color: '#21201E',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        className="programs-container"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 40px'
        }}
      >
        {/* Header Row */}
        <div className="programs-header">
          <div className="programs-header-left">
            <span className="programs-sub-tag">
              — CLASSES —
            </span>
            <h2 className="programs-heading">
              Find Your Perfect Class
            </h2>
          </div>

          <p className="programs-subtitle">
            From beginner-friendly sessions to advanced pilates, find the class that suits you best.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#944426' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', display: 'block' }} />
            <p style={{ color: '#8A8580' }}>Loading available classes...</p>
          </div>
        ) : (
          <>
            {/* Desktop Track View */}
            <div className="programs-desktop-track-wrapper">
              <div
                className="programs-desktop-track"
                style={{
                  transform: `translateX(calc(-${activeIndex} * (33.333% + 9.33px)))`
                }}
              >
                {displayList.map((item, idx) => {
                  const isActive = idx === activeIndex;

                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => {
                        setActiveIndex(idx);
                        onOpenBooking('event', item.title);
                      }}
                      style={{
                        width: 'calc(33.333% - 18.66px)',
                        flexShrink: 0,
                        marginRight: '28px',
                        backgroundColor: isActive ? '#21201E' : '#FFFFFF',
                        color: isActive ? '#FFFFFF' : '#21201E',
                        borderRadius: '24px',
                        padding: isActive ? '18px' : '0px',
                        boxShadow: isActive ? '0 20px 40px rgba(33, 32, 30, 0.22)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.55s cubic-bezier(0.25, 1, 0.5, 1)',
                        boxSizing: 'border-box'
                      }}
                      className="event-card-item"
                    >
                      <div>
                        <div
                          style={{
                            position: 'relative',
                            width: '100%',
                            height: '240px',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            marginBottom: '20px'
                          }}
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                              transition: 'transform 0.4s ease'
                            }}
                          />

                          <div
                            style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '52px',
                              height: '52px',
                              borderRadius: '50%',
                              backgroundColor: '#FFFFFF',
                              color: '#21201E',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                              opacity: isActive ? 1 : 0,
                              visibility: isActive ? 'visible' : 'hidden',
                              transition: 'all 0.35s ease'
                            }}
                          >
                            <ArrowUpRight size={22} />
                          </div>
                        </div>

                        {/* Metadata Row */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            fontSize: '12px',
                            color: isActive ? 'rgba(255, 255, 255, 0.75)' : '#757069',
                            marginBottom: '16px',
                            flexWrap: 'wrap'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <BarChart2 size={14} />
                            <span>{item.level}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Clock size={14} />
                            <span>{item.duration}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Target size={14} />
                            <span>{item.focus}</span>
                          </div>
                        </div>

                        <h3
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: '20px',
                            fontWeight: 700,
                            color: isActive ? '#FFFFFF' : '#21201E',
                            marginBottom: '10px',
                            lineHeight: 1.25
                          }}
                        >
                          {item.title}
                        </h3>

                        <p
                          style={{
                            fontSize: '14px',
                            color: isActive ? 'rgba(255, 255, 255, 0.75)' : '#757069',
                            lineHeight: 1.55,
                            margin: 0,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Stacked Vertical Cards (Matching Reference Screenshot) */}
            <div className="programs-mobile-list">
              {displayList.map((item, idx) => {
                const isDarkCard = idx % 2 === 1; // Alternate cards (e.g. Reformer Pilates) as dark featured

                return (
                  <div
                    key={item.id || idx}
                    onClick={() => onOpenBooking('event', item.title)}
                    className={`mobile-class-card ${isDarkCard ? 'dark-card' : 'light-card'}`}
                  >
                    {/* Top Image Box */}
                    <div className="mobile-card-img-box">
                      <img src={item.image} alt={item.title} className="mobile-card-img" />

                      {/* Hotspot Ring & Arrow Button for Dark Cards */}
                      {isDarkCard && (
                        <>
                          <div className="hotspot-pink-ring" />
                          <div className="mobile-center-arrow">
                            <ArrowUpRight size={22} color="#21201E" />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Metadata Row */}
                    <div className="mobile-meta-row">
                      <div className="meta-item">
                        <BarChart2 size={14} />
                        <span>{item.level}</span>
                      </div>
                      <div className="meta-item">
                        <Clock size={14} />
                        <span>{item.duration}</span>
                      </div>
                      <div className="meta-item">
                        <Target size={14} />
                        <span>{item.focus}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="mobile-card-title">{item.title}</h3>

                    {/* Description */}
                    <p className="mobile-card-desc">{item.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Bottom Progress Bar & Navigation Controls (Desktop) */}
            <div className="programs-desktop-controls">
              <div
                style={{
                  flexGrow: 1,
                  height: '2px',
                  backgroundColor: '#EAE5DC',
                  borderRadius: '2px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#21201E',
                    width: `${((activeIndex + 1) / total) * 100}%`,
                    transition: 'width 0.55s cubic-bezier(0.25, 1, 0.5, 1)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <button
                  onClick={handlePrev}
                  aria-label="Previous class"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #21201E',
                    color: '#21201E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={handleNext}
                  aria-label="Next class"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#21201E',
                    border: '1px solid #21201E',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .programs-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 32px;
          margin-bottom: 52px;
          flex-wrap: wrap;
        }
        .programs-header-left {
          max-width: 600px;
        }
        .programs-sub-tag {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #944426;
          text-transform: uppercase;
          display: block;
          margin-bottom: 12px;
        }
        .programs-heading {
          font-family: var(--font-serif);
          font-size: clamp(32px, 4vw, 54px);
          font-weight: 400;
          color: #21201E;
          line-height: 1.15;
          margin: 0;
        }
        .programs-subtitle {
          font-family: 'Neue Montreal', sans-serif;
          max-width: 380px;
          font-size: 15px;
          color: #757069;
          line-height: 1.6;
          margin: 8px 0 0 0;
        }
        .programs-desktop-track-wrapper {
          width: 100%;
          overflow: hidden;
          margin-bottom: 56px;
          padding: 10px 0;
        }
        .programs-desktop-track {
          display: flex;
          transition: transform 0.55s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .event-card-item:hover img {
          transform: scale(1.03);
        }
        .programs-mobile-list {
          display: none;
        }
        .programs-desktop-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        /* Mobile Layout - Matching User Reference Screenshot */
        @media (max-width: 768px) {
          .programs-section {
            padding: 40px 0 52px 0 !important;
          }
          .programs-container {
            padding: 0 20px !important;
          }
          .programs-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            margin-bottom: 28px !important;
          }
          .programs-sub-tag {
            font-size: 11.5px !important;
            margin-bottom: 8px !important;
          }
          .programs-heading {
            font-size: 32px !important;
            line-height: 1.15 !important;
          }
          .programs-subtitle {
            font-size: 14.5px !important;
            line-height: 1.55 !important;
            max-width: 100% !important;
            margin-top: 0 !important;
          }
          .programs-desktop-track-wrapper, .programs-desktop-controls {
            display: none !important;
          }
          .programs-mobile-list {
            display: flex !important;
            flex-direction: column !important;
            gap: 36px !important;
          }
          .mobile-class-card {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            cursor: pointer !important;
          }
          .mobile-class-card.light-card {
            background-color: transparent !important;
            color: #21201E !important;
          }
          .mobile-class-card.dark-card {
            background-color: #21201E !important;
            color: #FFFFFF !important;
            border-radius: 24px !important;
            padding: 16px !important;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12) !important;
          }
          .mobile-card-img-box {
            position: relative !important;
            width: 100% !important;
            height: 240px !important;
            border-radius: 18px !important;
            overflow: hidden !important;
            margin-bottom: 16px !important;
          }
          .mobile-card-img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            display: block !important;
            border-radius: 18px !important;
          }
          .hotspot-pink-ring {
            position: absolute !important;
            top: 36% !important;
            left: 52% !important;
            width: 20px !important;
            height: 20px !important;
            border-radius: 50% !important;
            border: 2px solid #E05297 !important;
            background: rgba(224, 82, 151, 0.25) !important;
            box-shadow: 0 0 10px rgba(224, 82, 151, 0.5) !important;
          }
          .mobile-center-arrow {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 48px !important;
            height: 48px !important;
            border-radius: 50% !important;
            background-color: #FFFFFF !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: 0 6px 18px rgba(0,0,0,0.2) !important;
          }
          .mobile-meta-row {
            display: flex !important;
            align-items: center !important;
            gap: 16px !important;
            font-size: 13px !important;
            margin-bottom: 12px !important;
            flex-wrap: wrap !important;
          }
          .light-card .mobile-meta-row {
            color: #757069 !important;
          }
          .dark-card .mobile-meta-row {
            color: rgba(255, 255, 255, 0.8) !important;
          }
          .meta-item {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
          }
          .mobile-card-title {
            font-family: var(--font-sans) !important;
            font-size: 22px !important;
            font-weight: 700 !important;
            margin-bottom: 8px !important;
            line-height: 1.25 !important;
          }
          .light-card .mobile-card-title {
            color: #21201E !important;
          }
          .dark-card .mobile-card-title {
            color: #FFFFFF !important;
          }
          .mobile-card-desc {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default ProgramsEvents;
