import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

export const TestimonialsCarousel: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const testimonialsData = [
    [
      {
        id: 1,
        author: 'Amber Flinch',
        text: 'Alluna helped me regain strength after pregnancy. I feel healthier every day. The instructors are patient and truly understand each member’s needs.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 2,
        author: 'Betrand Lee',
        text: 'As an athlete, pilates improved my flexibility and reduced injuries. I feel stronger, more balanced, and ready to perform at my best.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 3,
        author: 'Clara Simmons',
        text: 'I love the relaxing atmosphere and supportive instructors at Alluna. Every class feels like a personal retreat from my busy schedule.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop'
      }
    ],
    [
      {
        id: 4,
        author: 'Marcus Thorne',
        text: 'The combination of Reformer Pilates with traditional Hatha yoga in an environment that feels like a 5-star resort is unmatched.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 5,
        author: 'Elena Rostova',
        text: 'Master Aarya’s Pranayama sessions have become my mandatory weekly reset for mental clarity and executive stress management.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop'
      },
      {
        id: 6,
        author: 'Dr. Ananya Sharma',
        text: 'The attention to joint anatomy and nervous system soothing is something you simply do not get in standard commercial movement studios.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop'
      }
    ]
  ];

  const totalPages = testimonialsData.length;

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const currentSet = testimonialsData[currentPage];

  return (
    <section
      id="community"
      className="testimonials-section"
      style={{
        backgroundColor: '#FFFFFF',
        padding: '84px 0',
        color: '#21201E',
        position: 'relative'
      }}
    >
      <div
        className="testimonials-container"
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '0 40px'
        }}
      >
        {/* 2-Column Main Layout */}
        <div className="testimonials-main-grid reveal-on-scroll">
          {/* Left Column: Tag, Heading & Giant Member Stat */}
          <div className="testimonials-left-col reveal-left">
            <div>
              <div className="testimonials-tag-row">
                <span className="testimonials-sub-tag">
                  — TESTIMONIALS —
                </span>
                <span className="testimonials-pink-dash" />
              </div>
              <h2 className="testimonials-heading">
                Voices of Our Pilates Community
              </h2>
            </div>

            {/* Bottom Stat Box (Desktop) */}
            <div className="testimonials-desktop-stat">
              <div className="stat-number">
                120+
              </div>
              <div className="stat-pill">
                Empowered pilates members
              </div>
            </div>
          </div>

          {/* Right Column: Vertical List of 3 Testimonials */}
          <div className="testimonials-right-col reveal-right">
            <div className="testimonials-list">
              {currentSet.map((item) => (
                <div key={item.id} className="testimonial-item-row">
                  {/* Square Avatar Photo */}
                  <img
                    src={item.image}
                    alt={item.author}
                    className="testimonial-avatar"
                  />

                  {/* Rating, Name & Quote Content */}
                  <div className="testimonial-content">
                    {/* 5-Star Rating */}
                    <div className="star-rating-row">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} size={15} fill="#21201E" color="#21201E" />
                      ))}
                    </div>

                    {/* Author Name */}
                    <h3 className="testimonial-author">
                      {item.author}
                    </h3>

                    {/* Quote Text */}
                    <p className="testimonial-quote">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Progress Bar & Carousel Navigation */}
            <div className="testimonials-controls-row">
              {/* Progress Line */}
              <div className="testimonials-progress-track">
                <div
                  className="testimonials-progress-bar"
                  style={{
                    width: `${((currentPage + 1) / totalPages) * 100}%`
                  }}
                />
              </div>

              {/* Navigation Arrows */}
              <div className="testimonials-arrow-group">
                <button
                  onClick={handlePrev}
                  aria-label="Previous testimonials"
                  className="testimonial-nav-btn prev-btn"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  onClick={handleNext}
                  aria-label="Next testimonials"
                  className="testimonial-nav-btn next-btn"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .testimonials-main-grid {
          display: grid;
          grid-template-columns: 1.1fr 1.6fr;
          gap: 64px;
          align-items: flex-start;
        }
        .testimonials-left-col {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          min-height: 440px;
        }
        .testimonials-tag-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .testimonials-sub-tag {
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: #21201E;
          text-transform: uppercase;
        }
        .testimonials-pink-dash {
          display: inline-block;
          width: 24px;
          height: 2px;
          background-color: #E05297;
          border-radius: 2px;
        }
        .testimonials-heading {
          font-family: 'BNCringeSerif', 'Canela', Georgia, serif;
          font-size: clamp(34px, 4.5vw, 56px);
          font-weight: 400;
          color: #21201E;
          line-height: 1.15;
          margin: 0;
        }
        .testimonials-desktop-stat {
          margin-top: auto;
          padding-top: 40px;
        }
        .stat-number {
          font-family: 'Canela', serif;
          font-size: clamp(64px, 7vw, 92px);
          font-weight: 400;
          color: #00381F;
          line-height: 1;
        }
        .stat-pill {
          display: inline-block;
          margin-top: 16px;
          background-color: #EFEBE2;
          border-radius: 999px;
          padding: 8px 22px;
          font-size: 13.5px;
          font-weight: 600;
          color: #5A5854;
        }
        .testimonials-list {
          display: flex;
          flex-direction: column;
          margin-bottom: 40px;
        }
        .testimonial-item-row {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          padding-top: 20px;
          padding-bottom: 20px;
          border-top: 1px solid #DFD9CF;
        }
        .testimonial-avatar {
          width: 120px;
          height: 120px;
          border-radius: 18px;
          object-fit: cover;
          flex-shrink: 0;
          background-color: #ECE6DC;
        }
        .testimonial-content {
          flex-grow: 1;
        }
        .star-rating-row {
          display: flex;
          gap: 4px;
          margin-bottom: 8px;
        }
        .testimonial-author {
          font-family: var(--font-sans);
          font-size: 17px;
          font-weight: 700;
          color: #21201E;
          margin-bottom: 6px;
          line-height: 1.25;
        }
        .testimonial-quote {
          font-family: 'Neue Montreal', sans-serif;
          font-size: 13.5px;
          color: #757069;
          line-height: 1.55;
          margin: 0;
        }
        .testimonials-controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .testimonials-progress-track {
          flex-grow: 1;
          height: 2px;
          background-color: #EAE5DC;
          border-radius: 2px;
          position: relative;
          overflow: hidden;
        }
        .testimonials-progress-bar {
          height: 100%;
          background-color: #21201E;
          transition: width 0.4s ease;
        }
        .testimonials-arrow-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .testimonial-nav-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .prev-btn {
          background-color: #FFFFFF;
          border: 1px solid #21201E;
          color: #21201E;
        }
        .next-btn {
          background-color: #21201E;
          border: 1px solid #21201E;
          color: #FFFFFF;
        }

        /* Mobile View - Matching User Reference Screenshot Exactly */
        @media (max-width: 768px) {
          .testimonials-section {
            padding: 40px 0 52px 0 !important;
          }
          .testimonials-container {
            padding: 0 20px !important;
          }
          .testimonials-main-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .testimonials-left-col {
            min-height: auto !important;
          }
          .testimonials-heading {
            font-size: 32px !important;
            line-height: 1.15 !important;
            margin-bottom: 0 !important;
          }
          .testimonials-desktop-stat {
            display: none !important;
          }
          .testimonials-list {
            margin-bottom: 28px !important;
          }
          .testimonial-item-row {
            flex-direction: row !important;
            gap: 16px !important;
            padding-top: 18px !important;
            padding-bottom: 18px !important;
            align-items: flex-start !important;
          }
          .testimonial-avatar {
            width: 100px !important;
            height: 100px !important;
            border-radius: 16px !important;
          }
          .testimonial-author {
            font-size: 17px !important;
            margin-bottom: 6px !important;
          }
          .testimonial-quote {
            font-size: 13px !important;
            line-height: 1.5 !important;
            color: #7D7871 !important;
          }
        }
      `}</style>
    </section>
  );
};

export default TestimonialsCarousel;
