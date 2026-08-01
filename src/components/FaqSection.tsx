import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { FaqItem } from '../types';

interface FaqSectionProps {
  onOpenBooking?: (type?: string, title?: string) => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onOpenBooking }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [openIndex, setOpenIndex] = useState<number | null>(1); // Item 02 open by default matching reference screenshot

  const homeFaqs: FaqItem[] = [
    {
      question: "Do I need prior experience to join?",
      answer: "No prior experience is needed! Our expert-led sessions are designed for all levels, from complete beginners to advanced practitioners."
    },
    {
      question: "What should I bring to class?",
      answer: "A mat, comfortable clothing, and water — everything you need for a smooth and mindful practice that nurtures strength and balance."
    },
    {
      question: "Is online booking available?",
      answer: "Yes, you can easily view live session schedules and reserve your spot online up to 7 days in advance."
    },
    {
      question: "Can I switch membership plans?",
      answer: "Absolutely. You can upgrade, downgrade, or pause your membership at any time with zero hassle."
    },
    {
      question: "Are classes suitable during pregnancy?",
      answer: "Yes, we offer specialized prenatal modifications and gentle restorative sessions suitable for expecting mothers."
    }
  ];

  useEffect(() => {
    setLoading(false);
  }, []);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const displayList = homeFaqs;

  return (
    <section
      id="faq"
      className="faq-section"
      style={{
        backgroundColor: '#FFFFFF',
        padding: '84px 0 96px 0',
        color: '#21201E',
        position: 'relative'
      }}
    >
      <div
        className="faq-container"
        style={{
          maxWidth: '860px',
          margin: '0 auto',
          padding: '0 24px'
        }}
      >
        {/* Header Tag & Title */}
        <div className="faq-header reveal-blur" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span
            className="faq-sub-tag"
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              letterSpacing: '0.16em',
              color: '#4A4640',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '12px'
            }}
          >
            — FREQUENTLY ASKED QUESTIONS —
          </span>

          <h2
            className="faq-heading"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 'clamp(32px, 4.5vw, 54px)',
              fontWeight: 400,
              color: '#21201E',
              lineHeight: 1.15,
              margin: 0
            }}
          >
            Quick Answers for Curious Minds
          </h2>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#944426' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px auto', display: 'block' }} />
            <p style={{ color: '#757069', fontSize: '14px' }}>Loading FAQs...</p>
          </div>
        ) : (
          /* Accordion List */
          <div className="faq-accordion-list" style={{ display: 'flex', flexDirection: 'column', marginBottom: '48px' }}>
            {displayList.map((faq, idx) => {
              const isOpen = openIndex === idx;
              const formattedIndex = String(idx + 1).padStart(2, '0');

              return (
                <div
                  key={faq.question}
                  className={`faq-item reveal-on-scroll delay-${Math.min(idx + 1, 6)}`}
                  style={{
                    borderBottom: '1px solid #DFD9CF',
                    paddingBottom: '20px',
                    marginBottom: '20px'
                  }}
                >
                  {/* Header Row Button */}
                  <button
                    onClick={() => toggleFaq(idx)}
                    style={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr 24px',
                      alignItems: 'center',
                      backgroundColor: 'transparent',
                      border: 'none',
                      padding: '6px 0',
                      textAlign: 'left',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    {/* Index */}
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#21201E'
                      }}
                    >
                      {formattedIndex}
                    </span>

                    {/* Question Title */}
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: '17px',
                        fontWeight: 700,
                        color: '#21201E',
                        paddingRight: '16px',
                        lineHeight: 1.3
                      }}
                    >
                      {faq.question}
                    </span>

                    {/* Expand/Collapse Chevron */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#21201E'
                      }}
                    >
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </button>

                  {/* Expanded Answer Content */}
                  {isOpen && (
                    <div
                      className="faq-answer-box"
                      style={{
                        paddingLeft: '40px',
                        paddingRight: '16px',
                        paddingTop: '10px',
                        fontSize: '14px',
                        color: '#757069',
                        lineHeight: 1.55,
                        fontFamily: "'Neue Montreal', sans-serif"
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Help Widget */}
        <div className="faq-help-widget" style={{ textAlign: 'center', paddingTop: '12px' }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: '17px',
              fontWeight: 700,
              color: '#21201E',
              margin: '0 0 8px 0'
            }}
          >
            Questions? We're Here to Help.
          </p>

          <button
            onClick={() => onOpenBooking && onOpenBooking('inquiry', 'General Inquiry')}
            style={{
              backgroundColor: '#21201E',
              color: '#FFFFFF',
              borderRadius: '999px',
              padding: '14px 44px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
            className="faq-cta-btn"
          >
            LET US KNOW
          </button>
        </div>
      </div>

      <style>{`
        .faq-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(33, 32, 30, 0.25);
          background-color: #000000 !important;
        }

        /* Mobile View - Matching User Reference Screenshot Exactly */
        @media (max-width: 768px) {
          .faq-section {
            padding: 40px 0 52px 0 !important;
          }
          .faq-container {
            padding: 0 20px !important;
          }
          .faq-header {
            margin-bottom: 32px !important;
          }
          .faq-sub-tag {
            font-size: 11.5px !important;
            margin-bottom: 8px !important;
          }
          .faq-heading {
            font-size: 32px !important;
            line-height: 1.15 !important;
          }
          .faq-accordion-list {
            margin-bottom: 36px !important;
          }
          .faq-item {
            padding-bottom: 16px !important;
            margin-bottom: 16px !important;
          }
          .faq-answer-box {
            padding-left: 40px !important;
            padding-right: 0 !important;
            font-size: 13.5px !important;
            color: #7D7871 !important;
          }
        }
      `}</style>
    </section>
  );
};

export default FaqSection;
