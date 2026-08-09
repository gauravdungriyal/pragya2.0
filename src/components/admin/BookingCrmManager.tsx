import React, { useState } from 'react';
import { Search, FileSpreadsheet, Eye, Edit3, UserCheck, Calendar } from 'lucide-react';
import { BookingRecord, BookingDetailDrawer } from './BookingDetailDrawer';
import { CustomerProfile, CustomerDetailModal } from './CustomerDetailModal';

interface BookingCrmManagerProps {
  bookings: BookingRecord[];
  customers: CustomerProfile[];
  onUpdateBookingStatus: (id: string, status: BookingRecord['status'], notes?: string, date?: string) => void;
}

export const BookingCrmManager: React.FC<BookingCrmManagerProps> = ({
  bookings,
  customers,
  onUpdateBookingStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'crm'>('bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.itemTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || b.bookingType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredCustomers = customers.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const exportBookingsCSV = () => {
    const headers = ['Booking ID', 'Customer Name', 'Email', 'Phone', 'Type', 'Item Title', 'Date', 'Amount', 'Status', 'Notes'];
    const rows = filteredBookings.map((b) => [
      b.id,
      `"${b.customerName}"`,
      b.email,
      b.phone,
      b.bookingType,
      `"${b.itemTitle}"`,
      b.date,
      b.amount || 0,
      b.status,
      `"${b.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pragya_bookings_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCustomersCSV = () => {
    const headers = ['Customer ID', 'Name', 'Email', 'Phone', 'Active Pass', 'Total Bookings', 'Member Since'];
    const rows = filteredCustomers.map((c) => [
      c.id,
      `"${c.name}"`,
      c.email,
      c.phone,
      `"${c.activePass || 'Standard'}"`,
      c.totalBookings,
      c.memberSince,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pragya_customers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenBooking = (b: BookingRecord) => {
    setSelectedBooking(b);
    setBookingDrawerOpen(true);
  };

  const handleOpenCustomer = (c: CustomerProfile) => {
    setSelectedCustomer(c);
    setCustomerModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Top Controls Bar */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '20px 28px', borderRadius: '16px', border: '1px solid #E7E5E4', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setActiveTab('bookings')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: activeTab === 'bookings' ? 'none' : '1px solid #E7E5E4',
              backgroundColor: activeTab === 'bookings' ? '#B45309' : '#F5F5F4',
              color: activeTab === 'bookings' ? '#FFFFFF' : '#44403C',
            }}
          >
            <Calendar className="w-4 h-4" /> Booking Ledger ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab('crm')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: activeTab === 'crm' ? 'none' : '1px solid #E7E5E4',
              backgroundColor: activeTab === 'crm' ? '#B45309' : '#F5F5F4',
              color: activeTab === 'crm' ? '#FFFFFF' : '#44403C',
            }}
          >
            <UserCheck className="w-4 h-4" /> Customer CRM ({customers.length})
          </button>
        </div>

        <button
          onClick={activeTab === 'bookings' ? exportBookingsCSV : exportCustomersCSV}
          style={{
            padding: '10px 20px',
            backgroundColor: '#F5F5F4',
            color: '#292524',
            fontWeight: 800,
            borderRadius: '12px',
            fontSize: '13px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid #D6D3D1',
            cursor: 'pointer',
          }}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" /> Export CSV Data
        </button>

      </div>

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>

        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search className="w-4 h-4" style={{ position: 'absolute', left: '14px', top: '14px', color: '#A8A29E' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={activeTab === 'bookings' ? 'Search name, email, booking ID...' : 'Search customer name, email, phone...'}
            style={{ width: '100%', backgroundColor: '#FFFFFF', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px 12px 42px', fontSize: '13px', color: '#1C1917', outline: 'none', fontWeight: 600 }}
          />
        </div>

        {activeTab === 'bookings' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #D6D3D1', color: '#292524', borderRadius: '12px', padding: '12px 16px', fontSize: '13px', outline: 'none', fontWeight: 700 }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #D6D3D1', color: '#292524', borderRadius: '12px', padding: '12px 16px', fontSize: '13px', outline: 'none', fontWeight: 700 }}
            >
              <option value="ALL">All Categories</option>
              <option value="Class">Class</option>
              <option value="Package">Package</option>
              <option value="Event">Event</option>
              <option value="Retreat">Retreat</option>
              <option value="TTC">TTC</option>
            </select>
          </div>
        )}

      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: BOOKING LEDGER TABLE */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'bookings' && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', color: '#1C1917' }}>
              <thead style={{ backgroundColor: '#F5F5F4', color: '#57534E', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 900, borderBottom: '1px solid #E7E5E4' }}>
                <tr>
                  <th style={{ padding: '16px 20px' }}>ID</th>
                  <th style={{ padding: '16px 20px' }}>Customer</th>
                  <th style={{ padding: '16px 20px' }}>Item / Session</th>
                  <th style={{ padding: '16px 20px' }}>Type</th>
                  <th style={{ padding: '16px 20px' }}>Date</th>
                  <th style={{ padding: '16px 20px' }}>Amount</th>
                  <th style={{ padding: '16px 20px' }}>Status</th>
                  <th style={{ padding: '16px 20px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center', color: '#A8A29E', fontStyle: 'italic' }}>
                      No matching booking records found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #F5F5F4' }}>
                      <td style={{ padding: '16px 20px', fontFamily: 'monospace', color: '#78716C', fontWeight: 800 }}>#{b.id}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 800, color: '#1C1917' }}>{b.customerName}</div>
                        <div style={{ color: '#78716C', fontSize: '12px', marginTop: '2px' }}>{b.email}</div>
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 800, color: '#92400E' }}>{b.itemTitle}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ backgroundColor: '#F5F5F4', color: '#44403C', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, border: '1px solid #E7E5E4' }}>
                          {b.bookingType}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#57534E', fontWeight: 600 }}>{b.date}</td>
                      <td style={{ padding: '16px 20px', fontWeight: 900, color: '#1C1917' }}>
                        {b.amount ? `${b.currency || 'HKD'} $${b.amount}` : 'Free'}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 800,
                          backgroundColor: b.status === 'Confirmed' ? '#ECFDF5' : b.status === 'Completed' ? '#F0F9FF' : b.status === 'Cancelled' ? '#FEF2F2' : '#FEF3C7',
                          color: b.status === 'Confirmed' ? '#065F46' : b.status === 'Completed' ? '#0369A1' : b.status === 'Cancelled' ? '#991B1B' : '#78350F',
                          border: b.status === 'Confirmed' ? '1px solid #A7F3D0' : b.status === 'Completed' ? '1px solid #BAE6FD' : b.status === 'Cancelled' ? '1px solid #FECDD3' : '1px solid #FDE68A',
                        }}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenBooking(b)}
                          style={{ padding: '6px 14px', backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: '10px', fontWeight: 800, fontSize: '12px', border: '1px solid #FDE68A', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: CUSTOMER CRM TABLE */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'crm' && (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', color: '#1C1917' }}>
              <thead style={{ backgroundColor: '#F5F5F4', color: '#57534E', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 900, borderBottom: '1px solid #E7E5E4' }}>
                <tr>
                  <th style={{ padding: '16px 20px' }}>Customer Name</th>
                  <th style={{ padding: '16px 20px' }}>Email & Phone</th>
                  <th style={{ padding: '16px 20px' }}>Active Pass / Plan</th>
                  <th style={{ padding: '16px 20px' }}>Total Bookings</th>
                  <th style={{ padding: '16px 20px' }}>Member Since</th>
                  <th style={{ padding: '16px 20px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: '#A8A29E', fontStyle: 'italic' }}>
                      No matching customer records found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => {
                    const cBookings = bookings.filter(b => b.email.toLowerCase() === c.email.toLowerCase());
                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid #F5F5F4' }}>
                        <td style={{ padding: '16px 20px', fontWeight: 800, color: '#1C1917' }}>{c.name}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ color: '#1C1917', fontWeight: 700 }}>{c.email}</div>
                          <div style={{ color: '#78716C', fontSize: '12px', marginTop: '2px' }}>{c.phone}</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ backgroundColor: '#FEF3C7', color: '#78350F', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, border: '1px solid #FDE68A' }}>
                            {c.activePass || 'Standard Pass'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', fontWeight: 900, color: '#1C1917' }}>{cBookings.length || c.totalBookings}</td>
                        <td style={{ padding: '16px 20px', color: '#78716C', fontWeight: 600 }}>{c.memberSince}</td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleOpenCustomer(c)}
                            style={{ padding: '6px 14px', backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: '10px', fontWeight: 800, fontSize: '12px', border: '1px solid #FDE68A', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Eye className="w-3.5 h-3.5" /> View Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drawers */}
      <BookingDetailDrawer
        isOpen={bookingDrawerOpen}
        onClose={() => setBookingDrawerOpen(false)}
        booking={selectedBooking}
        onUpdateStatus={onUpdateBookingStatus}
      />

      <CustomerDetailModal
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        customer={selectedCustomer}
        customerBookings={
          selectedCustomer
            ? bookings.filter((b) => b.email.toLowerCase() === selectedCustomer.email.toLowerCase())
            : []
        }
      />

    </div>
  );
};
