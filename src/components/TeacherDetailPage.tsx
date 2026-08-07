import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Minus, Calendar, Clock, MapPin, User, RefreshCw, Filter, ChevronDown, Check } from 'lucide-react';
import { Instructor, ClassScheduleItem } from '../types';
import { getScheduleByDate } from '../services/api';

interface TeacherDetailPageProps {
  teacher: Instructor;
  onBack: () => void;
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
}

export const TeacherDetailPage: React.FC<TeacherDetailPageProps> = ({ teacher, onBack, onOpenBooking }) => {
  const [qualificationsOpen, setQualificationsOpen] = useState<boolean>(false);
  const [dailySchedules, setDailySchedules] = useState<Record<string, ClassScheduleItem[]>>({});
  const [loadingSchedule, setLoadingSchedule] = useState<boolean>(true);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('All');
  const [classDropdownOpen, setClassDropdownOpen] = useState<boolean>(false);
  const [isBioExpanded, setIsBioExpanded] = useState<boolean>(false);

  // Helper to format date for display and API
  const generateUpcomingDays = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 4; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);

      const dayStr = String(d.getDate()).padStart(2, '0');
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const yearStr = d.getFullYear();

      dates.push({
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        dateFormatted: d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        apiDateStr: `${dayStr}/${monthStr}/${yearStr}`,
        isoDateStr: d.toISOString().split('T')[0]
      });
    }
    return dates;
  };

  const daysList = generateUpcomingDays();

  // Teacher Image & Image Fallback
  const teacherImages: Record<string, string> = {
    "Master Aarya Kuldeep": "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1200&auto=format&fit=crop",
    "Angela Lee": "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop",
    "Charlotte Chiu": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop",
    "Louise Vance": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop"
  };

  const bgImage = (teacher as any).image || teacherImages[teacher.name] || "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1200&auto=format&fit=crop";

  // Check if instructor matches current teacher
  const isTeacherMatch = (tName: string, instName: string) => {
    if (!instName) return false;
    const tLower = tName.toLowerCase();
    const iLower = instName.toLowerCase();
    const tokens = tLower.split(' ').filter((x) => x.length > 2);
    return tokens.some((token) => iLower.includes(token)) || iLower.includes(tLower) || tLower.includes(iLower);
  };

  useEffect(() => {
    let isMounted = true;
    setLoadingSchedule(true);

    const promises = daysList.map((d) =>
      getScheduleByDate(d.isoDateStr).then((res) => ({
        dateKey: d.apiDateStr,
        items: res && Array.isArray(res.schedules) ? res.schedules : []
      }))
    );

    Promise.all(promises).then((results) => {
      if (!isMounted) return;
      const map: Record<string, ClassScheduleItem[]> = {};
      results.forEach((r) => {
        map[r.dateKey] = r.items;
      });
      setDailySchedules(map);
      setLoadingSchedule(false);
    });

    return () => {
      isMounted = false;
    };
  }, [teacher.name]);

  // Extract unique class titles for filter dropdown
  const availableClassTitles = Array.from(
    new Set(
      Object.values(dailySchedules)
        .flat()
        .filter((c) => isTeacherMatch(teacher.name, c.instructor))
        .map((c) => c.title)
        .filter(Boolean)
    )
  );

  // Clean description and decode HTML entities
  const cleanDescription = (teacher.description || '')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>?/gm, '')
    .trim();

  const fullBio = cleanDescription || `${teacher.name} believes that yoga is the ultimate medicine for the human body and mind. Helping practitioners cultivate present-moment awareness, build physical resilience, and rediscover inner stillness is their life's primary mission.`;
  const shouldTruncateBio = fullBio.length > 220;
  const displayBio = shouldTruncateBio && !isBioExpanded ? `${fullBio.slice(0, 220)}...` : fullBio;

  // Qualifications list
  const qualifications = [
    '200-Hour & 500-Hour Yoga Alliance Certified Master Teacher',
    'PhD Research Scholar in Yogic Sciences & Human Physiology',
    'Advanced Certification in Pranayama, Meditation & Sound Therapy',
    'Over 8+ Years of International Teaching & Workshop Facilitation'
  ];

  const studioBadges = ['Woo House'];
  const languageBadges = ['English', 'Hindi', 'Sanskrit'];

  return (
    <div style={{ backgroundColor: '#F5EFE5', minHeight: '100vh', color: '#21201E' }}>
      {/* Top Header & Breadcrumb Bar */}
      <section
        className="teacher-top-section"
        style={{
          padding: '130px 32px 48px 32px',
          maxWidth: '1280px',
          margin: '0 auto'
        }}
      >
        {/* Back Link */}
        <button
          onClick={onBack}
          className="teacher-back-btn"
          style={{
            background: 'none',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: "var(--font-sans)",
            fontSize: '12.5px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: '#944426',
            textTransform: 'uppercase',
            cursor: 'pointer',
            padding: 0,
            marginBottom: '28px',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(-3px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <ChevronLeft size={18} color="#944426" />
          <span>ALL YOGA GUIDES</span>
        </button>

        {/* Large Display Name in Brand Sans Font */}
        <h1
          className="teacher-detail-name"
          style={{
            fontFamily: "'Neue Montreal', -apple-system, sans-serif",
            fontSize: 'clamp(44px, 6vw, 76px)',
            fontWeight: 700,
            color: '#21201E',
            letterSpacing: '-0.02em',
            margin: '0 0 32px 0',
            lineHeight: 1.05
          }}
        >
          {teacher.name}
        </h1>

        {/* Language & Studios Metadata Row */}
        <div
          className="teacher-meta-wrapper"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* Languages */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: '15px', fontWeight: 700, color: '#21201E', minWidth: '90px' }}>
              Language
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {languageBadges.map((lang) => (
                <span
                  key={lang}
                  style={{
                    fontFamily: "var(--font-sans)",
                    backgroundColor: '#354336',
                    color: '#FFFFFF',
                    borderRadius: '999px',
                    padding: '6px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.02em'
                  }}
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Studios */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: '15px', fontWeight: 700, color: '#21201E', minWidth: '90px' }}>
              Studios
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {studioBadges.map((studio) => (
                <span
                  key={studio}
                  style={{
                    fontFamily: "var(--font-sans)",
                    backgroundColor: '#21201E',
                    color: '#FFFFFF',
                    borderRadius: '999px',
                    padding: '6px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.02em'
                  }}
                >
                  {studio}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Full Width Hero Photo Banner */}
      <section className="teacher-hero-banner" style={{ width: '100%', height: '540px', overflow: 'hidden', backgroundColor: '#354336', position: 'relative' }}>
        <img
          src={bgImage}
          alt={teacher.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 25%',
            display: 'block'
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(53,67,54,0.4) 100%)'
          }}
        />
      </section>

      {/* Quote & Biography Section */}
      <section
        className="teacher-bio-section"
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '80px 32px'
        }}
      >
        {/* About Instructor Heading */}
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 'clamp(28px, 3.5vw, 42px)',
            fontWeight: 400,
            color: '#21201E',
            margin: '0 0 20px 0',
            letterSpacing: '-0.01em'
          }}
        >
          About {teacher.name}
        </h2>

        {/* Bio Text in Neue Montreal Font with Read More / Read Less Toggle */}
        <div style={{ marginBottom: '48px' }}>
          <p
            className="teacher-bio-desc"
            style={{
              fontFamily: "'Neue Montreal', -apple-system, sans-serif",
              fontSize: '16px',
              color: '#5A554F',
              lineHeight: 1.75,
              margin: '0 0 12px 0'
            }}
          >
            {displayBio}
          </p>

          {shouldTruncateBio && (
            <button
              onClick={() => setIsBioExpanded(!isBioExpanded)}
              style={{
                background: 'none',
                border: 'none',
                color: '#944426',
                fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                padding: '4px 0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'underline'
              }}
            >
              <span>{isBioExpanded ? 'Read Less' : 'Read More'}</span>
              <span style={{ fontSize: '11px' }}>{isBioExpanded ? '▲' : '▼'}</span>
            </button>
          )}
        </div>

        {/* Qualifications Collapsible Accordion Box */}
        <div
          style={{
            border: '1px solid rgba(148, 68, 38, 0.18)',
            borderRadius: '20px',
            overflow: 'hidden',
            backgroundColor: '#EAE1D3',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
          }}
        >
          <button
            onClick={() => setQualificationsOpen(!qualificationsOpen)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '28px 32px',
              backgroundColor: '#EAE1D3',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <h3 style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '24px', fontWeight: 700, color: '#21201E', margin: 0 }}>
              Qualifications
            </h3>
            {qualificationsOpen ? <Minus size={22} color="#944426" /> : <Plus size={22} color="#944426" />}
          </button>

          {qualificationsOpen && (
            <div style={{ padding: '0 32px 28px 32px', borderTop: '1px solid rgba(148, 68, 38, 0.12)' }}>
              <ul style={{ margin: '16px 0 0 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {qualifications.map((q, i) => (
                  <li key={i} style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '15px', color: '#5A554F', lineHeight: 1.6 }}>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Classes Timetable Section */}
      <section
        className="teacher-timetable-section"
        style={{
          backgroundColor: '#EAE1D3',
          padding: '80px 32px',
          borderTop: '1px solid rgba(39, 39, 39, 0.08)'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 400,
              color: '#21201E',
              margin: '0 0 28px 0'
            }}
          >
            Classes Timetable
          </h2>

          {/* Clean Modern Filter Bar (Location Removed) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontFamily: "var(--font-sans)",
              marginBottom: '36px',
              paddingBottom: '20px',
              borderBottom: '1px solid rgba(39, 39, 39, 0.12)',
              flexWrap: 'wrap',
              position: 'relative'
            }}
          >
            {/* Active Teacher Pill Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#944426',
                color: '#FFFFFF',
                borderRadius: '999px',
                padding: '8px 18px',
                fontSize: '13.5px',
                fontWeight: 700,
                letterSpacing: '0.02em',
                boxShadow: '0 2px 8px rgba(148, 68, 38, 0.2)'
              }}
            >
              <Check size={14} color="#FFFFFF" />
              <span>Instructor: {teacher.name.split(' ')[0]}</span>
            </div>

            {/* Interactive Class Type Dropdown Pill */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setClassDropdownOpen(!classDropdownOpen)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  color: selectedClassFilter !== 'All' ? '#944426' : '#21201E',
                  border: selectedClassFilter !== 'All' ? '1px solid #944426' : '1px solid rgba(39, 39, 39, 0.18)',
                  borderRadius: '999px',
                  padding: '8px 18px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Filter size={14} color={selectedClassFilter !== 'All' ? '#944426' : '#21201E'} />
                <span>Class: {selectedClassFilter === 'All' ? 'All Classes' : selectedClassFilter}</span>
                <ChevronDown size={14} color="#21201E" />
              </button>

              {/* Dropdown Menu */}
              {classDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    zIndex: 50,
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '8px',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
                    minWidth: '200px',
                    border: '1px solid rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <button
                    onClick={() => {
                      setSelectedClassFilter('All');
                      setClassDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: selectedClassFilter === 'All' ? 'rgba(148, 68, 38, 0.08)' : 'transparent',
                      color: selectedClassFilter === 'All' ? '#944426' : '#21201E',
                      fontWeight: selectedClassFilter === 'All' ? 800 : 600,
                      fontSize: '13.5px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    All Classes
                  </button>

                  {availableClassTitles.map((cTitle) => (
                    <button
                      key={cTitle}
                      onClick={() => {
                        setSelectedClassFilter(cTitle);
                        setClassDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: selectedClassFilter === cTitle ? 'rgba(148, 68, 38, 0.08)' : 'transparent',
                        color: selectedClassFilter === cTitle ? '#944426' : '#21201E',
                        fontWeight: selectedClassFilter === cTitle ? 800 : 600,
                        fontSize: '13.5px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {cTitle}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Filter button if class is selected */}
            {selectedClassFilter !== 'All' && (
              <button
                onClick={() => setSelectedClassFilter('All')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#944426',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '4px 8px'
                }}
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Loading Indicator */}
          {loadingSchedule ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#944426' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block' }} />
              <span style={{ fontFamily: "var(--font-sans)", fontSize: '14px', color: '#7A756F' }}>Loading live class timetable...</span>
            </div>
          ) : (
            /* Horizontal Day Cards Carousel Grid */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '20px'
              }}
            >
              {daysList.map((dayItem, dIdx) => {
                const dayAllClasses = dailySchedules[dayItem.apiDateStr] || [];
                // Filter classes taught by this instructor and matching selected class
                const teacherClasses = dayAllClasses.filter((c) => {
                  const matchInst = isTeacherMatch(teacher.name, c.instructor);
                  const matchClass = selectedClassFilter === 'All' || c.title?.toLowerCase().includes(selectedClassFilter.toLowerCase());
                  return matchInst && matchClass;
                });
                const displayClass = teacherClasses.length > 0 ? teacherClasses[0] : null;
                const hasClass = Boolean(displayClass);

                return (
                  <div
                    key={dIdx}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '20px',
                      padding: '28px 24px',
                      minHeight: '230px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                      transition: 'all 0.25s ease'
                    }}
                    className="teacher-day-card"
                  >
                    {/* Top Day Info */}
                    <div>
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: '12px', fontWeight: 700, color: '#7A756F', marginBottom: '2px' }}>
                        {dayItem.dateFormatted}
                      </div>
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: '24px', fontWeight: 800, color: '#21201E', textTransform: 'uppercase', marginBottom: '16px' }}>
                        {dayItem.dayName}
                      </div>
                    </div>

                    {/* Middle / Bottom Content */}
                    {hasClass && displayClass ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                          <img
                            src={bgImage}
                            alt={teacher.name}
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                          <div>
                            <div style={{ fontFamily: "var(--font-sans)", fontSize: '15px', fontWeight: 800, color: '#21201E', lineHeight: 1.2 }}>
                              {displayClass.title || 'Hatha Yoga'}
                            </div>
                            <div style={{ fontFamily: "var(--font-sans)", fontSize: '12px', color: '#7A756F', fontWeight: 600, marginTop: '2px' }}>
                              {displayClass.timing || '09:00 AM (60 mins)'}
                            </div>
                          </div>
                        </div>

                        <div style={{ fontFamily: "var(--font-sans)", fontSize: '12px', color: '#7A756F', marginBottom: '16px' }}>
                          {displayClass.instructor || teacher.name} • {displayClass.room || 'Woo House'}
                        </div>

                        <button
                          onClick={() => onOpenBooking('class', displayClass.title || 'Yoga Class', displayClass)}
                          style={{
                            width: '100%',
                            backgroundColor: '#354336',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '999px',
                            padding: '10px 0',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#944426';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#354336';
                          }}
                        >
                          Book Class
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: '13.5px', color: '#8A8580', fontWeight: 500, padding: '16px 0' }}>
                        No Classes Available..
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Hover & Mobile Responsive CSS */}
      <style>{`
        .teacher-day-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08) !important;
        }
        @media (max-width: 768px) {
          .teacher-top-section {
            padding: 104px 20px 24px 20px !important;
          }
          .teacher-back-btn {
            margin-bottom: 20px !important;
          }
          .teacher-detail-name {
            font-size: 36px !important;
            margin-bottom: 20px !important;
            line-height: 1.1 !important;
          }
          .teacher-meta-wrapper {
            gap: 12px !important;
          }
          .teacher-hero-banner {
            height: 320px !important;
            border-radius: 16px !important;
            margin: 0 20px !important;
            width: calc(100% - 40px) !important;
          }
          .teacher-bio-section {
            padding: 40px 20px !important;
          }
          .teacher-bio-desc {
            font-size: 15px !important;
            line-height: 1.65 !important;
            margin-bottom: 32px !important;
          }
          .teacher-timetable-section {
            padding: 48px 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TeacherDetailPage;
