import React, { useState, useEffect } from 'react';
import { Calendar, User, Menu, X, LogIn, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { AuthModal } from './AuthModal';
import { UserProfileDrawer } from './UserProfileDrawer';

interface HeaderProps {
  onOpenBooking: (type?: string, title?: string) => void;
  onOpenSearch: () => void;
  onNavigateSection: (sectionId: string) => void;
  currentView?: string;
  onViewChange?: (view: 'home' | 'about' | 'classes' | 'teachers' | 'membership' | 'events' | 'ai-assistant' | 'cart') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBooking,
  onOpenSearch,
  onNavigateSection,
  currentView = 'home',
  onViewChange
}) => {
  const { user, profile } = useAuth();
  const { cartCount, openCart } = useCart();
  const [activeTab, setActiveTab] = useState(
    currentView === 'about' ? 'About' : currentView === 'classes' ? 'Classes' : currentView === 'teachers' ? 'Teachers' : currentView === 'membership' ? 'Membership & Packages' : currentView === 'events' ? 'Events' : currentView === 'community' ? 'Community' : 'Home'
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  // Listen for the global "open auth" event (triggered by PackageReserveModal's sign-in link)
  useEffect(() => {
    const handler = () => setAuthModalOpen(true);
    window.addEventListener('pragya-open-auth', handler);
    return () => window.removeEventListener('pragya-open-auth', handler);
  }, []);

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
    { label: 'Community', id: 'community', type: 'page' }
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
        // Bug 1 fix: position:fixed so the header is always visible;
        // on home it stays transparent (hero handles the bg), on inner pages a solid bg is shown
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        padding: '16px 36px',
        height: '100px',
        backgroundColor: currentView === 'home' ? 'transparent' : '#F5EFE5',
        boxShadow: currentView === 'home' ? 'none' : '0 2px 16px rgba(0,0,0,0.06)',
        backdropFilter: currentView !== 'home' ? 'blur(12px)' : undefined,
        WebkitBackdropFilter: currentView !== 'home' ? 'blur(12px)' : undefined,
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
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
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
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
            WebkitBackdropFilter: 'blur(8px)',
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

        {/* Shopping Cart Button */}
        <button
          onClick={() => onViewChange && onViewChange('cart')}
          aria-label="Cart"
          className="hdr-icon-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(33, 32, 30, 0.25)',
            color: '#21201E',
            borderRadius: '999px',
            padding: '0 12px',
            height: '36px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            position: 'relative',
          }}
        >
          <ShoppingBag size={14} color="#944426" />
          {cartCount > 0 && (
            <span
              style={{
                backgroundColor: '#C85A32',
                color: '#FFFFFF',
                borderRadius: '999px',
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {cartCount}
            </span>
          )}
        </button>

        {/* Auth Button — Login or Avatar */}
        {user ? (
          <button
            onClick={() => setProfileDrawerOpen(true)}
            aria-label="My Profile"
            className="hdr-icon-btn"
            style={{
              background: 'rgba(148, 68, 38, 0.12)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1.5px solid rgba(148, 68, 38, 0.35)',
              height: '36px',
              width: '36px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#944426',
              transition: 'all 0.2s ease',
              position: 'relative',
              padding: 0,
            }}
          >
            {profile?.profile ? (
              <img src={profile.profile} alt="avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <User size={16} />
            )}
          </button>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            aria-label="Login"
            className="hdr-login-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#944426',
              border: 'none',
              color: '#fff',
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
            <LogIn size={13} />
            <span>LOGIN</span>
          </button>
        )}

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
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            height: '100vh',
            width: '100vw',
            backgroundColor: '#F5EFE5',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          {/* Mobile Drawer Top Header Bar */}
          <div
            style={{
              padding: '16px 24px',
              height: '80px',
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid rgba(39, 39, 39, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              zIndex: 2,
            }}
          >
            <div
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick({ label: 'Home', id: 'hero', type: 'section' });
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            >
              <img src="/logo.png" alt="Logo" style={{ height: '44px', width: 'auto' }} />
              <span style={{ fontFamily: "'Canela', serif", fontSize: '18px', fontWeight: 600, color: '#21201E' }}>
                Pragya Yog
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              style={{
                backgroundColor: 'rgba(39, 39, 39, 0.06)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#21201E',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Mobile Nav Links List */}
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {navItems.map((item) => {
              const isActive = activeTab === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavClick(item);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '14px 18px',
                    backgroundColor: isActive ? '#EAE1D4' : 'transparent',
                    border: 'none',
                    borderRadius: '12px',
                    fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                    fontSize: '18px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#944426' : '#21201E',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>{item.label}</span>
                  {isActive && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#944426' }} />}
                </button>
              );
            })}

            {/* Action Buttons inside Mobile Menu */}
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(39,39,39,0.08)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleScheduleRedirect();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(33, 32, 30, 0.2)',
                  borderRadius: '999px',
                  padding: '14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#21201E',
                  cursor: 'pointer',
                }}
              >
                <Calendar size={16} />
                <span>VIEW SCHEDULE</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onViewChange) onViewChange('cart');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(33, 32, 30, 0.2)',
                  borderRadius: '999px',
                  padding: '14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#21201E',
                  cursor: 'pointer',
                }}
              >
                <ShoppingBag size={16} color="#944426" />
                <span>CART ({cartCount})</span>
              </button>

              {user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setProfileDrawerOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#944426',
                    color: '#FFFFFF',
                    borderRadius: '999px',
                    padding: '14px',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <User size={16} />
                  <span>MY ACCOUNT ({user.name || user.email})</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#944426',
                    color: '#FFFFFF',
                    borderRadius: '999px',
                    padding: '14px',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <LogIn size={16} />
                  <span>MEMBER LOGIN</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setProfileDrawerOpen(true)}
      />

      {/* Profile Drawer */}
      <UserProfileDrawer
        isOpen={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
      />

      <style>{`
        .nav-pill-button:not(.active):hover {
          background-color: rgba(255, 255, 255, 0.5) !important;
          color: #000000 !important;
        }
        .brand-logo-img:hover {
          transform: scale(1.03);
        }
        /* Bug 12 fix: separate hover styles for schedule btn vs login btn */
        .hdr-action-btn:hover {
          background-color: rgba(255,255,255,0.9) !important;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
          transform: translateY(-1px);
        }
        .hdr-login-btn:hover {
          background-color: #7a3620 !important;
          box-shadow: 0 3px 10px rgba(148, 68, 38, 0.35);
          transform: translateY(-1px);
        }
        .hdr-icon-btn:hover {
          background-color: rgba(148, 68, 38, 0.2) !important;
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
          .hdr-login-btn { display: none !important; }
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
