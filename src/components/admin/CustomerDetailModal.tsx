import React from 'react';
import { X, Mail, Phone, Award } from 'lucide-react';
import { BookingRecord } from './BookingDetailDrawer';

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  activePass?: string;
  memberSince: string;
}

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerProfile | null;
  customerBookings: BookingRecord[];
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  onClose,
  customer,
  customerBookings,
}) => {
  if (!isOpen || !customer) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderLeft: '1px solid #E7E5E4', color: '#1C1917', width: '100%', maxWidth: '520px', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)' }}>
        
        {/* Header Bar with Generous Padding */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid #F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78350F', fontWeight: 800, fontSize: '18px' }}>
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1917', margin: 0 }}>{customer.name}</h2>
              <p style={{ fontSize: '12px', color: '#78716C', fontWeight: 600, margin: '2px 0 0 0' }}>Member since {customer.memberSince}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ padding: '8px', color: '#78716C', borderRadius: '10px', backgroundColor: '#F5F5F4', border: '1px solid #E7E5E4', cursor: 'pointer' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body with Generous Vertical Gaps & Padding */}
        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, overflowY: 'auto' }}>
          
          {/* Contact Details Card */}
          <div style={{ backgroundColor: '#FAF7F2', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E7E5E4', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 900, color: '#78350F', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Contact Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#44403C' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail className="w-4 h-4 text-amber-700 shrink-0" />
                <a href={`mailto:${customer.email}`} style={{ fontWeight: 700, color: '#1C1917', textDecoration: 'none' }}>{customer.email}</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone className="w-4 h-4 text-amber-700 shrink-0" />
                <span style={{ fontWeight: 600 }}>{customer.phone || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award className="w-4 h-4 text-amber-700 shrink-0" />
                <span style={{ fontWeight: 600 }}>Active Pass: <strong style={{ color: '#1C1917', fontWeight: 800 }}>{customer.activePass || 'Standard Guest'}</strong></span>
              </div>
            </div>
          </div>

          {/* Booking History Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 900, color: '#78350F', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Booking History ({customerBookings.length})
            </h3>

            {customerBookings.length === 0 ? (
              <div style={{ padding: '16px 20px', backgroundColor: '#FAF7F2', borderRadius: '12px', border: '1px border #E7E5E4', color: '#A8A29E', fontSize: '13px', fontStyle: 'italic' }}>
                No booking history recorded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {customerBookings.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E7E5E4',
                      padding: '16px 20px',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: '#1C1917', fontSize: '14px' }}>{b.itemTitle}</div>
                      <div style={{ color: '#78716C', fontSize: '12px', marginTop: '3px', fontWeight: 600 }}>
                        📅 {b.date} • {b.bookingType}
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 800,
                      backgroundColor: b.status === 'Confirmed' ? '#ECFDF5' : b.status === 'Completed' ? '#F0F9FF' : b.status === 'Cancelled' ? '#FEF2F2' : '#FEF3C7',
                      color: b.status === 'Confirmed' ? '#047857' : b.status === 'Completed' ? '#0369A1' : b.status === 'Cancelled' ? '#991B1B' : '#78350F',
                      border: b.status === 'Confirmed' ? '1px solid #A7F3D0' : b.status === 'Completed' ? '1px solid #BAE6FD' : b.status === 'Cancelled' ? '1px solid #FECDD3' : '1px solid #FDE68A',
                    }}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Bar with Padding */}
        <div style={{ padding: '20px 28px', borderTop: '1px solid #F5F5F4', backgroundColor: '#FAF7F2' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: '#FFFFFF',
              color: '#44403C',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 800,
              border: '1px solid #D6D3D1',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            }}
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};
