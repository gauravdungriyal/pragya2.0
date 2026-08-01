import React from 'react';
import { Dumbbell, Command, Layers, Heart } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: Dumbbell,
      title: 'Improved Core Strength',
      description: 'Develop strength and balance through precise, core-centered movements.'
    },
    {
      icon: Command,
      title: 'Increased Flexibility',
      description: 'Expand your mobility with smooth and intentional motion towards inner harmony.'
    },
    {
      icon: Layers,
      title: 'Better Posture',
      description: 'Align your spine and develop awareness for daily posture improvements.'
    },
    {
      icon: Heart,
      title: 'Low-Impact Fitness',
      description: 'Safe and effective Yog & Pilates workouts suitable for all ages and levels.'
    }
  ];

  return (
    <section
      id="why-us"
      className="why-us-section"
      style={{
        backgroundColor: '#F5EFE5',
        padding: '64px 0 72px 0',
        color: '#272727',
        borderTop: '1px solid rgba(0, 0, 0, 0.05)'
      }}
    >
      <div
        className="why-us-container"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 40px'
        }}
      >
        {/* Top Header */}
        <div className="why-us-header">
          <div className="why-us-title-group reveal-left">
            <span className="why-us-subtitle">
              — VALUE —
            </span>
            <h2 className="why-us-heading">
              Why Choose Pragya Yog School
            </h2>
          </div>

          <p className="why-us-description reveal-right">
            Discover the transformative benefits of yog &amp; pilates for body, mind, and lifestyle.
          </p>
        </div>

        {/* Content Container (Desktop: 2 Columns | Mobile: Stacked matching reference) */}
        <div className="why-us-content-grid">
          {/* Main Image */}
          <div className="why-us-image-wrapper reveal-zoom">
            <img
              src="/about.png"
              alt="Pragya Yog School About Us Practitioner Image"
              className="why-us-img"
            />
          </div>

          {/* Accent Divider Line (Visible in Mobile Layout) */}
          <div className="mobile-accent-divider">
            <span className="mobile-accent-bar" />
          </div>

          {/* Feature List Cards */}
          <div className="why-us-feature-list">
            {features.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className={`why-us-card reveal-on-scroll delay-${i + 1}`}>
                  <div className="icon-badge">
                    <Icon size={18} />
                  </div>

                  <div className="card-text-content">
                    <h3 className="card-title">
                      {item.title}
                    </h3>
                    <p className="card-desc">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .why-us-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 32px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        .why-us-title-group {
          max-width: 640px;
        }
        .why-us-subtitle {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #4A4640;
          text-transform: uppercase;
          display: block;
          margin-bottom: 10px;
        }
        .why-us-heading {
          font-family: var(--font-serif);
          font-size: clamp(30px, 3.6vw, 44px);
          font-weight: 400;
          color: #21201E;
          line-height: 1.12;
          margin: 0;
        }
        .why-us-description {
          font-family: var(--font-sans);
          max-width: 380px;
          font-size: 14.5px;
          color: #757069;
          line-height: 1.55;
          margin: 0;
          padding-bottom: 4px;
        }
        .why-us-content-grid {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 48px;
          align-items: stretch;
        }
        .why-us-image-wrapper {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          height: 100%;
          min-height: 440px;
        }
        .why-us-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: 24px;
          transition: transform 0.4s ease;
        }
        .why-us-img:hover {
          transform: scale(1.02);
        }
        .mobile-accent-divider {
          display: none;
        }
        .why-us-feature-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px 32px;
          align-content: space-between;
        }
        .why-us-card {
          border-top: 1px solid #DFD9CF;
          padding-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: transform 0.25s ease;
        }
        .icon-badge {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background-color: #ECE6DC;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4A4640;
          transition: all 0.25s ease;
          flex-shrink: 0;
        }
        .why-us-card:hover .icon-badge {
          background-color: #944426;
          color: #FFFFFF;
          transform: translateY(-2px);
        }
        .card-title {
          font-family: var(--font-sans);
          font-size: 17px;
          font-weight: 700;
          color: #21201E;
          margin-bottom: 6px;
          line-height: 1.25;
        }
        .card-desc {
          font-family: 'Neue Montreal', sans-serif;
          font-size: 13.5px;
          color: #757069;
          line-height: 1.5;
          margin: 0;
        }

        /* Mobile View - Matching User Reference Screenshot Exactly */
        @media (max-width: 768px) {
          .why-us-section {
            padding: 40px 0 52px 0 !important;
          }
          .why-us-container {
            padding: 0 20px !important;
          }
          .why-us-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            margin-bottom: 24px !important;
          }
          .why-us-subtitle {
            font-size: 11.5px !important;
            letter-spacing: 0.12em !important;
            margin-bottom: 8px !important;
            color: #4A4640 !important;
          }
          .why-us-heading {
            font-size: 32px !important;
            line-height: 1.15 !important;
          }
          .why-us-description {
            font-size: 14.5px !important;
            line-height: 1.55 !important;
            color: #757069 !important;
            max-width: 100% !important;
            padding-bottom: 0 !important;
          }
          .why-us-content-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 24px !important;
          }
          .why-us-image-wrapper {
            width: 100% !important;
            height: 380px !important;
            min-height: 340px !important;
            border-radius: 20px !important;
          }
          .why-us-img {
            border-radius: 20px !important;
            object-position: center 35% !important;
          }
          .mobile-accent-divider {
            display: block !important;
            position: relative !important;
            width: 100% !important;
            height: 1px !important;
            background-color: #DFD9CF !important;
            margin: 8px 0 12px 0 !important;
          }
          .mobile-accent-bar {
            position: absolute !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            top: -1px !important;
            width: 32px !important;
            height: 3px !important;
            background-color: #E05297 !important;
            border-radius: 2px !important;
          }
          .why-us-feature-list {
            display: flex !important;
            flex-direction: column !important;
            gap: 24px !important;
          }
          .why-us-card {
            border-top: none !important;
            border-bottom: 1px solid #DFD9CF !important;
            padding-top: 0 !important;
            padding-bottom: 24px !important;
            gap: 16px !important;
          }
          .icon-badge {
            width: 44px !important;
            height: 44px !important;
            background-color: #ECE6DC !important;
          }
          .card-title {
            font-size: 19px !important;
            font-weight: 700 !important;
            margin-bottom: 6px !important;
          }
          .card-desc {
            font-size: 14.5px !important;
            line-height: 1.55 !important;
            color: #7D7871 !important;
          }
        }
      `}</style>
    </section>
  );
};

export default WhyChooseUs;
