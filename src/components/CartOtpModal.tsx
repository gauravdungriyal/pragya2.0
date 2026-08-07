import React, { useState } from 'react';
import { X, Mail, Shield, User, Phone, Sparkles, CheckCircle2, ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { guestBookingCheckEmail, guestReservePackage, guestReserveBundle, guestBooking } from '../services/api';

interface CartOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: any;
  onSuccess: () => void;
}

export const CartOtpModal: React.FC<CartOtpModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess
}) => {
  const { setSessionTokens } = useAuth();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('852');
  const [hongkongId, setHongkongId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleStep1CheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await guestBookingCheckEmail(email);
      if (res?.fname) {
        setName(res.fname);
        if (res.phone) setPhone(res.phone);
        if (res.hongkong_id) setHongkongId(res.hongkong_id);
      }
      setStep('otp');
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleStep2VerifyAndReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otpCode || otpCode.length < 4) {
      setError('Please enter the OTP code sent to your email.');
      return;
    }
    if (!name) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      let res: any = null;

      const isBundle = item?.package_ids && Array.isArray(item.package_ids);
      const isPackage = item?.package_id || item?.packageID || item?.id;
      const isClass = item?.event_id || item?.schedule_id;

      if (isBundle) {
        res = await guestReserveBundle({
          bundle_id: item.bundle_id || item.id,
          package_ids: item.package_ids,
          otp: otpCode,
          email,
          name,
          phone,
          country_code: countryCode,
          hongkong_id: hongkongId,
        });
      } else if (isClass) {
        res = await guestBooking({
          event_id: item.event_id || item.schedule_id || item.id,
          otp: otpCode,
          name,
          email,
          phone,
          country_code: countryCode,
          hongkong_id: hongkongId,
        });
      } else {
        res = await guestReservePackage({
          package_id: item?.package_id || item?.packageID || item?.id || 1,
          otp: otpCode,
          email,
          name,
          phone,
          country_code: countryCode,
          hongkong_id: hongkongId,
        });
      }

      const isSuccess = res?.success === true || res?.status === true;

      if (isSuccess) {
        // Auto login guest with issued JWT tokens
        if (res?.access_token) {
          setSessionTokens({
            uid: String(res.uid || '1049'),
            name: res.name || name || email.split('@')[0],
            email,
            access_token: res.access_token,
            refresh_token: res.refresh_token || '',
          });
        }
        onSuccess();
      } else {
        const errMsg = res?.errors?.isEmpty || res?.message || 'Invalid OTP code. Please try again.';
        setError(errMsg);
      }
    } catch {
      setError('Network error. Please try again.');
    }

    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    paddingLeft: '44px',
    border: '1.5px solid rgba(39,39,39,0.15)',
    borderRadius: '12px',
    fontSize: '14.5px',
    color: '#272727',
    backgroundColor: '#FDFAF6',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11.5px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: '#5A5854',
    textTransform: 'uppercase',
    marginBottom: '6px'
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1060 }}>
      <div
        className="modal-content no-scrollbar"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: '36px 32px',
          maxWidth: '460px',
          width: '100%',
          borderRadius: '20px',
          maxHeight: '90vh',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '18px', right: '18px',
            background: 'rgba(39,39,39,0.06)', border: 'none', borderRadius: '50%',
            width: '34px', height: '34px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: '#272727'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#944426', fontSize: '11px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '10px' }}>
          <Sparkles size={13} />
          <span>Guest Verification & Auto-Login</span>
        </div>

        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: '#272727', marginBottom: '6px' }}>
          OTP Verification
        </h3>
        <p style={{ fontSize: '13.5px', color: '#6B655F', lineHeight: 1.5, marginBottom: '24px' }}>
          Verify your email to create your guest account and add <strong>{item?.title || 'this package'}</strong> to your cart.
        </p>

        {error && (
          <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#DC2626', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleStep1CheckEmail} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#8A8580" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  autoFocus
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary-hero"
              style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <Loader className="animate-spin" size={16} /> : <>Send OTP Code <ArrowRight size={16} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2VerifyAndReserve} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', color: '#5A5854', margin: 0 }}>
              An OTP was sent to <strong>{email}</strong>. Please enter the code below.
            </p>

            <div>
              <label style={labelStyle}>6-Digit OTP Code</label>
              <div style={{ position: 'relative' }}>
                <Shield size={16} color="#8A8580" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  style={{ ...inputStyle, letterSpacing: '0.15em', fontSize: '16px', fontWeight: 700 }}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#8A8580" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Code</label>
                <input
                  type="text"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '12px' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#8A8580" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>HKID / Passport No. (Optional)</label>
              <input
                type="text"
                placeholder="Optional"
                value={hongkongId}
                onChange={(e) => setHongkongId(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '16px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary-hero"
              style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1, marginTop: '8px' }}
            >
              {loading ? <Loader className="animate-spin" size={16} /> : <>Verify & Add to Cart <CheckCircle2 size={16} /></>}
            </button>

            <button
              type="button"
              onClick={() => { setStep('email'); setOtpCode(''); }}
              style={{ background: 'none', border: 'none', color: '#944426', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}
            >
              Change Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
