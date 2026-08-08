import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { getFaqs } from '../services/api';
import { FaqItem } from '../types';

interface FaqSectionProps {
  onOpenBooking?: (type?: string, title?: string) => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onOpenBooking }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const fetchFaqsData = () => {
    setLoading(true);
    getFaqs().then((data) => {
      setFaqs(data || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchFaqsData();
  }, []);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const displayList = faqs;

  return (
    <section
      id="faq"
      className="faq-section"
      style={{
        backgroundColor: '#FFFFFF',
        padding: '24px 0 16px 0',
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
        <div
          className="faq-header reveal-on-scroll"
          style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}
        >
          <span
            className="faq-sub-tag"
            style={{
              fontFamily: "'Neue Montreal', sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: '#944426',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '10px'
            }}
          >
            — FREQUENTLY ASKED QUESTIONS —
          </span>
          <h2
            className="faq-heading"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: '42px',
              fontWeight: 700,
              color: '#21201E',
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: 1.12
            }}
          >
            Quick Answers for Curious Minds
          </h2>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#944426' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px auto', display: 'block' }} />
            <p style={{ color: '#757069', fontSize: '14px' }}>Fetching FAQs from API...</p>
          </div>
        ) : displayList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', backgroundColor: '#FAF6F0', borderRadius: '16px', border: '1px solid rgba(148,68,38,0.12)', marginBottom: '24px' }}>
            <p style={{ color: '#4A4540', fontSize: '14.5px', fontWeight: 600, margin: '0 0 14px 0' }}>
              No FAQ entries received from backend API.
            </p>
            <button
              onClick={fetchFaqsData}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#00381F',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '999px',
                padding: '9px 22px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} />
              <span>Retry Fetching FAQs</span>
            </button>
          </div>
        ) : (
          /* Accordion List */
          <div className="faq-accordion-list" style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
            {displayList.map((faq, idx) => {
              const isOpen = openIndex === idx;
              const formattedIndex = String(idx + 1).padStart(2, '0');

              return (
                <div
                  key={faq.question || idx}
                  className="faq-item"
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
            onClick={() => window.open('https://wa.me/85267082503?text=Namaste%20%F0%9F%99%8F%20I%20have%20a%20question%20about%20Pragya%20Yog%20School', '_blank', 'noopener,noreferrer')}
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
