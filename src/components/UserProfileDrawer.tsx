import React, { useState, useEffect, useCallback } from 'react';
import {
  X, User, Wallet, Bell, Phone, Shield, LogOut, ChevronRight,
  Edit3, Check, AlertCircle, QrCode, Ticket, RefreshCw, Plus, Trash2,
  Eye, EyeOff, Lock, Camera, Calendar, Award, FileText, CalendarDays,
  Sparkles, CheckCircle2, ArrowRight
} from 'lucide-react';
import { useAuth, UserProfile } from '../context/AuthContext';
import { fetchFormData, renewPackage, toggleAutoRenew } from '../services/api';

import { API_BASE_URL } from '../config/apiConfig';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type Section = 'overview' | 'edit' | 'bookings' | 'memberships' | 'billings' | 'wallet' | 'notifications' | 'emergency' | 'password' | 'tickets' | 'checkin';

interface WalletEntry {
  amount: string;
  type: boolean;
  comments: string;
  date: string;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  created_at: string;
  user_seen: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  photo: string;
}

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({ isOpen, onClose }) => {
  const { user, profile, logout, authFetch, refreshProfile, resetPassword, setSessionTokens } = useAuth();
  const [section, setSection] = useState<Section>('overview');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  // Wallet
  const [walletBalance, setWalletBalance] = useState('');
  const [walletHistory, setWalletHistory] = useState<WalletEntry[]>([]);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Emergency contacts
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '' });
  const [addingContact, setAddingContact] = useState(false);

  // Edit profile form
  const [editForm, setEditForm] = useState({
    fname: '', lname: '', chinese_name: '', email: '', phone: '',
    hongkong_id: '', notify_whatsapp: '1', notify_email: '1', notify_push: '1',
    dob_month: '', dob_date: '',
  });

  // Password form
  const [passForm, setPassForm] = useState({ old_pass: '', password: '', confirmpassword: '' });
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });

  // Tickets
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });

  // Check-in QR
  const [qrData, setQrData] = useState('');

  // Bookings, Memberships, Billings
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [myMemberships, setMyMemberships] = useState<any[]>([]);
  const [myInvoices, setMyInvoices] = useState<any[]>([]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync edit form with profile
  useEffect(() => {
    if (profile) {
      setEditForm({
        fname: profile.fname || '',
        lname: profile.lname || '',
        chinese_name: profile.chinese_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        hongkong_id: profile.hkdf || '',
        notify_whatsapp: profile.notify_whatsapp || '1',
        notify_email: profile.notify_email || '1',
        notify_push: profile.notify_push || '1',
        dob_month: profile.dob_month || '',
        dob_date: profile.dob_date || '',
      });
    }
  }, [profile]);

  // Load section data on navigate
  useEffect(() => {
    if (!isOpen || !user) return;
    if (section === 'wallet') loadWallet();
    if (section === 'notifications') loadNotifications();
    if (section === 'emergency') loadContacts();
    if (section === 'tickets') loadTickets();
    if (section === 'checkin') loadQr();
    if (section === 'bookings') loadMyBookings();
    if (section === 'memberships') loadMyMemberships();
    if (section === 'billings') loadMyInvoices();
  }, [section, isOpen]);

  const loadWallet = async () => {
    try {
      const res = await authFetch('wallet');
      if (res?.status) {
        setWalletBalance(res.balance || '0.00');
        setWalletHistory(res.history || []);
      }
    } catch { }
  };

  const loadNotifications = async () => {
    try {
      const res = await authFetch('get-notification');
      if (res?.status) setNotifications(res.data || []);
    } catch { }
  };

  const dismissNotification = async (id: string) => {
    try {
      await authFetch('del-notification', { id });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch { }
  };

  const loadContacts = async () => {
    try {
      const res = await authFetch('emergency-contact', { action_type: 'get' });
      if (res?.status) setContacts(res.data || []);
    } catch { }
  };

  const addContact = async () => {
    if (!newContact.name || !newContact.relationship || !newContact.phone) {
      showToast('Please fill all contact fields.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await authFetch('emergency-contact', { action_type: 'add', ...newContact });
      if (res?.status) {
        showToast('Contact added!');
        setNewContact({ name: '', relationship: '', phone: '' });
        setAddingContact(false);
        loadContacts();
      } else {
        showToast(res?.message || 'Failed to add contact.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    }
    setLoading(false);
  };

  const deleteContact = async (id: string) => {
    try {
      const res = await authFetch('emergency-contact', { action_type: 'delete', contact_id: id });
      if (res?.status) {
        showToast('Contact removed.');
        setContacts((prev) => prev.filter((c) => c.id !== id));
      }
    } catch { }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(editForm).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          if (k === 'notify_push') {
            formData.append(k, '0'); // Web browser mode: bypass native mobile FCM token check
          } else {
            formData.append(k, String(v));
          }
        }
      });
      const res = await fetchFormData('edit_user_details', formData, user?.access_token);
      if (res?.status) {
        if (user && (editForm.email !== user.email || editForm.fname !== user.name.split(' ')[0])) {
          const updatedName = `${editForm.fname} ${editForm.lname}`.trim();
          setSessionTokens({
            ...user,
            email: editForm.email || user.email,
            name: updatedName || user.name,
          });
        }
        showToast('Profile updated!');
        await refreshProfile();
        setSection('overview');
      } else {
        showToast(res?.message || 'Update failed.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    }
    setLoading(false);
  };

  const saveNotifications = async () => {
    setLoading(true);
    try {
      const payload = {
        notify_whatsapp: parseInt(editForm.notify_whatsapp),
        notify_email: parseInt(editForm.notify_email),
        notify_push: parseInt(editForm.notify_push),
      };
      const res = await authFetch('update-notification-settings', payload);
      if (res?.status) {
        showToast('Notification preferences saved!');
        await refreshProfile();
      } else {
        showToast(res?.message || 'Failed to update.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    }
    setLoading(false);
  };

  const handleSendResetLink = async () => {
    if (!user?.email) {
      showToast('No account email found.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await resetPassword(user.email);
      if (res?.success) {
        setResetSent(true);
        setResetMsg(`Password reset link sent to ${user.email}. Please check your inbox!`);
        showToast(res.message || 'Password reset link sent to your email!');
      } else {
        showToast(res.message || 'Could not send reset email.', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    }
    setLoading(false);
  };

  const changePassword = async () => {
    if (!passForm.old_pass || !passForm.password || !passForm.confirmpassword) {
      showToast('Please fill all fields, or click "Send Password Reset Link" below if signed in via OTP.', 'error');
      return;
    }
    if (passForm.password !== passForm.confirmpassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await authFetch('passwrod_change', passForm);
      if (res?.status) {
        showToast('Password changed. You will be logged out.');
        setTimeout(() => logout(), 2000);
      } else {
        const msg = res?.message || 'Change failed.';
        if (msg.toLowerCase().includes('old password') || msg.toLowerCase().includes('wrong')) {
          showToast('Current password incorrect. If signed in via OTP, click "Send Reset Link" below!', 'error');
        } else {
          showToast(msg, 'error');
        }
      }
    } catch {
      showToast('Network error.', 'error');
    }
    setLoading(false);
  };

  const loadTickets = async () => {
    try {
      const res = await authFetch('get-ticket');
      if (res?.status) setTickets(res.data || []);
    } catch { }
  };

  const submitTicket = async () => {
    if (!newTicket.subject || !newTicket.message) {
      showToast('Please fill subject and message.', 'error');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('subject', newTicket.subject);
      formData.append('summernote', newTicket.message);
      const res = await fetchFormData('ticketSubmit', formData, user?.access_token);
      if (res?.status) {
        showToast('Support ticket submitted!');
        setNewTicket({ subject: '', message: '' });
        loadTickets();
      } else {
        showToast(res?.message || 'Submission failed.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    }
    setLoading(false);
  };

  const loadQr = async () => {
    try {
      const res = await authFetch('get-user-checkin-qr');
      if (res?.status && res.qr_data) setQrData(res.qr_data);
      else if (res?.qr_code) setQrData(res.qr_code);
    } catch { }
  };

  const loadMyBookings = async () => {
    try {
      const res = await authFetch('bookings', { action_type: 'upcoming' });
      if (res?.status && Array.isArray(res.data)) setMyBookings(res.data);
    } catch { }
  };

  const cancelMyBooking = async (bookingId: string) => {
    try {
      const res = await authFetch('bookings', { action_type: 'cancel', id: bookingId });
      if (res?.status === true || res?.status === 'true') {
        showToast('Booking cancelled.');
        loadMyBookings();
      } else {
        showToast(res?.message || 'Could not cancel booking.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    }
  };

  const loadMyMemberships = async () => {
    try {
      const res = await authFetch('get-active-membership');
      if (res?.status && Array.isArray(res.message)) setMyMemberships(res.message);
    } catch { }
  };

  const loadMyInvoices = async () => {
    try {
      const res = await authFetch('billings');
      if (res?.status && Array.isArray(res.data)) setMyInvoices(res.data);
    } catch { }
  };

  if (!isOpen) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1.5px solid rgba(39,39,39,0.15)',
    borderRadius: '10px', fontSize: '13px', color: '#272727', backgroundColor: '#FDFAF6',
    outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
    color: '#8A8580', textTransform: 'uppercase', marginBottom: '5px',
  };

  const sectionBtnStyle = (s: Section): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 18px',
    background: section === s ? '#EAE1D4' : 'transparent',
    border: 'none', borderRadius: '10px', cursor: 'pointer', width: '100%',
    color: section === s ? '#8B3E23' : '#5A5854', fontSize: '13.5px', fontWeight: section === s ? 700 : 500,
    transition: 'all 0.2s',
  });

  const avatar = profile?.profile || '';
  const displayName = profile ? `${profile.fname} ${profile.lname}`.trim() : user?.name || '';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(25, 23, 20, 0.55)',
          zIndex: 99998,
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          height: '100vh',
          maxHeight: '100vh',
          width: '100%',
          maxWidth: '540px',
          backgroundColor: '#F5EFE5',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.25)',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Toast */}
        {toast && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: toast.type === 'success' ? '#1B5E20' : '#B71C1C',
              color: '#FFFFFF',
              padding: '10px 22px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 700,
              zIndex: 100000,
              whiteSpace: 'nowrap',
              boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
            }}
          >
            {toast.msg}
          </div>
        )}

        {/* Header Card */}
        <div
          style={{
            padding: '24px 28px 20px 28px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid rgba(39, 39, 39, 0.08)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
            position: 'relative',
            zIndex: 2,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B3E23' }}>
              MY ACCOUNT
            </span>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(39, 39, 39, 0.06)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#272727',
                transition: 'all 0.2s ease',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Profile summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: '#E2DBD2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <User size={28} color="#9E9890" />
              )}
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#1A1A1A', lineHeight: 1.2 }}>
                {displayName || 'Pragya Member'}
              </div>
              <div style={{ fontSize: '12.5px', color: '#777777', fontWeight: 500, marginTop: '2px' }}>
                {profile?.email || user?.email || ''}
              </div>
              {profile && (
                <div style={{ fontSize: '11.5px', color: '#8B3E23', fontWeight: 700, marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#F9F4EC', padding: '2px 8px', borderRadius: '999px' }}>
                  <span>{profile.bookings} class{Number(profile.bookings) !== 1 ? 'es' : ''} this month</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nav sidebar + Content */}
        <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 130px)', minHeight: 0, overflow: 'hidden' }}>
          {/* Sidebar nav */}
          <div style={{ width: '180px', flexShrink: 0, padding: '16px 12px', borderRight: '1px solid rgba(0,0,0,0.06)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {([
              { s: 'overview', icon: User, label: 'Overview' },
              { s: 'edit', icon: Edit3, label: 'Edit Profile' },
              { s: 'bookings', icon: CalendarDays, label: 'My Bookings' },
              { s: 'memberships', icon: Award, label: 'Memberships' },
              { s: 'billings', icon: FileText, label: 'Invoices' },
              { s: 'wallet', icon: Wallet, label: 'Wallet' },
              { s: 'notifications', icon: Bell, label: 'Alerts' },
              { s: 'emergency', icon: Phone, label: 'Emergency' },
              { s: 'password', icon: Lock, label: 'Password' },
              { s: 'tickets', icon: Ticket, label: 'Support' },
              { s: 'checkin', icon: QrCode, label: 'Check-in' },
            ] as { s: Section; icon: any; label: string }[]).map(({ s, icon: Icon, label }) => (
              <button key={s} onClick={() => setSection(s)} style={sectionBtnStyle(s)}>
                <Icon size={15} />
                <span style={{ fontSize: '12px' }}>{label}</span>
              </button>
            ))}

            <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <button
                onClick={() => { logout(); onClose(); }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', background: 'transparent', border: 'none', borderRadius: '12px', cursor: 'pointer', width: '100%', color: '#DC2626', fontSize: '12px', fontWeight: 600 }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Content area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px' }}>

            {/* ── OVERVIEW ───────────────────────────────────────── */}
            {section === 'overview' && profile && (
              <div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: '#1A1A1A', margin: '0 0 20px 0', fontWeight: 600 }}>
                  Profile Overview
                </h3>
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '20px 24px', border: '1px solid rgba(39,39,39,0.06)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  {[
                    { label: 'Full Name', val: profile.fullname },
                    { label: 'Chinese Name', val: profile.chinese_name },
                    { label: 'Email', val: profile.email },
                    { label: 'Phone', val: profile.phone },
                    { label: 'Member Since', val: profile.enroll_date },
                    { label: 'Wallet Balance', val: `HK$ ${profile.wallet_balance}` },
                    { label: 'No-show Strikes', val: String(profile.noshow_strikes) },
                    { label: 'Late Check-in Strikes', val: String(profile.late_checkin_strikes) },
                  ].map(({ label, val }) => (
                    val ? (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F2ECE4', fontSize: '13px' }}>
                        <span style={{ color: '#777777', fontWeight: 600 }}>{label}</span>
                        <span style={{ color: '#1A1A1A', fontWeight: 700, textAlign: 'right', maxWidth: '60%' }}>{val}</span>
                      </div>
                    ) : null
                  ))}
                </div>
                <button
                  onClick={() => setSection('edit')}
                  style={{
                    marginTop: '24px',
                    width: '100%',
                    padding: '15px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    borderRadius: '100px',
                    backgroundColor: '#8B3E23',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 6px 18px rgba(139,62,35,0.3)',
                    letterSpacing: '0.02em',
                  }}
                >
                  <Edit3 size={15} /> Edit My Details
                </button>
              </div>
            )}

            {section === 'overview' && !profile && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#8A8580', fontSize: '14px' }}>
                <RefreshCw size={18} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                Loading profile…
              </div>
            )}

            {/* ── EDIT PROFILE ──────────────────────────────────── */}
            {section === 'edit' && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#272727', marginBottom: '16px' }}>Edit Profile</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { key: 'fname', label: 'First Name' },
                    { key: 'lname', label: 'Last Name' },
                    { key: 'chinese_name', label: 'Chinese Name' },
                    { key: 'email', label: 'Email', type: 'email' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'hongkong_id', label: 'HKID' },
                  ].map(({ key, label, type = 'text' }) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <input
                        type={type}
                        value={(editForm as any)[key]}
                        onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                  ))}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={labelStyle}>Birth Month (MM)</label>
                      <input value={editForm.dob_month} onChange={(e) => setEditForm({ ...editForm, dob_month: e.target.value })} maxLength={2} placeholder="08" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Birth Day (DD)</label>
                      <input value={editForm.dob_date} onChange={(e) => setEditForm({ ...editForm, dob_date: e.target.value })} maxLength={2} placeholder="15" style={inputStyle} />
                    </div>
                  </div>
                  <button onClick={saveProfile} disabled={loading} className="btn btn-primary-hero" style={{ width: '100%', padding: '13px', fontSize: '14px', fontWeight: 700, marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* ── MY BOOKINGS ───────────────────────────────────── */}
            {section === 'bookings' && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#272727', marginBottom: '16px' }}>My Class Bookings</h3>
                {myBookings.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#8A8580', fontSize: '13px', padding: '30px 0' }}>No upcoming bookings found.</div>
                ) : (
                  myBookings.map((b) => (
                    <div key={b.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '14px 16px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#272727' }}>{b.title || 'Class Booking'}</div>
                        <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: 'rgba(148,68,38,0.12)', color: '#944426', fontWeight: 700 }}>UPCOMING</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#5A5854' }}>{b.event_date || b.date} • {b.timing || b.event_time}</div>
                      <div style={{ fontSize: '12px', color: '#8A8580', marginTop: '2px' }}>Instructor: {b.instructor || b.instructor_name || 'Master Teacher'}</div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button onClick={() => cancelMyBooking(b.id)} style={{ background: 'none', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '999px', padding: '4px 12px', fontSize: '11px', fontWeight: 600, color: '#DC2626', cursor: 'pointer' }}>
                          Cancel Booking
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── MY MEMBERSHIPS ───────────────────────────────── */}
            {section === 'memberships' && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#272727', marginBottom: '16px' }}>Active Memberships</h3>
                {myMemberships.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#8A8580', fontSize: '13px', padding: '30px 0' }}>No active memberships found.</div>
                ) : (
                  myMemberships.map((m) => {
                    const upId = m.user_package_id || m.id;
                    return (
                      <div key={upId} style={{ background: '#fff', border: '1px solid rgba(148,68,38,0.2)', borderRadius: '14px', padding: '16px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: '#944426' }}>{m.package_title}</div>
                          {m.days_to_expiry !== undefined && (
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: m.days_to_expiry <= 7 ? 'rgba(220,38,38,0.1)' : 'rgba(27,94,32,0.1)', color: m.days_to_expiry <= 7 ? '#DC2626' : '#1B5E20' }}>
                              {m.days_to_expiry} days left
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#5A5854', marginBottom: '8px' }}>Valid: {m.start_date} – {m.end_date}</div>
                        <div style={{ background: '#FAF6F0', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', color: '#272727', fontWeight: 600, marginBottom: '12px' }}>
                          {m.remaining_access_sessions || m.remaining || 'Active pass'}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                          {/* Auto-renew switch */}
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#5A5854', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={m.auto_renew === 1}
                              onChange={async (e) => {
                                if (!user?.access_token || !upId) return;
                                const nextVal = e.target.checked ? 1 : 0;
                                const res = await toggleAutoRenew(user.access_token, upId, nextVal);
                                if (res.success) {
                                  setMyMemberships((prev) => prev.map((item) => String(item.user_package_id || item.id) === String(upId) ? { ...item, auto_renew: res.autoRenew } : item));
                                }
                              }}
                            />
                            <span>Auto-Renew</span>
                          </label>

                          {/* Manual Renew button */}
                          <button
                            onClick={async () => {
                              if (!user?.access_token || !upId) return;
                              setLoading(true);
                              const res = await renewPackage(user.access_token, upId);
                              alert(res.message);
                              loadMyMemberships();
                              setLoading(false);
                            }}
                            disabled={loading}
                            style={{
                              backgroundColor: '#944426',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '999px',
                              padding: '6px 14px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <RefreshCw size={12} />
                            <span>Renew Membership</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── MY INVOICES ──────────────────────────────────── */}
            {section === 'billings' && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#272727', marginBottom: '16px' }}>Invoices & Billing</h3>
                {myInvoices.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#8A8580', fontSize: '13px', padding: '30px 0' }}>No invoice records.</div>
                ) : (
                  myInvoices.map((inv) => (
                    <div key={inv.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '14px 16px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#272727' }}>{inv.description || `Invoice #${inv.id}`}</div>
                        <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: inv.statusBadge || 'rgba(0,0,0,0.06)', color: inv.statusText || '#272727', fontWeight: 700, textTransform: 'uppercase' }}>
                          {inv.status || 'Paid'}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#944426' }}>HK$ {inv.total}</div>
                      <div style={{ fontSize: '11px', color: '#8A8580', marginTop: '4px' }}>Date: {inv.billing_date || inv.invoice_date}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── WALLET ────────────────────────────────────────── */}
            {section === 'wallet' && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#272727', marginBottom: '4px' }}>Wallet</h3>
                <div style={{ background: 'linear-gradient(135deg, #944426, #C05F2F)', borderRadius: '16px', padding: '24px', color: '#fff', marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Current Balance</div>
                  <div style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-serif)' }}>HK$ {walletBalance || '—'}</div>
                </div>
                {walletHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#8A8580', fontSize: '13px', padding: '30px 0' }}>No transactions yet.</div>
                ) : (
                  walletHistory.map((entry, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#272727' }}>{entry.comments || 'Transaction'}</div>
                        <div style={{ fontSize: '11px', color: '#8A8580', marginTop: '2px' }}>{entry.date}</div>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: entry.type ? '#1B5E20' : '#B71C1C' }}>
                        {entry.amount}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── NOTIFICATIONS ─────────────────────────────────── */}
            {section === 'notifications' && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#272727', marginBottom: '16px' }}>Alerts & Notifications</h3>
                {notifications.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#8A8580', fontSize: '13px', padding: '30px 0' }}>No new notifications.</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '14px 16px', marginBottom: '10px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <AlertCircle size={16} color="#944426" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#272727', marginBottom: '4px' }}>{n.title}</div>
                        <div style={{ fontSize: '12px', color: '#5A5854' }}>{n.description}</div>
                        <div style={{ fontSize: '11px', color: '#8A8580', marginTop: '4px' }}>{n.created_at}</div>
                      </div>
                      <button onClick={() => dismissNotification(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8580', padding: '2px' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}

                {/* Notification preferences */}
                <div style={{ marginTop: '24px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#5A5854', marginBottom: '12px' }}>Preferences</div>
                  {[
                    { key: 'notify_whatsapp', label: 'WhatsApp Notifications' },
                    { key: 'notify_email', label: 'Email Notifications' },
                    { key: 'notify_push', label: 'Push Notifications' },
                  ].map(({ key, label }) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <span style={{ fontSize: '13px', color: '#272727', fontWeight: 500 }}>{label}</span>
                      <button
                        onClick={() => setEditForm({ ...editForm, [key]: (editForm as any)[key] === '1' ? '0' : '1' })}
                        style={{
                          width: '44px', height: '24px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                          background: (editForm as any)[key] === '1' ? '#944426' : '#D5CEC7',
                          transition: 'background 0.2s', position: 'relative',
                        }}
                      >
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                          position: 'absolute', top: '3px', transition: 'left 0.2s',
                          left: (editForm as any)[key] === '1' ? '23px' : '3px',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                        }} />
                      </button>
                    </div>
                  ))}
                  <button onClick={saveNotifications} disabled={loading} className="btn btn-primary-hero" style={{ width: '100%', padding: '12px', fontSize: '13px', fontWeight: 700, marginTop: '16px', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Saving…' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            )}

            {/* ── EMERGENCY CONTACTS ────────────────────────────── */}
            {section === 'emergency' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#272727' }}>Emergency Contacts</h3>
                  <button onClick={() => setAddingContact(!addingContact)} style={{ background: '#944426', border: 'none', color: '#fff', borderRadius: '999px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={12} /> Add
                  </button>
                </div>

                {addingContact && (
                  <div style={{ background: '#fff', border: '1px solid rgba(148,68,38,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { key: 'name', label: 'Name', placeholder: 'Contact name' },
                        { key: 'relationship', label: 'Relationship', placeholder: 'e.g. Sister, Father' },
                        { key: 'phone', label: 'Phone', placeholder: '+852 XXXX XXXX' },
                      ].map(({ key, label, placeholder }) => (
                        <div key={key}>
                          <label style={labelStyle}>{label}</label>
                          <input value={(newContact as any)[key]} onChange={(e) => setNewContact({ ...newContact, [key]: e.target.value })} placeholder={placeholder} style={inputStyle} />
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button onClick={addContact} disabled={loading} className="btn btn-primary-hero" style={{ flex: 1, padding: '10px', fontSize: '13px', fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
                          {loading ? 'Adding…' : 'Add Contact'}
                        </button>
                        <button onClick={() => setAddingContact(false)} className="btn btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '13px' }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {contacts.length === 0 && !addingContact && (
                  <div style={{ textAlign: 'center', color: '#8A8580', fontSize: '13px', padding: '30px 0' }}>No emergency contacts added.</div>
                )}

                {contacts.map((c) => (
                  <div key={c.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '14px 16px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(148,68,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={18} color="#944426" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#272727' }}>{c.name}</div>
                      <div style={{ fontSize: '12px', color: '#8A8580' }}>{c.relation} • {c.phone}</div>
                    </div>
                    <button onClick={() => deleteContact(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '4px' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── PASSWORD ──────────────────────────────────────── */}
            {section === 'password' && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#272727', marginBottom: '12px' }}>Change Password</h3>

                {/* Banner for OTP Logged In / Missing Old Password Users */}
                <div
                  style={{
                    backgroundColor: '#FAF6F0',
                    border: '1px solid #EBE4D8',
                    borderRadius: '16px',
                    padding: '16px 18px',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#944426', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    <Sparkles size={14} /> SIGNED IN VIA OTP / NO PASSWORD SET?
                  </div>
                  <p style={{ fontSize: '13px', color: '#6B655F', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                    If you logged in via Guest OTP Verification and don't know your current password, click below to receive a secure link via email to create your password.
                  </p>

                  {resetSent ? (
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#00B594', backgroundColor: '#E6F8F4', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} /> {resetMsg}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendResetLink}
                      disabled={loading}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: '#D9A726',
                        color: '#272727',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        borderRadius: '20px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(217, 167, 38, 0.25)',
                      }}
                    >
                      Send Password Reset Link to {user?.email || 'Email'} <ArrowRight size={14} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { key: 'old_pass', label: 'Current Password (if known)', showKey: 'old' },
                    { key: 'password', label: 'New Password', showKey: 'new' },
                    { key: 'confirmpassword', label: 'Confirm New Password', showKey: 'confirm' },
                  ].map(({ key, label, showKey }) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={(showPass as any)[showKey] ? 'text' : 'password'}
                          value={(passForm as any)[key]}
                          onChange={(e) => setPassForm({ ...passForm, [key]: e.target.value })}
                          style={{ ...inputStyle, paddingRight: '44px' }}
                        />
                        <button type="button" onClick={() => setShowPass({ ...showPass, [showKey]: !(showPass as any)[showKey] })} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8A8580' }}>
                          {(showPass as any)[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={changePassword} disabled={loading} className="btn btn-primary-hero" style={{ width: '100%', padding: '13px', fontSize: '14px', fontWeight: 700, marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Changing…' : 'Change Password'}
                  </button>
                </div>
              </div>
            )}

            {/* ── SUPPORT TICKETS ───────────────────────────────── */}
            {section === 'tickets' && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#272727', marginBottom: '16px' }}>Support Tickets</h3>

                {/* New ticket form */}
                <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#944426', marginBottom: '12px' }}>New Ticket</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={labelStyle}>Subject</label>
                      <input value={newTicket.subject} onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })} placeholder="Describe your issue briefly" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Message</label>
                      <textarea value={newTicket.message} onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })} placeholder="Provide more details…" rows={4} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                    </div>
                    <button onClick={submitTicket} disabled={loading} className="btn btn-primary-hero" style={{ padding: '12px', fontSize: '13px', fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
                      {loading ? 'Submitting…' : 'Submit Ticket'}
                    </button>
                  </div>
                </div>

                {/* Existing tickets */}
                {tickets.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#8A8580', fontSize: '13px', padding: '20px 0' }}>No support tickets yet.</div>
                ) : (
                  tickets.map((t) => (
                    <div key={t.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '14px 16px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#272727' }}>{t.subject}</div>
                        <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: t.status === 'open' ? 'rgba(148,68,38,0.12)' : 'rgba(0,0,0,0.06)', color: t.status === 'open' ? '#944426' : '#8A8580', fontWeight: 700, textTransform: 'uppercase' }}>{t.status}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#5A5854' }}>{t.message}</div>
                      <div style={{ fontSize: '11px', color: '#8A8580', marginTop: '6px' }}>{t.created_at}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── CHECK-IN QR ───────────────────────────────────── */}
            {section === 'checkin' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#272727', marginBottom: '8px' }}>Check-in QR Code</h3>
                <p style={{ fontSize: '13px', color: '#8A8580', marginBottom: '24px' }}>Show this code at the front desk to check into your class.</p>
                {qrData ? (
                  <div style={{ display: 'inline-block', background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <img src={qrData.startsWith('data:') ? qrData : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`} alt="Check-in QR" style={{ width: '200px', height: '200px' }} />
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '40px 0' }}>
                    <QrCode size={48} color="#D5CEC7" />
                    <div style={{ fontSize: '13px', color: '#8A8580' }}>QR code unavailable. Please check at the front desk.</div>
                  </div>
                )}
                <button onClick={loadQr} style={{ marginTop: '20px', background: 'none', border: '1.5px solid rgba(148,68,38,0.3)', borderRadius: '999px', padding: '10px 24px', fontSize: '13px', fontWeight: 600, color: '#944426', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={14} /> Refresh QR
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};
