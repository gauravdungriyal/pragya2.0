import React from 'react';
import { X, User, Mail, Phone, Calendar, Tag, DollarSign, ShieldCheck } from 'lucide-react';

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
}

export const BookingDetailDrawer: React.FC<BookingDetailDrawerProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  if (!isOpen || !booking) return null;

  const getStatusBadgeStyle = (status: BookingRecord['status']) => {
    switch (status) {
      case 'Confirmed':
        return { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' };
      case 'Completed':
        return { bg: '#F0F9FF', color: '#0369A1', border: '#BAE6FD' };
      case 'Cancelled':
        return { bg: '#FEF2F2', color: '#991B1B', border: '#FECDD3' };
      default:
        return { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' };
    }
  };

  const statusStyle = getStatusBadgeStyle(booking.status);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderLeft: '1px solid #E7E5E4', color: '#1C1917', width: '100%', maxWidth: '540px', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)' }}>
        
        {/* Header */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid #F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1917', margin: 0 }}>Booking Inspection</h2>
            <p style={{ fontSize: '12px', color: '#78716C', fontFamily: 'monospace', margin: '2px 0 0 0' }}>ID: #{booking.id}</p>
          </div>
          <button
            onClick={onClose}
            style={{ padding: '8px', color: '#78716C', borderRadius: '10px', backgroundColor: '#F5F5F4', border: '1px solid #E7E5E4', cursor: 'pointer' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-Only Body */}
        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, overflowY: 'auto' }}>
          
          {/* Status Badge Card */}
          <div style={{ backgroundColor: '#FAF7F2', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E7E5E4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Booking Status
            </span>
            <span style={{ padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 800, backgroundColor: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}>
              {booking.status}
            </span>
          </div>

          {/* Customer Information Card */}
          <div style={{ backgroundColor: '#FAF7F2', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E7E5E4', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 900, color: '#78350F', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Customer Details
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

          {/* Reserved Offering Details */}
          <div style={{ backgroundColor: '#FAF7F2', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E7E5E4', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 900, color: '#78350F', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Reserved Item Info
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#44403C' }}>
              <div style={{ fontWeight: 800, color: '#1C1917', fontSize: '16px' }}>{booking.itemTitle}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag className="w-4 h-4 text-stone-500" />
                <span>Type: <strong style={{ color: '#1C1917' }}>{booking.bookingType}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar className="w-4 h-4 text-stone-500" />
                <span>Scheduled Date: <strong style={{ color: '#1C1917' }}>{booking.date}</strong></span>
              </div>
              {booking.amount !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign className="w-4 h-4 text-amber-700" />
                  <span>Amount Paid: <strong style={{ color: '#B45309', fontSize: '15px' }}>{booking.currency || 'HKD'} ${booking.amount}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Admin / Booking Notes (Read-Only) */}
          {booking.notes && (
            <div style={{ backgroundColor: '#FAF7F2', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E7E5E4', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#78350F', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Booking Notes
              </span>
              <p style={{ margin: 0, fontSize: '13px', color: '#44403C', lineHeight: '1.5' }}>
                {booking.notes}
              </p>
            </div>
          )}

          <div style={{ backgroundColor: '#ECFDF5', padding: '14px 20px', borderRadius: '14px', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#065F46', fontWeight: 700 }}>
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            Verified API Record (Read-Only)
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ padding: '20px 28px', borderTop: '1px solid #F5F5F4', backgroundColor: '#FAF7F2', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '12px 28px', backgroundColor: '#B45309', color: '#FFFFFF', borderRadius: '12px', fontSize: '14px', fontWeight: 800, border: 'none', cursor: 'pointer' }}
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
};
