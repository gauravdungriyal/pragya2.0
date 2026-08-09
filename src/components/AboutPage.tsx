import React, { useEffect, useState, useRef } from 'react';
import { 
  Check, 
  ArrowRight, 
  Sparkles, 
  Compass, 
  Eye, 
  BookOpen, 
  Microscope, 
  Flame, 
  Activity, 
  Target, 
  Sun,
  HeartPulse,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getTeachers, getScheduleByDate, getUpcomingEvents } from '../services/api';

interface AboutPageProps {
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenBooking, onNavigateSection }) => {
  const benefits = [
    'Enhances flexibility, strength, and joint mobility',
    'Improves circulation and subtle energy flow',
    'Promotes deep cellular relaxation and stress relief',
    'Increases mindfulness and bodily self-awareness',
    'Balances the nervous system for better sleep and calmness'
  ];

  const defaultInstructors = [
    {
      name: 'Master Aarya Kuldeep',
      role: 'Founder & PhD Research Scholar',
      avatar: 'https://pragya-yog.com/uploads/teachers/1744359416.webp'
    },
    {
      name: 'Angela Lee',
      role: 'Senior Vinyasa & Pilates Master',
      avatar: 'https://pragya-yog.com/uploads/teachers/1744359563.webp'
    },
    {
      name: 'Master Shoaib M',
      role: 'Master Yoga Therapist & Neuropathy',
      avatar: '/shoaib.webp'
    },
    {
      name: 'Charlotte Chiu',
      role: 'Sound Healing & Yin Yoga Guide',
      avatar: 'https://pragya-yog.com/uploads/teachers/1744359589.webp'
    },
    {
      name: 'Ashish P',
      role: 'Senior Yog & Alignment Specialist',
      avatar: 'https://pragya-yog.com/uploads/teachers/1768183299.webp'
    },
    {
      name: 'Louise Vance',
      role: 'Holistic Movement & Yin-Yang Specialist',
      avatar: 'https://pragya-yog.com/uploads/teachers/1779244503.webp'
    },
    {
      name: 'Marcus Chan',
      role: 'Mindfulness & Tibetan Sound Healer',
      avatar: 'https://pragya-yog.com/uploads/teachers/1779244590.webp'
    },
    {
      name: 'Dr. Yatendra Amoli',
      role: 'Director of Teaching & Research Scholar',
      avatar: 'https://pragya-yog.com/uploads/teachers/1781458525.webp'
    }
  ];

  const [instructors, setInstructors] = useState(defaultInstructors);

  const locationImages = [
    {
      url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1200&auto=format&fit=crop',
      title: 'Central Studio Sanctuary',
      subtitle: 'Sheung Wan, Central • Hong Kong'
    },
    {
      url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
      title: 'Oceanfront Reset Lawn',
      subtitle: 'Repulse Bay • Hong Kong'
    },
    {
      url: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=80&w=1200&auto=format&fit=crop',
      title: 'Pokhara Mountain Retreat Center',
      subtitle: 'Annapurna Range • Nepal'
    },
    {
      url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop',
      title: 'Pragya Academy Center',
      subtitle: 'Kowloon Bay • Hong Kong'
    }
  ];

  const [currentLocationIdx, setCurrentLocationIdx] = useState(0);

  const handleNextLocation = () => {
    setCurrentLocationIdx((prev) => (prev + 1) % locationImages.length);
  };

  const handlePrevLocation = () => {
    setCurrentLocationIdx((prev) => (prev - 1 + locationImages.length) % locationImages.length);
  };

  const defaultClassStyles = [
    {
      title: 'Classical Hatha Alignment',
      subtitle: 'Awaken vital energy through traditional posture holds and breath awareness.',
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1200&auto=format&fit=crop',
      tag: 'CLASSICAL HATHA ALIGNMENT'
    },
    {
      title: 'Mindful Vinyasa Flow',
      subtitle: 'Fluid movement synchronized with dynamic breath to build stamina and strength.',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
      tag: 'DYNAMIC VINYASA FLOW'
    },
    {
      title: 'Restorative Yin Yoga',
      subtitle: 'Deep cellular relaxation and joint release through prolonged supported postures.',
      image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=80&w=1200&auto=format&fit=crop',
      tag: 'YIN & RESTORATIVE YOG'
    },
    {
      title: 'Himalayan Pranayama & Sound',
      subtitle: 'Reset the central nervous system with acoustic singing bowls and ancient pranayama.',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop',
      tag: 'SOUND IMMERSION & BREATH'
    },
    {
      title: 'Ashtanga Primary Series',
      subtitle: 'Structured meditative series focusing on core vitality, bandhas, and drishti gaze.',
      image: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=1200&auto=format&fit=crop',
      tag: 'ASHTANGA YOGA PRACTICE'
    }
  ];

  const [classStylesList, setClassStylesList] = useState(defaultClassStyles);

  const toOneLineDesc = (text: string) => {
    if (!text) return 'Guided by Pragya Yog certified faculty for holistic transformation.';
    const cleaned = text
      .replace(/<[^>]*>?/gm, '')
      .replace(/&ndash;/g, '–')
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .trim();
    const firstSentence = cleaned.split('.')[0].trim();
    if (firstSentence && firstSentence.length <= 110 && firstSentence.length >= 20) {
      return firstSentence + '.';
    }
    if (cleaned.length > 90) {
      return cleaned.slice(0, 90).trim() + '...';
    }
    return cleaned;
  };

  useEffect(() => {
    let isMounted = true;
    getScheduleByDate().then((schedData) => {
      if (!isMounted) return;
      if (schedData && Array.isArray(schedData.schedules) && schedData.schedules.length > 0) {
        const realClasses = schedData.schedules.map((item: any, idx: number) => ({
          title: item.title || item.name || defaultClassStyles[idx % defaultClassStyles.length].title,
          subtitle: toOneLineDesc(item.description || defaultClassStyles[idx % defaultClassStyles.length].subtitle),
          image: defaultClassStyles[idx % defaultClassStyles.length].image,
          tag: item.levels ? `${item.levels.toUpperCase()} · CLASS` : 'REGULAR STUDIO CLASS'
        }));
        if (realClasses.length > 0) {
          setClassStylesList(realClasses);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const quadrupledClassStyles = [...classStylesList, ...classStylesList, ...classStylesList, ...classStylesList];
  const classScrollRef = useRef<HTMLDivElement>(null);
  const [isClassCarouselHovered, setIsClassCarouselHovered] = useState(false);

  useEffect(() => {
    const container = classScrollRef.current;
    if (!container) return;

    let animationFrameId: number;
    const speed = 0.75;

    const animateScroll = () => {
      if (!isClassCarouselHovered && container) {
        container.scrollLeft += speed;
        const singleSetWidth = container.scrollWidth / 4;
        if (singleSetWidth > 0) {
          if (container.scrollLeft >= singleSetWidth * 2) {
            container.scrollLeft -= singleSetWidth;
          }
        }
      }
      animationFrameId = requestAnimationFrame(animateScroll);
    };

    animationFrameId = requestAnimationFrame(animateScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isClassCarouselHovered, classStylesList.length]);

  useEffect(() => {
    getTeachers().then((data) => {
      if (data && data.length > 0) {
        const mapped = data.map((t) => ({
          name: t.name,
          role: t.designation || 'Yog Instructor',
          avatar: t.image || defaultInstructors[0].avatar
        }));
        setInstructors(mapped);
      }
    });
  }, []);

  const elements = [
    {
      title: 'Holistic Well-being',
      description: 'Embracing the ancient wisdom and practices of yog to nurture holistic well-being.',
      icon: Sparkles,
      color: '#944426'
    },
    {
      title: 'Harmony',
      description: 'Bridging mind, body, and spirit for a harmonious and balanced life.',
      icon: Compass,
      color: '#9D9D48'
    },
    {
      title: 'Self-Discovery',
      description: 'Encouraging self-exploration and mindfulness to awaken your true potential.',
      icon: Eye,
      color: '#944426'
    },
    {
      title: 'Continuous Growth',
      description: 'Fostering continuous learning and personal development through yogic practices.',
      icon: BookOpen,
      color: '#9D9D48'
    }
  ];

  const pillars = [
    {
      tag: 'BODY & MIND ACCURACY',
      title: 'Biomechanical Precision',
      description: 'Every posture is taught with deep anatomical awareness and alignment to ensure maximum safety, physical longevity, and joint protection.',
      icon: Microscope,
      badgeColor: '#944426',
      bgColor: '#FFFFFF'
    },
    {
      tag: 'ANCIENT LINEAGE',
      title: 'Traditional Roots',
      description: 'We preserve the sacred integrity of traditional Hatha & Ashtanga Vinyasa yoga while adapting practices to modern lifestyle needs.',
      icon: Flame,
      badgeColor: '#00381F',
      bgColor: '#FFFFFF'
    },
    {
      tag: 'AUTONOMIC HEALING',
      title: 'Nervous System Regulation',
      description: 'Integrating targeted pranayama breathwork and restorative sound baths to lower cortisol, calm autonomic arousal, and restore deep sleep.',
      icon: HeartPulse,
      badgeColor: '#D9AE29',
      bgColor: '#FFFFFF'
    },
    {
      tag: 'COMMUNITY & GUIDANCE',
      title: 'Personalized Mentorship',
      description: 'Small class sizes ensure every practitioner receives individualized feedback, hands-on adjustments, and continuous guidance.',
      icon: Activity,
      badgeColor: '#944426',
      bgColor: '#FFFFFF'
    },
    {
      tag: 'PURPOSE & PASSION',
      title: 'Our Mission',
      description: 'To guide you to embrace conscious living through the transformative power of yog by igniting your passion and curiosity for yog and let you experience the wisdom of yog and harness the transformative energy of yog for vitality.',
      icon: Sun,
      badgeColor: '#00381F',
      bgColor: '#FFFFFF'
    },
    {
      tag: 'SCIENCE MEETS SPIRITUALITY',
      title: 'Our Goal',
      description: 'We aim at being the most comprehensive and authentic yog institute where science meets spirituality.',
      icon: Target,
      badgeColor: '#D9AE29',
      bgColor: '#FFFFFF'
    }
  ];

  return (
    <div className="about-page-wrapper" style={{ backgroundColor: '#F5EFE5', minHeight: '100vh', color: '#21201E', paddingBottom: 0 }}>
      
      {/* Top Section Header: Title & Subtitle */}
      <section className="about-top-section">
        <div className="about-top-container">
          {/* Title: Brand Name with Bold Sans + Italic Serif Brand Fonts */}
          <h1 className="about-hero-title">
            Pragya <span className="title-serif-italic">Yog School</span>
          </h1>

          {/* Subtitle */}
          <p className="about-hero-subtitle">
            A meditative practice of stillness and deep stretches designed to release tension, restore balance, and calm the mind.
          </p>

          {/* Full-Width Featured Image */}
          <div className="about-hero-img-box">
            <img
              src="/about.png"
              alt="Yin Yoga practitioner in serene pose at Pragya Yog School"
              className="about-hero-img"
            />
          </div>
        </div>
      </section>

      {/* 2-Column Main Layout Section */}
      <section className="about-main-section">
        <div className="about-content-grid">
          
          {/* Left Column: About the Class & Benefit */}
          <div className="about-left-col">
            {/* About Pragya Yog School */}
            <div className="about-block">
              <h2 className="block-title">About Pragya Yog School</h2>
              <p className="block-desc">
                Pragya Yog School is a holistic sanctuary dedicated to traditional Hatha, Ashtanga, Yin Yoga, and therapeutic sound healing. Guided by ancient lineage and modern physiological science, our sanctuary empowers students to cultivate awareness, deepen their practice, and experience true mind-body harmony.
              </p>
            </div>

            {/* Benefit List */}
            <div className="benefit-block">
              <h2 className="block-title">Benefit</h2>

              <ul className="benefit-list">
                {benefits.map((item, idx) => (
                  <li key={idx} className="benefit-item">
                    <div className="check-badge">
                      <Check size={13} color="#21201E" strokeWidth={2.5} />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Spec Key Details Card Box */}
          <div className="about-spec-card">
            <div className="spec-table-grid">
              <div className="spec-label">Level</div>
              <div className="spec-value">All Levels</div>

              <div className="spec-label">Schedule</div>
              <div className="spec-value">Mon – Sun • Daily Sessions</div>

              <div className="spec-label">Duration</div>
              <div className="spec-value">60 – 90 minutes</div>

              <div className="spec-label">Type</div>
              <div className="spec-value">Classical Hatha, Vinyasa Flow, Yin Yoga, Ashtanga, Pranayama & Sound Healing, Reformer Pilates</div>

              <div className="spec-label label-instructors">Instructors</div>
              <div className="instructors-pills-list">
                {instructors.map((instructor, idx) => (
                  <div key={idx} className="instructor-pill">
                    <img src={instructor.avatar} alt={instructor.name} className="instructor-avatar" />
                    <span className="instructor-name">{instructor.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => {
                if (onNavigateSection) {
                  onNavigateSection('classes');
                } else {
                  onOpenBooking('class', 'Book a Class Now');
                }
              }}
              className="about-book-btn"
            >
              <span>Book a Class Now</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 2: Our Elements */}
      <section className="about-elements-section">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.14em',
              color: '#944426',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '10px'
            }}
          >
            — CORE VALUES —
          </span>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 'clamp(28px, 3.8vw, 42px)',
              fontWeight: 400,
              color: '#21201E',
              margin: 0,
              lineHeight: 1.15
            }}
          >
            Guided by Wisdom & Purpose
          </h2>
        </div>

        <div className="elements-grid">
          {elements.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} className="element-card">
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#EAE1D3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    color: item.color
                  }}
                >
                  <IconComponent size={22} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#21201E', marginBottom: '10px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#6B655F', lineHeight: 1.6, margin: 0 }}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: Pillars & Philosophy Grid */}
      <section className="about-pillars-section">
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 48px auto' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.14em',
              color: '#00381F',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '10px'
            }}
          >
            — OUR FOUNDATION —
          </span>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 'clamp(28px, 3.8vw, 42px)',
              fontWeight: 400,
              color: '#21201E',
              margin: 0,
              lineHeight: 1.15
            }}
          >
            Pillars of Pragya Sanctuary
          </h2>
        </div>

        <div className="pillars-grid">
          {pillars.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} className="pillar-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 500,
                      letterSpacing: '0.12em',
                      color: item.badgeColor,
                      textTransform: 'uppercase'
                    }}
                  >
                    {item.tag}
                  </span>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#F5EFE5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.badgeColor
                    }}
                  >
                    <IconComponent size={18} />
                  </div>
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: 500, color: '#21201E', marginBottom: '12px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '14.5px', color: '#5A554F', lineHeight: 1.6, margin: 0 }}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: Connect With Our Instructors (Matching Reference Image 1-to-1) */}
      <section
        className="about-instructors-feature-section"
        style={{
          backgroundColor: '#FFFFFF',
          padding: '100px 32px 120px 32px',
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
        }}
      >
        <div
          className="about-instructors-grid"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1.15fr',
            gap: '64px',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Headline, Sub-tag, Plus List & Action Link */}
          <div>
            <span
              style={{
                fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                fontSize: '11.5px',
                fontWeight: 800,
                letterSpacing: '0.14em',
                color: '#944426',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '14px'
              }}
            >
              CONNECT WITH OUR INSTRUCTORS
            </span>

            <h2
              style={{
                fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                fontSize: 'clamp(32px, 4.2vw, 52px)',
                fontWeight: 700,
                color: '#21201E',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                margin: '0 0 36px 0'
              }}
            >
              Meet our Master<br />Yogic Instructors
            </h2>

            {/* Accordion / Plus Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '44px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '20px', fontWeight: 600, color: '#21201E' }}>+</span>
                <span style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '15.5px', fontWeight: 700, color: '#21201E' }}>
                  Traditional Himalayan Lineage & Philosophy
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '20px', fontWeight: 600, color: '#21201E' }}>+</span>
                <span style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '15.5px', fontWeight: 700, color: '#21201E' }}>
                  Serene Sanctuary & Oceanfront Resets
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '20px', fontWeight: 600, color: '#21201E' }}>+</span>
                <span style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '15.5px', fontWeight: 700, color: '#21201E' }}>
                  World-Class Instructors, Real Results
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '20px', fontWeight: 600, color: '#21201E' }}>+</span>
                <span style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '15.5px', fontWeight: 700, color: '#21201E' }}>
                  360° Wellness & Sound Immersion Lifestyle
                </span>
              </div>
            </div>

            {/* Bottom CTA Action Link */}
            <button
              onClick={() => {
                if (onNavigateSection) onNavigateSection('teachers');
                else onOpenBooking('teacher');
              }}
              style={{
                fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#21201E',
                backgroundColor: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                textTransform: 'uppercase'
              }}
            >
              <span>BROWSE YOGIC INSTRUCTORS</span>
              <ArrowRight size={16} color="#944426" />
            </button>
          </div>

          {/* Right Column: Dynamic Photo Box with Overlapping Stat Badges */}
          <div style={{ position: 'relative', width: '100%' }}>
            {/* Main Instructor Photo Box */}
            <div
              style={{
                width: '100%',
                height: '460px',
                borderRadius: '24px',
                overflow: 'hidden',
                backgroundColor: '#F5EFE5',
                position: 'relative',
                boxShadow: '0 12px 36px rgba(33, 32, 30, 0.08)'
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1200&auto=format&fit=crop"
                alt="Master Yoga Instructor at Pragya Yog School"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
              />
            </div>

            {/* Overlapping Stat Badges Overlay Grid (Matching Reference Screenshot) */}
            <div
              className="about-stat-badges-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                maxWidth: '440px',
                position: 'absolute',
                bottom: '-40px',
                left: '24px',
                zIndex: 2
              }}
            >
              {/* Stat Badge 1: Terracotta Accent (#944426) */}
              <div
                style={{
                  backgroundColor: '#944426',
                  color: '#FFFFFF',
                  padding: '24px 22px',
                  borderRadius: '16px',
                  boxShadow: '0 12px 28px rgba(148, 68, 38, 0.25)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Sparkles size={20} color="#FFFFFF" />
                  <span style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '32px', fontWeight: 800, lineHeight: 1 }}>
                    15+
                  </span>
                </div>
                <span style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '13px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.95)', display: 'block', lineHeight: 1.3 }}>
                  Master Instructors
                </span>
              </div>

              {/* Stat Badge 2: Dark Charcoal Accent (#21201E) */}
              <div
                style={{
                  backgroundColor: '#21201E',
                  color: '#FFFFFF',
                  padding: '24px 22px',
                  borderRadius: '16px',
                  boxShadow: '0 12px 28px rgba(33, 32, 30, 0.25)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Compass size={20} color="#FFFFFF" />
                  <span style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '32px', fontWeight: 800, lineHeight: 1 }}>
                    50+
                  </span>
                </div>
                <span style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '13px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.95)', display: 'block', lineHeight: 1.3 }}>
                  Curated Class Types
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 5: Discover Our Locations (Matching Reference Screenshot 1-to-1) */}
      <section
        className="about-locations-section"
        style={{
          backgroundColor: '#F5EFE5',
          padding: '96px 32px'
        }}
      >
        <div
          className="about-locations-grid"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1.15fr',
            gap: '64px',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Location Photo Carousel with Controls Below (Matching Reference Layout) */}
          <div>
            <div
              style={{
                width: '100%',
                height: '420px',
                borderRadius: '20px',
                overflow: 'hidden',
                backgroundColor: '#21201E',
                position: 'relative',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.06)'
              }}
            >
              <img
                src={locationImages[currentLocationIdx].url}
                alt={locationImages[currentLocationIdx].title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  transition: 'opacity 0.4s ease'
                }}
              />

              {/* Location Badge Tag */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  backgroundColor: 'rgba(33, 32, 30, 0.85)',
                  color: '#FFFFFF',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  borderRadius: '999px',
                  padding: '6px 16px',
                  fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                  fontSize: '12.5px',
                  fontWeight: 700
                }}
              >
                {locationImages[currentLocationIdx].title} ({locationImages[currentLocationIdx].subtitle})
              </div>
            </div>

            {/* Carousel Controls Row Below Image (1-to-1 matching Reference Screenshot) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '16px',
                padding: '0 4px'
              }}
            >
              {/* Left Counter Indicator: e.g. 1 — 4 */}
              <div style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '14px', fontWeight: 600, color: '#6B655F' }}>
                <span>{currentLocationIdx + 1}</span>
                <span style={{ margin: '0 8px', opacity: 0.5 }}>—</span>
                <span>{locationImages.length}</span>
              </div>

              {/* Right Navigation Arrow Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={handlePrevLocation}
                  aria-label="Previous location"
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#21201E',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  <ChevronLeft size={20} color="#21201E" />
                </button>

                <button
                  onClick={handleNextLocation}
                  aria-label="Next location"
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#21201E',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  <ChevronRight size={20} color="#21201E" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Subtitle, Main Headline & 2-Column Location List */}
          <div>
            <span
              style={{
                fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                fontSize: '11.5px',
                fontWeight: 800,
                letterSpacing: '0.14em',
                color: '#944426',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '14px'
              }}
            >
              EXPLORE OUR SANCTUARY LOCATIONS
            </span>

            <h2
              style={{
                fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                fontSize: 'clamp(32px, 4.2vw, 52px)',
                fontWeight: 700,
                color: '#21201E',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                margin: '0 0 24px 0'
              }}
            >
              Discover Our Locations
            </h2>

            {/* Light horizontal divider line matching reference */}
            <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(33, 32, 30, 0.15)', marginBottom: '32px' }} />

            {/* 2-Column Location Bullet Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 32px' }}>
              <div>
                <h4 style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '15px', fontWeight: 800, color: '#21201E', margin: '0 0 4px 0' }}>
                  Central Studio Sanctuary
                </h4>
                <span style={{ fontSize: '13px', color: '#6B655F' }}>Sheung Wan, Central HK</span>
              </div>

              <div>
                <h4 style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '15px', fontWeight: 800, color: '#21201E', margin: '0 0 4px 0' }}>
                  Oceanfront Reset Lawn
                </h4>
                <span style={{ fontSize: '13px', color: '#6B655F' }}>Repulse Bay Beach, HK</span>
              </div>

              <div>
                <h4 style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '15px', fontWeight: 800, color: '#21201E', margin: '0 0 4px 0' }}>
                  Pokhara Mountain Base
                </h4>
                <span style={{ fontSize: '13px', color: '#6B655F' }}>Annapurna Range, Nepal</span>
              </div>

              <div>
                <h4 style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '15px', fontWeight: 800, color: '#21201E', margin: '0 0 4px 0' }}>
                  Pragya Academy Center
                </h4>
                <span style={{ fontSize: '13px', color: '#6B655F' }}>Kowloon Bay, Hong Kong</span>
              </div>

              <div>
                <h4 style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '15px', fontWeight: 800, color: '#21201E', margin: '0 0 4px 0' }}>
                  Private Wellness Suites
                </h4>
                <span style={{ fontSize: '13px', color: '#6B655F' }}>Victoria Harbour View</span>
              </div>

              <div>
                <h4 style={{ fontFamily: "'Neue Montreal', -apple-system, sans-serif", fontSize: '15px', fontWeight: 800, color: '#21201E', margin: '0 0 4px 0' }}>
                  Hydrotherapy & Sound Deck
                </h4>
                <span style={{ fontSize: '13px', color: '#6B655F' }}>Main Sanctuary Center</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 6: Explore Classes (Infinite Automatic Horizontal Carousel matching Reference Screenshot) */}
      <section className="about-explore-classes-section">
        {/* Header Block */}
        <div className="about-explore-classes-header">
          <span className="about-explore-classes-tag">
            DISCOVER YOUR YOGA STYLE
          </span>

          <h2 className="about-explore-classes-title">
            Explore Classes
          </h2>

          <p className="about-explore-classes-desc">
            Whatever your intention or level, Pragya Yog School offers a variety of classes to give you the ultimate yoga experience.
          </p>
        </div>

        {/* Automatic Infinite Horizontal Carousel Track */}
        <div
          ref={classScrollRef}
          className="about-explore-classes-track"
          onMouseEnter={() => setIsClassCarouselHovered(true)}
          onMouseLeave={() => setIsClassCarouselHovered(false)}
          onTouchStart={() => setIsClassCarouselHovered(true)}
          onTouchEnd={() => setIsClassCarouselHovered(false)}
        >
          <div style={{ display: 'flex', width: 'max-content' }}>
            {quadrupledClassStyles.map((item, idx) => (
              <div
                key={idx}
                className="explore-class-card"
                onClick={() => {
                  if (onNavigateSection) {
                    onNavigateSection('classes');
                  } else {
                    onOpenBooking('class', item.title);
                  }
                }}
              >
                {/* Background Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="explore-class-card-img"
                />

                {/* Dark Gradient Overlay for High Contrast Text (Matching Reference Image) */}
                <div className="explore-class-card-overlay">
                  <span className="explore-class-card-tag">
                    {item.tag}
                  </span>

                  <h3 className="explore-class-card-title">
                    {item.title}
                  </h3>

                  <p className="explore-class-card-subtitle">
                    {item.subtitle}
                  </p>

                  <div className="explore-class-card-btn">
                    <span>BOOK NOW</span>
                    <ArrowRight size={15} color="#FFFFFF" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner with Rich Serene Background Image */}
      <section className="about-bottom-cta">
        <div className="about-bottom-cta-overlay" />
        <div className="about-bottom-cta-content">
          <h2 className="cta-heading">
            Ready to <span className="cta-italic">Embrace</span><br />Stillness?
          </h2>
          <p className="cta-subtext">
            Join Pragya Yog School and experience the deep release, calm, and balance your body and mind deserve.
          </p>

          <button
            onClick={() => {
              if (onNavigateSection) {
                onNavigateSection('classes');
              } else {
                onOpenBooking('class', 'Book Your Spot - Pragya Yog School');
              }
            }}
            className="cta-book-btn"
          >
            <span>Book Your Spot</span>
          </button>
        </div>
      </section>

      {/* Component Styles & Mobile Responsive Specs Matching Reference Screenshot */}
      <style>{`
        .about-top-section {
          max-width: 1280px;
          margin: 0 auto;
          padding: 130px 32px 32px 32px;
        }
        .about-hero-title {
          font-family: 'Neue Montreal', -apple-system, sans-serif;
          font-size: clamp(38px, 5.5vw, 64px);
          font-weight: 700;
          color: #21201E;
          line-height: 1.08;
          margin: 0 0 16px 0;
          letter-spacing: -0.02em;
        }
        .title-serif-italic {
          font-family: var(--font-serif);
          font-style: italic;
          font-weight: 400;
        }
        .about-hero-subtitle {
          font-family: var(--font-sans);
          font-size: 16px;
          color: #6B655F;
          line-height: 1.6;
          margin: 0 0 32px 0;
          max-width: 620px;
        }
        .about-hero-img-box {
          width: 100%;
          height: clamp(260px, 42vw, 500px);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 12px 36px rgba(33, 32, 30, 0.08);
          margin-bottom: 48px;
        }
        .about-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 35%;
          display: block;
        }
        .about-main-section {
          max-width: 1280px;
          margin: 0 auto 84px auto;
          padding: 0 32px;
        }
        .about-content-grid {
          display: grid;
          gridTemplateColumns: 1fr 380px;
          gap: 64px;
          align-items: start;
        }
        .block-title {
          font-family: var(--font-serif);
          font-size: 28px;
          font-weight: 400;
          color: #21201E;
          margin: 0 0 16px 0;
          letter-spacing: -0.01em;
        }
        .block-desc {
          font-family: var(--font-sans);
          font-size: 15.5px;
          color: #5A554F;
          line-height: 1.7;
          margin: 0 0 40px 0;
          max-width: 720px;
        }
        .benefit-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .benefit-item {
          display: flex;
          align-items: center;
          gap: 14px;
          font-family: var(--font-sans);
          font-size: 15px;
          color: #4A4540;
          line-height: 1.4;
        }
        .check-badge {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #EAE1D3;
          border: 1px solid rgba(33, 32, 30, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .about-spec-card {
          background-color: #EAE1D3;
          border-radius: 20px;
          padding: 36px 32px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .spec-table-grid {
          display: grid;
          grid-template-columns: 100px 1fr;
          row-gap: 20px;
          align-items: center;
        }
        .spec-label {
          font-size: 14px;
          color: #7A756F;
          font-weight: 500;
        }
        .label-coaches, .label-instructors {
          align-self: start;
          padding-top: 6px;
        }
        .spec-value {
          font-size: 15px;
          font-weight: 500;
          color: #21201E;
        }
        .coaches-pills-list, .instructors-pills-list {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 8px 10px;
          align-items: center;
          max-width: 100%;
        }
        .coach-pill, .instructor-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: #FFFFFF;
          border-radius: 999px;
          padding: 4px 14px 4px 4px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .coach-pill:hover, .instructor-pill:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
        }
        .coach-avatar, .instructor-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }
        .coach-name, .instructor-name {
          font-size: 13.5px;
          font-weight: 500;
          color: #21201E;
        }
        .about-book-btn {
          margin-top: 12px;
          width: 100%;
          background-color: #21201E;
          color: #FFFFFF;
          border: none;
          border-radius: 999px;
          padding: 14px 24px;
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .about-book-btn:hover {
          background-color: #944426;
          transform: translateY(-1px);
        }
        .about-elements-section {
          max-width: 1280px;
          margin: 0 auto 96px auto;
          padding: 0 32px;
        }
        .elements-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .element-card {
          background-color: #EAE1D3;
          border-radius: 20px;
          padding: 32px 24px;
          transition: all 0.3s ease;
        }
        .about-pillars-section {
          max-width: 1280px;
          margin: 0 auto 96px auto;
          padding: 0 32px;
        }
        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .pillar-card {
          background-color: #FFFFFF;
          border-radius: 20px;
          padding: 36px 28px;
          border: 1px solid rgba(33, 32, 30, 0.08);
          transition: all 0.3s ease;
        }

        /* SECTION 6: Explore Classes Responsive Styles */
        .about-explore-classes-section {
          background-color: #FFFFFF;
          padding: 96px 0 100px 0;
          overflow: hidden;
        }
        .about-explore-classes-header {
          max-width: 1280px;
          margin: 0 auto 44px auto;
          padding: 0 32px;
        }
        .about-explore-classes-tag {
          font-family: 'Neue Montreal', -apple-system, sans-serif;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.14em;
          color: #944426;
          text-transform: uppercase;
          display: block;
          margin-bottom: 10px;
        }
        .about-explore-classes-title {
          font-family: 'Neue Montreal', -apple-system, sans-serif;
          font-size: clamp(30px, 4.5vw, 56px);
          font-weight: 700;
          color: #21201E;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0 0 14px 0;
        }
        .about-explore-classes-desc {
          font-family: 'Neue Montreal', -apple-system, sans-serif;
          font-size: 15px;
          color: #6B655F;
          line-height: 1.6;
          margin: 0;
          max-width: 600px;
        }
        .about-explore-classes-track {
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
          padding: 12px 0 24px 0;
        }
        .about-explore-classes-track::-webkit-scrollbar {
          display: none;
        }
        .explore-class-card {
          width: 580px;
          height: 380px;
          flex-shrink: 0;
          margin-right: 24px;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }
        .explore-class-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.14);
        }
        .explore-class-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }
        .explore-class-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.3) 55%, transparent 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 36px;
        }
        .explore-class-card-tag {
          font-family: 'Neue Montreal', -apple-system, sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.85);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .explore-class-card-title {
          font-family: 'Neue Montreal', -apple-system, sans-serif;
          font-size: 36px;
          font-weight: 700;
          color: #FFFFFF;
          line-height: 1.15;
          margin: 0 0 10px 0;
          letter-spacing: -0.01em;
        }
        .explore-class-card-subtitle {
          font-family: 'Neue Montreal', -apple-system, sans-serif;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.88);
          line-height: 1.5;
          margin: 0 0 20px 0;
          max-width: 480px;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .explore-class-card-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Neue Montreal', -apple-system, sans-serif;
          font-size: 12.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #FFFFFF;
          text-transform: uppercase;
        }

        .about-bottom-cta {
          position: relative;
          background-image: url('https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1600&auto=format&fit=crop');
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          padding: 120px 32px;
          margin-top: 0;
          overflow: hidden;
        }
        .about-bottom-cta-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(20, 18, 16, 0.42) 0%, rgba(255, 255, 255, 0.22) 42%, rgba(255, 255, 255, 0.82) 78%, #FFFFFF 100%);
          z-index: 1;
        }
        .about-bottom-cta-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 720px;
          margin: 0 auto;
        }
        .cta-heading {
          font-family: 'Neue Montreal', -apple-system, sans-serif;
          font-size: clamp(38px, 5.2vw, 62px);
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 20px;
          line-height: 1.15;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }
        .cta-italic {
          font-family: var(--font-serif);
          font-style: italic;
          font-weight: 400;
        }
        .cta-subtext {
          font-size: 16px;
          color: #21201E;
          font-weight: 500;
          max-width: 580px;
          margin: 0 auto 36px auto;
          line-height: 1.6;
          font-family: 'Neue Montreal', -apple-system, sans-serif;
        }
        .cta-book-btn {
          background-color: #21201E;
          color: #FFFFFF;
          border: none;
          border-radius: 999px;
          padding: 16px 42px;
          font-size: 14.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(33, 32, 30, 0.2);
          transition: all 0.25s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .cta-book-btn:hover {
          background-color: #000000;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
        }

        /* Mobile View - Premium Responsive Layout matching Yog Sanctuary aesthetics */
        @media (max-width: 768px) {
          .about-top-section {
            padding: 104px 20px 20px 20px !important;
          }
          .about-hero-title {
            font-size: 40px !important;
            margin-bottom: 14px !important;
          }
          .about-hero-subtitle {
            font-size: 14.5px !important;
            margin-bottom: 24px !important;
            line-height: 1.55 !important;
            color: #6B655F !important;
          }
          .about-hero-img-box {
            height: 230px !important;
            border-radius: 12px !important;
            margin-bottom: 32px !important;
          }
          .about-main-section {
            padding: 0 20px !important;
            margin-bottom: 56px !important;
          }
          .about-content-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .block-title {
            font-size: 22px !important;
            margin-bottom: 12px !important;
          }
          .block-desc {
            font-size: 14px !important;
            line-height: 1.6 !important;
            margin-bottom: 32px !important;
          }
          .benefit-list {
            gap: 14px !important;
          }
          .benefit-item {
            font-size: 13.5px !important;
          }
          .about-spec-card {
            padding: 24px 20px !important;
            border-radius: 18px !important;
            background-color: #EAE4D9 !important;
            margin-top: 12px !important;
          }
          .spec-table-grid {
            grid-template-columns: 90px 1fr !important;
            row-gap: 18px !important;
          }
          .spec-label {
            font-size: 13.5px !important;
          }
          .spec-value {
            font-size: 14px !important;
          }
          .coaches-pills-list, .instructors-pills-list {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 6px 8px !important;
            align-items: center !important;
          }
          .coach-pill, .instructor-pill {
            padding: 3px 10px 3px 3px !important;
          }
          .coach-avatar, .instructor-avatar {
            width: 22px !important;
            height: 22px !important;
          }
          .coach-name, .instructor-name {
            font-size: 12.5px !important;
          }
          .about-elements-section, .about-pillars-section {
            padding: 0 20px !important;
            margin-bottom: 56px !important;
          }
          .elements-grid, .pillars-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .element-card {
            padding: 24px 20px !important;
            border-radius: 18px !important;
          }
          .pillar-card {
            padding: 24px 20px !important;
            border-radius: 18px !important;
          }
          .pillar-card h3 {
            font-size: 18px !important;
            margin-bottom: 8px !important;
          }
          .pillar-card p {
            font-size: 13.5px !important;
            line-height: 1.55 !important;
          }
          .about-bottom-cta {
            padding: 56px 20px !important;
            margin-top: 0 !important;
          }
          .about-bottom-cta h2 {
            font-size: 32px !important;
            line-height: 1.15 !important;
            margin-bottom: 16px !important;
          }
          .about-bottom-cta p {
            font-size: 14px !important;
            line-height: 1.55 !important;
            margin-bottom: 28px !important;
          }
          .cta-book-btn {
            width: 100% !important;
            padding: 16px 24px !important;
            font-size: 14px !important;
          }
          @media (max-width: 900px) {
            .about-instructors-feature-section {
              padding: 60px 20px 80px 20px !important;
            }
            .about-instructors-grid {
              grid-template-columns: 1fr !important;
              gap: 40px !important;
            }
            .about-stat-badges-row {
              position: static !important;
              max-width: 100% !important;
              margin-top: 16px !important;
            }
            .about-locations-section {
              padding: 60px 20px !important;
            }
            .about-locations-grid {
              grid-template-columns: 1fr !important;
              gap: 40px !important;
            }
            .about-explore-classes-section {
              padding: 60px 0 70px 0 !important;
            }
          }

          @media (max-width: 1024px) {
            .explore-class-card {
              width: 440px !important;
              height: 340px !important;
              margin-right: 20px !important;
              border-radius: 18px !important;
            }
            .explore-class-card-overlay {
              padding: 26px !important;
            }
            .explore-class-card-title {
              font-size: 28px !important;
            }
          }

          @media (max-width: 768px) {
            .about-explore-classes-section {
              padding: 48px 0 56px 0 !important;
            }
            .about-explore-classes-header {
              padding: 0 20px !important;
              margin-bottom: 24px !important;
            }
            .about-explore-classes-desc {
              font-size: 14px !important;
            }
            .explore-class-card {
              width: min(84vw, 340px) !important;
              height: 320px !important;
              margin-right: 16px !important;
              border-radius: 16px !important;
            }
            .explore-class-card-overlay {
              padding: 22px 20px !important;
            }
            .explore-class-card-tag {
              font-size: 10px !important;
              margin-bottom: 6px !important;
            }
            .explore-class-card-title {
              font-size: 23px !important;
              margin-bottom: 6px !important;
            }
            .explore-class-card-subtitle {
              font-size: 13px !important;
              margin-bottom: 14px !important;
            }
            .explore-class-card-btn {
              font-size: 11.5px !important;
            }
          }

          @media (max-width: 480px) {
            .about-explore-classes-header {
              padding: 0 16px !important;
            }
            .explore-class-card {
              width: calc(88vw - 12px) !important;
              max-width: 320px !important;
              height: 290px !important;
              margin-right: 12px !important;
              border-radius: 14px !important;
            }
            .explore-class-card-overlay {
              padding: 18px 16px !important;
            }
            .explore-class-card-title {
              font-size: 21px !important;
            }
          }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
