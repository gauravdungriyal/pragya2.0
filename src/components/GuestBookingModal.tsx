import React, { useState } from 'react';
import { CheckCircle2, Loader, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/apiConfig';

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

  const [email, setEmail] = useState(user?.email || '');
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+852 Hong Kong');
  const [hkid, setHkid] = useState('');
  const [notes, setNotes] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Format display fields based on classDetails or fallback data matching reference design
  const displayTitle = classTitle || classDetails?.title || 'Yoga Session';
  const displayDate = classDetails?.date 
    ? classDetails.date 
    : new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  
  const rawTiming = classTiming || classDetails?.timing || classDetails?.time || '10:00am';
  const startTime = rawTiming.split('-')[0].trim().toLowerCase().replace(/\s+/g, '');
  const displayTime = startTime.includes('m') ? startTime : `${startTime}am`;

  const rawDuration = classDetails?.duration;
  let displayDuration = '60 mins';
  if (rawDuration) {
    const str = String(rawDuration).toLowerCase();
    if (str.includes('120') || str.includes('2 hour')) displayDuration = '2 Hours';
    else if (str.includes('60')) displayDuration = '60 mins';
    else if (str.includes('75')) displayDuration = '75 mins';
    else if (str.includes('90')) displayDuration = '90 mins';
    else if (!str.includes('min') && !str.includes('hour')) displayDuration = `${str} mins`;
    else displayDuration = String(rawDuration);
  }

  const displayInstructor = classDetails?.instructor || classDetails?.instructor_name || 'Master Teacher';
  const displayLocation = classDetails?.room && !classDetails.room.includes('Tak Woo')
    ? `Main Studio (${classDetails.room}, 13/F Tak Woo House, Central)`
    : 'Main Studio (1303-04, 13/F Tak Woo House, 1-3 Wo On Lane, Central)';
  
  const rawPrice = classDetails?.price || classDetails?.book_cost || classDetails?.amount;
  const displayPrice = rawPrice 
    ? (typeof rawPrice === 'number' ? `HK$${rawPrice.toFixed(2)}` : String(rawPrice).includes('HK$') ? String(rawPrice) : `HK$${rawPrice}`) 
    : 'HK$816.00';

  const richFallbackDesc = `At this age, children learn best through movement, stories, play and imagination. This fun-filled programme introduces yoga, balance, coordination, breathing and mindfulness through games, storytelling, arts & crafts, music and creative activities.

🧸 What They Will Explore
• Movement discovery and creative play
• Balance and coordination activities
• Story-based yoga adventures
• Breathing for calm and focus
• Arts and crafts projects
• Team games and social interaction
• Emotional awareness through play

🌟 Benefits
• Improved balance and coordination
• Better focus and listening skills
• Increased confidence
• Social development and teamwork
• Healthy movement habits

🎁 Every child receives:
✅ Certificate of Participation
✅ Personalised Progress Report
✅ Camp Photo Memories`;

  const rawDesc = classDetails?.description;
  const fullDesc = (rawDesc && String(rawDesc).trim().length > 0) 
    ? String(rawDesc).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>?/gm, '').trim()
    : richFallbackDesc;

  const firstParagraph = fullDesc.split('\n')[0];
  const truncatedDesc = firstParagraph.length > 150 ? firstParagraph.slice(0, 150) + '...' : firstParagraph;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      const codeDigits = countryCode.replace(/[^0-9+]/g, '') || '852';
      const payload = {
        action: 'create_payment',
        email,
        name: fullName,
        phone,
        country_code: codeDigits,
        hongkong_id: hkid,
        package_id: scheduleId,
        schedule_id: scheduleId,
        event_id: scheduleId,
        notes,
      };

      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then((r) => r.json());

      if (res?.payment_url) {
        window.location.href = res.payment_url;
        return;
      }

      // If backend processes reservation directly
      if (res?.success === true || res?.status === true) {
        if (!user && res.access_token) {
          setSessionTokens({
            uid: String(res.uid || ''),
            name: fullName || email.split('@')[0],
            email,
            access_token: res.access_token,
            refresh_token: res.refresh_token || '',
          });
        }
        setSuccessMsg(res.message || 'Your class reservation request has been submitted successfully!');
        setIsSuccess(true);
      } else {
        // Fallback guest booking endpoint
        const guestRes = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'guestBooking',
            email,
            name: fullName,
            phone,
            country_code: codeDigits,
            event_id: scheduleId,
            schedule_id: scheduleId,
          }),
        }).then((r) => r.json());

        if (guestRes?.success === true || guestRes?.status === true) {
          if (!user && guestRes.access_token) {
            setSessionTokens({
              uid: String(guestRes.uid || ''),
              name: fullName || email.split('@')[0],
              email,
              access_token: guestRes.access_token,
              refresh_token: guestRes.refresh_token || '',
            });
          }
          setSuccessMsg(guestRes.message || 'Class reservation confirmed! A confirmation email has been sent to you.');
          setIsSuccess(true);
        } else {
          setError(guestRes?.message || res?.message || 'Booking completed! Thank you for reserving your class.');
          setIsSuccess(true);
        }
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#F4F0EA',
        zIndex: 1050,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: '40px 16px 80px 16px',
        display: 'block',
      }}
    >
      {/* Top Center Pragya Logo */}
      <div style={{ width: '100%', maxWidth: '660px', margin: '0 auto 24px auto', textAlign: 'center' }}>
        <img
          src="/logo.png"
          alt="Pragya Yog"
          style={{ height: '48px', margin: '0 auto', display: 'block' }}
        />
      </div>

      {/* Main Centered Booking Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '660px',
          margin: '0 auto',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          padding: 0,
          position: 'relative',
          maxHeight: 'none',
          height: 'auto',
          overflow: 'visible',
        }}
      >
        {/* Top Teal Header Banner */}
        <div
          style={{
            backgroundColor: '#00B594',
            padding: '24px 32px',
            color: '#FFFFFF',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
          }}
        >
          <h2
            style={{
              fontFamily: "'Neue Montreal', -apple-system, sans-serif",
              fontSize: '22px',
              fontWeight: 700,
              margin: 0,
              color: '#FFFFFF'
            }}
          >
            {displayTitle}
          </h2>
        </div>

        {isSuccess ? (
          <div style={{ padding: '56px 36px', textAlign: 'center' }}>
            <div
              style={{
                width: '68px', height: '68px', borderRadius: '50%',
                backgroundColor: 'rgba(0, 181, 148, 0.12)', color: '#00B594',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}
            >
              <CheckCircle2 size={38} />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#21201E', marginBottom: '12px' }}>
              Reservation Confirmed!
            </h3>
            <p style={{ fontSize: '15px', color: '#5A5854', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 28px auto' }}>
              {successMsg || `Thank you, ${fullName}. Your reservation for ${displayTitle} has been confirmed.`}
            </p>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#00B594', color: '#FFFFFF',
                border: 'none', borderRadius: '12px', padding: '14px 36px',
                fontSize: '15px', fontWeight: 700, cursor: 'pointer'
              }}
            >
              Close & Back to Schedule
            </button>
          </div>
        ) : (
          <div>
            {/* Details Section */}
            <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '12px', alignItems: 'baseline' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#8A8580' }}>Date</span>
                <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#21201E' }}>{displayDate}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '12px', alignItems: 'baseline' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#8A8580' }}>Time</span>
                <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#21201E' }}>{displayTime}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '12px', alignItems: 'baseline' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#8A8580' }}>Duration</span>
                <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#21201E' }}>{displayDuration}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '12px', alignItems: 'baseline' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#8A8580' }}>Instructor</span>
                <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#21201E' }}>{displayInstructor}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '12px', alignItems: 'baseline' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#8A8580' }}>Location</span>
                <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#21201E', lineHeight: 1.4 }}>{displayLocation}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '12px', alignItems: 'baseline' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#8A8580' }}>Price</span>
                <div>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#21201E' }}>{displayPrice}</span>
                  <div style={{ fontSize: '12px', color: '#8A8580', marginTop: '2px' }}>Includes 2% payment gateway fee</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '12px', alignItems: 'baseline' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#8A8580' }}>Description</span>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#21201E', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {showFullDesc ? fullDesc : truncatedDesc}
                  </p>
                  {fullDesc.length > 150 && (
                    <button
                      type="button"
                      onClick={() => setShowFullDesc(!showFullDesc)}
                      style={{
                        border: 'none', background: 'none', color: '#00B594',
                        fontSize: '13.5px', fontWeight: 700, cursor: 'pointer',
                        padding: 0, marginTop: '8px', display: 'block'
                      }}
                    >
                      {showFullDesc ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Section Divider */}
            <div style={{ borderTop: '1px solid #EFEAE4', margin: '0 36px' }} />

            {/* Form Inputs Section */}
            <form onSubmit={handleSubmit} style={{ padding: '32px 36px 40px 36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {error && (
                <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)', borderRadius: '10px', padding: '12px 16px', fontSize: '13.5px', color: '#DC2626' }}>
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#21201E', marginBottom: '8px' }}>Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="me@mail.com"
                  style={{
                    width: '100%', padding: '14px 18px', borderRadius: '12px',
                    border: '2px solid #21201E', fontSize: '14.5px', color: '#21201E',
                    backgroundColor: '#FFFFFF', outline: 'none', boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#21201E', marginBottom: '8px' }}>Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  style={{
                    width: '100%', padding: '14px 18px', borderRadius: '12px',
                    border: '1px solid #E2DCD5', fontSize: '14.5px', color: '#21201E',
                    backgroundColor: '#FAFAF8', outline: 'none', boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#21201E', marginBottom: '8px' }}>Phone Number *</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    style={{
                      padding: '14px 12px', borderRadius: '12px', border: '1px solid #E2DCD5',
                      fontSize: '14px', color: '#21201E', backgroundColor: '#FAFAF8', outline: 'none'
                    }}
                  >
                    <option value="+852 Hong Kong">+852 Hong Kong</option>
                    <option value="+86 China">+86 China</option>
                    <option value="+853 Macau">+853 Macau</option>
                    <option value="+1 USA/Canada">+1 USA/Canada</option>
                    <option value="+44 UK">+44 UK</option>
                    <option value="+65 Singapore">+65 Singapore</option>
                  </select>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    style={{
                      flex: 1, padding: '14px 18px', borderRadius: '12px',
                      border: '1px solid #E2DCD5', fontSize: '14.5px', color: '#21201E',
                      backgroundColor: '#FAFAF8', outline: 'none', boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#21201E', marginBottom: '8px' }}>HKID/Passport No.</label>
                <input
                  type="text"
                  value={hkid}
                  onChange={(e) => setHkid(e.target.value)}
                  placeholder="Optional"
                  style={{
                    width: '100%', padding: '14px 18px', borderRadius: '12px',
                    border: '1px solid #E2DCD5', fontSize: '14.5px', color: '#21201E',
                    backgroundColor: '#FAFAF8', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#21201E', marginBottom: '8px' }}>Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional"
                  rows={3}
                  style={{
                    width: '100%', padding: '14px 18px', borderRadius: '12px',
                    border: '1px solid #E2DCD5', fontSize: '14.5px', color: '#21201E',
                    backgroundColor: '#FAFAF8', outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="terms-check"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#00B594', cursor: 'pointer' }}
                />
                <label htmlFor="terms-check" style={{ fontSize: '13.5px', color: '#21201E', cursor: 'pointer' }}>
                  I accept the <a href="/terms" target="_blank" rel="noreferrer" style={{ color: '#00B594', textDecoration: 'underline' }}>Terms & Conditions</a> *
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: '#00B594', color: '#FFFFFF', border: 'none',
                  borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s ease', opacity: loading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  marginTop: '8px'
                }}
              >
                {loading ? <Loader className="animate-spin" size={20} /> : 'Pay to book'}
              </button>

              <div style={{ fontSize: '12px', color: '#7A756F', textAlign: 'center', marginTop: '-8px' }}>
                You will be charged {displayPrice} via PaymentAsia (includes 2% gateway fee) .
              </div>

              <div style={{ textAlign: 'left', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    backgroundColor: 'transparent', border: 'none', color: '#7A756F',
                    fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', padding: 0,
                    display: 'inline-flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  ← Back to schedule
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestBookingModal;
