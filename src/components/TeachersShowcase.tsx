import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, RefreshCw } from 'lucide-react';
import { getTeachers } from '../services/api';
import { Instructor } from '../types';

interface TeachersShowcaseProps {
  onOpenTeacherModal: (teacher: Instructor) => void;
}

export const TeachersShowcase: React.FC<TeachersShowcaseProps> = ({ onOpenTeacherModal }) => {
  const [teachers, setTeachers] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    getTeachers().then((data) => {
      setTeachers(data);
      setLoading(false);
    });
  }, []);

  const teacherImages = [
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop", // Master Aarya
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop", // Angela
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop", // Charlotte
    "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800&auto=format&fit=crop"  // Louise
  ];

  const handleNext = () => {
    if (teachers.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % teachers.length);
  };

  const handlePrev = () => {
    if (teachers.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + teachers.length) % teachers.length);
  };

  return (
    <section
      id="teachers"
      className="reveal-on-scroll"
      style={{
        position: 'relative',
        backgroundColor: '#FFFFFF',
        padding: '90px 0 80px 0',
        overflow: 'hidden',
        color: '#21201E'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 32px',
          position: 'relative',
          zIndex: 5
        }}
      >
        {/* Top Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px auto' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: '#6B655F',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '12px'
            }}
          >
            — INSTRUCTORS —
          </span>
          <h2
            style={{
              fontFamily: "'BNCringeSerif', 'Canela', Georgia, serif",
              fontSize: 'clamp(32px, 4.2vw, 56px)',
              fontWeight: 400,
              color: '#21201E',
              lineHeight: 1.15,
              marginBottom: '12px'
            }}
          >
            Guided by Passion and Purpose
          </h2>
          <p style={{ fontFamily: "'Neue Montreal', sans-serif", fontSize: '15px', color: '#757069', lineHeight: 1.6 }}>
            Passionate teachers guiding your journey with care.
          </p>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#944426' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', display: 'block' }} />
            <p style={{ color: '#8A8580' }}>Loading our master faculty...</p>
          </div>
        ) : teachers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#8A8580' }}>
            <p>Faculty profiles are currently unavailable.</p>
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', minHeight: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* Ambient Radial Soft Glow Behind Watermark */}
            <div
              style={{
                position: 'absolute',
                top: '48%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(640px, 90vw)',
                height: '320px',
                background: 'radial-gradient(circle, rgba(148, 68, 38, 0.07) 0%, rgba(245, 239, 229, 0) 70%)',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 0
              }}
            />

            {/* Watermark Left - EXPERT */}
            <div
              aria-hidden="true"
              className="watermark-left"
              style={{
                position: 'absolute',
                top: '44%',
                right: 'calc(50% + 195px)',
                transform: 'translateY(-50%)',
                fontSize: 'clamp(36px, 6vw, 96px)',
                fontWeight: 500,
                fontFamily: "var(--font-serif)",
                letterSpacing: '0.08em',
                color: 'rgba(33, 32, 30, 0.06)',
                WebkitTextStroke: '1.5px rgba(33, 32, 30, 0.28)',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 1
              }}
            >
              EXPERT
            </div>

            {/* Watermark Right - FACULTY */}
            <div
              aria-hidden="true"
              className="watermark-right"
              style={{
                position: 'absolute',
                top: '44%',
                left: 'calc(50% + 195px)',
                transform: 'translateY(-50%)',
                fontSize: 'clamp(36px, 6vw, 96px)',
                fontWeight: 500,
                fontFamily: "var(--font-serif)",
                letterSpacing: '0.08em',
                color: 'rgba(33, 32, 30, 0.06)',
                WebkitTextStroke: '1.5px rgba(33, 32, 30, 0.28)',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 1
              }}
            >
              FACULTY
            </div>

            {/* Stacked Card Deck */}
            <div
              className="teachers-card-deck"
              style={{
                position: 'relative',
                width: '320px',
                height: '400px',
                zIndex: 10,
                margin: '0 auto 40px auto'
              }}
            >
              {teachers.map((teacher, idx) => {
                const total = teachers.length;
                const offset = (idx - activeIndex + total) % total;

                // Only render active card and next 2 stacked cards behind
                if (offset > 2 && offset < total - 1) return null;

                const imgSrc = teacherImages[idx % teacherImages.length];

                let transform = 'translate(-50%, -50%) scale(1)';
                let zIndex = 10;
                let opacity = 1;

                if (offset === 0) {
                  // Active Front Card
                  transform = 'translate(-50%, -50%) rotate(0deg) scale(1)';
                  zIndex = 10;
                  opacity = 1;
                } else if (offset === 1) {
                  // Stacked Card 1 Behind
                  transform = 'translate(-44%, -46%) rotate(7deg) scale(0.94)';
                  zIndex = 8;
                  opacity = 0.9;
                } else if (offset === 2) {
                  // Stacked Card 2 Behind
                  transform = 'translate(-56%, -44%) rotate(-9deg) scale(0.88)';
                  zIndex = 6;
                  opacity = 0.75;
                } else if (offset === total - 1) {
                  // Previous Stacked Card
                  transform = 'translate(-58%, -48%) rotate(-6deg) scale(0.92)';
                  zIndex = 7;
                  opacity = 0.85;
                }

                return (
                  <div
                    key={teacher.staff_id || teacher.name}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '310px',
                      height: '390px',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      backgroundColor: '#FFFFFF',
                      boxShadow: offset === 0 ? '0 20px 45px rgba(33, 32, 30, 0.16)' : '0 10px 25px rgba(33, 32, 30, 0.08)',
                      transform,
                      zIndex,
                      opacity,
                      transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      cursor: offset === 0 ? 'pointer' : 'default'
                    }}
                    onClick={() => {
                      if (offset === 0) onOpenTeacherModal(teacher);
                    }}
                  >
                    {/* Background Image */}
                    <img
                      src={imgSrc}
                      alt={teacher.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />

                    {/* Gradient Overlay for Text Visibility */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 40%, rgba(0, 0, 0, 0.75) 100%)'
                      }}
                    />

                    {/* Top Right Floating '+' Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenTeacherModal(teacher);
                      }}
                      aria-label={`View ${teacher.name} profile`}
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#21201E',
                        color: '#FFFFFF',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                        transition: 'transform 0.2s ease',
                        zIndex: 12
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <Plus size={20} />
                    </button>

                    {/* Bottom Teacher Info Overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '24px',
                        left: '24px',
                        right: '24px',
                        color: '#FFFFFF',
                        zIndex: 11
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: '22px',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          marginBottom: '4px',
                          lineHeight: 1.2
                        }}
                      >
                        {teacher.name}
                      </h3>
                      <p
                        style={{
                          fontSize: '13px',
                          color: 'rgba(255, 255, 255, 0.85)',
                          margin: 0,
                          fontWeight: 400
                        }}
                      >
                        {teacher.designation || 'Master Faculty'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Carousel Arrow Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 10 }}>
              <button
                onClick={handlePrev}
                aria-label="Previous Instructor"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #21201E',
                  color: '#21201E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F5EFE5';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={handleNext}
                aria-label="Next Instructor"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#21201E',
                  border: '1px solid #21201E',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(33,32,30,0.18)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#000000';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#21201E';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>

          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          #teachers {
            padding: 56px 0 64px 0 !important;
          }
          .watermark-left {
            display: block !important;
            right: auto !important;
            left: -32px !important;
            top: 46% !important;
            font-size: 44px !important;
            letter-spacing: 0.08em !important;
            color: rgba(33, 32, 30, 0.04) !important;
            WebkitTextStroke: 1.5px rgba(33, 32, 30, 0.15) !important;
          }
          .watermark-right {
            display: block !important;
            left: auto !important;
            right: -32px !important;
            top: 46% !important;
            font-size: 44px !important;
            letter-spacing: 0.08em !important;
            color: rgba(33, 32, 30, 0.04) !important;
            WebkitTextStroke: 1.5px rgba(33, 32, 30, 0.15) !important;
          }
        }
      `}</style>
    </section>
  );
};
