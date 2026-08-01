import React, { useState } from 'react';
import { X, CheckCircle2, User, Mail, Phone, Sparkles } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingType: string;
  bookingTitle: string;
  bookingDetails?: any;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  bookingType,
  bookingTitle,
  bookingDetails
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '07:00 AM',
    notes: '',
    paymentMethod: 'studio'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleResetAndClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '36px' }}>
        <button
          onClick={handleResetAndClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(39,39,39,0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#272727'
          }}
        >
          <X size={20} />
        </button>

        {isSubmitted ? (
          <div style={{ textAlign: 'center', padding: '36px 12px' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'rgba(148, 68, 38, 0.12)',
                color: '#944426',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}
            >
              <CheckCircle2 size={40} />
            </div>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: '#272727', marginBottom: '12px' }}>
              Reservation Confirmed!
            </h3>

            <p style={{ fontSize: '15px', color: '#5A5854', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto 24px auto' }}>
              Thank you, <strong>{formData.name}</strong>. Your reservation for <strong>{bookingTitle}</strong> has been received. Our concierge will send instant confirmation to <strong>{formData.email}</strong>.
            </p>

            <div style={{ backgroundColor: '#FAF6F0', borderRadius: '16px', padding: '16px 20px', marginBottom: '28px', fontSize: '13px', color: '#8A8580', textAlign: 'left' }}>
              <div>• Booking Ref: <strong>PYS-{Math.floor(100000 + Math.random() * 900000)}</strong></div>
              <div>• Location: Pragya Main Sanctuary</div>
              <div>• Mat & Eco-Towels: Provided complimentary</div>
            </div>

            <button onClick={handleResetAndClose} className="btn btn-secondary" style={{ padding: '12px 32px' }}>
              Close Window
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#944426', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              <Sparkles size={15} />
              <span>Pragya Concierge Booking</span>
            </div>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: '#272727', marginBottom: '6px' }}>
              {bookingTitle || 'Reserve Session'}
            </h3>

            <p style={{ fontSize: '14px', color: '#8A8580', marginBottom: '24px' }}>
              Complete your details below to confirm your mat space or session consultation.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#272727', marginBottom: '6px' }}>
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#8A8580" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#272727', marginBottom: '6px' }}>
                    Email Address *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#8A8580" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                      style={{ paddingLeft: '44px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#272727', marginBottom: '6px' }}>
                    Phone Number *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} color="#8A8580" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field"
                      style={{ paddingLeft: '44px' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#272727', marginBottom: '6px' }}>
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#272727', marginBottom: '6px' }}>
                    Preferred Session Slot
                  </label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="input-field"
                  >
                    <option value="07:00 AM">Morning Sunrise (07:00 AM)</option>
                    <option value="09:00 AM">Morning Flow (09:00 AM)</option>
                    <option value="11:00 AM">Midday Reformer (11:00 AM)</option>
                    <option value="05:30 PM">Sunset Sound Bath (05:30 PM)</option>
                    <option value="07:15 PM">Evening Meditation (07:15 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#272727', marginBottom: '6px' }}>
                  Payment Preference
                </label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="payment"
                      value="studio"
                      checked={formData.paymentMethod === 'studio'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'studio' })}
                    />
                    <span>Pay at Studio Desk</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={formData.paymentMethod === 'online'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'online' })}
                    />
                    <span>Online Credit / Apple Pay</span>
                  </label>
                </div>
              </div>

              <div style={{ marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary-hero" style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700 }}>
                  Confirm Session Reservation
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
