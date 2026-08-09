import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, CheckCircle, Clock3, XCircle } from 'lucide-react';

export interface BookingRecord {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  bookingType: 'Class' | 'Package' | 'Event' | 'Retreat' | 'TTC';
  itemTitle: string;
  date: string;
  time?: string;
  amount?: number;
  currency?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt: string;
}

interface BookingDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingRecord | null;
  onUpdateStatus: (id: string, status: BookingRecord['status'], notes?: string, date?: string) => void;
}

export const BookingDetailDrawer: React.FC<BookingDetailDrawerProps> = ({
  isOpen,
  onClose,
  booking,
  onUpdateStatus,
}) => {
  const [status, setStatus] = useState<BookingRecord['status']>('Pending');
  const [notes, setNotes] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');

  useEffect(() => {
    if (booking) {
      setStatus(booking.status);
      setNotes(booking.notes || '');
      setRescheduleDate(booking.date || '');
    }
  }, [booking, isOpen]);

  if (!isOpen || !booking) return null;

  const handleSave = () => {
    onUpdateStatus(booking.id, status, notes.trim(), rescheduleDate.trim());
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderLeft: '1px solid #E7E5E4', color: '#1C1917', width: '100%', maxWidth: '540px', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)' }}>
        
        {/* Header */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid #F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1917', margin: 0 }}>Booking Details</h2>
            <p style={{ fontSize: '12px', color: '#78716C', fontFamily: 'monospace', margin: '2px 0 0 0' }}>ID: #{booking.id}</p>
          </div>
          <button
            onClick={onClose}
            style={{ padding: '8px', color: '#78716C', borderRadius: '10px', backgroundColor: '#F5F5F4', border: '1px solid #E7E5E4', cursor: 'pointer' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body with Generous Gaps */}
        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, overflowY: 'auto' }}>
          
          {/* Status Workflow Controls */}
          <div style={{ backgroundColor: '#FAF7F2', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E7E5E4', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: '#78350F', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Booking Status Workflow
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setStatus('Pending')}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  border: status === 'Pending' ? 'none' : '1px solid #E7E5E4',
                  backgroundColor: status === 'Pending' ? '#F59E0B' : '#FFFFFF',
                  color: status === 'Pending' ? '#FFFFFF' : '#44403C',
                }}
              >
                <Clock3 className="w-4 h-4" /> Pending
              </button>

              <button
                type="button"
                onClick={() => setStatus('Confirmed')}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  border: status === 'Confirmed' ? 'none' : '1px solid #E7E5E4',
                  backgroundColor: status === 'Confirmed' ? '#059669' : '#FFFFFF',
                  color: status === 'Confirmed' ? '#FFFFFF' : '#44403C',
                }}
              >
                <CheckCircle className="w-4 h-4" /> Confirmed
              </button>

              <button
                type="button"
                onClick={() => setStatus('Completed')}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  border: status === 'Completed' ? 'none' : '1px solid #E7E5E4',
                  backgroundColor: status === 'Completed' ? '#0284C7' : '#FFFFFF',
                  color: status === 'Completed' ? '#FFFFFF' : '#44403C',
                }}
              >
                <CheckCircle className="w-4 h-4" /> Completed
              </button>

              <button
                type="button"
                onClick={() => setStatus('Cancelled')}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  border: status === 'Cancelled' ? 'none' : '1px solid #E7E5E4',
                  backgroundColor: status === 'Cancelled' ? '#E11D48' : '#FFFFFF',
                  color: status === 'Cancelled' ? '#FFFFFF' : '#44403C',
                }}
              >
                <XCircle className="w-4 h-4" /> Cancelled
              </button>
            </div>
          </div>

          {/* Customer Information Card */}
          <div style={{ backgroundColor: '#FAF7F2', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E7E5E4', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 900, color: '#78350F', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Customer Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#44403C' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User className="w-4 h-4 text-amber-700 shrink-0" />
                <span style={{ fontWeight: 800, color: '#1C1917' }}>{booking.customerName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail className="w-4 h-4 text-amber-700 shrink-0" />
                <a href={`mailto:${booking.email}`} style={{ fontWeight: 700, color: '#1C1917', textDecoration: 'none' }}>{booking.email}</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone className="w-4 h-4 text-amber-700 shrink-0" />
                <span style={{ fontWeight: 600 }}>{booking.phone || 'No phone provided'}</span>
              </div>
            </div>
          </div>

          {/* Reserved Item Details */}
          <div style={{ backgroundColor: '#FAF7F2', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E7E5E4', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 900, color: '#78350F', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Reserved Offering Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#44403C' }}>
              <div style={{ fontWeight: 800, color: '#1C1917', fontSize: '16px' }}>{booking.itemTitle}</div>
              <div style={{ fontWeight: 600 }}>Category: <span style={{ color: '#1C1917', fontWeight: 800 }}>{booking.bookingType}</span></div>
              {booking.amount !== undefined && (
                <div style={{ fontWeight: 600 }}>Amount Paid: <span style={{ fontWeight: 900, color: '#B45309', fontSize: '16px' }}>{booking.currency || 'HKD'} ${booking.amount}</span></div>
              )}
            </div>
          </div>

          {/* Reschedule Date Input */}
          <div>
            <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Reschedule Date</label>
            <input
              type="text"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              placeholder="e.g. Oct 20, 2026 10:00 AM"
              style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
            />
          </div>

          {/* Internal Admin Notes Textarea */}
          <div>
            <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Internal Admin Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add payment ref #, reception notes, or special instructions..."
              style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '14px 16px', fontSize: '14px', color: '#1C1917', outline: 'none', lineHeight: '1.6', resize: 'vertical' }}
            />
          </div>

        </div>

        {/* Footer Actions with Padding */}
        <div style={{ padding: '20px 28px', borderTop: '1px solid #F5F5F4', backgroundColor: '#FAF7F2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{ padding: '12px 24px', backgroundColor: '#FFFFFF', color: '#44403C', borderRadius: '12px', fontSize: '14px', fontWeight: 800, border: '1px solid #D6D3D1', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{ padding: '12px 26px', backgroundColor: '#B45309', color: '#FFFFFF', borderRadius: '12px', fontSize: '14px', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 3px 10px rgba(180,83,9,0.3)' }}
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};
