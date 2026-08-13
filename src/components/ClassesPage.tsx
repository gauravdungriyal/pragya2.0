import React, { useEffect, useState, useRef } from 'react';
import { Signal, Clock, Calendar, Zap, Sparkles, Heart, Users, MapPin, User, ChevronRight, ChevronLeft, RefreshCw, SlidersHorizontal, Check, ArrowUpRight, X } from 'lucide-react';
import { getScheduleByDate, getFilters } from '../services/api';
import { ClassScheduleItem, FilterOptions } from '../types';
import { useAuth } from '../context/AuthContext';
import { getSiteConfig, subscribeSiteConfig, SiteConfig } from '../services/siteConfig';

interface ClassesPageProps {
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  onNavigateSection?: (sectionId: string) => void;
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

export const ClassesPage: React.FC<ClassesPageProps> = ({ onOpenBooking }) => {
  const { user } = useAuth();
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(getSiteConfig());
  const [schedules, setSchedules] = useState<ClassScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    return subscribeSiteConfig(setSiteConfig);
  }, []);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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
  
  const DEFAULT_LOCATIONS = ['Online', 'Outdoor', 'Pragya Yog School', 'Verano'];
  const [selectedLocations, setSelectedLocations] = useState<string[]>(DEFAULT_LOCATIONS);

  const availableLocations = React.useMemo(() => {
    const list: string[] = [];
    (filterData.locations || []).forEach((loc) => {
      const name = loc.name || loc.id;
      if (name && name.trim() !== '' && name.toLowerCase() !== 'all locations' && !list.includes(name)) {
        list.push(name);
      }
    });
    if (list.length === 0) return DEFAULT_LOCATIONS;
    return list;
  }, [filterData.locations]);

  React.useEffect(() => {
    if (availableLocations.length > 0) {
      setSelectedLocations(availableLocations);
    }
  }, [availableLocations]);

  const toggleLocationFilter = (locName: string) => {
    setSelectedLocations((prev) =>
      prev.includes(locName) ? prev.filter((l) => l !== locName) : [...prev, locName]
    );
  };

  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
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

  const classImages = [
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512290900673-70024421191e?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop'
  ];

  const fallbackImage = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop';

  // Fetch API schedule whenever selectedDate changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const fetchFn = user
      ? getScheduleByDate(dateStr, undefined, user.access_token)
      : getScheduleByDate(dateStr);

    fetchFn.then((data) => {
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
  }, [selectedDate, user]);

  // Format display classes list directly from API schedules
  const displayClasses = schedules.map((item, idx) => {
    const rawDesc = (item as any).description || '';
    const cleanDesc = rawDesc.replace(/<[^>]*>?/gm, '').trim();
    const formattedDate = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    return {
      id: String(idx + 1).padStart(2, '0'),
      schedule_id: (item as any).schedule_id || item.id || String(idx + 100),
      title: item.title || 'Yoga Session',
      level: (item as any).levels || (item as any).level || 'All Levels',
      color: item.color || '',
      duration: item.duration ? `${item.duration} mins` : '60 mins',
      timing: (item as any).timing || 'Daily Session',
      instructor: item.instructor || 'Master Teacher',
      room: (item as any).room || 'Woo House',
      schedule: (item as any).date || 'Scheduled Class',
      date: (item as any).date && (item as any).date !== 'Today' ? (item as any).date : formattedDate,
      price: (item as any).book_cost || (item as any).price || (item as any).amount,
      description: cleanDesc || 'Experience traditional yoga practice combining breath, movement, and alignment.',
      image: classImages[idx % classImages.length]
    };
  });

  const availableInstructors = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    map.set('all instructors', { id: '', name: 'All Instructors' });

    (filterData.instructors || []).forEach((inst) => {
      if (inst && inst.name && inst.name.toLowerCase() !== 'all instructors') {
        map.set(inst.name.toLowerCase(), { id: inst.id || inst.name, name: inst.name });
      }
    });

    (displayClasses || []).forEach((item) => {
      const instName = item.instructor || (item as any).instructor_name;
      if (instName && typeof instName === 'string' && instName.trim() !== '' && instName.toLowerCase() !== 'all instructors') {
        if (!map.has(instName.toLowerCase())) {
          map.set(instName.toLowerCase(), { id: instName, name: instName.trim() });
        }
      }
    });

    return Array.from(map.values());
  }, [filterData.instructors, displayClasses]);

  const hasActiveFilter = Boolean(
    (levelFilter && levelFilter !== '' && levelFilter !== 'ALL' && levelFilter.toLowerCase() !== 'all levels') ||
    (instructorFilter && instructorFilter !== '' && instructorFilter.toLowerCase() !== 'all instructors') ||
    (pillarFilter && pillarFilter !== '' && pillarFilter.toLowerCase() !== 'all pillars') ||
    (selectedLocations.length < availableLocations.length)
  );

  const resetAllFilters = () => {
    setLevelFilter('ALL');
    setInstructorFilter('');
    setPillarFilter('');
    setSelectedLocations(availableLocations);
  };

  const filteredClasses = displayClasses.filter((item) => {
    if (levelFilter && levelFilter !== '' && levelFilter !== 'ALL' && levelFilter.toLowerCase() !== 'all levels') {
      const itemLvl = (item.level || '').toLowerCase();
      const targetLvl = levelFilter.toLowerCase();
      if (!itemLvl.includes(targetLvl) && !targetLvl.includes(itemLvl)) return false;
    }
    if (instructorFilter && instructorFilter !== '' && instructorFilter.toLowerCase() !== 'all instructors') {
      const itemInst = (item.instructor || (item as any).instructor_name || '').toLowerCase();
      const targetInst = instructorFilter.toLowerCase();
      if (!itemInst.includes(targetInst) && !targetInst.includes(itemInst)) return false;
    }
    if (pillarFilter && pillarFilter !== '' && pillarFilter.toLowerCase() !== 'all pillars') {
      const itemPillar = ((item as any).pillar || (item as any).category || (item as any).pillar_name || '').toLowerCase();
      const targetPillar = pillarFilter.toLowerCase();
      if (!itemPillar.includes(targetPillar) && !targetPillar.includes(itemPillar)) return false;
    }
    if (selectedLocations.length < availableLocations.length) {
      if (selectedLocations.length === 0) return false;
      const itemLoc = ((item as any).room || (item as any).location || (item as any).studio || '').toLowerCase();
      const match = selectedLocations.some((locName) => {
        const lLower = locName.toLowerCase();
        return itemLoc.includes(lLower) || lLower.includes(itemLoc);
      });
      if (!match) return false;
    }
    return true;
  });

  return (
    <div style={{ backgroundColor: '#F5EFE5', minHeight: '100vh', color: '#21201E' }}>
      {/* Top Hero Banner */}
      <section
        className="classes-top-banner"
        style={{
          backgroundColor: '#F5EFE5',
          color: '#21201E',
          padding: '140px 32px 64px 32px'
        }}
      >
        <div
          className="classes-header-grid"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            alignItems: 'center'
          }}
        >
          {/* Title in Brand Serif & Canela Italic */}
          <div>
            <h1
              className="classes-top-title"
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
              {siteConfig.classesPageConfig?.topTitle || 'Explore'}{' '}
              <span
                className="classes-title-span"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: '#21201E'
                }}
              >
                {siteConfig.classesPageConfig?.topTitleItalic || 'Our Classes'}
              </span>
              {siteConfig.classesPageConfig?.topSuffix ? ` ${siteConfig.classesPageConfig.topSuffix}` : ''}
            </h1>
          </div>

          {/* Subtitle Description in Neue Montreal */}
          <div>
            <p
              className="classes-top-subtitle"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: '16px',
                color: '#6B655F',
                lineHeight: 1.6,
                margin: 0,
                maxWidth: '480px'
              }}
            >
              {siteConfig.classesPageConfig?.topSubtitle || 'From calming flows to energizing practices, Pragya Yog School offers a variety of yoga classes designed to fit every lifestyle and level.'}
            </p>
          </div>
        </div>
      </section>

      {/* Main Section 1: 3-Column Vertical Grid Cards (Matching Reference UI) */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '80px 32px'
        }}
      >
        {/* Title & Subtitle Header in Brand Fonts */}
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 56px auto' }}>
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 'clamp(34px, 4.8vw, 54px)',
              fontWeight: 700,
              color: '#21201E',
              margin: '0 0 12px 0',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}
          >
            {siteConfig.classesPageConfig?.idealTitle || 'Discover Your'}{' '}
            <span style={{ fontFamily: "var(--font-accent)", fontStyle: 'italic', fontWeight: 400 }}>
              {siteConfig.classesPageConfig?.idealTitleItalic || 'Ideal'}
            </span>
            {siteConfig.classesPageConfig?.idealSuffix !== undefined
              ? (siteConfig.classesPageConfig.idealSuffix ? ` ${siteConfig.classesPageConfig.idealSuffix}` : '')
              : ' Yog Practice'}
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: '16px', color: '#6B655F', margin: 0 }}>
            {siteConfig.classesPageConfig?.idealSubtitle || 'Join a class that matches your pace, your goals, and your lifestyle'}
          </p>
        </div>

        {/* Desktop 3-Column Grid Cards */}
        <div
          className="classes-desktop-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px'
          }}
        >
          {displayClasses.map((item) => (
            <div
              key={item.id}
              className="ideal-class-card"
              onClick={() => {
                const el = document.getElementById('live-schedule');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={{
                backgroundColor: '#EAE1D3',
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }}
            >
              {/* Top Photo Banner */}
              <div style={{ width: '100%', height: '220px', overflow: 'hidden' }}>
                <img
                  src={item.image}
                  alt={item.title}
                  onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.5s ease'
                  }}
                  className="ideal-card-img"
                />
              </div>

              {/* Card Body Content */}
              <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: '22px',
                      fontWeight: 700,
                      color: '#21201E',
                      margin: '0 0 12px 0'
                    }}
                  >
                    {item.title}
                  </h3>

                  {/* Level & Duration Icons Line */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontFamily: "var(--font-sans)",
                      fontSize: '13.5px',
                      fontWeight: 600,
                      color: '#4A4540',
                      marginBottom: '24px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Signal size={14} color="#7A756F" />
                      <span>{item.level || 'All Levels'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} color="#7A756F" />
                      <span>{String(item.duration || '60 mins').replace(/\s*mins?/gi, '')} mins</span>
                    </div>
                  </div>
                </div>

                {/* Footer Line: Schedule Info */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(39, 39, 39, 0.08)'
                  }}
                >
                  <div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: '11px', fontWeight: 700, color: '#7A756F', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Schedule
                    </div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: '13px', fontWeight: 700, color: '#21201E', marginTop: '2px' }}>
                      {item.schedule || 'Mon, Wed, Fri'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Vertical Stacked Cards (Matching Reference Screenshot Exactly) */}
        <div className="classes-mobile-list">
          {displayClasses.map((item) => (
            <div
              key={item.id}
              className="classes-ref-card"
              onClick={() => {
                const el = document.getElementById('live-schedule');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              {/* Top Header Row: Level Tag */}
              <div className="card-top-row">
                <span className="card-level">{item.level || 'Beginner'}</span>
              </div>

              {/* Class Title */}
              <h3 className="card-title">{item.title}</h3>

              {/* Meta Details Row */}
              <div className="card-meta-row">
                <div className="meta-item">
                  <Clock size={14} color="#7A756F" />
                  <span>{String(item.duration || '60 mins').replace(/\s*mins?/gi, '')} mins</span>
                </div>
                <div className="meta-item">
                  <Calendar size={14} color="#7A756F" />
                  <span>{item.schedule || 'Mon, Wed, Fri'}</span>
                </div>
              </div>

              {/* Bottom Featured Image */}
              <div className="card-img-box">
                <img
                  src={item.image}
                  alt={item.title}
                  className="card-img"
                  onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Section 2: Full Live Schedule with Date Selector Bar */}
      <section
        id="live-schedule"
        style={{
          backgroundColor: '#EAE1D3',
          padding: '80px 32px',
          borderTop: '1px solid rgba(39, 39, 39, 0.08)',
          borderBottom: '1px solid rgba(39, 39, 39, 0.08)'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px auto' }}>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.14em',
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
                fontSize: 'clamp(32px, 4.2vw, 52px)',
                fontWeight: 400,
                color: '#21201E',
                margin: '0 0 12px 0'
              }}
            >
              {scheduleViewMode === 'week' ? '7-Day Weekly Schedule' : 'Full Daily Schedule'}
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: '15px', color: '#6B655F', margin: '0 0 24px 0' }}>
              {scheduleViewMode === 'week'
                ? 'Explore the full weekly timetable below or filter by teacher, level & studio location.'
                : 'Check classes available on any date or filter by skill level.'}
            </p>

            {/* VIEW MODE TOGGLE SWITCHER (Desktop & Tablet) */}
            <div
              className="schedule-view-switcher-bar"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: '999px',
                padding: '4px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(148, 68, 38, 0.15)',
                marginBottom: '8px'
              }}
            >
              <button
                type="button"
                onClick={() => setScheduleViewMode('day')}
                style={{
                  fontFamily: "var(--font-sans)",
                  padding: '9px 22px',
                  borderRadius: '999px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: scheduleViewMode === 'day' ? '#00381F' : 'transparent',
                  color: scheduleViewMode === 'day' ? '#FFFFFF' : '#4A4540',
                  transition: 'all 0.25s ease'
                }}
              >
                📅 Daily View
              </button>
              <button
                type="button"
                onClick={() => setScheduleViewMode('week')}
                style={{
                  fontFamily: "var(--font-sans)",
                  padding: '9px 22px',
                  borderRadius: '999px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: scheduleViewMode === 'week' ? '#00381F' : 'transparent',
                  color: scheduleViewMode === 'week' ? '#FFFFFF' : '#4A4540',
                  transition: 'all 0.25s ease'
                }}
              >
                🗓️ Weekly View
              </button>
            </div>
          </div>

          {/* DATE NAVIGATOR BAR */}
          {/* Schedule Controls Top Bar: Location (Left) | Date Slider & Today Pill (Center) | Level, Instructor, Pillar (Right) */}
          <div
            className="schedule-controls-bar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              marginBottom: '36px'
            }}
          >
            {/* 📍 LEFT SIDE: Location Filter Pills (All active by default) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {availableLocations.map((locName) => {
                const isSelected = selectedLocations.includes(locName);
                return (
                  <button
                    key={locName}
                    type="button"
                    onClick={() => toggleLocationFilter(locName)}
                    style={{
                      fontFamily: "var(--font-sans)",
                      padding: '8px 16px',
                      borderRadius: '999px',
                      border: isSelected ? '1.5px solid #354336' : '1.5px solid rgba(148, 68, 38, 0.25)',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      backgroundColor: isSelected ? '#354336' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#6E6A63',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 4px 12px rgba(53, 67, 54, 0.2)' : '0 2px 6px rgba(0,0,0,0.02)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease',
                      userSelect: 'none'
                    }}
                  >
                    <span>{locName}</span>
                  </button>
                );
              })}
            </div>

            {/* 🗓️ CENTER: Date Selector Pill */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '999px',
                  padding: '10px 22px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '14px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                  border: '1px solid rgba(148, 68, 38, 0.15)',
                  position: 'relative',
                  whiteSpace: 'nowrap'
                }}
              >
                {/* Left Arrow Button */}
                <button
                  onClick={() => {
                    const prev = new Date(selectedDate);
                    const shiftDays = scheduleViewMode === 'week' ? 7 : 1;
                    prev.setDate(prev.getDate() - shiftDays);
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
                  title={scheduleViewMode === 'week' ? "Previous Week" : "Previous Day"}
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Date Text & Calendar Icon */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontFamily: "var(--font-sans)",
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#21201E',
                    cursor: 'pointer',
                    position: 'relative',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Calendar size={18} color="#944426" />
                  <span style={{ whiteSpace: 'nowrap' }}>
                    {scheduleViewMode === 'week' ? (
                      (() => {
                        const first = weekDays[0];
                        const last = weekDays[6];
                        if (!first || !last) return '';
                        const m1 = first.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        const m2 = last.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        return `${m1} – ${m2}`;
                      })()
                    ) : (
                      selectedDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    )}
                  </span>

                  {/* Hidden Date Input Overlay */}
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
                    title="Click to choose a date"
                  />
                </div>

                {/* Right Arrow Button */}
                <button
                  onClick={() => {
                    const next = new Date(selectedDate);
                    const shiftDays = scheduleViewMode === 'week' ? 7 : 1;
                    next.setDate(next.getDate() + shiftDays);
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
                  title={scheduleViewMode === 'week' ? "Next Week" : "Next Day"}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* 🎛️ RIGHT SIDE: Level, Instructor, Pillar Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* 1. LEVEL */}
              {filterData.levels && filterData.levels.length > 0 && (
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  style={{
                    fontFamily: "var(--font-sans)",
                    padding: '10px 38px 10px 16px',
                    borderRadius: '999px',
                    border: levelFilter !== 'ALL' && levelFilter !== '' ? '1.5px solid #354336' : '1.5px solid rgba(148, 68, 38, 0.25)',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    backgroundColor: levelFilter !== 'ALL' && levelFilter !== '' ? '#354336' : '#FFFFFF',
                    color: levelFilter !== 'ALL' && levelFilter !== '' ? '#FFFFFF' : '#21201E',
                    outline: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    backgroundImage: levelFilter !== 'ALL' && levelFilter !== ''
                      ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`
                      : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2321201E' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 18px center'
                  }}
                >
                  {filterData.levels.map((lvl) => (
                    <option key={lvl.id || lvl.name} value={lvl.name || lvl.id} style={{ color: '#21201E', backgroundColor: '#FFFFFF' }}>
                      {lvl.name || 'All Levels'}
                    </option>
                  ))}
                </select>
              )}

              {/* 2. INSTRUCTOR */}
              {availableInstructors && availableInstructors.length > 0 && (
                <select
                  value={instructorFilter}
                  onChange={(e) => setInstructorFilter(e.target.value)}
                  style={{
                    fontFamily: "var(--font-sans)",
                    padding: '10px 38px 10px 16px',
                    borderRadius: '999px',
                    border: instructorFilter ? '1.5px solid #354336' : '1.5px solid rgba(148, 68, 38, 0.25)',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    backgroundColor: instructorFilter ? '#354336' : '#FFFFFF',
                    color: instructorFilter ? '#FFFFFF' : '#21201E',
                    outline: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    backgroundImage: instructorFilter
                      ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`
                      : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2321201E' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 18px center'
                  }}
                >
                  {availableInstructors.map((inst) => (
                    <option key={inst.id || inst.name} value={inst.name || inst.id} style={{ color: '#21201E', backgroundColor: '#FFFFFF' }}>
                      {inst.name || 'All Instructors'}
                    </option>
                  ))}
                </select>
              )}

              {/* 3. PILLAR */}
              {filterData.pillars && filterData.pillars.length > 0 && (
                <select
                  value={pillarFilter}
                  onChange={(e) => setPillarFilter(e.target.value)}
                  style={{
                    fontFamily: "var(--font-sans)",
                    padding: '10px 38px 10px 16px',
                    borderRadius: '999px',
                    border: pillarFilter ? '1.5px solid #354336' : '1.5px solid rgba(148, 68, 38, 0.25)',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    backgroundColor: pillarFilter ? '#354336' : '#FFFFFF',
                    color: pillarFilter ? '#FFFFFF' : '#21201E',
                    outline: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    backgroundImage: pillarFilter
                      ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`
                      : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2321201E' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 18px center'
                  }}
                >
                  {filterData.pillars.map((p) => (
                    <option key={p.id || p.name} value={p.name || p.id} style={{ color: '#21201E', backgroundColor: '#FFFFFF' }}>
                      {p.name || 'All Pillars'}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* WEEKLY 7-DAY GRID VIEW (Desktop & Tablet) */}
          {scheduleViewMode === 'week' ? (
            <div className="weekly-schedule-container-desktop">
              {weeklyLoading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#944426' }}>
                  <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', display: 'block' }} />
                  <p style={{ fontFamily: "var(--font-sans)", color: '#8A8580', fontSize: '14.5px' }}>
                    Loading 7-Day Weekly Timetable...
                  </p>
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
                      const itemRoom = ((item as any).room || (item as any).location || (item as any).studio || '').toLowerCase();

                      if (levelFilter !== 'ALL' && levelFilter !== '' && !itemLevel.includes(levelFilter.toLowerCase())) return false;
                      if (instructorFilter !== '' && !itemInstructor.includes(instructorFilter.toLowerCase())) return false;
                      if (pillarFilter !== '' && !((item as any).pillar || '').toLowerCase().includes(pillarFilter.toLowerCase())) return false;

                      if (selectedLocations.length < availableLocations.length) {
                        if (selectedLocations.length === 0) return false;
                        const match = selectedLocations.some((locName) => {
                          const lLower = locName.toLowerCase();
                          return itemRoom.includes(lLower) || lLower.includes(itemRoom);
                        });
                        if (!match) return false;
                      }
                      return true;
                    });

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
                            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: isToday ? '#944426' : '#21201E' }}>
                              {dayName}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '2px', color: isToday ? '#944426' : '#21201E' }}>
                              {dateNum}
                            </div>
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

                              const isCompleted = checkIsCompleted(clsItem, dateObj);

                              return (
                                <div
                                  key={cIdx}
                                  onClick={() => {
                                    if (!isCompleted) {
                                      onOpenBooking('class', title, clsItem);
                                    }
                                  }}
                                  style={{
                                    backgroundColor: isCompleted ? '#F8FAFC' : '#FAF7F2',
                                    borderRadius: '16px',
                                    padding: '12px 10px 12px 14px',
                                    border: '1px solid #EBE4D8',
                                    borderLeft: `4px solid ${isCompleted ? '#94A3B8' : classColor}`,
                                    boxShadow: isCompleted ? 'none' : '0 4px 14px rgba(0, 0, 0, 0.04)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    textAlign: 'left',
                                    gap: '6px',
                                    position: 'relative',
                                    cursor: isCompleted ? 'default' : 'pointer',
                                    opacity: isCompleted ? 0.75 : 1,
                                    transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                                  }}
                                  className={isCompleted ? "weekly-slot-card completed" : "weekly-slot-card"}
                                >
                                  {/* Top Row: Time & Top-Right Floating BOOK Button */}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '4px' }}>
                                    <div
                                      style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: isCompleted ? '#94A3B8' : '#475569',
                                        textDecoration: isCompleted ? 'line-through' : 'none',
                                        letterSpacing: '-0.01em'
                                      }}
                                    >
                                      {endTime ? `${startTime} - ${endTime}` : startTime}
                                    </div>
                                    {!isCompleted && (
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
                                    )}
                                  </div>

                                  {/* Title Row with Bullet Dot */}
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', width: '100%', margin: '2px 0' }}>
                                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: isCompleted ? '#94A3B8' : classColor, marginTop: '5px', flexShrink: 0 }} />
                                    <div
                                      style={{
                                        fontFamily: "var(--font-sans)",
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        color: isCompleted ? '#94A3B8' : classColor,
                                        textDecoration: isCompleted ? 'line-through' : 'none',
                                        lineHeight: 1.25
                                      }}
                                    >
                                      {title}
                                    </div>
                                  </div>

                                  {/* Instructor & Room Info */}
                                  <div
                                    style={{
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
            /* Schedule Loading or Results Grid (Daily View) */
            loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#944426' }}>
                <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', display: 'block' }} />
                <p style={{ fontFamily: "var(--font-sans)", color: '#8A8580' }}>Loading live schedule for date...</p>
              </div>
            ) : filteredClasses.length === 0 ? (
              <div style={{ fontFamily: "var(--font-sans)", textAlign: 'center', padding: '48px', backgroundColor: '#FFFFFF', borderRadius: '16px', color: '#7A756F' }}>
                No sessions scheduled matching filter. Please try another date or clear filters.
              </div>
            ) : (
              <div className="classes-live-sch-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredClasses.map((cls, idx) => {
                const classColor = (cls.color && cls.color.trim() !== '') 
                  ? cls.color 
                  : (cls.title || '').toLowerCase().includes('back') ? '#D97706'
                  : (cls.title || '').toLowerCase().includes('yin') || (cls.title || '').toLowerCase().includes('sound') ? '#7C3AED'
                  : (cls.title || '').toLowerCase().includes('gentle') || (cls.title || '').toLowerCase().includes('hatha') ? '#059669'
                  : (cls.title || '').toLowerCase().includes('vinyasa') || (cls.title || '').toLowerCase().includes('power') ? '#944426'
                  : (cls.title || '').toLowerCase().includes('restorative') ? '#0284C7'
                  : '#D97706';

                const parts = (cls.timing || '').split(/\s*-\s*|\s*to\s*/i);
                const startTime = parts[0]?.trim() || cls.timing;
                const endTime = parts[1]?.trim() || '';

                const isCompleted = checkIsCompleted(cls, selectedDate);

                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: isCompleted ? '#F8FAFC' : '#FFFFFF',
                      borderRadius: '16px',
                      padding: '24px 32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '24px',
                      flexWrap: 'wrap',
                      boxShadow: isCompleted ? 'none' : '0 4px 16px rgba(0,0,0,0.03)',
                      borderLeft: `5px solid ${isCompleted ? '#94A3B8' : classColor}`,
                      opacity: isCompleted ? 0.75 : 1,
                      transition: 'all 0.25s ease'
                    }}
                    className="schedule-row-hover"
                  >
                    {/* Time & Room (Stacked Start & End Time) */}
                    <div className="cls-sch-time" style={{ minWidth: '100px', flexShrink: 0 }}>
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: '15px', fontWeight: 700, color: isCompleted ? '#94A3B8' : classColor, textDecoration: isCompleted ? 'line-through' : 'none', lineHeight: 1.2 }}>
                        {startTime}
                      </div>
                      {endTime && (
                        <div style={{ fontFamily: "var(--font-sans)", fontSize: '13px', fontWeight: 600, color: isCompleted ? '#94A3B8' : '#6B655F', textDecoration: isCompleted ? 'line-through' : 'none', lineHeight: 1.2 }}>
                          {endTime}
                        </div>
                      )}
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: '11.5px', color: isCompleted ? '#94A3B8' : '#8A8580', textDecoration: isCompleted ? 'line-through' : 'none', fontWeight: 500, marginTop: '2px' }}>
                        {cls.room}
                      </div>
                    </div>

                    {/* Class Title & Instructor */}
                    <div className="cls-sch-main" style={{ flexGrow: 1, minWidth: '140px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isCompleted ? '#94A3B8' : classColor, display: 'inline-block', flexShrink: 0 }} />
                        <h4 style={{ fontFamily: "var(--font-sans)", fontSize: '18px', fontWeight: 700, color: isCompleted ? '#94A3B8' : classColor, textDecoration: isCompleted ? 'line-through' : 'none', margin: 0 }}>
                          {cls.title}
                        </h4>
                      </div>
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: '13.5px', color: isCompleted ? '#94A3B8' : '#6B655F', textDecoration: isCompleted ? 'line-through' : 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} color={isCompleted ? '#94A3B8' : classColor} />
                        <span>Guided by {cls.instructor}</span>
                      </div>
                    </div>

                    {/* Level Badge */}
                    <div className="cls-sch-badge">
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          backgroundColor: isCompleted ? '#F1F5F9' : `${classColor}15`,
                          color: isCompleted ? '#94A3B8' : classColor,
                          border: `1px solid ${isCompleted ? '#CBD5E1' : `${classColor}30`}`,
                          padding: '6px 16px',
                          borderRadius: '999px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          letterSpacing: '0.02em'
                        }}
                      >
                        {cls.level}
                      </span>
                    </div>

                    {/* Book Session Action */}
                    {!isCompleted && (
                      <button
                        className="cls-sch-btn"
                        onClick={() => onOpenBooking('class', cls.title, cls)}
                        style={{
                          fontFamily: "var(--font-sans)",
                          backgroundColor: '#21201E',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '999px',
                          padding: '10px 24px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.25s ease',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>Book</span>
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
      </section>

      {/* SECTION 3: The Gift of Yoga */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '96px auto 96px auto',
          padding: '0 32px',
          textAlign: 'center'
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto 56px auto' }}>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 400,
              color: '#21201E',
              margin: '0 0 14px 0',
              lineHeight: 1.12
            }}
          >
            {siteConfig.classesPageConfig?.giftTitle || 'The'}{' '}
            <span
              style={{
                fontFamily: "var(--font-accent)",
                fontStyle: 'italic',
                fontWeight: 400
              }}
            >
              {siteConfig.classesPageConfig?.giftTitleItalic || 'Gift'}
            </span>
            {siteConfig.classesPageConfig?.giftSuffix !== undefined
              ? (siteConfig.classesPageConfig.giftSuffix ? ` ${siteConfig.classesPageConfig.giftSuffix}` : '')
              : ' of Yoga'}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: '15.5px',
              color: '#6B655F',
              lineHeight: 1.6,
              margin: 0
            }}
          >
            {siteConfig.classesPageConfig?.giftSubtitle || "Yoga is more than a physical practice, it's a path toward wellness, balance, and inner peace"}
          </p>
        </div>

        {/* 4 Feature Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '32px'
          }}
        >
          {(siteConfig.classesPageConfig?.giftCards || []).map((card, idx) => {
            const icons = [<Zap size={26} color="#4A4540" />, <Sparkles size={26} color="#4A4540" />, <Heart size={26} color="#4A4540" />, <Users size={26} color="#4A4540" />];
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#EAE1D3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}
                >
                  {icons[idx % icons.length]}
                </div>
                <h3 style={{ fontFamily: "var(--font-sans)", fontSize: '18px', fontWeight: 700, color: '#21201E', marginBottom: '10px' }}>
                  {card.title}
                </h3>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: '14px', color: '#6B655F', lineHeight: 1.6, margin: 0 }}>
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: Pre-Footer Banner - Find the Class That Moves You */}
      <section
        style={{
          width: '100%',
          marginBottom: 0,
          position: 'relative',
          minHeight: '480px',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Background Image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2000&auto=format&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            zIndex: 0
          }}
        />

        {/* Soft Warm Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(245, 239, 229, 0.95) 0%, rgba(245, 239, 229, 0.82) 45%, rgba(245, 239, 229, 0.15) 100%)',
            zIndex: 1
          }}
        />

        {/* Content Box */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1280px',
            width: '100%',
            margin: '0 auto',
            padding: '64px 32px'
          }}
        >
          <div style={{ maxWidth: '520px' }}>
            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 'clamp(36px, 4.8vw, 54px)',
                fontWeight: 700,
                color: '#21201E',
                margin: '0 0 16px 0',
                lineHeight: 1.15,
                letterSpacing: '-0.02em'
              }}
            >
              Find the Class That Moves You
            </h2>

            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: '15.5px',
                color: '#4A4540',
                margin: '0 0 32px 0',
                lineHeight: 1.6
              }}
            >
              Whatever your level or lifestyle, Pragya Yog School has the perfect practice waiting for you. Step onto the mat and start today.
            </p>

            <button
              onClick={() => {
                const el = document.getElementById('live-schedule');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  onOpenBooking('class', 'Book Your Class');
                }
              }}
              style={{
                fontFamily: "var(--font-sans)",
                backgroundColor: '#354336',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '999px',
                padding: '16px 36px',
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#21201E';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#354336';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Book Your Class
            </button>
          </div>
        </div>
      </section>

      {/* Hover & Responsive CSS Matching Reference UI */}
      <style>{`
        .ideal-class-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08) !important;
        }
        .ideal-class-card:hover .ideal-card-img {
          transform: scale(1.05);
        }
        .schedule-row-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
        }
        .classes-mobile-list {
          display: none;
        }
        @media (max-width: 992px) {
          .classes-header-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
        @media (max-width: 768px) {
          .classes-top-banner {
            background-color: #F5EFE5 !important;
            color: #21201E !important;
            padding: 104px 20px 32px 20px !important;
          }
          .classes-top-title {
            font-size: 38px !important;
            color: #21201E !important;
            margin-bottom: 12px !important;
          }
          .classes-title-span {
            color: #21201E !important;
          }
          .classes-top-subtitle {
            font-size: 14.5px !important;
            color: #6B655F !important;
            line-height: 1.55 !important;
          }
          .classes-desktop-grid {
            display: none !important;
          }
          .classes-mobile-list {
            display: flex !important;
            flex-direction: column !important;
            gap: 20px !important;
          }
          .classes-ref-card {
            background-color: #EAE1D3 !important;
            border-radius: 20px !important;
            padding: 24px 20px 20px 20px !important;
            display: flex !important;
            flex-direction: column !important;
            cursor: pointer !important;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03) !important;
            transition: transform 0.25s ease !important;
          }
          .classes-ref-card:active {
            transform: scale(0.99) !important;
          }
          .card-top-row {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            margin-bottom: 6px !important;
          }
          .card-level {
            font-size: 13.5px !important;
            color: #7A756F !important;
            font-weight: 500 !important;
          }
          .card-arrow-circle {
            width: 40px !important;
            height: 40px !important;
            border-radius: 50% !important;
            background-color: #FFFFFF !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
          }
          .card-title {
            font-size: 22px !important;
            font-weight: 700 !important;
            color: #21201E !important;
            margin: 0 0 12px 0 !important;
          }
          .card-meta-row {
            display: flex !important;
            align-items: center !important;
            gap: 18px !important;
            margin-bottom: 16px !important;
          }
          .meta-item {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            font-size: 13.5px !important;
            color: #6B655F !important;
          }
          .card-img-box {
            width: 100% !important;
            height: 200px !important;
            border-radius: 14px !important;
            overflow: hidden !important;
          }
          .card-img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
          }

          /* Live Schedule Section Ultra Compact Mobile Rules */
          .classes-today-btn, .classes-filter-wrapper {
            display: none !important;
          }
          #live-schedule {
            padding: 36px 14px !important;
          }
          .classes-live-sch-list {
            gap: 8px !important;
          }
          .schedule-row-hover {
            padding: 12px 14px !important;
            border-radius: 14px !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 10px !important;
            flex-wrap: nowrap !important;
          }
          .cls-sch-time {
            min-width: unset !important;
            width: auto !important;
            flex-shrink: 0 !important;
          }
          .cls-sch-time > div:first-child {
            font-size: 12px !important;
            font-weight: 800 !important;
            color: #944426 !important;
            line-height: 1.2 !important;
          }
          .cls-sch-time > div:last-child {
            font-size: 10.5px !important;
            color: #8A8580 !important;
            line-height: 1.2 !important;
          }
          .cls-sch-main {
            min-width: unset !important;
            flex-grow: 1 !important;
            overflow: hidden !important;
          }
          .cls-sch-main h4 {
            font-size: 13.5px !important;
            font-weight: 700 !important;
            margin: 0 0 2px 0 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            line-height: 1.2 !important;
          }
          .cls-sch-main > div {
            font-size: 11px !important;
            color: #6B655F !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          .cls-sch-badge {
            display: none !important;
          }
          .cls-sch-btn {
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
          .cls-sch-btn span {
            display: none !important;
          }
          .cls-sch-btn svg {
            display: block !important;
            width: 16px !important;
            height: 16px !important;
            margin: 0 !important;
          }
        .weekly-slot-card:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
          border-color: rgba(148, 68, 38, 0.25) !important;
        }
        @media (max-width: 767px) {
          .schedule-view-switcher-bar {
            display: none !important;
          }
          .weekly-schedule-container-desktop {
            display: none !important;
          }
          .classes-desktop-grid {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ClassesPage;
