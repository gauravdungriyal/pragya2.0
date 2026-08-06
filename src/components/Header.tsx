import React, { useState } from 'react';
import { Calendar, User, Menu, X } from 'lucide-react';

interface HeaderProps {
  onOpenBooking: (type?: string, title?: string) => void;
  onOpenSearch: () => void;
  onNavigateSection: (sectionId: string) => void;
  currentView?: string;
  onViewChange?: (view: 'home' | 'about' | 'classes' | 'teachers' | 'membership' | 'events' | 'ai-assistant') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBooking,
  onOpenSearch,
  onNavigateSection,
  currentView = 'home',
  onViewChange
}) => {
  const [activeTab, setActiveTab] = useState(
    currentView === 'about' ? 'About' : currentView === 'classes' ? 'Classes' : currentView === 'teachers' ? 'Teachers' : currentView === 'membership' ? 'Membership & Packages' : currentView === 'events' ? 'Events' : currentView === 'community' ? 'Community' : 'Home'
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Synchronize active tab with currentView prop
  React.useEffect(() => {
    if (currentView === 'about') {
      setActiveTab('About');
    } else if (currentView === 'classes') {
      setActiveTab('Classes');
    } else if (currentView === 'teachers') {
      setActiveTab('Teachers');
    } else if (currentView === 'membership') {
      setActiveTab('Membership & Packages');
    } else if (currentView === 'events') {
      setActiveTab('Events');
    } else if (currentView === 'community') {
      setActiveTab('Community');
    } else if (currentView === 'home') {
      setActiveTab('Home');
    }
  }, [currentView]);

  const navItems = [
    { label: 'Home', id: 'hero', type: 'section' },
    { label: 'About', id: 'about', type: 'page' },
    { label: 'Events', id: 'events', type: 'page' },
    { label: 'Classes', id: 'classes', type: 'page' },
    { label: 'Teachers', id: 'teachers', type: 'page' },
    { label: 'Membership & Packages', id: 'membership', type: 'page' },
    { label: 'Community', id: 'community', type: 'page' },
    { label: 'Login', id: 'login', type: 'action' }
  ];

  const handleScheduleRedirect = () => {
    if (onViewChange) {
      onViewChange('classes');
      setTimeout(() => {
        const elem = document.getElementById('live-schedule');
        if (elem) {
          const headerOffset = 80;
          const elementPosition = elem.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 150);
    }
  };

  const handleNavClick = (item: { label: string; id: string; type: string }) => {
    setActiveTab(item.label);
    setMobileMenuOpen(false);

    if (item.label === 'About' || item.id === 'about') {
      if (onViewChange) onViewChange('about');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.label === 'Classes' || item.id === 'classes') {
      if (onViewChange) onViewChange('classes');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.label === 'Teachers' || item.id === 'teachers') {
      if (onViewChange) onViewChange('teachers');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.label === 'Membership & Packages' || item.id === 'membership') {
      if (onViewChange) onViewChange('membership');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.label === 'Events' || item.id === 'events' || item.id === 'programs') {
      if (onViewChange) onViewChange('events');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.label === 'AI Assistant' || item.id === 'ai-assistant') {
      if (onViewChange) onViewChange('ai-assistant');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.label === 'Community' || item.id === 'community') {
      window.open('https://pragya-connect.vercel.app/', '_blank', 'noopener,noreferrer');
    } else if (item.label === 'Home') {
      if (onViewChange) onViewChange('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.type === 'action' && item.id === 'login') {
      if (onViewChange) onViewChange('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (onViewChange && currentView !== 'home') {
        onViewChange('home');
        setTimeout(() => {
          onNavigateSection(item.id);
        }, 100);
      } else {
        onNavigateSection(item.id);
      }
    }
  };

  return (
    <header
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        padding: '16px 36px',
        height: '100px',
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}
    >
      {/* Left: Brand Logo & Title */}
      <div
        onClick={() => handleNavClick({ label: 'Home', id: 'hero', type: 'section' })}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          userSelect: 'none',
          flexShrink: 0
        }}
      >
        <img
          src="/logo.png"
          alt="Pragya Yog School Logo"
          style={{ height: '68px', width: 'auto', objectFit: 'contain', transition: 'transform 0.25s ease' }}
          className="brand-logo-img"
        />
        <span
          className="brand-logo-text"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: '16px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: '#21201E',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap'
          }}
        >
          Pragya Yog School
        </span>
      </div>

      {/* Center: Completely Transparent Nav Items Bar */}
      <nav
        className="desktop-nav"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none',
          margin: '0 auto'
        }}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.label;
          return (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className={`nav-pill-button ${isActive ? 'active' : ''}`}
              style={{
                background: isActive ? '#FFFFFF' : 'transparent',
                color: '#21201E',
                boxShadow: isActive ? '0 4px 14px rgba(0, 0, 0, 0.06)' : 'none',
                border: 'none',
                borderRadius: '999px',
                padding: isActive ? '8px 22px' : '8px 12px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap'
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Right: Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={handleScheduleRedirect}
          className="hdr-action-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(33, 32, 30, 0.25)',
            color: '#21201E',
            borderRadius: '999px',
            padding: '0 16px',
            height: '36px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Calendar size={13} color="#21201E" />
          <span>SCHEDULE</span>
        </button>

        <button
          onClick={() => {
            if (onViewChange) onViewChange('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label="User Account"
          className="hdr-icon-btn"
          style={{
            background: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(33, 32, 30, 0.25)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#21201E',
            transition: 'all 0.2s ease'
          }}
        >
          <User size={16} />
        </button>

        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
          style={{
            background: 'transparent',
            border: 'none',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#21201E',
            transition: 'all 0.2s'
          }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile / Tablet Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            top: '96px',
            backgroundColor: '#E6D9CF',
            zIndex: 899,
            padding: '32px 48px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-serif)',
                fontSize: '24px',
                color: '#21201E',
                textAlign: 'left',
                padding: '10px 0',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                cursor: 'pointer'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        .nav-pill-button:not(.active):hover {
          background-color: rgba(255, 255, 255, 0.5) !important;
          color: #000000 !important;
        }
        .brand-logo-img:hover {
          transform: scale(1.03);
        }
        .hdr-action-btn:hover, .hdr-icon-btn:hover {
          background-color: #FFFFFF !important;
          border-color: #21201E !important;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
          transform: translateY(-1px);
        }
        .mobile-menu-toggle {
          display: none !important;
        }
        @media (max-width: 768px) {
          header {
            padding: 12px 20px !important;
            height: 96px !important;
          }
          .brand-logo-img {
            height: 80px !important;
          }
          .brand-logo-text {
            display: none !important;
          }
          .hdr-icon-btn {
            display: none !important;
          }
        }
        @media (max-width: 1240px) {
          .desktop-nav { display: none !important; }
          .hdr-action-btn { display: none !important; }
          .mobile-menu-toggle {
            display: flex !important;
            background-color: #FFFFFF !important;
            border: 1px solid rgba(0, 0, 0, 0.08) !important;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06) !important;
            width: 42px !important;
            height: 42px !important;
            border-radius: 50% !important;
            align-items: center !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </header>
  );
};
