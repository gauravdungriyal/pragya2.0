import React, { useState } from 'react';
import { X, CheckCircle2, Loader, Mail, Shield, User, Phone, Sparkles, ArrowRight, RefreshCw, ShoppingBag, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { guestBookingCheckEmail, guestBooking, guestReservePackage, getPackages, bookClass, bookDropIn } from '../services/api';
import { API_BASE_URL } from '../config/apiConfig';

let _cachedLivePackageId: number = 0;

async function getLivePackageId(): Promise<number> {
  if (_cachedLivePackageId > 0) return _cachedLivePackageId;
  try {
    const pkgData = await getPackages();
    if (pkgData && typeof pkgData === 'object') {
      for (const catItems of Object.values(pkgData)) {
        if (Array.isArray(catItems) && catItems.length > 0) {
          const id = Number((catItems[0] as any).id);
          if (!isNaN(id) && id > 0) {
            _cachedLivePackageId = id;
            return id;
          }
        }
      }
    }
  } catch { /* silent */ }
  return 0;
}

interface GuestBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string | number;
  classTitle: string;
  classTiming?: string;
  classDetails?: any;
}

export const GuestBookingModal: React.FC<GuestBookingModalProps> = ({
  isOpen, onClose, scheduleId, classTitle, classTiming, classDetails
}) => {
  const { user, setSessionTokens } = useAuth();
  const { addToCart } = useCart();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState(user?.email || '');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('852');
  const [hkid, setHkid] = useState('');
  const [notes, setNotes] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(true);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [noPackageError, setNoPackageError] = useState(false);

  if (!isOpen) return null;

  const handleResetAndClose = () => {
    setStep('email');
    setOtp('');
    setError('');
    setInfoMsg('');
    setIsSuccess(false);
    setNoPackageError(false);
    onClose();
  };

  const displayTitle = classTitle || classDetails?.title || 'Yoga Session';

  // Member direct booking (Skip OTP for logged in users)
  const handleMemberDirectBook = async () => {
    if (!user?.access_token) return;
    setLoading(true);
    setError('');
    setNoPackageError(false);
    try {
      const res = await bookClass(user.access_token, scheduleId);
      if (res.success) {
        setSuccessMsg(res.message || `Your booking for ${displayTitle} has been confirmed!`);
        setIsSuccess(true);
      } else {
        const msg = res.message || 'No active package or membership found for this class.';
        setError(msg);
        setNoPackageError(true);
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  // Drop-in Single Class Handler (Dynamic Price & ID)
  const handleBookDropIn = async () => {
    if (!user?.access_token) return;
    setLoading(true);
    setError('');
    const dropInPrice = Number(classDetails?.price || classDetails?.dropin_price || classDetails?.cost || 220);
    try {
      const res = await bookDropIn(user.access_token, scheduleId);
      if (res.success) {
        setSuccessMsg(res.message || `Drop-in booking request for ${displayTitle} submitted successfully!`);
        setIsSuccess(true);
      } else {
        // Add single drop-in class pass to cart dynamically
        addToCart({
          id: scheduleId || classDetails?.id || 'dropin-' + Date.now(),
          package_id: classDetails?.package_id || classDetails?.id || scheduleId,
          schedule_id: scheduleId,
          title: `Drop-In Single Class: ${displayTitle}`,
          price: dropInPrice,
          category: classDetails?.category || 'Drop-In Pass',
          type: 'class_pack'
        });
        handleResetAndClose();
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  // Buy Pass or Membership Handler (Dynamic API package lookup)
  const handleBuyPass = async () => {
    try {
      const pkgData = await getPackages();
      if (pkgData && typeof pkgData === 'object') {
        for (const catItems of Object.values(pkgData)) {
          if (Array.isArray(catItems) && catItems.length > 0) {
            const pkg = catItems[0] as any;
            addToCart({
              id: pkg.id || pkg.package_id,
              package_id: pkg.id || pkg.package_id,
              title: pkg.title || pkg.name || 'Sanctuary Class Pass',
              price: Number(pkg.price || pkg.amount || 1500),
              category: pkg.category || 'Class Pack',
              type: 'class_pack'
            });
            handleResetAndClose();
            return;
          }
        }
      }
    } catch { /* silent fallback */ }

    addToCart({
      id: classDetails?.package_id || classDetails?.id || 'pass-' + Date.now(),
      package_id: classDetails?.package_id || classDetails?.id || scheduleId,
      title: `${displayTitle} Pass`,
      price: Number(classDetails?.price || 1500),
      category: 'Class Pack',
      type: 'class_pack'
    });
    handleResetAndClose();
  };

  // Step 1: Check Email & Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await guestBookingCheckEmail(email);
      if (res?.fname) setFullName(res.fname);
      if (res?.phone) setPhone(res.phone);
      if (res?.hongkong_id) setHkid(res.hongkong_id);

      setStep('otp');
      setInfoMsg(`OTP code sent to ${email}`);
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!email) return;
    setResending(true);
    setError('');
    setInfoMsg('');
    try {
      await guestBookingCheckEmail(email);
      setInfoMsg(`A new 6-digit OTP code has been sent to ${email}`);
    } catch {
      setError('Failed to resend OTP code. Please try again.');
    }
    setResending(false);
  };

  // Step 2: Verify OTP & Background Login -> Transition to Member Booking
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNoPackageError(false);

    if (!otp || otp.trim().length < 6) {
      setError('Please enter the 6-digit OTP verification code sent to your email.');
      return;
    }
    if (!termsAgreed) {
      setError('Please accept the Terms & Conditions to proceed.');
      return;
    }
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!fullName) {
      setError('Please enter your full name.');
      return;
    }
    if (!phone) {
      setError('Please enter your phone number.');
      return;
    }

    setLoading(true);

    try {
      const parsedId = parseInt(String(scheduleId), 10);
      const numScheduleId = (!isNaN(parsedId) && parsedId > 0) ? parsedId : 101;
      const codeDigits = countryCode.replace(/[^0-9]/g, '') || '852';
      const cleanPhone = phone.replace(/[^0-9]/g, '');

      // 1. Call guestBooking endpoint to verify OTP & auto-create/activate guest account in database
      const guestRes = await guestBooking({
        event_id: numScheduleId,
        schedule_id: numScheduleId,
        otp: otp.trim(),
        name: fullName.trim(),
        email: email.trim(),
        phone: cleanPhone,
        country_code: codeDigits,
        hongkong_id: hkid.trim(),
      });

      // 2. Check if OTP verification failed (e.g. Invalid OTP)
      const rawErr = guestRes?.errors?.isEmpty || guestRes?.message || '';
      if (rawErr.toLowerCase().includes('invalid otp')) {
        setError('Invalid OTP code. Please check and try again.');
        setLoading(false);
        return;
      }

      // 3. OTP verified! Perform background auto-login with session tokens
      const authUser = {
        uid: String(guestRes?.uid || guestRes?.id || Date.now()),
        name: fullName.trim() || email.split('@')[0],
        email: email.trim(),
        access_token: guestRes?.access_token || 'guest_token_' + Date.now(),
        refresh_token: guestRes?.refresh_token || '',
      };
      setSessionTokens(authUser);

      // 4. Attempt member class booking with active session
      const token = authUser.access_token;
      const bookRes = await bookClass(token, scheduleId);

      if (bookRes.success) {
        setSuccessMsg(bookRes.message || `Your booking for ${displayTitle} has been confirmed!`);
        setIsSuccess(true);
      } else {
        // No active package found: transition directly to Member Class Booking screen with options
        setError(bookRes.message || 'No active package or membership found for this class.');
        setNoPackageError(true);
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11.5px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: '#5A5854',
    textTransform: 'uppercase',
    marginBottom: '6px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 18px 14px 44px',
    borderRadius: '14px',
    border: '1.5px solid rgba(39,39,39,0.15)',
    fontSize: '15px',
    color: '#272727',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  };

  return (
    <div
      onClick={handleResetAndClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(33, 30, 26, 0.55)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 1000000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#F8F4EE',
          borderRadius: '24px',
          padding: '36px 32px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(39, 39, 39, 0.07)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#272727',
            transition: 'background-color 0.2s ease',
          }}
        >
          <X size={18} />
        </button>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '16px 8px 8px 8px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 181, 148, 0.12)',
                color: '#00B594',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: '#272727', marginBottom: '10px', fontWeight: 600 }}>
              Reservation Confirmed!
            </h3>

            <p style={{ fontSize: '14px', color: '#5A5854', lineHeight: 1.6, marginBottom: '24px' }}>
              {successMsg || `Thank you, ${fullName}. Your reservation for ${displayTitle} has been confirmed.`}
            </p>

            <button
              onClick={handleResetAndClose}
              style={{
                width: '100%',
                padding: '14px 24px',
                backgroundColor: '#D9A726',
                color: '#272727',
                fontSize: '15px',
                fontWeight: 700,
                borderRadius: '30px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(217, 167, 38, 0.35)',
              }}
            >
              Close & Back to Schedule
            </button>
          </div>
        ) : user?.access_token ? (
          /* ── LOGGED-IN MEMBER CLASS BOOKING VIEW (No OTP) ─────────────── */
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#944426', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
              <Sparkles size={14} color="#944426" />
              <span>MEMBER CLASS BOOKING</span>
            </div>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', color: '#272727', margin: '0 0 6px 0', fontWeight: 600 }}>
              Book Class
            </h3>

            <p style={{ fontSize: '13.5px', color: '#6B655F', lineHeight: 1.5, marginBottom: '20px', marginTop: 0 }}>
              Confirm your booking for <strong>{displayTitle}</strong>.
            </p>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(39,39,39,0.1)', borderRadius: '16px', padding: '18px 20px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: '#8A8580', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '6px' }}>
                LOGGED-IN MEMBER ACCOUNT
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#272727', marginBottom: '2px' }}>
                {user.name || user.email}
              </div>
              <div style={{ fontSize: '13.5px', color: '#6B655F' }}>
                {user.email}
              </div>
              {classTiming && (
                <div style={{ fontSize: '13px', color: '#944426', fontWeight: 600, marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(39,39,39,0.06)' }}>
                  ⏰ {classTiming}
                </div>
              )}
            </div>

            {error && (
              <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)', borderRadius: '14px', padding: '16px', fontSize: '13px', color: '#DC2626', marginBottom: '18px' }}>
                <div style={{ fontWeight: 700, marginBottom: noPackageError ? '4px' : 0 }}>⚠️ {error}</div>
                {noPackageError && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(220, 38, 38, 0.15)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleBookDropIn}
                      disabled={loading}
                      style={{
                        padding: '11px 16px',
                        borderRadius: '100px',
                        backgroundColor: '#944426',
                        color: '#FFFFFF',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(148,68,38,0.25)'
                      }}
                    >
                      <ShoppingBag size={14} />
                      <span>Book Single Drop-In Class (HK${classDetails?.price || classDetails?.dropin_price || classDetails?.cost || 220})</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleBuyPass}
                      style={{
                        padding: '11px 16px',
                        borderRadius: '100px',
                        backgroundColor: '#272727',
                        color: '#FFFFFF',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(39,39,39,0.2)'
                      }}
                    >
                      <CreditCard size={14} />
                      <span>Buy Pass or Membership</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleMemberDirectBook}
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px 24px',
                backgroundColor: '#D9A726',
                color: '#272727',
                fontSize: '15px',
                fontWeight: 700,
                borderRadius: '30px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 20px rgba(217, 167, 38, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <Loader className="animate-spin" size={18} /> : <>Confirm Booking <ArrowRight size={18} /></>}
            </button>
          </div>
        ) : (
          <div>
            {/* Header Badge matching reference screenshot */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#944426',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              <Sparkles size={14} color="#944426" />
              <span>GUEST VERIFICATION & AUTO-LOGIN</span>
            </div>

            {/* Title */}
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '26px',
                color: '#272727',
                margin: '0 0 6px 0',
                fontWeight: 600,
              }}
            >
              OTP Verification
            </h3>

            {/* Subtext */}
            <p style={{ fontSize: '13.5px', color: '#6B655F', lineHeight: 1.5, marginBottom: '24px', marginTop: 0 }}>
              Verify your email to create your guest account and book <strong>{displayTitle}</strong>.
            </p>

            {error && (
              <div
                style={{
                  backgroundColor: 'rgba(220, 38, 38, 0.08)',
                  border: '1px solid rgba(220, 38, 38, 0.2)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  fontSize: '13px',
                  color: '#DC2626',
                  marginBottom: '18px',
                }}
              >
                {error}
              </div>
            )}

            {infoMsg && (
              <div
                style={{
                  backgroundColor: 'rgba(0, 181, 148, 0.08)',
                  border: '1px solid rgba(0, 181, 148, 0.2)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  fontSize: '13px',
                  color: '#00B594',
                  marginBottom: '18px',
                }}
              >
                {infoMsg}
              </div>
            )}

            {step === 'email' ? (
              /* ── STEP 1: Enter Email & Send OTP Code ─────────────── */
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>EMAIL ADDRESS</label>
                  <div style={{ position: 'relative' }}>
                    <Mail
                      size={18}
                      color="#8A8580"
                      style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    />
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
                  style={{
                    width: '100%',
                    padding: '15px 24px',
                    backgroundColor: '#D9A726',
                    color: '#272727',
                    fontSize: '15px',
                    fontWeight: 700,
                    borderRadius: '30px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(217, 167, 38, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: loading ? 0.7 : 1,
                    marginTop: '4px',
                  }}
                >
                  {loading ? (
                    <Loader className="animate-spin" size={18} />
                  ) : (
                    <>
                      Send OTP Code <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* ── STEP 2: Enter OTP & Complete Booking Details ────── */
              <form onSubmit={handleSubmitBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(39,39,39,0.1)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#5A5854' }}>
                    OTP sent to <strong>{email}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setOtp(''); setError(''); setInfoMsg(''); }}
                    style={{ background: 'none', border: 'none', color: '#944426', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Change Email
                  </button>
                </div>

                <div>
                  <label style={labelStyle}>6-DIGIT OTP CODE *</label>
                  <div style={{ position: 'relative' }}>
                    <Shield
                      size={18}
                      color="#944426"
                      style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    />
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      style={{
                        ...inputStyle,
                        border: '1.5px solid #D9A726',
                        letterSpacing: '0.15em',
                        fontSize: '16px',
                        fontWeight: 700,
                      }}
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>FULL NAME *</label>
                  <div style={{ position: 'relative' }}>
                    <User
                      size={18}
                      color="#8A8580"
                      style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    />
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>PHONE NUMBER *</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      style={{
                        padding: '14px 12px',
                        borderRadius: '14px',
                        border: '1.5px solid rgba(39,39,39,0.15)',
                        fontSize: '13.5px',
                        color: '#272727',
                        backgroundColor: '#FFFFFF',
                        outline: 'none',
                      }}
                    >
                      <option value="852">+852 Hong Kong</option>
                      <option value="91">+91 India</option>
                      <option value="86">+86 China</option>
                      <option value="853">+853 Macau</option>
                      <option value="1">+1 USA / Canada</option>
                      <option value="44">+44 UK (United Kingdom)</option>
                      <option value="65">+65 Singapore</option>
                      <option value="61">+61 Australia</option>
                      <option value="64">+64 New Zealand</option>
                      <option value="81">+81 Japan</option>
                      <option value="82">+82 South Korea</option>
                      <option value="49">+49 Germany</option>
                      <option value="33">+33 France</option>
                      <option value="39">+39 Italy</option>
                      <option value="34">+34 Spain</option>
                      <option value="41">+41 Switzerland</option>
                      <option value="31">+31 Netherlands</option>
                      <option value="32">+32 Belgium</option>
                      <option value="43">+43 Austria</option>
                      <option value="46">+46 Sweden</option>
                      <option value="47">+47 Norway</option>
                      <option value="45">+45 Denmark</option>
                      <option value="353">+353 Ireland</option>
                      <option value="971">+971 UAE (Dubai)</option>
                      <option value="966">+966 Saudi Arabia</option>
                      <option value="60">+60 Malaysia</option>
                      <option value="66">+66 Thailand</option>
                      <option value="62">+62 Indonesia</option>
                      <option value="63">+63 Philippines</option>
                      <option value="84">+84 Vietnam</option>
                      <option value="886">+886 Taiwan</option>
                    </select>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Phone
                        size={18}
                        color="#8A8580"
                        style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                      />
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>HKID / PASSPORT NO. (OPTIONAL)</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={hkid}
                    onChange={(e) => setHkid(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: '16px' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <input
                    type="checkbox"
                    id="modal-terms-check"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#D9A726', cursor: 'pointer' }}
                  />
                  <label htmlFor="modal-terms-check" style={{ fontSize: '12.5px', color: '#5A5854', cursor: 'pointer' }}>
                    I accept the Terms & Conditions *
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '15px 24px',
                    backgroundColor: '#D9A726',
                    color: '#272727',
                    fontSize: '15px',
                    fontWeight: 700,
                    borderRadius: '30px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(217, 167, 38, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: loading ? 0.7 : 1,
                    marginTop: '8px',
                  }}
                >
                  {loading ? (
                    <Loader className="animate-spin" size={18} />
                  ) : (
                    <>
                      Verify & Book Class <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#944426',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {resending ? <Loader className="animate-spin" size={14} /> : <RefreshCw size={14} />} Resend OTP Code
                  </button>

                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    style={{ background: 'none', border: 'none', color: '#7A756F', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestBookingModal;


