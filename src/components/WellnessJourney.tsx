import React, { useState } from 'react';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

interface WellnessJourneyProps {
  onOpenBooking: (type?: string, title?: string) => void;
}

export const WellnessJourney: React.FC<WellnessJourneyProps> = ({ onOpenBooking }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: "01",
      title: "Bio-Individual Consult",
      subtitle: "Understanding your unique constitution",
      description: "Begin with a 1-on-1 assessment with our master teachers. We analyze your posture, joint range, stress patterns, and energy levels to design your personalized path.",
      bullets: ["Postural & Mobility Scan", "Stress & Nervous System Baseline", "Ayurvedic Dosha Profile"],
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop"
    },
    {
      num: "02",
      title: "Foundation & Core Alignment",
      subtitle: "Building physical resilience",
      description: "Master breath-led movement mechanics through tailored Hatha and Reformer Pilates practices designed to unlock joint freedom and build core stability.",
      bullets: ["Diaphragmatic Breath Integration", "Pelvic & Spine Realignment", "Injury-Prevention Fundamentals"],
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop"
    },
    {
      num: "03",
      title: "Pranayama & Sound Recovery",
      subtitle: "Calming the central nervous system",
      description: "Transition into high-frequency vibrational sound baths, cold contrast hydrotherapy, and advanced Kundalini Kriyas to clear mental fatigue.",
      bullets: ["Multi-Frequency Quartz Sound Bath", "Guided Contrast Hydro Therapy", "Deep Vagus Nerve Reset"],
      image: "https://images.unsplash.com/photo-1512290900673-70024421191e?q=80&w=800&auto=format&fit=crop"
    },
    {
      num: "04",
      title: "Mastery & Daily Ikigai",
      subtitle: "Living in effortless balance",
      description: "Embody your practice seamlessly into daily life with advanced flow classes, weekend retreats, and lifelong participation in our supportive community.",
      bullets: ["Advanced Asana & Meditation", "Seasonal Detox & Retreat Access", "Lifetime Community Circle"],
      image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800&auto=format&fit=crop"
    }
  ];

  return (
    <section id="journey" className="section" style={{ backgroundColor: '#F5EFE5' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 56px auto' }}>
          <span className="badge-pill badge-terracotta" style={{ marginBottom: '16px' }}>
            The Wellness Journey
          </span>
          <h2 className="heading-1" style={{ color: '#272727', marginBottom: '18px' }}>
            Your 4-Stage Pathway to Transformation
          </h2>
          <p className="subheadline">
            Whether you are stepping onto the mat for the first time or deepening a lifelong practice, our structured pathway ensures clear, sustainable progress.
          </p>
        </div>

        {/* Journey Step Selectors */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '40px'
          }}
        >
          {steps.map((step, idx) => (
            <button
              key={step.num}
              onClick={() => setActiveStep(idx)}
              style={{
                backgroundColor: activeStep === idx ? '#944426' : '#FFFFFF',
                color: activeStep === idx ? '#FFFFFF' : '#272727',
                border: '1px solid rgba(39,39,39,0.08)',
                borderRadius: '20px',
                padding: '20px 18px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: activeStep === idx ? '0 12px 28px -6px rgba(148,68,38,0.35)' : 'var(--shadow-soft)'
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: activeStep === idx ? '#D9AE29' : '#944426',
                  marginBottom: '4px'
                }}
              >
                STAGE {step.num}
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 500 }}>
                {step.title}
              </div>
            </button>
          ))}
        </div>

        {/* Active Stage Detail Showcase Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '32px',
            padding: '40px',
            boxShadow: 'var(--shadow-elevated)',
            border: '1px solid rgba(39,39,39,0.08)',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '36px'
          }}
          className="grid-md-2"
        >
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#944426', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              <Sparkles size={16} />
              <span>{steps[activeStep].subtitle}</span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: '#272727', marginBottom: '16px' }}>
              Stage {steps[activeStep].num}: {steps[activeStep].title}
            </h3>
            <p style={{ fontSize: '16px', color: '#5A5854', lineHeight: 1.65, marginBottom: '28px' }}>
              {steps[activeStep].description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {steps[activeStep].bullets.map((bullet) => (
                <div key={bullet} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle2 size={18} color="#944426" />
                  <span style={{ fontSize: '15px', fontWeight: 500, color: '#272727' }}>{bullet}</span>
                </div>
              ))}
            </div>

            <div>
              <button
                onClick={() => onOpenBooking('journey', `Stage ${steps[activeStep].num} Consultation`)}
                className="btn btn-secondary"
                style={{ padding: '14px 32px' }}
              >
                <span>Start Stage {steps[activeStep].num} Journey</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div style={{ borderRadius: '24px', overflow: 'hidden', height: '360px', position: 'relative' }}>
            <img
              src={steps[activeStep].image}
              alt={steps[activeStep].title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
