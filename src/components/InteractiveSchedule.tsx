import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, RefreshCw, Calendar, SlidersHorizontal, Check } from 'lucide-react';
import { getScheduleByDate } from '../services/api';
import { ClassScheduleItem } from '../types';

interface InteractiveScheduleProps {
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
}

export const InteractiveSchedule: React.FC<InteractiveScheduleProps> = ({ onOpenBooking }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2026-08-01'));
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [scheduleItems, setScheduleItems] = useState<ClassScheduleItem[]>([]);

  const levelOptions = ['ALL', 'Beginner', 'Intermediate', 'Advanced', 'Restorative'];

  const fallbackClasses = [
    {
      id: '101',
      schedule_id: '25493',
      title: 'Morning Sun Hatha & Pranayama',
      timing: '07:00 AM - 08:15 AM',
      duration: '75 Minutes',
      instructor: 'Master Aarya',
      levels: 'All Levels',
      room: 'Lotus Sanctuary Room A',
      description: 'Awaken bodily energy with sun salutations and breathwork.'
    },
    {
      id: '102',
      schedule_id: '25494',
      title: 'Mindful Vinyasa Flow',
      timing: '09:00 AM - 10:15 AM',
      duration: '75 Minutes',
      instructor: 'Angela Lee',
      levels: 'Intermediate',
      room: 'Prana Studio',
      description: 'Fluid movement synchronized with dynamic breath.'
    },
    {
      id: '103',
      schedule_id: '25495',
      title: 'Reformer Pilates & Core Sculpt',
      timing: '11:00 AM - 12:00 PM',
      duration: '60 Minutes',
      instructor: 'Angela Lee',
      levels: 'All Levels',
      room: 'Reformer Suite',
      description: 'Precision controlled reformer movements.'
    },
    {
      id: '104',
      schedule_id: '25496',
      title: 'Acoustic Sound Bath & Recovery',
      timing: '05:30 PM - 06:45 PM',
      duration: '75 Minutes',
      instructor: 'Charlotte Chiu',
      levels: 'Restorative',
      room: 'Lotus Sanctuary Room B',
      description: 'Deep restorative floor postures with quartz singing bowls.'
    }
  ];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const dateStr = selectedDate.toISOString().split('T')[0];

    getScheduleByDate(dateStr).then((data) => {
      if (!isMounted) return;
      if (data && Array.isArray(data.schedules) && data.schedules.length > 0) {
        setScheduleItems(data.schedules);
      } else {
        setScheduleItems([]);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  const displayItems = scheduleItems.length > 0 ? scheduleItems : (fallbackClasses as any[]);

  const filteredItems = levelFilter === 'ALL'
    ? displayItems
    : displayItems.filter((item) => (item.levels || '').toLowerCase().includes(levelFilter.toLowerCase()));

  return (
    <section
      id="schedule"
      style={{
        backgroundColor: '#FFFFFF',
        padding: '72px 0',
        color: '#21201E'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px'
        }}
      >
        {/* Main Card Outer Container */}
        <div
          style={{
            backgroundColor: '#F5EFE5',
            borderRadius: '32px',
            padding: '56px 48px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.03)'
          }}
          className="schedule-card-container"
        >
          {/* Header Tag & Title */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span
              style={{
                fontFamily: "'Neue Montreal', sans-serif",
                fontSize: '11.5px',
                fontWeight: 700,
                letterSpacing: '0.16em',
                color: '#944426',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '10px'
              }}
            >
              — SCHEDULE —
            </span>
            <h2
              style={{
                fontFamily: "'BNCringeSerif', 'Canela', Georgia, serif",
                fontSize: 'clamp(32px, 4.5vw, 54px)',
                fontWeight: 400,
                color: '#272727',
                lineHeight: 1.15,
                margin: 0
              }}
            >
              Find Your <span style={{ fontFamily: "'Canela', serif", fontStyle: 'italic', fontWeight: 400 }}>Perfect</span> Schedule
            </h2>
          </div>

          {/* DATE NAVIGATOR BAR */}
          <div
            className="schedule-nav-bar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              marginBottom: '40px',
              position: 'relative'
            }}
          >
            {/* Center Date Selector Pill */}
            <div
              className="schedule-date-pill"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '999px',
                padding: '10px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(148, 68, 38, 0.15)',
                position: 'relative'
              }}
            >
              {/* Left Arrow */}
              <button
                onClick={() => {
                  const prev = new Date(selectedDate);
                  prev.setDate(prev.getDate() - 1);
                  setSelectedDate(prev);
                }}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#21201E'
                }}
                title="Previous Day"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Date Text & Calendar Icon */}
              <div
                className="date-pill-text-wrapper"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: "'Neue Montreal', sans-serif",
                  fontSize: '14.5px',
                  fontWeight: 700,
                  color: '#21201E',
                  cursor: 'pointer',
                  position: 'relative',
                  whiteSpace: 'nowrap'
                }}
              >
                <Calendar size={16} color="#944426" style={{ flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap' }}>
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>

                {/* Hidden Native Date Input */}
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedDate(new Date(e.target.value));
                    }
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%'
                  }}
                  title="Click to select date"
                />
              </div>

              {/* Right Arrow */}
              <button
                onClick={() => {
                  const next = new Date(selectedDate);
                  next.setDate(next.getDate() + 1);
                  setSelectedDate(next);
                }}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#21201E'
                }}
                title="Next Day"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* TODAY Pill Button */}
            <button
              className="schedule-today-btn"
              onClick={() => setSelectedDate(new Date('2026-08-01'))}
              style={{
                fontFamily: "'Neue Montreal', sans-serif",
                backgroundColor: 'transparent',
                color: '#354336',
                border: '1.5px solid #354336',
                borderRadius: '999px',
                padding: '10px 24px',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#354336';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#354336';
              }}
            >
              TODAY
            </button>

            {/* FILTERS Pill Button */}
            <div className="schedule-filter-wrapper" style={{ position: 'relative' }}>
              <button
                className="schedule-filter-btn"
                onClick={() => setShowFilterModal(!showFilterModal)}
                style={{
                  fontFamily: "'Neue Montreal', sans-serif",
                  backgroundColor: showFilterModal ? '#354336' : 'transparent',
                  color: showFilterModal ? '#FFFFFF' : '#4A4540',
                  border: '1.5px solid rgba(148, 68, 38, 0.3)',
                  borderRadius: '999px',
                  padding: '10px 24px',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <SlidersHorizontal size={14} />
                <span>FILTERS</span>
                {levelFilter !== 'ALL' && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#944426'
                    }}
                  />
                )}
              </button>

              {/* Filter Dropdown Popup */}
              {showFilterModal && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '16px',
                    width: '220px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                    zIndex: 10,
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#7A756F', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                    Filter By Level
                  </div>
                  {levelOptions.map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => {
                        setLevelFilter(lvl);
                        setShowFilterModal(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: levelFilter === lvl ? '#F5EFE5' : 'transparent',
                        color: levelFilter === lvl ? '#944426' : '#21201E',
                        fontWeight: levelFilter === lvl ? 700 : 500,
                        fontSize: '13.5px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '4px'
                      }}
                    >
                      <span>{lvl}</span>
                      {levelFilter === lvl && <Check size={14} color="#944426" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Loading Indicator */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#944426' }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', display: 'block' }} />
              <p style={{ fontFamily: "'Neue Montreal', sans-serif", color: '#757069' }}>Loading live class schedule...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#FFFFFF', borderRadius: '16px', color: '#7A756F' }}>
              No sessions scheduled for this filter. Select another date or clear filter.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredItems.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onOpenBooking('class', item.title || item.className, item)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '24px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '24px',
                    flexWrap: 'wrap',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    transition: 'all 0.25s ease'
                  }}
                  className="schedule-row-grid"
                >
                  <div style={{ minWidth: '180px' }}>
                    <div style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '16px', fontWeight: 700, color: '#21201E' }}>
                      {item.timing || item.time}
                    </div>
                    <div style={{ fontSize: '13px', color: '#7A756F', fontWeight: 500 }}>
                      {item.room || 'Main Sanctuary'}
                    </div>
                  </div>

                  <div style={{ flexGrow: 1, minWidth: '220px' }}>
                    <h4 style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '18px', fontWeight: 700, color: '#21201E', margin: '0 0 4px 0' }}>
                      {item.title || item.className}
                    </h4>
                    <div style={{ fontSize: '13.5px', color: '#6B655F' }}>
                      Guided by {item.instructor}
                    </div>
                  </div>

                  <div>
                    <span
                      style={{
                        backgroundColor: '#F5EFE5',
                        color: '#944426',
                        padding: '6px 16px',
                        borderRadius: '999px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        letterSpacing: '0.02em'
                      }}
                    >
                      {item.levels || item.duration || 'All Levels'}
                    </span>
                  </div>

                  <button
                    style={{
                      border: 'none',
                      backgroundColor: '#21201E',
                      color: '#FFFFFF',
                      borderRadius: '999px',
                      padding: '10px 24px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>BOOK SESSION</span>
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .schedule-row-grid:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
        }

        /* Mobile View Rules - Removed Filter & Simplified Today View */
        @media (max-width: 768px) {
          #schedule {
            padding: 40px 0 52px 0 !important;
          }
          .schedule-card-container {
            padding: 32px 18px !important;
            border-radius: 24px !important;
          }
          .schedule-today-btn, .schedule-filter-wrapper {
            display: none !important;
          }
          .schedule-nav-bar {
            margin-bottom: 24px !important;
          }
          .schedule-date-pill {
            width: 100% !important;
            max-width: 340px !important;
            justify-content: space-between !important;
            padding: 10px 14px !important;
            margin: 0 auto !important;
            white-space: nowrap !important;
          }
          .date-pill-text-wrapper {
            font-size: 13.5px !important;
            gap: 6px !important;
            white-space: nowrap !important;
          }
          .schedule-row-grid {
            padding: 20px !important;
            border-radius: 20px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 14px !important;
          }
          .schedule-row-grid > div {
            min-width: 100% !important;
            width: 100% !important;
          }
          .schedule-row-grid button {
            width: 100% !important;
            justify-content: center !important;
            margin-top: 4px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default InteractiveSchedule;
