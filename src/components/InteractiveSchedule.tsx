import React, { useEffect, useState, useRef } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, RefreshCw, Calendar, SlidersHorizontal, Check, X } from 'lucide-react';
import { getScheduleByDate, getFilters } from '../services/api';
import { ClassScheduleItem, FilterOptions } from '../types';
import { useAuth } from '../context/AuthContext';

interface InteractiveScheduleProps {
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
}

export const InteractiveSchedule: React.FC<InteractiveScheduleProps> = ({ onOpenBooking }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // API Filter options
  const [filterData, setFilterData] = useState<FilterOptions>({
    instructors: [{ id: '', name: 'All Instructors' }],
    pillars: [{ id: '', name: 'All Pillars' }],
    levels: [
      { id: '', name: 'All Levels' },
      { id: 'Beginner', name: 'Beginner' },
      { id: 'Intermediate', name: 'Intermediate' },
      { id: 'Advanced', name: 'Advanced' },
      { id: 'Restorative', name: 'Restorative' }
    ],
    locations: [{ id: '', name: 'All Locations' }]
  });

  // Selected filters
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [instructorFilter, setInstructorFilter] = useState<string>('');
  const [pillarFilter, setPillarFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');

  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [scheduleItems, setScheduleItems] = useState<ClassScheduleItem[]>([]);
  const filterWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getFilters().then((data) => {
      if (data) {
        setFilterData({
          instructors: data.instructors && data.instructors.length > 0 ? data.instructors : [{ id: '', name: 'All Instructors' }],
          pillars: data.pillars && data.pillars.length > 0 ? data.pillars : [{ id: '', name: 'All Pillars' }],
          levels: data.levels && data.levels.length > 0 ? data.levels : [{ id: '', name: 'All Levels' }],
          locations: data.locations && data.locations.length > 0 ? data.locations : [{ id: '', name: 'All Locations' }]
        });
      }
    });
  }, []);

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

  // View Mode: 'day' or 'week'
  const [scheduleViewMode, setScheduleViewMode] = useState<'day' | 'week'>('day');
  const [weeklySchedules, setWeeklySchedules] = useState<Record<string, ClassScheduleItem[]>>({});
  const [weeklyLoading, setWeeklyLoading] = useState<boolean>(false);

  const getWeekDays = (baseDate: Date) => {
    const day = baseDate.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + diffToMon);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays(selectedDate);

  // Fetch 7-day weekly schedule when viewMode is 'week'
  useEffect(() => {
    if (scheduleViewMode !== 'week') return;
    let isMounted = true;
    setWeeklyLoading(true);

    const promises = weekDays.map((d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dayStr}`;

      const fetchFn = user
        ? getScheduleByDate(dateStr, undefined, user.access_token)
        : getScheduleByDate(dateStr);

      return fetchFn.then((res) => ({
        dateStr,
        schedules: res && Array.isArray(res.schedules) ? res.schedules : []
      }));
    });

    Promise.all(promises).then((results) => {
      if (!isMounted) return;
      const map: Record<string, ClassScheduleItem[]> = {};
      results.forEach((r) => {
        map[r.dateStr] = r.schedules;
      });
      setWeeklySchedules(map);
      setWeeklyLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, scheduleViewMode, user]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    // Bug 3 fix: use local date parts to avoid UTC timezone shift
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

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

  const availableInstructors = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    map.set('all instructors', { id: '', name: 'All Instructors' });

    (filterData.instructors || []).forEach((inst) => {
      if (inst && inst.name && inst.name.toLowerCase() !== 'all instructors') {
        map.set(inst.name.toLowerCase(), { id: inst.id || inst.name, name: inst.name });
      }
    });

    (displayItems || []).forEach((item) => {
      const instName = item.instructor || (item as any).instructor_name;
      if (instName && typeof instName === 'string' && instName.trim() !== '' && instName.toLowerCase() !== 'all instructors') {
        if (!map.has(instName.toLowerCase())) {
          map.set(instName.toLowerCase(), { id: instName, name: instName.trim() });
        }
      }
    });

    return Array.from(map.values());
  }, [filterData.instructors, displayItems]);

  const hasActiveFilter = Boolean(
    (levelFilter && levelFilter !== '' && levelFilter !== 'ALL' && levelFilter.toLowerCase() !== 'all levels') ||
    (instructorFilter && instructorFilter !== '' && instructorFilter.toLowerCase() !== 'all instructors') ||
    (pillarFilter && pillarFilter !== '' && pillarFilter.toLowerCase() !== 'all pillars') ||
    (locationFilter && locationFilter !== '' && locationFilter.toLowerCase() !== 'all locations')
  );

  const resetAllFilters = () => {
    setLevelFilter('ALL');
    setInstructorFilter('');
    setPillarFilter('');
    setLocationFilter('');
  };

  const filteredItems = displayItems.filter((item) => {
    if (levelFilter && levelFilter !== '' && levelFilter !== 'ALL' && levelFilter.toLowerCase() !== 'all levels') {
      const itemLvl = (item.levels || item.level || '').toLowerCase();
      const targetLvl = levelFilter.toLowerCase();
      if (!itemLvl.includes(targetLvl) && !targetLvl.includes(itemLvl)) return false;
    }
    if (instructorFilter && instructorFilter !== '' && instructorFilter.toLowerCase() !== 'all instructors') {
      const itemInst = (item.instructor || (item as any).instructor_name || '').toLowerCase();
      const targetInst = instructorFilter.toLowerCase();
      if (!itemInst.includes(targetInst) && !targetInst.includes(itemInst)) return false;
    }
    if (pillarFilter && pillarFilter !== '' && pillarFilter.toLowerCase() !== 'all pillars') {
      const itemPillar = (item.pillar || (item as any).category || (item as any).pillar_name || '').toLowerCase();
      const targetPillar = pillarFilter.toLowerCase();
      if (!itemPillar.includes(targetPillar) && !targetPillar.includes(itemPillar)) return false;
    }
    if (locationFilter && locationFilter !== '' && locationFilter.toLowerCase() !== 'all locations') {
      const itemLoc = (item.room || (item as any).location || (item as any).studio || '').toLowerCase();
      const targetLoc = locationFilter.toLowerCase();
      if (!itemLoc.includes(targetLoc) && !targetLoc.includes(itemLoc)) return false;
    }
    return true;
  });

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
                  backgroundColor: showFilterModal || hasActiveFilter ? '#354336' : 'transparent',
                  color: showFilterModal || hasActiveFilter ? '#FFFFFF' : '#4A4540',
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
                {hasActiveFilter && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#D9A726'
                    }}
                  />
                )}
              </button>

              {/* Multi-Category Filter Dropdown Popup */}
              {showFilterModal && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    backgroundColor: '#FFFFFF',
                    borderRadius: '18px',
                    padding: '18px',
                    width: '280px',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
                    zIndex: 100,
                    border: '1px solid rgba(0,0,0,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    maxHeight: '440px',
                    overflowY: 'auto'
                  }}
                >
                  {/* Header & Reset */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F0EAE1', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#944426', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Filter Schedule
                    </span>
                    {hasActiveFilter && (
                      <button
                        onClick={resetAllFilters}
                        style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Reset All
                      </button>
                    )}
                  </div>

                  {/* 1. LEVEL */}
                  {filterData.levels && filterData.levels.length > 0 && (
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7A756F', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
                        Level
                      </label>
                      <select
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '10px',
                          border: '1px solid rgba(39,39,39,0.15)',
                          fontSize: '13px',
                          backgroundColor: '#FDFAF6',
                          color: '#272727',
                          fontWeight: 600,
                          outline: 'none'
                        }}
                      >
                        {filterData.levels.map((lvl) => (
                          <option key={lvl.id || lvl.name} value={lvl.name || lvl.id}>
                            {lvl.name || 'All Levels'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* 2. INSTRUCTOR */}
                  {availableInstructors && availableInstructors.length > 0 && (
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7A756F', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
                        Instructor
                      </label>
                      <select
                        value={instructorFilter}
                        onChange={(e) => setInstructorFilter(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '10px',
                          border: '1px solid rgba(39,39,39,0.15)',
                          fontSize: '13px',
                          backgroundColor: '#FDFAF6',
                          color: '#272727',
                          fontWeight: 600,
                          outline: 'none'
                        }}
                      >
                        {availableInstructors.map((inst) => (
                          <option key={inst.id || inst.name} value={inst.name || inst.id}>
                            {inst.name || 'All Instructors'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* 3. PILLAR */}
                  {filterData.pillars && filterData.pillars.length > 0 && (
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7A756F', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
                        Pillar / Focus
                      </label>
                      <select
                        value={pillarFilter}
                        onChange={(e) => setPillarFilter(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '10px',
                          border: '1px solid rgba(39,39,39,0.15)',
                          fontSize: '13px',
                          backgroundColor: '#FDFAF6',
                          color: '#272727',
                          fontWeight: 600,
                          outline: 'none'
                        }}
                      >
                        {filterData.pillars.map((p) => (
                          <option key={p.id || p.name} value={p.name || p.id}>
                            {p.name || 'All Pillars'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* 4. LOCATION */}
                  {filterData.locations && filterData.locations.length > 0 && (
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7A756F', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
                        Location / Studio
                      </label>
                      <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '10px',
                          border: '1px solid rgba(39,39,39,0.15)',
                          fontSize: '13px',
                          backgroundColor: '#FDFAF6',
                          color: '#272727',
                          fontWeight: 600,
                          outline: 'none'
                        }}
                      >
                        {filterData.locations.map((loc) => (
                          <option key={loc.id || loc.name} value={loc.name || loc.id}>
                            {loc.name || 'All Locations'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* VIEW SWITCHER PILL (Daily vs Weekly) */}
            <div style={{ display: 'inline-flex', backgroundColor: '#EDE6DA', borderRadius: '999px', padding: '4px', gap: '4px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)' }}>
              <button
                type="button"
                onClick={() => setScheduleViewMode('day')}
                style={{
                  backgroundColor: scheduleViewMode === 'day' ? '#063928' : 'transparent',
                  color: scheduleViewMode === 'day' ? '#FFFFFF' : '#6B655F',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '8px 18px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.25s ease'
                }}
              >
                <Calendar size={14} />
                <span>Daily View</span>
              </button>
              <button
                type="button"
                onClick={() => setScheduleViewMode('week')}
                style={{
                  backgroundColor: scheduleViewMode === 'week' ? '#063928' : 'transparent',
                  color: scheduleViewMode === 'week' ? '#FFFFFF' : '#6B655F',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '8px 18px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.25s ease'
                }}
              >
                <Calendar size={14} />
                <span>Weekly View</span>
              </button>
            </div>
          </div>

          {/* WEEKLY VIEW or DAILY VIEW BRANCH */}
          {scheduleViewMode === 'week' ? (
            <div className="weekly-schedule-container-desktop" style={{ width: '100%' }}>
              {weeklyLoading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#944426' }}>
                  <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', display: 'block' }} />
                  <p style={{ fontFamily: "var(--font-sans)", color: '#8A8580', fontSize: '14.5px' }}>
                    Loading 7-Day Weekly Timetable...
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', paddingBottom: '12px' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, minmax(180px, 1fr))',
                      gap: '12px',
                      minWidth: '1050px',
                      alignItems: 'stretch'
                    }}
                  >
                    {weekDays.map((dateObj, dIdx) => {
                      const y = dateObj.getFullYear();
                      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                      const dayStr = String(dateObj.getDate()).padStart(2, '0');
                      const keyStr = `${y}-${m}-${dayStr}`;

                      const rawDayItems = weeklySchedules[keyStr] || [];
                      const displayDayItems = rawDayItems;

                      // Filter items according to active filters
                      const filteredDayItems = displayDayItems.filter((item) => {
                        const itemLevel = ((item as any).levels || (item as any).level || '').toLowerCase();
                        const itemInstructor = ((item as any).instructor || '').toLowerCase();
                        const itemRoom = ((item as any).room || '').toLowerCase();

                        if (levelFilter !== 'ALL' && levelFilter !== '' && !itemLevel.includes(levelFilter.toLowerCase())) return false;
                        if (instructorFilter !== '' && !itemInstructor.includes(instructorFilter.toLowerCase())) return false;
                        if (locationFilter !== '' && !itemRoom.includes(locationFilter.toLowerCase())) return false;
                        return true;
                      });

                      const isToday = dateObj.toDateString() === new Date().toDateString();
                      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                      const dateNum = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                      return (
                        <div
                          key={keyStr}
                          style={{
                            backgroundColor: isToday ? '#FFFFFF' : '#FAF6F0',
                            borderRadius: '20px',
                            border: isToday ? '2px solid #944426' : '1px solid #EBE4D8',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: isToday ? '0 10px 28px rgba(148, 68, 38, 0.14)' : 'none',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {/* Column Day Header */}
                          <div
                            style={{
                              backgroundColor: isToday ? '#063928' : '#F5EFE5',
                              color: isToday ? '#FFFFFF' : '#21201E',
                              padding: '14px 10px',
                              textAlign: 'center',
                              borderBottom: '1px solid #EBE4D8'
                            }}
                          >
                            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em', opacity: 0.85 }}>
                              {dayName}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>
                              {dateNum}
                            </div>
                            {isToday && (
                              <span style={{ display: 'inline-block', fontSize: '9px', fontWeight: 900, backgroundColor: '#D97706', color: '#FFFFFF', padding: '2px 8px', borderRadius: '999px', marginTop: '4px', textTransform: 'uppercase' }}>
                                TODAY
                              </span>
                            )}
                          </div>

                          {/* Class Slot Cards Column */}
                          <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1 }}>
                            {filteredDayItems.length === 0 ? (
                              <div style={{ textAlign: 'center', padding: '32px 6px', fontSize: '12px', color: '#8A8580', fontStyle: 'italic' }}>
                                No sessions
                              </div>
                            ) : (
                              filteredDayItems.map((clsItem, cIdx) => {
                                const title = clsItem.title || 'Yoga Class';
                                const timing = (clsItem as any).timing || '09:00 AM';
                                const instructor = clsItem.instructor || 'Teacher';
                                const room = (clsItem as any).room || 'Woo House';
                                const classColor = (clsItem.color && clsItem.color.trim() !== '') 
                                  ? clsItem.color 
                                  : title.toLowerCase().includes('back') ? '#D97706'
                                  : title.toLowerCase().includes('yin') || title.toLowerCase().includes('sound') ? '#7C3AED'
                                  : title.toLowerCase().includes('gentle') || title.toLowerCase().includes('hatha') ? '#059669'
                                  : title.toLowerCase().includes('vinyasa') || title.toLowerCase().includes('power') ? '#944426'
                                  : title.toLowerCase().includes('restorative') ? '#0284C7'
                                  : '#D97706';

                                const parts = (timing || '').split(/\s*-\s*|\s*to\s*/i);
                                const startTime = parts[0]?.trim() || timing;
                                const endTime = parts[1]?.trim() || '';

                                return (
                                  <div
                                    key={cIdx}
                                    onClick={() => onOpenBooking('class', title, clsItem)}
                                    style={{
                                      backgroundColor: '#FAF7F2',
                                      borderRadius: '16px',
                                      padding: '12px 10px 12px 14px',
                                      border: '1px solid #EBE4D8',
                                      borderLeft: `4px solid ${classColor}`,
                                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'flex-start',
                                      textAlign: 'left',
                                      gap: '6px',
                                      position: 'relative',
                                      cursor: 'pointer',
                                      transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                                    }}
                                    className="weekly-slot-card"
                                  >
                                    {/* Top Row: Time & Top-Right Floating BOOK Button */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '4px' }}>
                                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', letterSpacing: '-0.01em' }}>
                                        {endTime ? `${startTime} - ${endTime}` : startTime}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onOpenBooking('class', title, clsItem);
                                        }}
                                        style={{
                                          backgroundColor: '#1E293B',
                                          color: '#FFFFFF',
                                          border: 'none',
                                          borderRadius: '999px',
                                          padding: '3px 9px',
                                          fontSize: '10px',
                                          fontWeight: 800,
                                          cursor: 'pointer',
                                          letterSpacing: '0.06em',
                                          boxShadow: '0 2px 6px rgba(30, 41, 59, 0.25)',
                                          flexShrink: 0
                                        }}
                                      >
                                        BOOK
                                      </button>
                                    </div>

                                    {/* Title Row with Bullet Dot */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', width: '100%', margin: '2px 0' }}>
                                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: classColor, marginTop: '5px', flexShrink: 0 }} />
                                      <div style={{ fontFamily: "var(--font-sans)", fontSize: '13px', fontWeight: 700, color: classColor, lineHeight: 1.25 }}>
                                        {title}
                                      </div>
                                    </div>

                                    {/* Instructor & Room Info */}
                                    <div style={{ fontSize: '11px', color: '#334155', fontWeight: 600, lineHeight: 1.3 }}>
                                      By {instructor} {room ? `📍 ${room}` : ''}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* DAILY VIEW */
            loading ? (
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
              {filteredItems.map((item, idx) => {
                const classColor = (item.color && item.color.trim() !== '') 
                  ? item.color 
                  : (item.title || '').toLowerCase().includes('yin') || (item.title || '').toLowerCase().includes('sound') ? '#7C3AED'
                  : (item.title || '').toLowerCase().includes('gentle') || (item.title || '').toLowerCase().includes('hatha') ? '#059669'
                  : (item.title || '').toLowerCase().includes('vinyasa') || (item.title || '').toLowerCase().includes('power') ? '#944426'
                  : (item.title || '').toLowerCase().includes('restorative') ? '#0284C7'
                  : '#944426';

                return (
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
                      borderLeft: `5px solid ${classColor}`,
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
                            <div style={{ fontFamily: "var(--font-sans)", fontSize: '15px', fontWeight: 700, color: classColor, lineHeight: 1.2 }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: classColor, display: 'inline-block', flexShrink: 0 }} />
                        <h4 style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '18px', fontWeight: 700, color: '#21201E', margin: 0 }}>
                          {item.title || item.className}
                        </h4>
                      </div>
                      <div style={{ fontSize: '13.5px', color: '#6B655F' }}>
                        Guided by {item.instructor}
                      </div>
                    </div>

                    <div className="sch-row-badge">
                      <span
                        style={{
                          backgroundColor: `${classColor}15`,
                          color: classColor,
                          border: `1px solid ${classColor}30`,
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
                );
              })}
            </div>
          )
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
            width: 38px !important;
            height: 38px !important;
            padding: 0 !important;
            flex-shrink: 0 !important;
            border-radius: 999px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin-top: 0 !important;
          }
          .sch-row-btn span {
            display: none !important;
          }
          .sch-row-btn svg {
            display: block !important;
            width: 16px !important;
            height: 16px !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </section>
  );
};

export default InteractiveSchedule;
