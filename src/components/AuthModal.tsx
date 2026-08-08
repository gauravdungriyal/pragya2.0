import React, { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, Sparkles, CheckCircle2, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** Pre-select the tab when opening */
  initialTab?: 'login' | 'reset';
}

type Tab = 'login' | 'reset' | 'reset-sent';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, initialTab = 'login' }) => {
  const { login, resetPassword } = useAuth();

  const [tab, setTab] = useState<Tab>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Reset form
  const [resetEmail, setResetEmail] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginData.email || !loginData.password) {
      setError('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    const result = await login(loginData.email, loginData.password);
    setIsLoading(false);
    if (result.success) {
      onSuccess?.();
      onClose();
    } else {
      setError(result.message);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!resetEmail) {
      setError('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    const result = await resetPassword(resetEmail);
    setIsLoading(false);
    if (result.success) {
      setTab('reset-sent');
    } else {
      let msg = result.message;
      if (msg === 'Can not reset password.') {
        msg = 'No registered member account was found for this email. If you booked as a guest, please reserve a package or pass to receive instant login tokens.';
      }
      setError(msg);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    paddingLeft: '44px',
    border: '1.5px solid rgba(39,39,39,0.15)',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#272727',
    backgroundColor: '#FDFAF6',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: '#5A5854',
    textTransform: 'uppercase',
    marginBottom: '6px',
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{ zIndex: 1050 }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '40px 36px', maxWidth: '440px', width: '100%' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '18px', right: '18px',
            background: 'rgba(39,39,39,0.06)', border: 'none', borderRadius: '50%',
            width: '34px', height: '34px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: '#272727',
          }}
        >
          <X size={18} />
        </button>

        {/* Brand badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#944426', fontSize: '11px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '12px' }}>
          <Sparkles size={13} />
          <span>Pragya Yog Member Portal</span>
        </div>

        {/* ── LOGIN TAB ─────────────────────────────────────── */}
        {tab === 'login' && (
          <>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: '#272727', marginBottom: '6px' }}>
              Welcome Back
            </h2>
            <p style={{ fontSize: '13px', color: '#8A8580', marginBottom: '28px' }}>
              Sign in to book classes, manage your membership & more.
            </p>

            {error && (
              <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#DC2626', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Email or Username</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#8A8580" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    placeholder="you@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    style={inputStyle}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#8A8580" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    style={{ ...inputStyle, paddingRight: '44px' }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8A8580', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => { setTab('reset'); setError(''); }}
                  style={{ background: 'none', border: 'none', fontSize: '12px', color: '#8A8580', cursor: 'pointer', fontWeight: 600 }}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary-hero"
                style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? (
                  <span>Signing in…</span>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Sign In to My Account</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* ── RESET PASSWORD TAB ───────────────────────────── */}
        {tab === 'reset' && (
          <>
            <button
              onClick={() => { setTab('login'); setError(''); }}
              style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#944426', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '20px', padding: 0 }}
            >
              <ArrowLeft size={14} /> Back to Login
            </button>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', color: '#272727', marginBottom: '6px' }}>
              Reset Password
            </h2>
            <p style={{ fontSize: '13px', color: '#8A8580', marginBottom: '24px' }}>
              Enter your registered email and we'll send a reset link.
            </p>

            {error && (
              <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#DC2626', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#8A8580" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary-hero"
                style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: 700, opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}

        {/* ── RESET SENT CONFIRMATION ──────────────────────── */}
        {tab === 'reset-sent' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(148,68,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <CheckCircle2 size={32} color="#944426" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: '#272727', marginBottom: '10px' }}>
              Reset Link Sent!
            </h3>
            <p style={{ fontSize: '14px', color: '#5A5854', lineHeight: 1.6, marginBottom: '24px' }}>
              Check your inbox at <strong>{resetEmail}</strong> for the password reset link.
            </p>
            <button
              onClick={() => { setTab('login'); setResetEmail(''); }}
              className="btn btn-secondary"
              style={{ padding: '12px 32px' }}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
