import React from 'react';
import { ArrowUpRight, Sun, Flame, Sparkles, Heart, Activity, Coffee, UserCheck } from 'lucide-react';

interface ExperiencesGridProps {
  onOpenBooking: (type?: string, title?: string) => void;
}

export const ExperiencesGrid: React.FC<ExperiencesGridProps> = ({ onOpenBooking }) => {
  const experiences = [
    {
      title: "Classical & Dynamic Yoga",
      category: "Movement & Mind",
      description: "From traditional Hatha alignment to fluid Vinyasa flow and deep restorative Yin. Guided by PhD-led master faculty.",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop",
      icon: Sun,
      bgColor: "#9D9D48", // Olive Green
      tags: ["Hatha", "Vinyasa", "Yin", "Pranayama"]
    },
    {
      title: "Reformer & Mat Pilates",
      category: "Precision Core",
      description: "Lengthen, align, and strengthen stabilizing core musculature on state-of-the-art Peak Pilates reformers.",
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1000&auto=format&fit=crop",
      icon: Flame,
      bgColor: "#944426", // Terracotta
      tags: ["Reformer", "Core Sculpt", "Postural Care"]
    },
    {
      title: "Acoustic & Sound Recovery",
      category: "Mindfulness",
      description: "Multi-frequency sound baths using quartz crystal bowls and Tibetan gongs to dissolve neural tension.",
      image: "https://images.unsplash.com/photo-1512290900673-70024421191e?q=80&w=1000&auto=format&fit=crop",
      icon: Sparkles,
      bgColor: "#9D9D48", // Olive Green
      tags: ["Sound Bath", "Meditation", "Kriya"]
    },
    {
      title: "Contrast Hydro & Infrared Sauna",
      category: "Restoration",
      description: "Reset cellular metabolism and reduce inflammation with guided ice bath contrast plunges and full-spectrum infrared therapy.",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000&auto=format&fit=crop",
      icon: Heart,
      bgColor: "#944426", // Terracotta
      tags: ["Ice Plunge", "Infrared", "Lymphatic Flush"]
    },
    {
      title: "Mindful Functional Fitness",
      category: "Strength",
      description: "Intention-based strength training focusing on mobility, functional kinetics, and sustainable joint longevity.",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000&auto=format&fit=crop",
      icon: Activity,
      bgColor: "#9D9D48", // Olive Green
      tags: ["Functional Strength", "Mobility", "Kinetics"]
    },
    {
      title: "Ayurvedic & Holistic Nutrition",
      category: "Vitality",
      description: "Customized bio-individual dietary planning grounded in ancient Ayurvedic wisdom and modern metabolic science.",
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1000&auto=format&fit=crop",
      icon: Coffee,
      bgColor: "#944426", // Terracotta
      tags: ["Ayurveda", "Metabolic Health", "Detox"]
    },
    {
      title: "1-on-1 Personal Training & Concierge",
      category: "Personalized",
      description: "Bespoke 1-on-1 movement architecture tailored precisely to your biomechanics and wellness milestones.",
      image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop",
      icon: UserCheck,
      bgColor: "#9D9D48", // Olive Green
      tags: ["Private Suite", "Biomechanics", "Tailored Plan"]
    }
  ];

  return (
    <section id="experiences" className="section" style={{ backgroundColor: '#F5EFE5' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 56px auto' }}>
          <span className="badge-pill badge-terracotta" style={{ marginBottom: '16px' }}>
            Featured Experiences
          </span>
          <h2 className="heading-1" style={{ color: '#272727', marginBottom: '18px' }}>
            Curated Pillars of Movement & Sanctuary
          </h2>
          <p className="subheadline">
            Explore seven distinct dimensions of holistic care, designed to cultivate physical resilience, mental stillness, and total cellular vitality.
          </p>
        </div>

        {/* Alternating Card Grid (#9D9D48 & #944426) */}
        <div className="experiences-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
          {experiences.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                style={{
                  backgroundColor: item.bgColor,
                  color: '#FFFFFF',
                  borderRadius: '28px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 16px 36px -10px rgba(0,0,0,0.15)',
                  transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                }}
              >
                {/* Image Showcase */}
                <div style={{ position: 'relative', height: '230px', overflow: 'hidden' }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.4) 100%)'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: item.bgColor,
                      borderRadius: '999px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Icon size={14} />
                    <span>{item.category}</span>
                  </div>
                </div>

                {/* Content Details */}
                <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 500, marginBottom: '12px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.88)', lineHeight: 1.6, marginBottom: '20px', flexGrow: 1 }}>
                    {item.description}
                  </p>

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.18)',
                          color: '#FFFFFF',
                          borderRadius: '999px',
                          padding: '4px 12px',
                          fontSize: '11px',
                          fontWeight: 500
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Link */}
                  <button
                    onClick={() => onOpenBooking('experience', item.title)}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.92)',
                      color: item.bgColor === '#944426' ? '#944426' : '#5a5a1f',
                      border: 'none',
                      borderRadius: '999px',
                      padding: '12px 20px',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>Reserve Session</span>
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #experiences {
            padding: 40px 0 52px 0 !important;
          }
          .experiences-card-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </section>
  );
};
