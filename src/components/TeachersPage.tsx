import React, { useEffect, useState } from 'react';
import { getTeachers } from '../services/api';
import { Instructor } from '../types';
import { RefreshCw, ArrowUpRight, Sparkles, Heart, Award } from 'lucide-react';

interface TeachersPageProps {
  onOpenTeacherModal: (teacher: Instructor) => void;
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const TeachersPage: React.FC<TeachersPageProps> = ({ onOpenTeacherModal, onOpenBooking }) => {
  const [teachers, setTeachers] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fallback high quality instructor profiles matching the reference image layout
  const fallbackTeachers: (Instructor & { image: string; tag: string })[] = [
    {
      staff_id: 360610,
      name: "Master Aarya Kuldeep",
      designation: "Founder & PhD Research Scholar",
      description: "Aarya, founder of Pragya Yog School, is a PhD research scholar and seasoned yog teacher with nearly a decade of international teaching experience. His passion for yog began at age three and integrates ancient wisdom with modern physiological science.",
      specialization: ["Classical Hatha", "Pranayama & Kriya", "Meditation Science"],
      image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800&auto=format&fit=crop",
      tag: "Classical Hatha, Pranayama"
    },
    {
      staff_id: 360637,
      name: "Angela Lee",
      designation: "Senior Vinyasa & Pilates Master",
      description: "Angela brings high-energy grace to mindful movement. Her classes combine dynamic Vinyasa sequencing with postural alignment and restorative Breathwork.",
      specialization: ["Dynamic Vinyasa", "Reformer Pilates", "Postural Realignment"],
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
      tag: "Vinyasa Flow, Power Yoga"
    },
    {
      staff_id: 360735,
      name: "Charlotte Chiu",
      designation: "Sound Healing & Yin Yoga Guide",
      description: "Charlotte specializes in immersive acoustic meditation using Tibetan Singing Bowls and Gongs, coupled with deep restorative Yin practices.",
      specialization: ["Yin Yoga", "Sound Therapy", "Stress Recovery"],
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
      tag: "Yin Yoga, Mindfulness Practices"
    },
    {
      staff_id: 360801,
      name: "Louise Vance",
      designation: "Holistic Nutrition & Movement Specialist",
      description: "Louise integrates mindful functional movement with customized Ayurvedic and modern nutritional counseling for total mind-body vitality.",
      specialization: ["Functional Yoga", "Ayurvedic Nutrition", "Metabolic Health"],
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
      tag: "Gentle Yoga, Breathwork"
    }
  ];

  const teacherImages = [
    "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop"
  ];

  useEffect(() => {
    let isMounted = true;
    getTeachers().then((data) => {
      if (!isMounted) return;
      if (Array.isArray(data) && data.length > 0) {
        setTeachers(data);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const displayList = (teachers.length > 0 ? teachers : fallbackTeachers).map((t, idx) => ({
    ...t,
    image: (t as any).image || teacherImages[idx % teacherImages.length],
    tag: (t as any).tag || (t.specialization ? t.specialization.join(', ') : 'Yoga & Mindfulness')
  }));

  return (
    <div style={{ backgroundColor: '#F5EFE5', minHeight: '100vh', color: '#21201E' }}>
      {/* Top Banner */}
      <section
        style={{
          backgroundColor: '#F5EFE5',
          color: '#21201E',
          padding: '140px 32px 64px 32px',
          textAlign: 'center'
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1
            style={{
              fontFamily: "'Neue Montreal', -apple-system, sans-serif",
              fontSize: 'clamp(44px, 6.5vw, 76px)',
              fontWeight: 700,
              color: '#21201E',
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              margin: '0 0 16px 0'
            }}
          >
            Your Yoga{' '}
            <span
              style={{
                fontFamily: "'BNCringeSerif', 'Canela', Georgia, serif",
                fontStyle: 'italic',
                fontWeight: 400,
                color: '#21201E'
              }}
            >
              Guides
            </span>
          </h1>
          <p
            style={{
              fontFamily: "'Neue Montreal', -apple-system, sans-serif",
              fontSize: '16.5px',
              color: '#6B655F',
              lineHeight: 1.6,
              margin: 0
            }}
          >
            Guided by expertise and compassion, our team is here to support your journey at every step
          </p>
        </div>
      </section>

      {/* Main Content: Teachers Card Grid */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '80px 32px 100px 32px'
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#944426' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', display: 'block' }} />
            <p style={{ color: '#8A8580' }}>Loading master faculty profiles...</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '40px'
            }}
          >
            {displayList.map((teacher) => (
              <div
                key={teacher.staff_id}
                onClick={() => onOpenTeacherModal(teacher)}
                className="teacher-guide-card"
                style={{
                  backgroundColor: '#EAE1D3',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Image Container */}
                <div
                  style={{
                    height: '380px',
                    width: '100%',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <img
                    src={teacher.image}
                    alt={teacher.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.5s ease'
                    }}
                    className="teacher-card-img"
                  />

                  {/* Gradient Shadow Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.15) 100%)'
                    }}
                  />
                </div>

                {/* Floating White Label Box (Matching Reference UI) */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '18px',
                    padding: '22px 24px',
                    margin: '-48px 16px 16px 16px',
                    position: 'relative',
                    zIndex: 2,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                    transition: 'transform 0.3s ease'
                  }}
                  className="teacher-floating-label"
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: '21px',
                      fontWeight: 700,
                      color: '#21201E',
                      margin: '0 0 6px 0',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {teacher.name}
                  </h3>

                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: '13.5px',
                      color: '#6B655F',
                      margin: 0,
                      lineHeight: 1.45,
                      fontWeight: 500
                    }}
                  >
                    {teacher.tag || teacher.designation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pre-Footer Banner: Meet & Practice with Our Faculty */}
      <section
        style={{
          width: '100%',
          marginBottom: 0,
          position: 'relative',
          minHeight: '440px',
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
            backgroundImage: `url('https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            zIndex: 0
          }}
        />

        {/* Soft Warm Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(245, 239, 229, 0.96) 0%, rgba(245, 239, 229, 0.85) 45%, rgba(245, 239, 229, 0.2) 100%)',
            zIndex: 1
          }}
        />

        {/* Content Container */}
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
          <div style={{ maxWidth: '540px' }}>
            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 'clamp(36px, 4.5vw, 52px)',
                fontWeight: 700,
                color: '#21201E',
                margin: '0 0 16px 0',
                lineHeight: 1.15,
                letterSpacing: '-0.02em'
              }}
            >
              Practice with Master Teachers
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
              Book 1-on-1 private sessions or join group classes guided by Pragya Yog School's internationally certified faculty.
            </p>

            <button
              onClick={() => onOpenBooking('private', 'Private Session with Faculty')}
              style={{
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
              Book Private Session
            </button>
          </div>
        </div>
      </section>

      {/* Hover & Responsive CSS */}
      <style>{`
        .teacher-guide-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08) !important;
          background-color: #E6DDD0 !important;
        }
        .teacher-guide-card:hover .teacher-card-img {
          transform: scale(1.05);
        }
        .teacher-guide-card:hover .teacher-floating-label {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12) !important;
        }
      `}</style>
    </div>
  );
};

export default TeachersPage;
