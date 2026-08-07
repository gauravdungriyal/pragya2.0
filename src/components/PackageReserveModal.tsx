import React, { useState } from 'react';
import { X, Package, Mail, User, Phone, Shield, CheckCircle2, Sparkles, ArrowLeft, ArrowRight, Loader, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/apiConfig';

interface PackageReserveModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: number | string;
  packageTitle: string;
  packagePrice?: string | number;
  isBundleMode?: boolean;
  bundleId?: number;
  packageIds?: number[];
}

type Mode = 'choose' | 'auth-reserve' | 'guest-email' | 'guest-otp' | 'success' | 'already-pending';

async function apiPost(action: string, payload: Record<string, any> = {}) {
  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  return res.json();
}

const PACKAGE_ID_MAP: Record<string, number> = {
  'ev-backbend-intensive': 12791,
  'ev-boat-trip': 12792,
  'ws-yog-therapy': 12794,
  'ws-sacred-sound': 12798,
  'ret-nepal-single': 12725,
  'ttc-200hr': 12760,
  'priv-health-1': 12795,
  'priv-5pack': 12796,
  'mem-unlim-1m': 12660,
  'mem-annual': 12712,
  'pack-10': 12753,
};

function resolveNumericPackageId(id: number | string): number {
  if (typeof id === 'number') return id;
  const parsed = Number(id);
  if (!isNaN(parsed) && parsed > 0) return parsed;
  const key = String(id).toLowerCase().trim();
  return PACKAGE_ID_MAP[key] || 12791;
}

export const PackageReserveModal: React.FC<PackageReserveModalProps> = ({
  isOpen, onClose, packageId, packageTitle, packagePrice, isBundleMode = false, bundleId, packageIds = []
}) => {
  const { user, authFetch, setSessionTokens } = useAuth();

  const [mode, setMode] = useState<Mode>('choose');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Guest fields
  const [guestEmail, setGuestEmail] = useState('');
  const [guestOtp, setGuestOtp] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [countryCode, setCountryCode] = useState('852');

  if (!isOpen) return null;

  const finalPackageId = resolveNumericPackageId(packageId);

  const handleClose = () => {
    setMode('choose');
    setError('');
    setGuestEmail('');
    setGuestOtp('');
    setGuestName('');
    setGuestPhone('');
    onClose();
  };

  // ── Authenticated reservation ──────────────────────────────────
  const handleAuthReserve = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      let res;
      if (isBundleMode) {
        res = await authFetch('reserve_bundle', { bundle_id: bundleId, package_ids: packageIds });
      } else {
        res = await authFetch('reserve_package', { package_id: finalPackageId });
      }

      if (res?.status === true || res?.success === true) {
        setSuccessMsg(res.message || 'Your reservation request has been submitted. Our team will contact you for payment.');
        setMode('success');
      } else if (res?.message?.toLowerCase().includes('already') || res?.message?.toLowerCase().includes('pending')) {
        setSuccessMsg(res.message);
        setMode('already-pending');
      } else {
        setError(res?.message || 'Reservation failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  // ── Guest email check ────────────────────────────────────────
  const handleGuestEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!guestEmail) { setError('Please enter your email.'); return; }
    setLoading(true);
    try {
      // Trigger OTP by calling email check
      const res = await apiPost('guestBookingCheckEmail', { email: guestEmail });
      if (res?.fname) setGuestName(res.fname);
      if (res?.phone) setGuestPhone(res.phone);
      setMode('guest-otp');
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  // ── Guest OTP reservation ────────────────────────────────────
  const handleGuestReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!guestOtp) { setError('Please enter the OTP sent to your email.'); return; }
    setLoading(true);
    try {
      let res;
      const basePayload = {
        otp: guestOtp,
        email: guestEmail,
        name: guestName,
        phone: guestPhone,
        country_code: countryCode,
      };

      if (isBundleMode) {
        res = await apiPost('guest_reserve_bundle', { ...basePayload, bundle_id: bundleId, package_ids: packageIds });
      } else {
        res = await apiPost('guest_reserve_package', { ...basePayload, package_id: finalPackageId });
      }

      if (res?.success === true) {
        if (res.access_token) {
          setSessionTokens({
            uid: String(res.uid || ''),
            name: res.name || guestName || guestEmail.split('@')[0],
            email: guestEmail,
            access_token: res.access_token,
            refresh_token: res.refresh_token || '',
          });
        }
        setSuccessMsg(res.message || 'Reservation submitted! Our admin team will contact you.');
        setMode('success');
      } else {
        let msg = res?.errors?.isEmpty || res?.message || 'Reservation failed.';
        if (msg === 'Please Try Again') {
          msg = 'This package or session is currently unavailable for reservation. Please try another pass or contact support.';
        }
        setError(msg);
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', paddingLeft: '44px',
    border: '1.5px solid rgba(39,39,39,0.15)', borderRadius: '12px',
    fontSize: '14px', color: '#272727', backgroundColor: '#FDFAF6',
    outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
    color: '#5A5854', textTransform: 'uppercase', marginBottom: '6px',
  };

  return (
    <div className="modal-backdrop" onClick={handleClose} style={{ zIndex: 1050 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '40px 36px', maxWidth: '460px', width: '100%' }}>
        <button onClick={handleClose} style={{ position: 'absolute', top: '18px', right: '18px', background: 'rgba(39,39,39,0.06)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#272727' }}>
          <X size={18} />
        </button>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#944426', fontSize: '11px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '10px' }}>
          <Sparkles size={13} /> Reserve Package
        </div>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#272727', marginBottom: '4px', lineHeight: 1.3 }}>{packageTitle}</h2>
        {packagePrice && (
          <p style={{ fontSize: '16px', color: '#944426', fontWeight: 700, marginBottom: '20px' }}>
            {typeof packagePrice === 'number' ? `HK$ ${packagePrice.toLocaleString()}` : packagePrice}
          </p>
        )}

        {error && (
          <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#DC2626', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* ── CHOOSE MODE ────────────────────────────────────── */}
        {mode === 'choose' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '13px', color: '#5A5854', marginBottom: '8px' }}>How would you like to proceed?</p>

            {user ? (
              <div style={{ background: '#FAF6F0', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(148,68,38,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} color="#944426" />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#272727' }}>Signed in as {user.name}</div>
                  <div style={{ fontSize: '11px', color: '#8A8580' }}>{user.email}</div>
                </div>
              </div>
            ) : null}

            {user ? (
              <button onClick={handleAuthReserve} disabled={loading} className="btn btn-primary-hero" style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
                {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</> : <><CreditCard size={16} /> Reserve Now</>}
              </button>
            ) : (
              <>
                <button onClick={() => setMode('guest-email')} className="btn btn-primary-hero" style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Mail size={16} /> Reserve as Guest (OTP)
                </button>
                <p style={{ fontSize: '12px', color: '#8A8580', textAlign: 'center' }}>
                  Have an account? <button onClick={() => window.dispatchEvent(new CustomEvent('pragya-open-auth'))} style={{ background: 'none', border: 'none', color: '#944426', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>Sign In</button>
                </p>
              </>
            )}
          </div>
        )}

        {/* ── GUEST EMAIL STEP ───────────────────────────────── */}
        {mode === 'guest-email' && (
          <form onSubmit={handleGuestEmailCheck} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button onClick={() => { setMode('choose'); setError(''); }} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#944426', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
              <ArrowLeft size={14} /> Back
            </button>
            <p style={{ fontSize: '13px', color: '#5A5854' }}>Enter your email to receive an OTP for verification.</p>
            <div>
              <label style={labelStyle}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#8A8580" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} autoFocus />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary-hero" style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
              {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending OTP…</> : <>Send OTP <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* ── GUEST OTP + DETAILS STEP ───────────────────────── */}
        {mode === 'guest-otp' && (
          <form onSubmit={handleGuestReserve} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button onClick={() => { setMode('guest-email'); setError(''); }} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#944426', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
              <ArrowLeft size={14} /> Back
            </button>
            <p style={{ fontSize: '13px', color: '#5A5854' }}>OTP sent to <strong>{guestEmail}</strong>. Enter your details below.</p>

            <div>
              <label style={labelStyle}>OTP Code</label>
              <div style={{ position: 'relative' }}>
                <Shield size={16} color="#8A8580" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="text" value={guestOtp} onChange={(e) => setGuestOtp(e.target.value)} placeholder="6-digit OTP" maxLength={6} style={inputStyle} inputMode="numeric" autoFocus />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#8A8580" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your full name" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Code</label>
                <input value={countryCode} onChange={(e) => setCountryCode(e.target.value)} placeholder="852" style={{ ...inputStyle, paddingLeft: '14px' }} />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#8A8580" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="Phone number" style={inputStyle} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary-hero" style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1, marginTop: '4px' }}>
              {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Reserving…</> : <><CheckCircle2 size={16} /> Confirm Reservation</>}
            </button>
          </form>
        )}

        {/* ── SUCCESS ────────────────────────────────────────── */}
        {(mode === 'success' || mode === 'already-pending') && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: 'rgba(148,68,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <CheckCircle2 size={36} color="#944426" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: '#272727', marginBottom: '10px' }}>
              {mode === 'already-pending' ? 'Already Reserved!' : 'Reservation Submitted!'}
            </h3>
            <p style={{ fontSize: '14px', color: '#5A5854', lineHeight: 1.6, marginBottom: '24px', maxWidth: '340px', margin: '0 auto 24px auto' }}>
              {successMsg}
            </p>
            <button onClick={handleClose} className="btn btn-secondary" style={{ padding: '12px 32px' }}>Done</button>
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};
