import React from 'react';
import { Phone, Mail, MapPin, Facebook, Twitter, Youtube, Linkedin, Instagram } from 'lucide-react';

interface NewsletterFooterProps {
  onNavigateSection?: (sectionId: string) => void;
  onOpenBooking?: (type?: string, title?: string) => void;
}

export const NewsletterFooter: React.FC<NewsletterFooterProps> = ({
  onNavigateSection
}) => {
  const quickLinks = [
    { label: 'Contact Us', section: 'faq' },
    { label: 'Website Terms', section: 'terms' },
    { label: 'Studio Guidelines', section: 'guidelines' },
    { label: 'Privacy Policy', section: 'privacy' },
    { label: 'Careers', section: 'careers' },
    { label: 'FAQs', section: 'faq' }
  ];

  const yogCourses = [
    { label: 'Regular Classes', section: 'schedule' },
    { label: 'Private Sessions', section: 'membership' },
    { label: 'Pragya 200-Hr TTC', section: 'programs' },
    { label: 'Somatic Retreats', section: 'programs' },
    { label: 'Intake Consult', section: 'contact' }
  ];

  return (
    <footer
      id="footer"
      style={{
        backgroundColor: '#00381F',
        color: '#FFFFFF',
        paddingTop: '72px',
        paddingBottom: '40px',
        borderTop: '1px solid rgba(217, 174, 41, 0.25)'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 32px'
        }}
      >
        {/* Top Header Row: Brand Logo */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '32px',
            marginBottom: '40px',
            flexWrap: 'wrap'
          }}
        >
          {/* Brand Logo & Name - Large Logo + Small Refined Text */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              cursor: 'pointer'
            }}
            onClick={() => onNavigateSection && onNavigateSection('hero')}
          >
            <img
              src="/logo.png"
              alt="Pragya Yog School Logo"
              style={{
                height: '92px',
                width: 'auto',
                objectFit: 'contain',
                transition: 'transform 0.3s ease'
              }}
              className="footer-logo-img"
            />
            <span
              style={{
                fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '0.14em',
                color: '#FFFFFF',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap'
              }}
              className="footer-logo-text"
            >
              PRAGYA YOG SCHOOL
            </span>
          </div>
        </div>

        {/* Middle Main Content Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 1fr 1.4fr',
            gap: '48px',
            paddingBottom: '56px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
          }}
          className="footer-main-grid"
        >
          {/* Column 1: Brand Info & Description */}
          <div className="footer-brand-col">
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.75)',
                lineHeight: 1.6,
                marginBottom: '28px',
                maxWidth: '320px'
              }}
            >
              Strengthen your body, calm your mind, and embrace mindful movement with our expert-led yoga & pilates sessions.
            </p>

            {/* Mobile App Downloads (Desktop Only) */}
            <div className="footer-apps-container">
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'rgba(255, 255, 255, 0.5)',
                  textTransform: 'uppercase',
                  marginBottom: '10px'
                }}
              >
                Mobile Apps
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a
                  href="#"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    textDecoration: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    width: 'fit-content'
                  }}
                  className="app-download-link"
                >
                  Download on the App Store
                </a>
                <a
                  href="#"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    textDecoration: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    width: 'fit-content'
                  }}
                  className="app-download-link"
                >
                  Get it on Google Play
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (Desktop Only) */}
          <div className="footer-links-col">
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}
            >
              Quick Links
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  onClick={() => onNavigateSection && onNavigateSection(link.section)}
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease'
                  }}
                  className="footer-text-link"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Column 3: Yog Courses (Desktop Only) */}
          <div className="footer-links-col">
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}
            >
              Yog Courses
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {yogCourses.map((course) => (
                <a
                  key={course.label}
                  onClick={() => onNavigateSection && onNavigateSection(course.section)}
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease'
                  }}
                  className="footer-text-link"
                >
                  {course.label}
                </a>
              ))}
            </div>
          </div>

          {/* Column 4: Contact Information & Social Media */}
          <div className="footer-contact-col">
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}
            >
              Contact Information
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.4 }}>
                <MapPin size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>1303-04, 13/F Tak Woo House, 13 Wo On Lane, Central, Hong Kong</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.85)' }}>
                <Phone size={16} style={{ flexShrink: 0 }} />
                <span>+852 6708 2503</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.85)' }}>
                <Mail size={16} style={{ flexShrink: 0 }} />
                <span>info@pyshk.com</span>
              </div>
            </div>

            {/* Social Media Circular White Buttons */}
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'rgba(255, 255, 255, 0.5)',
                  textTransform: 'uppercase',
                  marginBottom: '10px'
                }}
              >
                Social Media
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    color: '#1C1B19',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s ease'
                  }}
                  className="social-icon-btn"
                >
                  <Facebook size={17} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter (X)"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    color: '#1C1B19',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s ease'
                  }}
                  className="social-icon-btn"
                >
                  <Twitter size={17} />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    color: '#1C1B19',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s ease'
                  }}
                  className="social-icon-btn"
                >
                  <Youtube size={17} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    color: '#1C1B19',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s ease'
                  }}
                  className="social-icon-btn"
                >
                  <Linkedin size={17} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    color: '#1C1B19',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s ease'
                  }}
                  className="social-icon-btn"
                >
                  <Instagram size={17} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div style={{ paddingTop: '28px' }}>
          <p style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
            © 2026 Pragya Yog School. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        .footer-logo-img:hover {
          transform: scale(1.04);
        }
        .footer-text-link:hover {
          color: #FFFFFF !important;
        }
        .social-icon-btn:hover {
          transform: scale(1.1);
        }
        .app-download-link:hover {
          background-color: rgba(255, 255, 255, 0.16) !important;
        }

        /* Mobile View - Streamlined Clean Footer */
        @media (max-width: 768px) {
          #footer {
            padding-top: 44px !important;
            padding-bottom: 28px !important;
          }
          .footer-logo-img {
            height: 72px !important;
          }
          .footer-logo-text {
            font-size: 13px !important;
            letter-spacing: 0.10em !important;
          }
          .footer-main-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
            padding-bottom: 28px !important;
          }
          .footer-apps-container, .footer-links-col {
            display: none !important;
          }
          .footer-brand-col p {
            margin-bottom: 0 !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default NewsletterFooter;
