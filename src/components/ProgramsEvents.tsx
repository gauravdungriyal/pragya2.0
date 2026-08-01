import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, BarChart2, Clock, Target, RefreshCw } from 'lucide-react';
import { getUpcomingEvents } from '../services/api';
import { UpcomingEvent } from '../types';

interface ProgramsEventsProps {
  onOpenBooking: (type?: string, title?: string) => void;
  onOpenEventDetail?: (event: UpcomingEvent) => void;
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

export const ProgramsEvents: React.FC<ProgramsEventsProps> = ({ onOpenBooking, onOpenEventDetail }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Touch handlers for mobile swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const defaultEvents = [
    {
      id: '1',
      title: 'Mat Pilates',
      name: 'Mat Pilates',
      level: 'Beginner',
      duration: '45 min',
      focus: 'Core Strength & Breathing',
      description: 'Gentle mat exercises focused on core activation and controlled breathing.',
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: '2',
      title: 'Reformer Pilates',
      name: 'Reformer Pilates',
      level: 'Intermediate',
      duration: '60 min',
      focus: 'Strength & Posture',
      description: 'Equipment-based training designed to tone muscles and improve posture.',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: '3',
      title: 'Pilates for Athletes',
      name: 'Pilates for Athletes',
      level: 'Advanced',
      duration: '60 min',
      focus: 'Peak Performance',
      description: 'Performance-driven sessions targeting strength, balance, and endurance.',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: '4',
      title: 'Himalayan Breathwork & Sound',
      name: 'Himalayan Breathwork & Sound',
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
        const mapped = data.map((item: any, idx: number) => {
          const realImage = item.image || item.banner_image?.url || item.square_image?.url;
          return {
            ...item,
            id: String(item.id || idx + 1),
            title: cleanText(item.title || item.name || defaultEvents[idx % defaultEvents.length].title),
            name: cleanText(item.name || item.title || defaultEvents[idx % defaultEvents.length].title),
            level: item.level || (idx === 0 ? 'Beginner' : idx === 1 ? 'Intermediate' : idx === 2 ? 'Advanced' : 'All Levels'),
            duration: item.duration || (idx === 0 ? '45 min' : idx === 1 ? '60 min' : '90 min'),
            focus: item.focus || item.category || (idx === 0 ? 'Core Strength & Breathing' : idx === 1 ? 'Strength & Posture' : 'Peak Performance'),
            description: cleanText(item.description || defaultEvents[idx % defaultEvents.length].description),
            image: realImage && realImage.trim() !== '' ? realImage : defaultEvents[idx % defaultEvents.length].image
          };
        });
        setEvents(mapped);
      } else {
        setEvents(defaultEvents);
      }
      setLoading(false);
    });
  }, []);

  const displayList = events.length > 0 ? events : defaultEvents;
  const total = displayList.length;

  const [lastClickedBtn, setLastClickedBtn] = useState<'prev' | 'next'>('next');

  const handleNext = () => {
    setLastClickedBtn('next');
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setLastClickedBtn('prev');
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) {
      handleNext();
    } else if (distance < -50) {
      handlePrev();
    }
  };

  return (
    <section
      id="programs"
      className="programs-section reveal-on-scroll"
      style={{
        backgroundColor: '#FFFFFF',
        padding: '52px 0',
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
              — EVENTS —
            </span>
            <h2 className="programs-heading">
              Upcoming Events
            </h2>
          </div>

          <p className="programs-subtitle">
            From beginner-friendly workshops to advanced masterclasses, find the event that suits you best.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#944426' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block' }} />
            <p style={{ color: '#8A8580', fontSize: '14px' }}>Loading upcoming events...</p>
          </div>
        ) : (
          <>
            {/* Carousel Container */}
            <div
              className="programs-carousel-wrapper"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="programs-carousel-track"
                style={{
                  '--active-index': activeIndex
                } as React.CSSProperties}
              >
                {displayList.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    onClick={() => {
                      if (onOpenEventDetail) {
                        onOpenEventDetail(item as UpcomingEvent);
                      } else {
                        onOpenBooking('event', item.title);
                      }
                    }}
                    className="programs-event-card"
                  >
                    {/* Top Image Box */}
                    <div className="programs-card-img-box">
                      <img src={item.image} alt={item.title} className="programs-card-img" />
                    </div>

                    {/* Metadata Row */}
                    <div className="programs-card-meta">
                      <div className="meta-item">
                        <BarChart2 size={13} />
                        <span>{item.level}</span>
                      </div>
                      <div className="meta-item">
                        <Clock size={13} />
                        <span>{item.duration}</span>
                      </div>
                      <div className="meta-item">
                        <Target size={13} />
                        <span>{item.focus}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="programs-card-title">{item.title}</h3>

                    {/* Description */}
                    <p className="programs-card-desc">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Progress Bar & Navigation Controls (Desktop & Mobile) */}
            <div className="programs-controls-row">
              <div className="programs-progress-track">
                <div
                  className="programs-progress-fill"
                  style={{
                    transform: `scaleX(${((activeIndex + 1) / total)})`
                  }}
                />
              </div>

              <div className="programs-nav-buttons">
                <button
                  onClick={handlePrev}
                  aria-label="Previous event"
                  className={`programs-nav-btn ${lastClickedBtn === 'prev' ? 'btn-active-black' : 'btn-inactive-white'}`}
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  onClick={handleNext}
                  aria-label="Next event"
                  className={`programs-nav-btn ${lastClickedBtn === 'next' ? 'btn-active-black' : 'btn-inactive-white'}`}
                >
                  <ChevronRight size={18} />
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
          gap: 24px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }
        .programs-header-left {
          max-width: 550px;
        }
        .programs-sub-tag {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #944426;
          text-transform: uppercase;
          display: block;
          margin-bottom: 6px;
        }
        .programs-heading {
          font-family: var(--font-serif);
          font-size: clamp(28px, 3.2vw, 42px);
          font-weight: 400;
          color: #21201E;
          line-height: 1.15;
          margin: 0;
        }
        .programs-subtitle {
          font-family: 'Neue Montreal', sans-serif;
          max-width: 360px;
          font-size: 14px;
          color: #757069;
          line-height: 1.5;
          margin: 4px 0 0 0;
        }

        /* Hardware Accelerated Carousel Track */
        .programs-carousel-wrapper {
          width: 100%;
          overflow: hidden;
          padding: 4px 0 8px 0;
          touch-action: pan-y;
        }
        .programs-carousel-track {
          display: flex;
          transform: translate3d(calc(-1 * var(--active-index, 0) * (33.3333% + 6.66px)), 0, 0);
          transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
        }

        /* Dark Event Cards */
        .programs-event-card {
          width: calc(33.3333% - 13.33px);
          flex-shrink: 0;
          margin-right: 20px;
          background-color: #21201E;
          color: #FFFFFF;
          border-radius: 24px;
          padding: 16px;
          box-shadow: 0 10px 28px rgba(33, 32, 30, 0.16);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: pointer;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease;
          box-sizing: border-box;
          backface-visibility: hidden;
        }
        .programs-event-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 36px rgba(33, 32, 30, 0.25);
        }

        .programs-card-img-box {
          position: relative;
          width: 100%;
          height: 220px;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 14px;
        }
        .programs-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .programs-event-card:hover .programs-card-img {
          transform: scale(1.03);
        }

        /* Card Details */
        .programs-card-meta {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .programs-card-title {
          font-family: var(--font-sans);
          font-size: 19px;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0 0 8px 0;
          line-height: 1.25;
        }
        .programs-card-desc {
          font-size: 13.5px;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.5;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Bottom Controls Row & Hardware-Accelerated Progress Line */
        .programs-controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 24px;
        }
        .programs-progress-track {
          flex-grow: 1;
          height: 2px;
          background-color: #EAE5DC;
          border-radius: 2px;
          position: relative;
          overflow: hidden;
        }
        .programs-progress-fill {
          width: 100%;
          height: 100%;
          background-color: #21201E;
          transform-origin: left center;
          transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
        }
        .programs-nav-buttons {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .programs-nav-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          user-select: none;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          will-change: transform;
        }
        .programs-nav-btn:active {
          transform: scale(0.90) !important;
          transition: transform 0.08s ease;
        }

        .btn-active-black {
          background-color: #21201E;
          border: 1px solid #21201E;
          color: #FFFFFF;
        }
        .btn-active-black:hover {
          background-color: #383633;
          transform: scale(1.06);
          box-shadow: 0 4px 12px rgba(33, 32, 30, 0.2);
        }

        .btn-inactive-white {
          background-color: #FFFFFF;
          border: 1px solid #21201E;
          color: #21201E;
        }
        .btn-inactive-white:hover {
          background-color: #F5F3EF;
          transform: scale(1.06);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        /* Mobile Responsive View */
        @media (max-width: 768px) {
          .programs-carousel-track {
            transform: translate3d(calc(-1 * var(--active-index, 0) * (100% + 14px)), 0, 0);
          }
          .programs-section {
            padding: 32px 0 40px 0 !important;
          }
          .programs-container {
            padding: 0 16px !important;
          }
          .programs-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
            margin-bottom: 20px !important;
          }
          .programs-sub-tag {
            font-size: 10.5px !important;
            margin-bottom: 4px !important;
          }
          .programs-heading {
            font-size: 26px !important;
            line-height: 1.15 !important;
          }
          .programs-subtitle {
            font-size: 13.5px !important;
            line-height: 1.45 !important;
            max-width: 100% !important;
            margin-top: 0 !important;
          }

          .programs-event-card {
            width: 100% !important;
            margin-right: 14px !important;
            padding: 14px !important;
            border-radius: 22px !important;
          }
          .programs-card-img-box {
            height: 210px !important;
            border-radius: 16px !important;
            margin-bottom: 12px !important;
          }
          .programs-card-title {
            font-size: 19px !important;
          }
          .programs-controls-row {
            margin-top: 20px !important;
            gap: 14px !important;
          }
          .programs-nav-btn {
            width: 38px !important;
            height: 38px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default ProgramsEvents;
