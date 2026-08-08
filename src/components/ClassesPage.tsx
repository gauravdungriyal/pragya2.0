import React, { useEffect, useState, useRef } from 'react';
import { Signal, Clock, Calendar, Zap, Sparkles, Heart, Users, MapPin, User, ChevronRight, ChevronLeft, RefreshCw, SlidersHorizontal, Check, ArrowUpRight, X } from 'lucide-react';
import { getScheduleByDate, getFilters } from '../services/api';
import { ClassScheduleItem, FilterOptions } from '../types';
import { useAuth } from '../context/AuthContext';

interface ClassesPageProps {
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const ClassesPage: React.FC<ClassesPageProps> = ({ onOpenBooking }) => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ClassScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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
      level: 'Beginner',
      duration: '60 mins',
      timing: '07:00 AM - 08:00 AM',
      instructor: 'Master Aarya',
      room: 'Woo House',
      schedule: 'Mon, Wed, Fri',
      description: 'Awaken the bodily energy through rhythmic breathwork, classical sun salutations, and grounding posture holds.',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: '02',
      schedule_id: '25494',
      title: 'Vinyasa Flow',
      level: 'Intermediate',
      duration: '75 mins',
      timing: '09:00 AM - 10:15 AM',
      instructor: 'Angela Lee',
      room: 'Woo House',
      schedule: 'Tue, Thu, Sat',
      description: 'Fluid movement synchronized with dynamic breath to build stamina, balance, and centered presence.',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: '03',
      schedule_id: '25495',
      title: 'Hatha Yoga',
      level: 'All Levels',
      duration: '60 mins',
      timing: '11:00 AM - 12:00 PM',
      instructor: 'Charlotte Chiu',
      room: 'Woo House',
      schedule: 'Mon, Thu, Sun',
      description: 'A meditative style with longer holds that release deep tension and cultivate inner stillness and balance.',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: '04',
      schedule_id: '25496',
      title: 'Yin Yoga',
      level: 'All Levels',
      duration: '60 mins',
      timing: '02:00 PM - 03:00 PM',
      instructor: 'Angela Lee',
      room: 'Woo House',
      schedule: 'Wed, Fri, Sun',
      description: 'Precision-controlled movement using traditional postures to lengthen, align, and strengthen deep stabilizing muscles.',
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: '05',
      schedule_id: '25497',
      title: 'Power Yoga',
      level: 'Advanced',
      duration: '75 mins',
      timing: '05:30 PM - 06:45 PM',
      instructor: 'Charlotte Chiu',
      room: 'Woo House',
      schedule: 'Tue, Thu, Sat',
      description: 'High energy dynamic movement sequence designed to build core vitality, stamina, and cardiovascular health.',
      image: 'https://images.unsplash.com/photo-1512290900673-70024421191e?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: '06',
      schedule_id: '25498',
      title: 'Restorative Yoga',
      level: 'All Levels',
      duration: '60 mins',
      timing: '07:15 PM - 08:15 PM',
      instructor: 'Master Aarya',
      room: 'Woo House',
      schedule: 'Mon, Wed, Fri',
      description: 'Sacred breath sequences and prop-supported floor postures designed to clear stress and rejuvenate vital energy.',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop'
    }
  ];

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
      if (data && Array.isArray(data.schedules) && data.schedules.length > 0) {
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

  // Format display classes list
  const displayClasses = (schedules.length > 0 ? schedules : fallbackClasses).map((item, idx) => {
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
      duration: item.duration ? `${item.duration} mins` : '60 mins',
      timing: (item as any).timing || 'Daily Session',
      instructor: item.instructor || 'Master Teacher',
      room: (item as any).room || 'Woo House',
      schedule: (item as any).date || (fallbackClasses[idx % fallbackClasses.length]?.schedule) || 'Mon, Wed, Fri',
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
    (locationFilter && locationFilter !== '' && locationFilter.toLowerCase() !== 'all locations')
  );

  const resetAllFilters = () => {
    setLevelFilter('ALL');
    setInstructorFilter('');
    setPillarFilter('');
    setLocationFilter('');
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
    if (locationFilter && locationFilter !== '' && locationFilter.toLowerCase() !== 'all locations') {
      const itemLoc = ((item as any).room || (item as any).location || (item as any).studio || '').toLowerCase();
      const targetLoc = locationFilter.toLowerCase();
      if (!itemLoc.includes(targetLoc) && !targetLoc.includes(itemLoc)) return false;
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
              Explore{' '}
              <span
                className="classes-title-span"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: '#21201E'
                }}
              >
                Our Classes
              </span>
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
              From calming flows to energizing practices, Pragya Yog School offers a variety of yoga classes designed to fit every lifestyle and level.
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
            Discover Your <span style={{ fontFamily: "var(--font-accent)", fontStyle: 'italic', fontWeight: 400 }}>Ideal</span> Yoga <span style={{ fontFamily: "var(--font-accent)", fontStyle: 'italic', fontWeight: 400 }}>Practice</span>
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: '16px', color: '#6B655F', margin: 0 }}>
            Join a class that matches your pace, your goals, and your lifestyle
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
              style={{
                backgroundColor: '#EAE1D3',
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
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
              onClick={() => onOpenBooking('class', item.title, item)}
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
              Full Daily Schedule
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: '15px', color: '#6B655F', margin: 0 }}>
              Check classes available on any date or filter by skill level.
            </p>
          </div>

          {/* DATE NAVIGATOR BAR */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              marginBottom: '36px',
              position: 'relative'
            }}
          >
            {/* Center Date Selector Pill */}
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
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
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
              className="classes-today-btn"
              onClick={() => setSelectedDate(new Date())}
              style={{
                fontFamily: "var(--font-sans)",
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
            <div className="classes-filter-wrapper" style={{ position: 'relative' }} ref={filterWrapperRef}>
              <button
                onClick={() => setShowFilterModal(!showFilterModal)}
                style={{
                  fontFamily: "var(--font-sans)",
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
                    fontFamily: "var(--font-sans)",
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
                      Filter Classes
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
          </div>

          {/* Schedule Loading or Results Grid */}
          {loading ? (
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
              {filteredClasses.map((cls, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '24px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '24px',
                    flexWrap: 'wrap',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    transition: 'all 0.25s ease'
                  }}
                  className="schedule-row-hover"
                >
                  {/* Time & Room (Stacked Start & End Time) */}
                  <div className="cls-sch-time" style={{ minWidth: '100px', flexShrink: 0 }}>
                    {(() => {
                      const parts = (cls.timing || '').split(/\s*-\s*|\s*to\s*/i);
                      const startTime = parts[0]?.trim() || cls.timing;
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
                          <div style={{ fontFamily: "var(--font-sans)", fontSize: '11.5px', color: '#8A8580', fontWeight: 500, marginTop: '2px' }}>
                            {cls.room}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Class Title & Instructor */}
                  <div className="cls-sch-main" style={{ flexGrow: 1, minWidth: '140px' }}>
                    <h4 style={{ fontFamily: "var(--font-sans)", fontSize: '18px', fontWeight: 700, color: '#21201E', margin: '0 0 4px 0' }}>
                      {cls.title}
                    </h4>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: '13.5px', color: '#6B655F', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} color="#944426" />
                      <span>Guided by {cls.instructor}</span>
                    </div>
                  </div>

                  {/* Level Badge */}
                  <div className="cls-sch-badge">
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        backgroundColor: '#F5EFE5',
                        color: '#944426',
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
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#944426';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#21201E';
                    }}
                  >
                    <span>Book</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
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
            The{' '}
            <span
              style={{
                fontFamily: "var(--font-accent)",
                fontStyle: 'italic',
                fontWeight: 400
              }}
            >
              Gift
            </span>{' '}
            of Yoga
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
            Yoga is more than a physical practice, it's a path toward wellness, balance, and inner peace
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
          {/* Card 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
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
              <Zap size={26} color="#4A4540" />
            </div>
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: '18px', fontWeight: 700, color: '#21201E', marginBottom: '10px' }}>
              Physical Strength & Flexibility
            </h3>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: '14px', color: '#6B655F', lineHeight: 1.6, margin: 0 }}>
              Build endurance, improve posture, and move with more ease and confidence.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
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
              <Sparkles size={26} color="#4A4540" />
            </div>
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: '18px', fontWeight: 700, color: '#21201E', marginBottom: '10px' }}>
              Mental Clarity
            </h3>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: '14px', color: '#6B655F', lineHeight: 1.6, margin: 0 }}>
              Reduce stress, sharpen focus, and calm the mind through mindful movement and breathwork.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
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
              <Heart size={26} color="#4A4540" />
            </div>
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: '18px', fontWeight: 700, color: '#21201E', marginBottom: '10px' }}>
              Emotional Balance
            </h3>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: '14px', color: '#6B655F', lineHeight: 1.6, margin: 0 }}>
              Release tension, manage emotions, and create harmony between body and spirit.
            </p>
          </div>

          {/* Card 4 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
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
              <Users size={26} color="#4A4540" />
            </div>
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: '18px', fontWeight: 700, color: '#21201E', marginBottom: '10px' }}>
              Community Connection
            </h3>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: '14px', color: '#6B655F', lineHeight: 1.6, margin: 0 }}>
              Join a welcoming space where like-minded individuals grow and thrive together.
            </p>
          </div>
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
            width: auto !important;
            flex-shrink: 0 !important;
            padding: 6px 12px !important;
            font-size: 11px !important;
            font-weight: 800 !important;
            border-radius: 999px !important;
            margin-top: 0 !important;
          }
          .cls-sch-btn span {
            display: none !important;
          }
          .cls-sch-btn::after {
            content: "BOOK";
            font-size: 11px;
            font-weight: 800;
          }
        }
      `}</style>
    </div>
  );
};

export default ClassesPage;
