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
    { label: 'Pragya Connect Community', section: 'community' },
    { label: 'Contact Us', section: 'faq' },
    { label: 'Website Terms', section: 'terms' },
    { label: 'Studio Guidelines', section: 'guidelines' },
    { label: 'Privacy Policy', section: 'privacy' },
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
        paddingTop: '32px',
        paddingBottom: '24px',
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
            gap: '24px',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}
        >
          {/* Brand Logo & Name - Compact Logo + Small Refined Text */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: 'pointer'
            }}
            onClick={() => onNavigateSection && onNavigateSection('hero')}
          >
            <img
              src="/logo.png"
              alt="Pragya Yog School Logo"
              style={{
                height: '76px',
                width: 'auto',
                objectFit: 'contain',
                transition: 'transform 0.3s ease'
              }}
              className="footer-logo-img"
            />
            <span
              style={{
                fontFamily: "var(--font-sans)",
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
            gap: '36px',
            paddingBottom: '32px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
          }}
          className="footer-main-grid"
        >
          {/* Column 1: Brand Info & Description */}
          <div className="footer-brand-col">
            <p
              style={{
                fontSize: '13.5px',
                color: 'rgba(255, 255, 255, 0.75)',
                lineHeight: 1.5,
                marginBottom: '16px',
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
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                  className="app-download-link"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.64-.78 1.08-1.87.96-2.96-.93.04-2.07.62-2.73 1.4-.59.68-1.11 1.79-.97 2.86 1.05.08 2.11-.52 2.74-1.3z" />
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.1 }}>
                    <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgba(255, 255, 255, 0.65)' }}>Download on</span>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>App Store</span>
                  </div>
                </a>

                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                  className="app-download-link"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a2.372 2.372 0 0 1-.609-1.637V3.451c0-.629.227-1.207.608-1.637zM15.206 13.414l2.769 2.769-12.721 7.345 9.952-10.114zM17.975 10.637l2.84 1.64c.731.423.731 1.111 0 1.534l-2.84 1.64-2.92-2.907 2.92-2.907zM5.254.472l12.721 7.345-2.769 2.769L5.254.472z" />
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.1 }}>
                    <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgba(255, 255, 255, 0.65)' }}>GET IT ON</span>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>Google Play</span>
                  </div>
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
                  onClick={() => {
                    if (link.section === 'community') {
                      window.open('https://pragya-connect.vercel.app/', '_blank', 'noopener,noreferrer');
                    } else if (onNavigateSection) {
                      onNavigateSection(link.section);
                    }
                  }}
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
                  href="https://www.facebook.com/pragyahk"
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
                  href="https://www.x.com/pragyahk"
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
                  href="https://www.youtube.com/@pys_hk"
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
                  href="https://www.linkedin.com/company/pyshk"
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
                  href="https://www.instagram.com/pragyahk"
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
        <div style={{ paddingTop: '18px' }}>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
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
