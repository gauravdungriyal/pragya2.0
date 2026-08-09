import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

interface AdminLoginProps {
  onAuthenticated: () => void;
  onExit: () => void;
}

const DEFAULT_ADMIN_PASS = 'kg867gjnki';

export const AdminLogin: React.FC<AdminLoginProps> = ({ onAuthenticated, onExit }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === DEFAULT_ADMIN_PASS) {
      sessionStorage.setItem('pragya_admin_auth', 'true');
      onAuthenticated();
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F0E6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', color: '#1C1917', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '24px', padding: '44px 36px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Brand / Header with Generous Padding */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '18px', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#B45309' }}>
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1C1917', margin: 0, letterSpacing: '-0.02em' }}>Pragya Admin</h1>
            <p style={{ fontSize: '13px', color: '#78716C', marginTop: '6px', margin: 0, lineHeight: 1.5 }}>Enter your administrator passcode to proceed</p>
          </div>
        </div>

        {/* Form with Explicit Gaps and Input Paddings */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#44403C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Admin Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter password..."
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '14px', padding: '14px 16px 14px 44px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              />
              <KeyRound style={{ width: '18px', height: '18px', color: '#A8A29E', position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            {error && (
              <p style={{ marginTop: '10px', padding: '10px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FECDD3', borderRadius: '10px', color: '#991B1B', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚠️</span> {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px 24px',
              backgroundColor: '#B45309',
              color: '#FFFFFF',
              fontWeight: 800,
              borderRadius: '14px',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(180,83,9,0.3)',
            }}
          >
            Access Admin Panel <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Return to website */}
        <div style={{ paddingTop: '20px', borderTop: '1px solid #F5F5F4', textAlign: 'center' }}>
          <button
            onClick={onExit}
            style={{ fontSize: '13px', color: '#78716C', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ← Return to Main Website
          </button>
        </div>

      </div>
    </div>
  );
};
