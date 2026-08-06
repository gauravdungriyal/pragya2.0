import React, { useState, useEffect } from 'react';
import {
  Lock, ArrowLeft, ShieldCheck, Sparkles, Eye, EyeOff,
  Server, HelpCircle, Leaf
} from 'lucide-react';
import { AdminPanel } from './AdminPanel';

interface AdminStandalonePageProps {
  onBackToSite: () => void;
}

export const AdminStandalonePage: React.FC<AdminStandalonePageProps> = ({ onBackToSite }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const prevBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#F5EFE5';
    return () => { document.body.style.backgroundColor = prevBg; };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const val = passcode.trim();
    if (val === 'kg867gjnki') {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const fillDemo = () => { setPasscode('kg867gjnki'); setError(false); };

  if (isAuthenticated) {
    return <AdminPanel onBackToSite={onBackToSite} />;
  }

  return (
    <div
      style={{ minHeight: '100vh', backgroundColor: '#F5EFE5', display: 'flex', flexDirection: 'column' }}
    >
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <header style={{
        backgroundColor: '#00381F',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '0 32px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {/* Left: Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.png" alt="Pragya Yog" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#D9AE29',
          }}>
            Pragya Yog
          </span>
        </div>

        {/* Right: Back button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onBackToSite}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 16px', borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
          >
            <ArrowLeft size={15} style={{ color: '#D9AE29' }} />
            Back to Website
          </button>
        </div>
      </header>

      {/* ─── Main ─────────────────────────────────────────────────────────── */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative background blobs */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 320, height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(148,68,38,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60,
          width: 280, height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,56,31,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* ─── Card Container ─── */}
        <div style={{
          width: '100%', maxWidth: 480,
          display: 'flex', flexDirection: 'column', gap: 0,
        }}>

          {/* Top decorative label */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, marginBottom: 24,
          }}>
            <Leaf size={14} style={{ color: '#00381F' }} />
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: '#00381F',
            }}>
              Staff & Admin Portal
            </span>
            <Leaf size={14} style={{ color: '#00381F', transform: 'scaleX(-1)' }} />
          </div>

          {/* Main Card */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: 24,
            border: '1px solid rgba(148,68,38,0.12)',
            boxShadow: '0 20px 60px -12px rgba(39,39,39,0.14), 0 0 0 1px rgba(148,68,38,0.06)',
            overflow: 'hidden',
          }}>
            {/* Card top accent stripe */}
            <div style={{
              height: 5,
              background: 'linear-gradient(90deg, #944426 0%, #D9AE29 50%, #00381F 100%)',
            }} />

            <div style={{ padding: '40px 40px 36px' }}>
              {/* Icon + Title */}
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 18,
                  background: 'linear-gradient(135deg, #944426 0%, #D9AE29 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 24px -4px rgba(148,68,38,0.35)',
                }}>
                  <Lock size={28} color="#fff" />
                </div>
                <h1 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 30, fontWeight: 700,
                  color: '#272727', letterSpacing: '-0.02em',
                  margin: '0 0 8px',
                }}>
                  Admin Authentication
                </h1>
                <p style={{
                  fontSize: 13, color: '#8A8580', fontWeight: 400, lineHeight: 1.6,
                  margin: 0,
                }}>
                  Secure access portal to manage Teacher Trainings, Workshops,
                  Retreats &amp; Memberships.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Passcode field */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: '#272727',
                    }}>
                      Passcode
                    </label>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasscode ? 'text' : 'password'}
                      value={passcode}
                      autoFocus
                      placeholder="Enter administrative passcode..."
                      onChange={e => { setPasscode(e.target.value); setError(false); }}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '13px 44px 13px 16px',
                        borderRadius: 12,
                        border: error
                          ? '1.5px solid #ef4444'
                          : '1.5px solid rgba(39,39,39,0.15)',
                        backgroundColor: '#F5EFE5',
                        fontSize: 14, color: '#272727',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        fontFamily: 'var(--font-sans)',
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = '#944426';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(148,68,38,0.1)';
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = error ? '#ef4444' : 'rgba(39,39,39,0.15)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode(v => !v)}
                      style={{
                        position: 'absolute', right: 14, top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#8A8580', display: 'flex', alignItems: 'center',
                        padding: 0,
                      }}
                    >
                      {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Error message */}
                  {error && (
                    <div style={{
                      marginTop: 8, padding: '10px 14px',
                      borderRadius: 10,
                      backgroundColor: 'rgba(239,68,68,0.06)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      display: 'flex', alignItems: 'flex-start', gap: 8,
                    }}>
                      <HelpCircle size={15} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 12, color: '#b91c1c', lineHeight: 1.5 }}>
                        Incorrect passcode. Please enter the correct admin passcode.
                      </span>
                    </div>
                  )}
                </div>

                {/* Access info box */}
                <div style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  backgroundColor: 'rgba(0,56,31,0.05)',
                  border: '1px solid rgba(0,56,31,0.12)',
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                }}>
                  <ShieldCheck size={16} style={{ color: '#00381F', flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#00381F', display: 'block', marginBottom: 3 }}>
                      Authorized Staff Access
                    </span>
                    <span style={{ fontSize: 12, color: '#8A8580', lineHeight: 1.55 }}>
                      Full rights to create, edit, and publish all 7 package types
                      with live database sync.
                    </span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #944426 0%, #D9AE29 100%)',
                    border: 'none',
                    color: '#fff',
                    fontSize: 14, fontWeight: 700,
                    letterSpacing: '0.02em',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 8px 24px -4px rgba(148,68,38,0.35)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.92'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Log In
                </button>
              </form>
            </div>
          </div>

          {/* Footer note */}
          <p style={{
            textAlign: 'center', marginTop: 20,
            fontSize: 12, color: '#8A8580',
          }}>
            This portal is restricted to authorized Pragya Yog staff only.
          </p>
        </div>
      </main>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer style={{
        backgroundColor: '#00381F',
        padding: '16px 32px',
        textAlign: 'center',
        fontSize: 12,
        color: 'rgba(255,255,255,0.45)',
      }}>
        Pragya Yog School Sanctuary &copy; {new Date().getFullYear()} — Admin Portal
      </footer>
    </div>
  );
};
