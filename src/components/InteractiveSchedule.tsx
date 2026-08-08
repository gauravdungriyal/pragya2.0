import React, { useEffect, useState, useRef } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, RefreshCw, Calendar, SlidersHorizontal, Check } from 'lucide-react';
import { getScheduleByDate } from '../services/api';
import { ClassScheduleItem } from '../types';
import { useAuth } from '../context/AuthContext';

interface InteractiveScheduleProps {
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
}

export const InteractiveSchedule: React.FC<InteractiveScheduleProps> = ({ onOpenBooking }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [scheduleItems, setScheduleItems] = useState<ClassScheduleItem[]>([]);
  // Bug 13 fix: ref for click-outside detection
  const filterWrapperRef = useRef<HTMLDivElement>(null);

  const levelOptions = ['ALL', 'Beginner', 'Intermediate', 'Advanced', 'Restorative'];

  const fallbackClasses = [
    {
      id: '01',
      schedule_id: '25493',
      title: 'Gentle Yoga',
      levels: 'Beginner',
      level: 'Beginner',
      duration: '60 mins',
      timing: '07:00 AM - 08:00 AM',
      instructor: 'Master Aarya',
      room: 'Woo House',
      description: 'Awaken the bodily energy through rhythmic breathwork, classical sun salutations, and grounding posture holds.'
    },
    {
      id: '02',
      schedule_id: '25494',
      title: 'Vinyasa Flow',
      levels: 'Intermediate',
      level: 'Intermediate',
      duration: '75 mins',
      timing: '09:00 AM - 10:15 AM',
      instructor: 'Angela Lee',
      room: 'Woo House',
      description: 'Fluid movement synchronized with dynamic breath to build stamina, balance, and centered presence.'
    },
    {
      id: '03',
      schedule_id: '25495',
      title: 'Hatha Yoga',
      levels: 'All Levels',
      level: 'All Levels',
      duration: '60 mins',
      timing: '11:00 AM - 12:00 PM',
      instructor: 'Charlotte Chiu',
      room: 'Woo House',
      description: 'A meditative style with longer holds that release deep tension and cultivate inner stillness and balance.'
    },
    {
      id: '04',
      schedule_id: '25496',
      title: 'Yin Yoga',
      levels: 'All Levels',
      level: 'All Levels',
      duration: '60 mins',
      timing: '02:00 PM - 03:00 PM',
      instructor: 'Angela Lee',
      room: 'Woo House',
      description: 'Precision-controlled movement using traditional postures to lengthen, align, and strengthen deep stabilizing muscles.'
    },
    {
      id: '05',
      schedule_id: '25497',
      title: 'Power Yoga',
      levels: 'Advanced',
      level: 'Advanced',
      duration: '75 mins',
      timing: '05:30 PM - 06:45 PM',
      instructor: 'Charlotte Chiu',
      room: 'Woo House',
      description: 'High energy dynamic movement sequence designed to build core vitality, stamina, and cardiovascular health.'
    },
    {
      id: '06',
      schedule_id: '25498',
      title: 'Restorative Yoga',
      levels: 'Restorative',
      level: 'Restorative',
      duration: '60 mins',
      timing: '07:15 PM - 08:15 PM',
      instructor: 'Master Aarya',
      room: 'Woo House',
      description: 'Sacred breath sequences and prop-supported floor postures designed to clear stress and rejuvenate vital energy.'
    }
  ];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    // Bug 3 fix: use local date parts to avoid UTC timezone shift (e.g. UTC+5:30 shifting date back by 1)
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    // Use JWT endpoint when user is logged in for richer data (spots remaining, user booking status)
    const fetchFn = user
      ? getScheduleByDate(dateStr, undefined, user.access_token)
      : getScheduleByDate(dateStr);

    fetchFn.then((data) => {
      if (!isMounted) return;
      const formattedDate = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      if (data && Array.isArray(data.schedules) && data.schedules.length > 0) {
        setScheduleItems(data.schedules.map((s: any) => ({
          ...s,
          date: s.date && s.date !== 'Today' ? s.date : formattedDate
        })));
      } else {
        setScheduleItems([]);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, user]); // Bug 2 fix: user added so re-fetch happens after login

  // Bug 13 fix: close filter dropdown on outside click
  useEffect(() => {
    if (!showFilterModal) return;
    const handleOutside = (e: MouseEvent) => {
      if (filterWrapperRef.current && !filterWrapperRef.current.contains(e.target as Node)) {
        setShowFilterModal(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showFilterModal]);

  const displayItems = scheduleItems.length > 0 ? scheduleItems : (fallbackClasses as any[]);

  const filteredItems = levelFilter === 'ALL'
    ? displayItems
    : displayItems.filter((item) => (item.levels || '').toLowerCase().includes(levelFilter.toLowerCase()));

  return (
    <section
      id="schedule"
      style={{
        backgroundColor: '#FFFFFF',
        padding: '24px 0 20px 0',
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
          className="schedule-card-container reveal-on-scroll"
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
                fontFamily: "var(--font-serif)",
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
                  value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}`}
                  onChange={(e) => {
                    if (e.target.value) {
                      // Bug 3 fix: parse date as local midnight (avoid UTC→local timezone shift)
                      const [y, m, d] = e.target.value.split('-').map(Number);
                      setSelectedDate(new Date(y, m - 1, d));
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
              onClick={() => setSelectedDate(new Date())}
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
            <div className="schedule-filter-wrapper" style={{ position: 'relative' }} ref={filterWrapperRef}>
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
            <div className="schedule-list-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  {/* Time & Room (Stacked Start & End Time) */}
                  <div className="sch-row-time" style={{ minWidth: '100px', flexShrink: 0 }}>
                    {(() => {
                      const rawTiming = item.timing || item.time || '';
                      const parts = rawTiming.split(/\s*-\s*|\s*to\s*/i);
                      const startTime = parts[0]?.trim() || rawTiming;
                      const endTime = parts[1]?.trim() || '';
                      return (
                        <>
                          <div style={{ fontFamily: "var(--font-sans)", fontSize: '15px', fontWeight: 700, color: '#944426', lineHeight: 1.2 }}>
                            {startTime}
                          </div>
                          {endTime && (
                            <div style={{ fontFamily: "var(--font-sans)", fontSize: '13px', fontWeight: 600, color: '#6B655F', lineHeight: 1.2 }}>
                              {endTime}
                            </div>
                          )}
                          <div style={{ fontSize: '11.5px', color: '#8A8580', fontWeight: 500, marginTop: '2px' }}>
                            {item.room || 'Woo House'}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="sch-row-main" style={{ flexGrow: 1, minWidth: '140px' }}>
                    <h4 style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '18px', fontWeight: 700, color: '#21201E', margin: '0 0 4px 0' }}>
                      {item.title || item.className}
                    </h4>
                    <div style={{ fontSize: '13.5px', color: '#6B655F' }}>
                      Guided by {item.instructor}
                    </div>
                  </div>

                  <div className="sch-row-badge">
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
                    className="sch-row-btn"
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
                    <span>Book</span>
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

        /* Mobile View Rules - Ultra Compact Daily Schedule View */
        @media (max-width: 768px) {
          #schedule {
            padding: 32px 0 40px 0 !important;
          }
          .schedule-card-container {
            padding: 20px 12px !important;
            border-radius: 20px !important;
          }
          /* Bug 28 fix: Today and Filter buttons now visible on mobile */
          .schedule-today-btn, .schedule-filter-wrapper {
            display: flex !important;
          }
          .schedule-nav-bar {
            margin-bottom: 16px !important;
          }
          .schedule-date-pill {
            width: 100% !important;
            max-width: 100% !important;
            justify-content: space-between !important;
            padding: 8px 12px !important;
            margin: 0 !important;
            white-space: nowrap !important;
          }
          .date-pill-text-wrapper {
            font-size: 13px !important;
            gap: 6px !important;
            white-space: nowrap !important;
          }
          .schedule-list-wrapper {
            gap: 8px !important;
          }
          .schedule-row-grid {
            padding: 12px 14px !important;
            border-radius: 14px !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 10px !important;
            flex-wrap: nowrap !important;
          }
          .sch-row-time {
            min-width: unset !important;
            width: auto !important;
            flex-shrink: 0 !important;
          }
          .sch-row-time > div:first-child {
            font-size: 12px !important;
            font-weight: 800 !important;
            color: #944426 !important;
            line-height: 1.2 !important;
          }
          .sch-row-time > div:last-child {
            font-size: 10.5px !important;
            color: #8A8580 !important;
            line-height: 1.2 !important;
          }
          .sch-row-main {
            min-width: unset !important;
            flex-grow: 1 !important;
            overflow: hidden !important;
          }
          .sch-row-main h4 {
            font-size: 13.5px !important;
            font-weight: 700 !important;
            margin: 0 0 2px 0 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            line-height: 1.2 !important;
          }
          .sch-row-main > div {
            font-size: 11px !important;
            color: #6B655F !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          .sch-row-badge {
            display: none !important;
          }
          .sch-row-btn {
            width: auto !important;
            flex-shrink: 0 !important;
            padding: 6px 12px !important;
            font-size: 11px !important;
            font-weight: 800 !important;
            border-radius: 999px !important;
            margin-top: 0 !important;
          }
          .sch-row-btn span {
            display: none !important;
          }
          .sch-row-btn::after {
            content: "BOOK";
            font-size: 11px;
            font-weight: 800;
          }
        }
      `}</style>
    </section>
  );
};

export default InteractiveSchedule;
