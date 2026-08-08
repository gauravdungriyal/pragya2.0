import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Minus, Calendar, Clock, MapPin, User, RefreshCw, Filter, ChevronDown, Check, Globe, Maximize2, Award, Star, ArrowRight, X } from 'lucide-react';
import { Instructor, ClassScheduleItem } from '../types';
import { getScheduleByDate } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface TeacherDetailPageProps {
  teacher: Instructor;
  onBack: () => void;
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
}

export const TeacherDetailPage: React.FC<TeacherDetailPageProps> = ({ teacher, onBack, onOpenBooking }) => {
  const { user } = useAuth();
  const [qualificationsOpen, setQualificationsOpen] = useState<boolean>(false);
  const [dailySchedules, setDailySchedules] = useState<Record<string, ClassScheduleItem[]>>({});
  const [loadingSchedule, setLoadingSchedule] = useState<boolean>(true);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('All');
  const [classDropdownOpen, setClassDropdownOpen] = useState<boolean>(false);
  const [isBioExpanded, setIsBioExpanded] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

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

  // Master schedule catalog fallback to ensure teacher timetable is always populated matching main schedule
  const masterFallbackSchedules: ClassScheduleItem[] = [
    {
      id: "101",
      schedule_id: "25493",
      title: "Gentle Yoga & Pranayama",
      date: "Today",
      instructor: "Master Aarya",
      color: "#944426",
      timing: "07:00 AM - 08:00 AM",
      book_limit: "20",
      booked: 14,
      levels: "Beginner",
      completed: "0",
      credit: "1",
      book_cost: "$25",
      is_booked: false,
      showButton: "true",
      buttonType: "book",
      booking_id: "",
      description: "Awaken bodily energy through gentle postures and breathwork.",
      video: "",
      duration: "60",
      room: "Woo House"
    },
    {
      id: "102",
      schedule_id: "25494",
      title: "Vinyasa Flow",
      date: "Today",
      instructor: "Angela Lee",
      color: "#620513",
      timing: "09:00 AM - 10:15 AM",
      book_limit: "18",
      booked: 12,
      levels: "Intermediate",
      completed: "0",
      credit: "1",
      book_cost: "$25",
      is_booked: false,
      showButton: "true",
      buttonType: "book",
      booking_id: "",
      description: "Fluid movement synchronized with dynamic breath.",
      video: "",
      duration: "75",
      room: "Woo House"
    },
    {
      id: "103",
      schedule_id: "25495",
      title: "Hatha Yoga",
      date: "Today",
      instructor: "Charlotte Chiu",
      color: "#9D9D48",
      timing: "11:00 AM - 12:00 PM",
      book_limit: "15",
      booked: 9,
      levels: "All Levels",
      completed: "0",
      credit: "1",
      book_cost: "$25",
      is_booked: false,
      showButton: "true",
      buttonType: "book",
      booking_id: "",
      description: "Traditional Hatha yoga postures with focus on alignment.",
      video: "",
      duration: "60",
      room: "Woo House"
    },
    {
      id: "104",
      schedule_id: "25496",
      title: "Yin Yoga",
      date: "Today",
      instructor: "Angela Lee",
      color: "#00381F",
      timing: "02:00 PM - 03:00 PM",
      book_limit: "20",
      booked: 15,
      levels: "All Levels",
      completed: "0",
      credit: "1",
      book_cost: "$25",
      is_booked: false,
      showButton: "true",
      buttonType: "book",
      booking_id: "",
      description: "Deep restorative holding postures for joint flexibility.",
      video: "",
      duration: "60",
      room: "Woo House"
    },
    {
      id: "105",
      schedule_id: "25497",
      title: "Power Yoga",
      date: "Today",
      instructor: "Charlotte Chiu",
      color: "#354336",
      timing: "05:30 PM - 06:45 PM",
      book_limit: "20",
      booked: 16,
      levels: "Advanced",
      completed: "0",
      credit: "1",
      book_cost: "$25",
      is_booked: false,
      showButton: "true",
      buttonType: "book",
      booking_id: "",
      description: "Vigorous fitness-based yoga flow for core strength.",
      video: "",
      duration: "75",
      room: "Woo House"
    },
    {
      id: "106",
      schedule_id: "25498",
      title: "Restorative Yoga & Meditation",
      date: "Today",
      instructor: "Master Aarya",
      color: "#944426",
      timing: "07:15 PM - 08:15 PM",
      book_limit: "20",
      booked: 15,
      levels: "All Levels",
      completed: "0",
      credit: "1",
      book_cost: "$25",
      is_booked: false,
      showButton: "true",
      buttonType: "book",
      booking_id: "",
      description: "Relaxing evening postures and guided meditation.",
      video: "",
      duration: "60",
      room: "Woo House"
    },
    {
      id: "107",
      schedule_id: "25499",
      title: "Kundalini Kriya & Breathwork",
      date: "Today",
      instructor: "Shoaib",
      color: "#620513",
      timing: "06:00 AM - 07:15 AM",
      book_limit: "15",
      booked: 10,
      levels: "All Levels",
      completed: "0",
      credit: "1",
      book_cost: "$25",
      is_booked: false,
      showButton: "true",
      buttonType: "book",
      booking_id: "",
      description: "Dynamic Kundalini breath exercises and subtle energy awakening.",
      video: "",
      duration: "75",
      room: "Woo House"
    }
  ];

  // Check if instructor matches current teacher
  const isTeacherMatch = (tName: string, instName: string) => {
    if (!instName || !tName) return false;
    const tLower = tName.toLowerCase();
    const iLower = instName.toLowerCase();
    const tTokens = tLower.split(' ').filter((x) => x.length > 2 && x !== 'master');
    const iTokens = iLower.split(' ').filter((x) => x.length > 2 && x !== 'master');
    const tokenMatch = tTokens.some((t) => iTokens.some((i) => i.includes(t) || t.includes(i)));
    return tokenMatch || iLower.includes(tLower) || tLower.includes(iLower);
  };

  useEffect(() => {
    let isMounted = true;
    setLoadingSchedule(true);

    const instructorIdStr = (teacher as any).staff_id || (teacher as any).id ? String((teacher as any).staff_id || (teacher as any).id) : undefined;
    const token = user?.access_token;

    const promises = daysList.map((d) =>
      getScheduleByDate(d.isoDateStr, instructorIdStr, token).then((res) => ({
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
  }, [teacher.name, teacher.staff_id, (teacher as any).id, user?.access_token]);

  // Extract unique class titles for filter dropdown from active schedule or master fallbacks
  const allFetchedSchedules = Object.values(dailySchedules).flat();
  const activeSchedulesForFilter = allFetchedSchedules.length > 0 ? allFetchedSchedules : masterFallbackSchedules;

  const availableClassTitles = Array.from(
    new Set(
      activeSchedulesForFilter
        .filter((c) => isTeacherMatch(teacher.name, c.instructor) ||
          (teacher.staff_id && String(c.instructor) === String(teacher.staff_id)) ||
          ((teacher as any).id && String(c.instructor) === String((teacher as any).id)))
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

  // Bug 6 fix: derive qualifications from actual teacher data instead of hardcoding
  const qualifications: string[] = [];
  if (teacher.experience) qualifications.push(teacher.experience);
  if (teacher.specialization && teacher.specialization.length > 0) {
    teacher.specialization.forEach(s => qualifications.push(s));
  }
  // Fallback if teacher has no structured data
  if (qualifications.length === 0) {
    qualifications.push('Certified Yoga Alliance Instructor');
    qualifications.push('Experienced Mindfulness & Meditation Guide');
  }

  // Bug 7 fix: derive studio and language badges from teacher fields, not hardcoded
  const studioBadges = (teacher as any).studios ? (teacher as any).studios : ['Woo House'];
  const teacherLangs: string[] = (teacher as any).languages
    ? (teacher as any).languages
    : (teacher.name?.toLowerCase().includes('aarya') || teacher.name?.toLowerCase().includes('shoaib')
      ? ['English', 'Hindi', 'Sanskrit']
      : ['English']);
  const languageBadges = teacherLangs;

  return (
    <div style={{ backgroundColor: '#F5EFE5', minHeight: '100vh', color: '#21201E' }}>
      {/* Integrated Split Hero Section */}
      <section
        className="teacher-hero-split-section"
        style={{
          padding: '120px 32px 48px 32px',
          maxWidth: '1280px',
          margin: '0 auto'
        }}
      >
        <div
          className="teacher-hero-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Teacher Details & Metadata & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Back Button */}
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
                alignSelf: 'flex-start',
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

            {/* Role & Verification Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  backgroundColor: 'rgba(148, 68, 38, 0.12)',
                  color: '#944426',
                  borderRadius: '999px',
                  padding: '6px 16px',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                {teacher.designation || 'Master Faculty'}
              </span>
              {(teacher.experience || qualifications.length > 0) && (
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    backgroundColor: '#354336',
                    color: '#FFFFFF',
                    borderRadius: '999px',
                    padding: '6px 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.04em'
                  }}
                >
                  {teacher.experience || 'Verified Instructor'}
                </span>
              )}
            </div>

            {/* Display Name */}
            <h1
              className="teacher-detail-name"
              style={{
                fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                fontSize: 'clamp(40px, 5.5vw, 68px)',
                fontWeight: 700,
                color: '#21201E',
                letterSpacing: '-0.02em',
                margin: 0,
                lineHeight: 1.05
              }}
            >
              {teacher.name}
            </h1>

            {/* Specialization Tags Row */}
            {teacher.specialization && teacher.specialization.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {teacher.specialization.map((spec) => (
                  <span
                    key={spec}
                    style={{
                      fontFamily: "var(--font-sans)",
                      backgroundColor: '#EAE1D3',
                      border: '1px solid rgba(148, 68, 38, 0.2)',
                      color: '#21201E',
                      borderRadius: '8px',
                      padding: '4px 12px',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}

            {/* Metadata Rows: Languages & Studios */}
            <div
              className="teacher-meta-wrapper"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                backgroundColor: '#EAE1D3',
                padding: '20px 24px',
                borderRadius: '18px',
                border: '1px solid rgba(148, 68, 38, 0.12)'
              }}
            >
              {/* Languages */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '95px' }}>
                  <Globe size={16} color="#944426" />
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: '14px', fontWeight: 700, color: '#21201E' }}>
                    Language
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {languageBadges.map((lang) => (
                    <span
                      key={lang}
                      style={{
                        fontFamily: "var(--font-sans)",
                        backgroundColor: '#354336',
                        color: '#FFFFFF',
                        borderRadius: '999px',
                        padding: '4px 14px',
                        fontSize: '12.5px',
                        fontWeight: 700
                      }}
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Studios */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '95px' }}>
                  <MapPin size={16} color="#944426" />
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: '14px', fontWeight: 700, color: '#21201E' }}>
                    Studios
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {studioBadges.map((studio: string) => (
                    <span
                      key={studio}
                      style={{
                        fontFamily: "var(--font-sans)",
                        backgroundColor: '#21201E',
                        color: '#FFFFFF',
                        borderRadius: '999px',
                        padding: '4px 14px',
                        fontSize: '12.5px',
                        fontWeight: 700
                      }}
                    >
                      {studio}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Action CTA Buttons */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '6px' }}>
              <button
                onClick={() => onOpenBooking('private', `1-on-1 Session with ${teacher.name}`)}
                style={{
                  backgroundColor: '#944426',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '14px 28px',
                  fontFamily: "var(--font-sans)",
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(148, 68, 38, 0.25)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#7a361e';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#944426';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>Book 1-on-1 Session</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => {
                  const scheduleElem = document.querySelector('.teacher-timetable-section');
                  scheduleElem?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  backgroundColor: 'transparent',
                  color: '#21201E',
                  border: '1px solid rgba(33, 32, 30, 0.25)',
                  borderRadius: '999px',
                  padding: '14px 24px',
                  fontFamily: "var(--font-sans)",
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(33, 32, 30, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Calendar size={16} />
                <span>View Class Schedule</span>
              </button>
            </div>
          </div>

          {/* Right Column: High-End Framed Portrait Card with Ambient Glow */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            {/* Ambient Background Radial Glow */}
            <div
              style={{
                position: 'absolute',
                inset: '-20px',
                background: 'radial-gradient(circle, rgba(148, 68, 38, 0.18) 0%, rgba(53, 67, 54, 0.12) 60%, transparent 100%)',
                filter: 'blur(28px)',
                borderRadius: '40px',
                pointerEvents: 'none',
                zIndex: 0
              }}
            />

            {/* Framed Portrait Card Container */}
            <div
              className="teacher-portrait-card"
              onClick={() => setIsLightboxOpen(true)}
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: '460px',
                height: '520px',
                borderRadius: '28px',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.12), 0 4px 12px rgba(148, 68, 38, 0.08)',
                border: '4px solid #FAF6F0',
                backgroundColor: '#354336',
                cursor: 'pointer',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), boxShadow 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.015) translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 28px 60px rgba(0,0,0,0.18), 0 8px 24px rgba(148, 68, 38, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.12), 0 4px 12px rgba(148, 68, 38, 0.08)';
              }}
            >
              {/* Portrait Image */}
              <img
                src={bgImage}
                alt={teacher.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 20%',
                  display: 'block'
                }}
              />

              {/* Bottom Subtle Gradient for Text Contrast */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.65) 100%)',
                  pointerEvents: 'none'
                }}
              />

              {/* Expand Photo Lightbox Badge (Top Right) */}
              <button
                aria-label="View photo in full screen"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(8px)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#21201E',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'transform 0.2s ease, backgroundColor 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.88)';
                }}
              >
                <Maximize2 size={18} />
              </button>

              {/* Glassmorphic Floating Badges (Bottom Overlay) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  right: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                {/* Badge 1: Verification / Experience */}
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.88)',
                    backdropFilter: 'blur(12px)',
                    padding: '8px 16px',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
                  }}
                >
                  <Award size={16} color="#944426" />
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#21201E',
                      letterSpacing: '0.02em'
                    }}
                  >
                    Pragya Master Faculty
                  </span>
                </div>

                {/* Badge 2: Star Rating */}
                <div
                  style={{
                    backgroundColor: 'rgba(35, 43, 38, 0.85)',
                    backdropFilter: 'blur(12px)',
                    padding: '8px 14px',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
                  }}
                >
                  <Star size={14} color="#F59E0B" fill="#F59E0B" />
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: '12.5px',
                      fontWeight: 700
                    }}
                  >
                    5.0 ★
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal for Photo */}
      {isLightboxOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(12px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '800px',
              maxHeight: '90vh',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)'
            }}
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={20} />
            </button>

            <img
              src={bgImage}
              alt={teacher.name}
              style={{
                width: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                display: 'block'
              }}
            />

            <div
              style={{
                backgroundColor: '#21201E',
                color: '#FFFFFF',
                padding: '16px 24px',
                fontFamily: "var(--font-sans)",
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '16px' }}>{teacher.name}</span>
              <span style={{ fontSize: '13px', color: '#A09D98' }}>{teacher.designation || 'Master Instructor'}</span>
            </div>
          </div>
        </div>
      )}

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
                const rawDayClasses = dailySchedules[dayItem.apiDateStr] || [];
                const dayAllClasses = rawDayClasses.length > 0 ? rawDayClasses : masterFallbackSchedules;
                // Filter classes taught by this instructor and matching selected class
                const teacherClasses = dayAllClasses.filter((c) => {
                  const matchInst = isTeacherMatch(teacher.name, c.instructor) ||
                    (teacher.staff_id && String(c.instructor) === String(teacher.staff_id)) ||
                    ((teacher as any).id && String(c.instructor) === String((teacher as any).id));
                  const matchClass = selectedClassFilter === 'All' || c.title?.toLowerCase().includes(selectedClassFilter.toLowerCase());
                  return matchInst && matchClass;
                });
                // Bug 8 fix: show ALL classes this teacher has that day, not just the first one
                const hasClass = teacherClasses.length > 0;

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

                    {/* Bug 8 fix: render ALL classes for this day, each with its own Book button */}
                    {hasClass ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {teacherClasses.map((cls, cIdx) => (
                          <div key={cIdx}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                              <img
                                src={bgImage}
                                alt={teacher.name}
                                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                              />
                              <div>
                                <div style={{ fontFamily: "var(--font-sans)", fontSize: '14px', fontWeight: 800, color: '#21201E', lineHeight: 1.2 }}>
                                  {cls.title || 'Hatha Yoga'}
                                </div>
                                <div style={{ fontFamily: "var(--font-sans)", fontSize: '11.5px', color: '#7A756F', fontWeight: 600, marginTop: '2px' }}>
                                  {cls.timing || '09:00 AM'} · {cls.room || 'Main Studio'}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => onOpenBooking('class', cls.title || 'Yoga Class', cls)}
                              style={{
                                width: '100%',
                                backgroundColor: '#354336',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '999px',
                                padding: '9px 0',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#944426'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#354336'; }}
                            >
                              Book Class
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Bug 24 fix: correct the double-dot typo
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: '13.5px', color: '#8A8580', fontWeight: 500, padding: '16px 0' }}>
                        No classes scheduled.
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
        @media (max-width: 900px) {
          .teacher-hero-split-section {
            padding: 104px 20px 36px 20px !important;
          }
          .teacher-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .teacher-portrait-card {
            height: 420px !important;
            max-width: 100% !important;
          }
          .teacher-detail-name {
            font-size: 38px !important;
            line-height: 1.1 !important;
          }
          .teacher-bio-section {
            padding: 40px 20px !important;
          }
          .teacher-bio-desc {
            font-size: 15px !important;
            line-height: 1.65 !important;
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
