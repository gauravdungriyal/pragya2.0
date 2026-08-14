import React, { useEffect, useState, useRef } from 'react';
import { Signal, Clock, Calendar, Zap, Sparkles, Heart, Users, MapPin, User, ChevronRight, ChevronLeft, RefreshCw, SlidersHorizontal, Check, ArrowUpRight, X } from 'lucide-react';
import { getScheduleByDate, getFilters, getDailyQuote } from '../services/api';
import { ClassScheduleItem, FilterOptions, DailyQuote } from '../types';
import { useAuth } from '../context/AuthContext';

interface InteractiveScheduleProps {
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  onNavigateSection?: (sectionId: string) => void;
  onOpenChat?: () => void;
  showHeading?: boolean;
}

const checkIsCompleted = (item: any, dateObj?: Date): boolean => {
  if (String(item?.completed) === '1' || item?.completed === 1 || item?.completed === true) {
    return true;
  }
  if (dateObj) {
    const now = new Date();
    const classDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (classDay < todayDay) {
      return true;
    }
  }
  return false;
};

export const InteractiveSchedule: React.FC<InteractiveScheduleProps> = ({
  onOpenBooking,
  showHeading = true
}) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<ClassScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dailyQuote, setDailyQuote] = useState<DailyQuote | null>(null);

  useEffect(() => {
    getDailyQuote().then((q) => {
      if (q) setDailyQuote(q);
    });
  }, []);

  const [scheduleViewMode, setScheduleViewMode] = useState<'day' | 'week'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'day';
    }
    return 'week';
  });

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setScheduleViewMode('day');
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [weeklySchedules, setWeeklySchedules] = useState<Record<string, ClassScheduleItem[]>>({});
  const [weeklyLoading, setWeeklyLoading] = useState<boolean>(false);

  // Selected API filters
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [instructorFilter, setInstructorFilter] = useState<string>('');
  const [pillarFilter, setPillarFilter] = useState<string>('');
  const filterWrapperRef = useRef<HTMLDivElement>(null);

  // API Filter options
  const [filterData, setFilterData] = useState<FilterOptions>({
    instructors: [{ id: '', name: 'All Instructors' }],
    pillars: [{ id: '', name: 'All Pillars' }],
    levels: [{ id: '', name: 'All Levels' }],
    locations: [{ id: '', name: 'All Locations' }]
  });

  useEffect(() => {
    getFilters().then((data) => {
      if (data) {
        setFilterData({
          instructors: data.instructors || [{ id: '', name: 'All Instructors' }],
          pillars: data.pillars || [{ id: '', name: 'All Pillars' }],
          levels: data.levels || [{ id: '', name: 'All Levels' }],
          locations: data.locations || [{ id: '', name: 'All Locations' }]
        });
      }
    });
  }, []);

  const getWeekDays = (baseDate: Date) => {
    const curr = new Date(baseDate);
    const day = curr.getDay();
    const diffToMon = curr.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(curr.setDate(diffToMon));

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays(selectedDate);

  // Pure API-Driven 7-day weekly schedule fetching
  useEffect(() => {
    if (scheduleViewMode !== 'week') return;
    let isMounted = true;
    setWeeklyLoading(true);

    const promises = weekDays.map((d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dayStr}`;

      return getScheduleByDate(
        dateStr,
        instructorFilter,
        levelFilter,
        pillarFilter,
        locationFilter,
        user?.access_token
      ).then((res) => ({
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
  }, [selectedDate, scheduleViewMode, levelFilter, instructorFilter, pillarFilter, locationFilter, user]);

  // Pure API-Driven daily schedule fetching
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    getScheduleByDate(
      dateStr,
      instructorFilter,
      levelFilter,
      pillarFilter,
      locationFilter,
      user?.access_token
    ).then((data) => {
      if (!isMounted) return;
      if (data && Array.isArray(data.schedules)) {
        setSchedules(data.schedules);
      } else {
        setSchedules([]);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, levelFilter, instructorFilter, pillarFilter, locationFilter, user]);

  const displayClasses = schedules.map((item) => {
    const rawDesc = (item as any).description || '';
    const cleanDesc = rawDesc.replace(/<[^>]*>?/gm, '').trim();
    const formattedDate = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    return {
      id: String(item.id || item.schedule_id || ''),
      schedule_id: String(item.schedule_id || item.id || ''),
      title: item.title || '',
      level: (item as any).levels || (item as any).level || '',
      color: item.color || '#944426',
      duration: item.duration ? (String(item.duration).includes('min') ? String(item.duration) : `${item.duration} mins`) : '',
      timing: (item as any).timing || '',
      instructor: item.instructor || '',
      room: (item as any).room || (item as any).location || (item as any).studio || (item as any).venue || '',
      schedule: (item as any).date || '',
      date: (item as any).date && (item as any).date !== 'Today' ? (item as any).date : formattedDate,
      price: (item as any).book_cost || (item as any).price || (item as any).amount || '',
      description: cleanDesc,
      image: (item as any).image || (item as any).coverImage || (item as any).photo || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
      is_booked: Boolean(item.is_booked),
      booking_id: item.booking_id || '',
      buttonType: item.buttonType || 'book'
    };
  });

  const isLocationActive = Boolean(locationFilter && locationFilter !== '' && locationFilter.toLowerCase() !== 'all locations');
  const isLevelActive = Boolean(levelFilter && levelFilter !== '' && levelFilter !== 'ALL' && levelFilter.toLowerCase() !== 'all levels');
  const isInstructorActive = Boolean(instructorFilter && instructorFilter !== '' && instructorFilter.toLowerCase() !== 'all instructors');
  const isPillarActive = Boolean(pillarFilter && pillarFilter !== '' && pillarFilter.toLowerCase() !== 'all pillars');

  const hasActiveFilter = Boolean(isLocationActive || isLevelActive || isInstructorActive || isPillarActive);

  const resetAllFilters = () => {
    setLocationFilter('');
    setLevelFilter('');
    setInstructorFilter('');
    setPillarFilter('');
  };

  const dateLabel = React.useMemo(() => {
    if (scheduleViewMode === 'week' && weekDays.length === 7) {
      const start = weekDays[0];
      const end = weekDays[6];
      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${startStr} - ${endStr}`;
    }
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [selectedDate, scheduleViewMode, weekDays]);

  return (
    <section
      id="live-schedule"
      style={{
        width: '100%',
        backgroundColor: '#FAF6F0',
        padding: '60px 32px 96px 32px'
      }}
    >
      <div className="ultrawide-container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {showHeading && (
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.2em',
                color: '#944426',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '10px'
              }}
            >
              — LIVE TIMETABLE —
            </span>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 'clamp(32px, 4.5vw, 48px)',
                fontWeight: 400,
                color: '#21201E',
                margin: '0 0 12px 0',
                lineHeight: 1.15
              }}
            >
              Classes <span style={{ fontFamily: "var(--font-accent)", fontStyle: 'italic', fontWeight: 400 }}>& Schedule</span>
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: '15.5px',
                color: '#6B655F',
                maxWidth: '560px',
                margin: '0 auto',
                lineHeight: 1.6
              }}
            >
              Book your next session online or in-studio. Updated live daily.
            </p>
          </div>
        )}

        {/* VIEW MODE TOGGLE (Daily / Weekly - Hidden on Mobile) */}
        <div className="sch-view-toggle-pill" style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <div
            style={{
              backgroundColor: '#EAE1D3',
              borderRadius: '999px',
              padding: '4px',
              display: 'inline-flex',
              gap: '4px',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}
          >
            <button
              onClick={() => setScheduleViewMode('day')}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: '13px',
                fontWeight: 700,
                padding: '8px 20px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: scheduleViewMode === 'day' ? '#354336' : 'transparent',
                color: scheduleViewMode === 'day' ? '#FFFFFF' : '#6E6A63',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>📅 Daily View</span>
            </button>
            <button
              onClick={() => setScheduleViewMode('week')}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: '13px',
                fontWeight: 700,
                padding: '8px 20px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: scheduleViewMode === 'week' ? '#354336' : 'transparent',
                color: scheduleViewMode === 'week' ? '#FFFFFF' : '#6E6A63',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🗓️ Weekly View</span>
            </button>
          </div>
        </div>

        {/* CONTROLS BAR: 4 Pure API Dropdown Filters (Centered) | Date Selector (Centered) */}
        <div
          className="sch-control-bar schedule-controls-bar"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '18px',
            marginBottom: '36px',
            width: '100%'
          }}
        >
          {/* 📍 CENTERED 4 API Dropdown Filters (Location, Level, Instructor, Pillar) */}
          <div className="sch-filter-grid" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', width: '100%' }} ref={filterWrapperRef}>
            {hasActiveFilter && (
              <button
                onClick={resetAllFilters}
                style={{
                  fontFamily: "var(--font-sans)",
                  padding: '10px 14px',
                  borderRadius: '999px',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
                title="Clear all filters"
              >
                <X size={14} /> Clear
              </button>
            )}

            {/* Location API Filter Dropdown */}
            <select
              className="sch-filter-select"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              style={{
                fontFamily: "var(--font-sans)",
                padding: '10px 36px 10px 18px',
                borderRadius: '999px',
                border: isLocationActive ? '1.5px solid #354336' : '1px solid rgba(148, 68, 38, 0.2)',
                fontSize: '13px',
                fontWeight: 700,
                backgroundColor: isLocationActive ? '#354336' : '#FFFFFF',
                color: isLocationActive ? '#FFFFFF' : '#21201E',
                cursor: 'pointer',
                boxShadow: isLocationActive ? '0 4px 12px rgba(53, 67, 54, 0.25)' : '0 4px 16px rgba(0, 0, 0, 0.04)',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='${isLocationActive ? '%23FFFFFF' : '%23944426'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center'
              }}
            >
              <option value="" style={{ color: '#21201E', backgroundColor: '#FFFFFF' }}>All Locations</option>
              {filterData.locations.map((loc) => {
                const isAll = !loc.id || loc.id === '' || loc.name.toLowerCase() === 'all locations';
                if (isAll) return null;
                return (
                  <option key={loc.id || loc.name} value={loc.name || loc.id} style={{ color: '#21201E', backgroundColor: '#FFFFFF' }}>
                    {loc.name}
                  </option>
                );
              })}
            </select>

            {/* Level API Filter Dropdown */}
            <select
              className="sch-filter-select"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              style={{
                fontFamily: "var(--font-sans)",
                padding: '10px 36px 10px 18px',
                borderRadius: '999px',
                border: isLevelActive ? '1.5px solid #354336' : '1px solid rgba(148, 68, 38, 0.2)',
                fontSize: '13px',
                fontWeight: 700,
                backgroundColor: isLevelActive ? '#354336' : '#FFFFFF',
                color: isLevelActive ? '#FFFFFF' : '#21201E',
                cursor: 'pointer',
                boxShadow: isLevelActive ? '0 4px 12px rgba(53, 67, 54, 0.25)' : '0 4px 16px rgba(0, 0, 0, 0.04)',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='${isLevelActive ? '%23FFFFFF' : '%23944426'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center'
              }}
            >
              <option value="" style={{ color: '#21201E', backgroundColor: '#FFFFFF' }}>All Levels</option>
              {filterData.levels.map((lvl) => {
                const isAll = !lvl.id || lvl.id === '' || lvl.name.toLowerCase() === 'all levels';
                if (isAll) return null;
                return (
                  <option key={lvl.id || lvl.name} value={lvl.id || lvl.name} style={{ color: '#21201E', backgroundColor: '#FFFFFF' }}>
                    {lvl.name}
                  </option>
                );
              })}
            </select>

            {/* Instructor API Filter Dropdown */}
            <select
              className="sch-filter-select"
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
              style={{
                fontFamily: "var(--font-sans)",
                padding: '10px 36px 10px 18px',
                borderRadius: '999px',
                border: isInstructorActive ? '1.5px solid #354336' : '1px solid rgba(148, 68, 38, 0.2)',
                fontSize: '13px',
                fontWeight: 700,
                backgroundColor: isInstructorActive ? '#354336' : '#FFFFFF',
                color: isInstructorActive ? '#FFFFFF' : '#21201E',
                cursor: 'pointer',
                boxShadow: isInstructorActive ? '0 4px 12px rgba(53, 67, 54, 0.25)' : '0 4px 16px rgba(0, 0, 0, 0.04)',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='${isInstructorActive ? '%23FFFFFF' : '%23944426'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center'
              }}
            >
              <option value="" style={{ color: '#21201E', backgroundColor: '#FFFFFF' }}>All Instructors</option>
              {filterData.instructors.map((inst) => {
                const isAll = !inst.id || inst.id === '' || inst.name.toLowerCase() === 'all instructors';
                if (isAll) return null;
                return (
                  <option key={inst.id || inst.name} value={inst.id || inst.name} style={{ color: '#21201E', backgroundColor: '#FFFFFF' }}>
                    {inst.name}
                  </option>
                );
              })}
            </select>

            {/* Pillar API Filter Dropdown */}
            {filterData.pillars && filterData.pillars.length > 0 && (
              <select
                className="sch-filter-select"
                value={pillarFilter}
                onChange={(e) => setPillarFilter(e.target.value)}
                style={{
                  fontFamily: "var(--font-sans)",
                  padding: '10px 36px 10px 18px',
                  borderRadius: '999px',
                  border: isPillarActive ? '1.5px solid #354336' : '1px solid rgba(148, 68, 38, 0.2)',
                  fontSize: '13px',
                  fontWeight: 700,
                  backgroundColor: isPillarActive ? '#354336' : '#FFFFFF',
                  color: isPillarActive ? '#FFFFFF' : '#21201E',
                  cursor: 'pointer',
                  boxShadow: isPillarActive ? '0 4px 12px rgba(53, 67, 54, 0.25)' : '0 4px 16px rgba(0, 0, 0, 0.04)',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='${isPillarActive ? '%23FFFFFF' : '%23944426'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center'
                }}
              >
                <option value="" style={{ color: '#21201E', backgroundColor: '#FFFFFF' }}>All Pillars</option>
                {filterData.pillars.map((p) => {
                  const isAll = !p.id || p.id === '' || p.name.toLowerCase() === 'all pillars';
                  if (isAll) return null;
                  return (
                    <option key={p.id || p.name} value={p.id || p.name} style={{ color: '#21201E', backgroundColor: '#FFFFFF' }}>
                      {p.name}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* 🗓️ RIGHT SIDE: Date Selector Pill */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '100%' }}>
            <div
              className="sch-date-pill"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '999px',
                padding: '8px 18px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(148, 68, 38, 0.15)',
                position: 'relative',
                whiteSpace: 'nowrap'
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const prev = new Date(selectedDate);
                  const shiftDays = scheduleViewMode === 'week' ? 7 : 1;
                  prev.setDate(prev.getDate() - shiftDays);
                  setSelectedDate(prev);
                }}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#21201E',
                  position: 'relative',
                  zIndex: 10
                }}
                title={scheduleViewMode === 'week' ? "Previous Week" : "Previous Day"}
              >
                <ChevronLeft size={18} />
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: "var(--font-sans)",
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#21201E',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                <Calendar size={16} color="#944426" />
                <span>{dateLabel}</span>
                <input
                  type="date"
                  value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [y, m, d] = e.target.value.split('-').map(Number);
                      setSelectedDate(new Date(y, m - 1, d));
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                    zIndex: 5
                  }}
                />
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const next = new Date(selectedDate);
                  const shiftDays = scheduleViewMode === 'week' ? 7 : 1;
                  next.setDate(next.getDate() + shiftDays);
                  setSelectedDate(next);
                }}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#21201E',
                  position: 'relative',
                  zIndex: 10
                }}
                title={scheduleViewMode === 'week' ? "Next Week" : "Next Day"}
              >
                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDate(new Date());
                }}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#944426',
                  backgroundColor: 'rgba(148, 68, 38, 0.08)',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                  position: 'relative',
                  zIndex: 10
                }}
              >
                Today
              </button>
            </div>
          </div>
        </div>

        {/* WEEKLY 7-DAY GRID VIEW */}
        {scheduleViewMode === 'week' ? (
          <div className="weekly-schedule-container-desktop">
            {weeklyLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', maxWidth: '650px', margin: '0 auto' }}>
                <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 16px auto', display: 'block', color: '#944426' }} />
                {dailyQuote ? (
                  <blockquote style={{ margin: 0, fontFamily: 'var(--font-heading, Georgia, serif)', fontStyle: 'italic' }}>
                    <p style={{ fontSize: '16.5px', color: '#21201E', lineHeight: 1.5, marginBottom: '8px', fontWeight: 500 }}>
                      &ldquo;{dailyQuote.q}&rdquo;
                    </p>
                    <footer style={{ fontSize: '13px', color: '#944426', fontWeight: 700, fontStyle: 'normal' }}>
                      &mdash; {dailyQuote.a}
                    </footer>
                  </blockquote>
                ) : (
                  <p style={{ fontFamily: "var(--font-sans)", color: '#8A8580', fontSize: '14.5px' }}>
                    Loading 7-Day Weekly Timetable...
                  </p>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '16px',
                  backgroundColor: '#FAF6F0',
                  borderRadius: '24px',
                  padding: '24px',
                  border: '1px solid rgba(148, 68, 38, 0.12)',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.04)'
                }}
              >
                {weekDays.map((dateObj) => {
                  const y = dateObj.getFullYear();
                  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                  const dayStr = String(dateObj.getDate()).padStart(2, '0');
                  const keyStr = `${y}-${m}-${dayStr}`;

                  const dayItems = weeklySchedules[keyStr] || [];

                  const isToday = dateObj.toDateString() === new Date().toDateString();
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const dateNum = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                  return (
                    <div
                      key={keyStr}
                      style={{
                        backgroundColor: '#FAF6F0',
                        borderRadius: '20px',
                        border: '1px solid #EBE4D8',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: 'none',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {/* Day Header Bar */}
                      <div
                        style={{
                          backgroundColor: '#EAE1D3',
                          color: isToday ? '#944426' : '#21201E',
                          padding: '14px 10px',
                          textAlign: 'center',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
                        }}
                      >
                        <div style={{ fontFamily: "var(--font-sans)", fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {dayName}
                        </div>
                        <div style={{ fontFamily: "var(--font-sans)", fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>
                          {dateNum}
                        </div>
                      </div>

                      {/* Day Class Cards Column */}
                      <div style={{ padding: '12px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#FAF6F0' }}>
                        {dayItems.length === 0 ? (
                          <div style={{ fontFamily: "var(--font-sans)", fontSize: '12px', color: '#94A3B8', textAlign: 'center', padding: '24px 8px', fontStyle: 'italic' }}>
                            No sessions scheduled
                          </div>
                        ) : (
                          dayItems.map((item, idx) => {
                            const classColor = (item.color && item.color.trim() !== '') ? item.color : '#944426';
                            const instructor = item.instructor || 'Master Teacher';
                            const room = (item as any).room || (item as any).location || (item as any).studio || '';

                            const parts = (item.timing || '').split(/\s*-\s*|\s*to\s*/i);
                            const startTime = parts[0]?.trim() || item.timing;
                            const endTime = parts[1]?.trim() || '';

                            const isCompleted = checkIsCompleted(item, dateObj);

                            return (
                              <div
                                key={idx}
                                style={{
                                  backgroundColor: isCompleted ? '#F1F5F9' : '#FFFFFF',
                                  borderRadius: '12px',
                                  padding: '12px',
                                  borderLeft: `4px solid ${isCompleted ? '#CBD5E1' : classColor}`,
                                  boxShadow: isCompleted ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.03)',
                                  opacity: isCompleted ? 0.65 : 1,
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  minHeight: '110px'
                                }}
                              >
                                <div>
                                  <div
                                    style={{
                                      fontFamily: "var(--font-sans)",
                                      fontSize: '13px',
                                      fontWeight: 800,
                                      color: isCompleted ? '#64748B' : classColor,
                                      textDecoration: isCompleted ? 'line-through' : 'none',
                                      marginBottom: '4px',
                                      lineHeight: 1.2
                                    }}
                                  >
                                    {item.title}
                                  </div>

                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      fontFamily: "var(--font-sans)",
                                      fontSize: '11px',
                                      color: isCompleted ? '#94A3B8' : '#64748B',
                                      marginBottom: '6px'
                                    }}
                                  >
                                    <Clock size={11} color={isCompleted ? '#94A3B8' : classColor} />
                                    <span>
                                      {startTime}{endTime ? ` - ${endTime}` : ''}
                                    </span>
                                  </div>

                                  <div
                                    style={{
                                      fontFamily: "var(--font-sans)",
                                      fontSize: '11px',
                                      color: isCompleted ? '#94A3B8' : '#334155',
                                      textDecoration: isCompleted ? 'line-through' : 'none',
                                      fontWeight: 600,
                                      lineHeight: 1.3
                                    }}
                                  >
                                    By {instructor} {room ? `📍 ${room}` : ''}
                                  </div>
                                </div>

                                <div style={{ marginTop: '10px' }}>
                                  {isCompleted ? (
                                    <span
                                      style={{
                                        fontFamily: "var(--font-sans)",
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: '#64748B',
                                        display: 'inline-block',
                                        padding: '4px 0'
                                      }}
                                    >
                                      Completed
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => onOpenBooking(item.buttonType || 'book', item.title, item)}
                                      style={{
                                        fontFamily: "var(--font-sans)",
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        width: '100%',
                                        padding: '6px 10px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: '#21201E',
                                        color: '#FFFFFF',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
                                      }}
                                    >
                                      <span>Book</span>
                                      <ArrowUpRight size={12} />
                                    </button>
                                  )}
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
            )}
          </div>
        ) : (
          /* Daily View Grid */
          loading ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', maxWidth: '650px', margin: '0 auto' }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 16px auto', display: 'block', color: '#944426' }} />
              {dailyQuote ? (
                <blockquote style={{ margin: 0, fontFamily: 'var(--font-heading, Georgia, serif)', fontStyle: 'italic' }}>
                  <p style={{ fontSize: '16.5px', color: '#21201E', lineHeight: 1.5, marginBottom: '8px', fontWeight: 500 }}>
                    &ldquo;{dailyQuote.q}&rdquo;
                  </p>
                  <footer style={{ fontSize: '13px', color: '#944426', fontWeight: 700, fontStyle: 'normal' }}>
                    &mdash; {dailyQuote.a}
                  </footer>
                </blockquote>
              ) : (
                <p style={{ fontFamily: "var(--font-sans)", color: '#8A8580', fontSize: '14.5px' }}>
                  Loading live schedule for date...
                </p>
              )}
            </div>
          ) : displayClasses.length === 0 ? (
            <div style={{ fontFamily: "var(--font-sans)", textAlign: 'center', padding: '48px', backgroundColor: '#FFFFFF', borderRadius: '16px', color: '#7A756F' }}>
              No sessions scheduled matching filter. Please try another selection.
            </div>
          ) : (
            <div className="classes-live-sch-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {displayClasses.map((cls, idx) => {
                const classColor = (cls.color && cls.color.trim() !== '') ? cls.color : '#944426';

                const parts = (cls.timing || '').split(/\s*-\s*|\s*to\s*/i);
                const startTime = parts[0]?.trim() || cls.timing;
                const endTime = parts[1]?.trim() || '';

                const isCompleted = checkIsCompleted(cls, selectedDate);

                return (
                  <div
                    key={idx}
                    className="sch-daily-card"
                    style={{
                      backgroundColor: isCompleted ? '#F8FAFC' : '#FFFFFF',
                      borderRadius: '16px',
                      borderLeft: `6px solid ${isCompleted ? '#CBD5E1' : classColor}`,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                      opacity: isCompleted ? 0.75 : 1,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* Time Column */}
                    <div className="sch-daily-time-col" style={{ minWidth: '75px' }}>
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: '13.5px', fontWeight: 800, color: isCompleted ? '#64748B' : '#21201E', lineHeight: 1.15 }}>
                        {startTime}
                      </div>
                      {endTime && (
                        <div style={{ fontFamily: "var(--font-sans)", fontSize: '11.5px', fontWeight: 600, color: isCompleted ? '#94A3B8' : '#7A756F', marginTop: '1px', lineHeight: 1.15 }}>
                          {endTime}
                        </div>
                      )}
                    </div>

                    {/* Class Details Column */}
                    <div className="sch-daily-details-col" style={{ flexGrow: 1 }}>
                      <div className="sch-daily-meta-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span
                          className="sch-level-badge"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: '999px',
                            backgroundColor: isCompleted ? '#E2E8F0' : `${classColor}15`,
                            color: isCompleted ? '#64748B' : classColor,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}
                        >
                          {cls.level || 'All Levels'}
                        </span>
                        {cls.room && (
                          <span className="sch-room-tag" style={{ fontFamily: "var(--font-sans)", fontSize: '12px', color: '#6B655F', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={13} color={isCompleted ? '#94A3B8' : classColor} /> {cls.room}
                          </span>
                        )}
                      </div>

                      <h3
                        className="sch-class-title"
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: '18px',
                          fontWeight: 700,
                          color: isCompleted ? '#64748B' : classColor,
                          margin: '0 0 4px 0',
                          textDecoration: isCompleted ? 'line-through' : 'none'
                        }}
                      >
                        {cls.title}
                      </h3>

                      <p className="sch-instructor-text" style={{ fontFamily: "var(--font-sans)", fontSize: '13.5px', color: '#6B655F', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                        <User size={13} color="#7A756F" /> <span className="sch-guided-by">Guided by </span><strong style={{ color: '#21201E' }}>{cls.instructor || 'Master Teacher'}</strong>
                      </p>
                    </div>

                    {/* Action Column */}
                    <div className="sch-daily-action-col" style={{ minWidth: '140px', textAlign: 'right' }}>
                      {isCompleted ? (
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#64748B',
                            backgroundColor: '#E2E8F0',
                            padding: '8px 16px',
                            borderRadius: '999px',
                            display: 'inline-block'
                          }}
                        >
                          Completed
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="sch-daily-book-btn"
                          onClick={() => onOpenBooking(cls.buttonType || 'book', cls.title, cls)}
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: '13px',
                            fontWeight: 800,
                            padding: '10px 24px',
                            borderRadius: '999px',
                            border: 'none',
                            backgroundColor: '#21201E',
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span className="hidden sm:inline">Book</span>
                          <ArrowUpRight size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default InteractiveSchedule;
