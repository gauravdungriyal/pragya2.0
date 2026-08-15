import React, { useState, useEffect } from 'react';
import {
  X, User, Wallet, Bell, Phone, Shield, LogOut, ChevronRight,
  Edit3, Check, AlertCircle, QrCode, Ticket, RefreshCw, Plus, Trash2,
  Eye, EyeOff, Lock, Camera, Calendar, Award, FileText, CalendarDays,
  Sparkles, CheckCircle2, ArrowRight
} from 'lucide-react';
import { useAuth, UserProfile } from '../context/AuthContext';
import { fetchFormData, renewPackage, toggleAutoRenew } from '../services/api';

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

interface TicketItem {
  id: string;
  ticket?: string;
  subject: string;
  message: string;
  image?: string;
  state: string;
  created_at?: string;
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
  const [openTickets, setOpenTickets] = useState<TicketItem[]>([]);
  const [closedTickets, setClosedTickets] = useState<TicketItem[]>([]);
  const [ticketTab, setTicketTab] = useState<'open' | 'closed'>('open');
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

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

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [isOpen]);

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
      const cleanFname = editForm.fname.trim();
      const cleanLname = editForm.lname.trim();
      const cleanChineseName = editForm.chinese_name.trim() || cleanFname || 'Pragya';
      const cleanEmail = editForm.email.trim();
      const cleanPhone = editForm.phone.trim();
      const cleanHkid = editForm.hongkong_id.trim();
      const cleanDobMonth = editForm.dob_month.trim();
      const cleanDobDate = editForm.dob_date.trim();

      if (!cleanFname || !cleanLname) {
        showToast('Please fill in both First Name and Last Name.', 'error');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('fname', cleanFname);
      formData.append('lname', cleanLname);
      formData.append('chinese_name', cleanChineseName);
      if (cleanEmail) formData.append('email', cleanEmail);
      if (cleanPhone) formData.append('phone', cleanPhone);
      if (cleanHkid) formData.append('hongkong_id', cleanHkid);
      if (cleanDobMonth) formData.append('dob_month', cleanDobMonth);
      if (cleanDobDate) formData.append('dob_date', cleanDobDate);
      formData.append('notify_whatsapp', editForm.notify_whatsapp || '1');
      formData.append('notify_email', editForm.notify_email || '1');
      formData.append('notify_push', '0');

      const res = await fetchFormData('edit_user_details', formData, user?.access_token);
      console.log('edit_user_details API response:', res);

      if (res?.status === true || res?.success === true) {
        if (user && (cleanEmail !== user.email || cleanFname !== user.name.split(' ')[0])) {
          const updatedName = `${cleanFname} ${cleanLname}`.trim();
          setSessionTokens({
            ...user,
            email: cleanEmail || user.email,
            name: updatedName || user.name,
          });
        }
        showToast('Profile updated successfully!');
        await refreshProfile();
        setSection('overview');
      } else {
        const errMsg = res?.message || res?.error || (res === null ? 'Network error or session expired. Please log in again.' : 'Update failed.');
        showToast(errMsg, 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Network error.', 'error');
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
      if (res?.status) {
        setOpenTickets(Array.isArray(res.openTicket) ? res.openTicket : []);
        setClosedTickets(Array.isArray(res.closedTicket) ? res.closedTicket : []);
      }
    } catch (err) {
      console.warn('Failed loading tickets:', err);
    }
  };

  const submitTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      showToast('Please enter both subject and message.', 'error');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('subject', newTicket.subject.trim());
      formData.append('summernote', newTicket.message.trim());
      if (screenshotFile) {
        formData.append('screenshot', screenshotFile);
      }

      const res = await fetchFormData('ticketSubmit', formData, user?.access_token);
      if (res?.status) {
        showToast(res.message || 'Support ticket submitted successfully!');
        setNewTicket({ subject: '', message: '' });
        setScreenshotFile(null);
        await loadTickets();
      } else {
        showToast(res?.message || 'Submission failed.', 'error');
      }
    } catch {
      showToast('Network error while submitting ticket.', 'error');
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
    width: '100%', padding: '12px 14px', border: '1.5px solid rgba(39,39,39,0.15)',
    borderRadius: '12px', fontSize: '13.5px', color: '#272727', backgroundColor: '#FDFAF6',
    outline: 'none', boxSizing: 'border-box', minHeight: '44px',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
    color: '#8A8580', textTransform: 'uppercase', marginBottom: '6px',
  };

  const sections: { s: Section; icon: any; label: string }[] = [
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
  ];

  const avatar = profile?.profile || '';
  const displayName = profile ? `${profile.fname} ${profile.lname}`.trim() : user?.name || '';
  const userEmail = profile?.email || user?.email || '';

  return (
    <>
      {/* Dynamic Breakpoints Styles */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .profile-nav-mobile::-webkit-scrollbar {
          display: none;
        }
        .profile-nav-mobile {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Default / Mobile screens (< 640px) */
        @media (max-width: 639px) {
          .profile-drawer-container {
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            top: 0 !important;
            bottom: 0 !important;
          }
          .profile-drawer-body {
            flex-direction: column !important;
            overflow: hidden !important;
          }
          .profile-nav-sidebar {
            display: none !important;
          }
          .profile-nav-mobile {
            display: flex !important;
          }
          .profile-content-area {
            padding: 20px 16px 40px 16px !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch;
          }
          .profile-form-grid {
            grid-template-columns: 1fr !important;
          }
          .profile-metrics-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .profile-header-padding {
            padding: 20px 18px 16px 18px !important;
          }
        }

        /* Tablet & Desktop screens (>= 640px) */
        @media (min-width: 640px) {
          .profile-drawer-container {
            width: 100% !important;
            max-width: min(680px, 90vw) !important;
          }
          .profile-drawer-body {
            flex-direction: row !important;
          }
          .profile-nav-sidebar {
            display: flex !important;
            width: 210px !important;
          }
          .profile-nav-mobile {
            display: none !important;
          }
          .profile-content-area {
            padding: 24px 28px 40px 28px !important;
          }
          .profile-form-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
          }
          .profile-metrics-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .profile-header-padding {
            padding: 24px 28px 20px 28px !important;
          }
        }
      `}</style>

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

      {/* Drawer Container */}
      <div
        className="profile-drawer-container"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          height: '100vh',
          maxHeight: '100vh',
          backgroundColor: '#F5EFE5',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.25)',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Toast Notification */}
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
          className="profile-header-padding"
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid rgba(39, 39, 39, 0.08)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
            position: 'relative',
            zIndex: 2,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B3E23' }}>
              MY ACCOUNT
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Quick sign-out shortcut button */}
              <button
                onClick={() => { logout(); onClose(); }}
                style={{
                  backgroundColor: 'rgba(220, 38, 38, 0.08)',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '5px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  color: '#DC2626',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                }}
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>

              <button
                onClick={onClose}
                style={{
                  backgroundColor: 'rgba(39, 39, 39, 0.06)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#272727',
                  transition: 'all 0.2s ease',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Profile summary banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: '#E2DBD2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '2px solid #8B3E23',
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
                <User size={26} color="#8B3E23" />
              )}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#1A1A1A', lineHeight: 1.2, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                {displayName || 'Pragya Member'}
              </div>
              {userEmail && (
                <div style={{ fontSize: '12.5px', color: '#666666', fontWeight: 500, marginTop: '2px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  {userEmail}
                </div>
              )}
              {profile && (
                <div style={{ fontSize: '11px', color: '#8B3E23', fontWeight: 700, marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#F9F4EC', padding: '3px 10px', borderRadius: '999px' }}>
                  <span>{profile.bookings} class{Number(profile.bookings) !== 1 ? 'es' : ''} this month</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Navigation Tabs */}
        <div
          className="profile-nav-mobile"
          style={{
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            padding: '10px 14px',
            backgroundColor: '#EAE1D4',
            borderBottom: '1px solid rgba(39, 39, 39, 0.08)',
            gap: '8px',
            flexShrink: 0,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {sections.map(({ s, icon: Icon, label }) => {
            const active = section === s;
            return (
              <button
                key={s}
                onClick={() => setSection(s)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  border: 'none',
                  background: active ? '#8B3E23' : '#FFFFFF',
                  color: active ? '#FFFFFF' : '#5A5854',
                  fontSize: '12px',
                  fontWeight: active ? 700 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: active ? '0 3px 10px rgba(139, 62, 35, 0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={14} color={active ? '#FFFFFF' : '#8B3E23'} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Body: Sidebar (Tablet/Desktop) + Main Content Area */}
        <div className="profile-drawer-body" style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Desktop Sidebar nav */}
          <div
            className="profile-nav-sidebar"
            style={{
              flexShrink: 0,
              padding: '18px 14px',
              borderRight: '1px solid rgba(0,0,0,0.06)',
              overflowY: 'auto',
              flexDirection: 'column',
              gap: '4px',
              backgroundColor: '#FAF5EE',
            }}
          >
            {sections.map(({ s, icon: Icon, label }) => {
              const active = section === s;
              return (
                <button
                  key={s}
                  onClick={() => setSection(s)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '11px 16px',
                    background: active ? '#8B3E23' : 'transparent',
                    color: active ? '#FFFFFF' : '#4A4744',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    width: '100%',
                    fontSize: '13px',
                    fontWeight: active ? 700 : 500,
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    boxShadow: active ? '0 4px 12px rgba(139, 62, 35, 0.2)' : 'none',
                  }}
                >
                  <Icon size={16} color={active ? '#FFFFFF' : '#777169'} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {active && <ChevronRight size={14} color="#FFFFFF" />}
                </button>
              );
            })}

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <button
                onClick={() => { logout(); onClose(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  background: 'rgba(220, 38, 38, 0.05)',
                  border: '1px solid rgba(220, 38, 38, 0.15)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  width: '100%',
                  color: '#DC2626',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="profile-content-area" style={{ flex: 1, overflowY: 'auto' }}>

            {/* ── OVERVIEW ───────────────────────────────────────── */}
            {section === 'overview' && profile && (
              <div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#1A1A1A', margin: '0 0 16px 0', fontWeight: 700 }}>
                  Profile Overview
                </h3>

                {/* Metrics Stats Cards */}
                <div className="profile-metrics-grid" style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '14px 16px', border: '1px solid rgba(39,39,39,0.06)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8B3E23', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <CalendarDays size={14} /> Classes
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#1A1A1A', marginTop: '4px' }}>
                      {profile.bookings || 0}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8A8580', marginTop: '2px' }}>This month</div>
                  </div>

                  <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '14px 16px', border: '1px solid rgba(39,39,39,0.06)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1B5E20', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <Wallet size={14} /> Balance
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#1A1A1A', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      HK$ {profile.wallet_balance || '0'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8A8580', marginTop: '2px' }}>Wallet credit</div>
                  </div>

                  <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '14px 16px', border: '1px solid rgba(39,39,39,0.06)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#B71C1C', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <AlertCircle size={14} /> Strikes
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#1A1A1A', marginTop: '4px' }}>
                      {profile.noshow_strikes || 0} <span style={{ fontSize: '11px', fontWeight: 500, color: '#777' }}>no-show</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#8A8580', marginTop: '2px' }}>{profile.late_checkin_strikes || 0} late check-in</div>
                  </div>
                </div>

                {/* Details List */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '16px 20px', border: '1px solid rgba(39,39,39,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                  {[
                    { label: 'Full Name', val: profile.fullname, icon: User },
                    { label: 'Chinese Name', val: profile.chinese_name, icon: Sparkles },
                    { label: 'Email Address', val: profile.email, icon: FileText },
                    { label: 'Phone Number', val: profile.phone, icon: Phone },
                    { label: 'Member Since', val: profile.enroll_date, icon: Calendar },
                    { label: 'HKID / ID', val: profile.hkdf, icon: Shield },
                  ].map(({ label, val, icon: Icon }) => (
                    val ? (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F4EEE7', fontSize: '13px', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#777777', fontWeight: 600, flexShrink: 0 }}>
                          <Icon size={15} color="#8B3E23" />
                          <span>{label}</span>
                        </div>
                        <span style={{ color: '#1A1A1A', fontWeight: 700, textAlign: 'right', wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '65%' }}>
                          {val}
                        </span>
                      </div>
                    ) : null
                  ))}
                </div>

                <button
                  onClick={() => setSection('edit')}
                  style={{
                    marginTop: '20px',
                    width: '100%',
                    padding: '14px',
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
                  <Edit3 size={16} /> Edit My Details
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
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#272727', marginBottom: '16px', fontWeight: 700 }}>
                  Edit Profile
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="profile-form-grid" style={{ display: 'grid', gap: '14px' }}>
                    {[
                      { key: 'fname', label: 'First Name' },
                      { key: 'lname', label: 'Last Name' },
                      { key: 'chinese_name', label: 'Chinese Name' },
                      { key: 'email', label: 'Email Address', type: 'email' },
                      { key: 'phone', label: 'Phone Number' },
                      { key: 'hongkong_id', label: 'HKID / ID' },
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
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Birth Month (MM)</label>
                      <input value={editForm.dob_month} onChange={(e) => setEditForm({ ...editForm, dob_month: e.target.value })} maxLength={2} placeholder="08" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Birth Day (DD)</label>
                      <input value={editForm.dob_date} onChange={(e) => setEditForm({ ...editForm, dob_date: e.target.value })} maxLength={2} placeholder="15" style={inputStyle} />
                    </div>
                  </div>

                  <button
                    onClick={saveProfile}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '14px',
                      fontSize: '14px',
                      fontWeight: 700,
                      marginTop: '10px',
                      borderRadius: '100px',
                      backgroundColor: '#8B3E23',
                      color: '#FFFFFF',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 6px 18px rgba(139,62,35,0.3)',
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* ── MY BOOKINGS ───────────────────────────────────── */}
            {section === 'bookings' && (
              <div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#272727', marginBottom: '16px', fontWeight: 700 }}>
                  My Class Bookings
                </h3>
                {myBookings.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#8A8580', fontSize: '13px', padding: '35px 0', background: '#FFF', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}>
                    No upcoming bookings found.
                  </div>
                ) : (
                  myBookings.map((b) => (
                    <div key={b.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '14px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '8px' }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#272727' }}>{b.title || 'Class Booking'}</div>
                        <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: 'rgba(139,62,35,0.12)', color: '#8B3E23', fontWeight: 700, flexShrink: 0 }}>UPCOMING</span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#5A5854' }}>{b.event_date || b.date} • {b.timing || b.event_time}</div>
                      <div style={{ fontSize: '12px', color: '#8A8580', marginTop: '4px' }}>Instructor: {b.instructor || b.instructor_name || 'Master Teacher'}</div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                        <button onClick={() => cancelMyBooking(b.id)} style={{ background: 'none', border: '1.5px solid rgba(220,38,38,0.3)', borderRadius: '999px', padding: '6px 14px', fontSize: '11.5px', fontWeight: 700, color: '#DC2626', cursor: 'pointer' }}>
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
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#272727', marginBottom: '16px', fontWeight: 700 }}>
                  Active Memberships
                </h3>
                {myMemberships.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#8A8580', fontSize: '13px', padding: '35px 0', background: '#FFF', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}>
                    No active memberships found.
                  </div>
                ) : (
                  myMemberships.map((m) => {
                    const upId = m.user_package_id || m.id;
                    return (
                      <div key={upId} style={{ background: '#fff', border: '1px solid rgba(139,62,35,0.2)', borderRadius: '16px', padding: '18px', marginBottom: '14px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '8px' }}>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: '#8B3E23' }}>{m.package_title}</div>
                          {m.days_to_expiry !== undefined && (
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: m.days_to_expiry <= 7 ? 'rgba(220,38,38,0.1)' : 'rgba(27,94,32,0.1)', color: m.days_to_expiry <= 7 ? '#DC2626' : '#1B5E20', flexShrink: 0 }}>
                              {m.days_to_expiry} days left
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#5A5854', marginBottom: '10px' }}>Valid: {m.start_date} – {m.end_date}</div>
                        <div style={{ background: '#FAF6F0', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#272727', fontWeight: 600, marginBottom: '14px' }}>
                          {m.remaining_access_sessions || m.remaining || 'Active pass'}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: '10px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 600, color: '#5A5854', cursor: 'pointer' }}>
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
                              backgroundColor: '#8B3E23',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '999px',
                              padding: '7px 16px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 8px rgba(139,62,35,0.2)',
                            }}
                          >
                            <RefreshCw size={13} />
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
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#272727', marginBottom: '16px', fontWeight: 700 }}>
                  Invoices & Billing
                </h3>
                {myInvoices.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#8A8580', fontSize: '13px', padding: '35px 0', background: '#FFF', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}>
                    No invoice records.
                  </div>
                ) : (
                  myInvoices.map((inv) => (
                    <div key={inv.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '14px', padding: '16px', marginBottom: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '8px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#272727' }}>{inv.description || `Invoice #${inv.id}`}</div>
                        <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: inv.statusBadge || 'rgba(0,0,0,0.06)', color: inv.statusText || '#272727', fontWeight: 700, textTransform: 'uppercase', flexShrink: 0 }}>
                          {inv.status || 'Paid'}
                        </span>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#8B3E23' }}>HK$ {inv.total}</div>
                      <div style={{ fontSize: '11.5px', color: '#8A8580', marginTop: '4px' }}>Date: {inv.billing_date || inv.invoice_date}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── WALLET ────────────────────────────────────────── */}
            {section === 'wallet' && (
              <div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#272727', marginBottom: '12px', fontWeight: 700 }}>
                  Wallet
                </h3>
                <div style={{ background: 'linear-gradient(135deg, #8B3E23, #C05F2F)', borderRadius: '18px', padding: '24px', color: '#fff', marginBottom: '20px', boxShadow: '0 8px 24px rgba(139,62,35,0.25)' }}>
                  <div style={{ fontSize: '11px', opacity: 0.85, marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>Current Balance</div>
                  <div style={{ fontSize: '34px', fontWeight: 800, fontFamily: 'Georgia, serif' }}>HK$ {walletBalance || '—'}</div>
                </div>

                <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#5A5854', marginBottom: '10px' }}>Recent Ledger</div>

                {walletHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#8A8580', fontSize: '13px', padding: '30px 0', background: '#FFF', borderRadius: '16px' }}>No transactions yet.</div>
                ) : (
                  <div style={{ background: '#FFF', borderRadius: '16px', padding: '8px 16px', border: '1px solid rgba(0,0,0,0.06)' }}>
                    {walletHistory.map((entry, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i === walletHistory.length - 1 ? 'none' : '1px solid rgba(0,0,0,0.05)', gap: '10px' }}>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#272727' }}>{entry.comments || 'Transaction'}</div>
                          <div style={{ fontSize: '11px', color: '#8A8580', marginTop: '2px' }}>{entry.date}</div>
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: entry.type ? '#1B5E20' : '#B71C1C', flexShrink: 0 }}>
                          {entry.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── NOTIFICATIONS ─────────────────────────────────── */}
            {section === 'notifications' && (
              <div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#272727', marginBottom: '16px', fontWeight: 700 }}>
                  Alerts & Notifications
                </h3>
                {notifications.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#8A8580', fontSize: '13px', padding: '35px 0', background: '#FFF', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}>
                    No new notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '14px', padding: '16px', marginBottom: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                      <AlertCircle size={18} color="#8B3E23" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#272727', marginBottom: '4px' }}>{n.title}</div>
                        <div style={{ fontSize: '12.5px', color: '#5A5854' }}>{n.description}</div>
                        <div style={{ fontSize: '11px', color: '#8A8580', marginTop: '6px' }}>{n.created_at}</div>
                      </div>
                      <button onClick={() => dismissNotification(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8580', padding: '4px' }}>
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}

                {/* Preferences */}
                <div style={{ marginTop: '24px', background: '#FFF', borderRadius: '16px', padding: '18px', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8B3E23', marginBottom: '12px' }}>Alert Preferences</div>
                  {[
                    { key: 'notify_whatsapp', label: 'WhatsApp Notifications' },
                    { key: 'notify_email', label: 'Email Notifications' },
                    { key: 'notify_push', label: 'Push Notifications' },
                  ].map(({ key, label }) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <span style={{ fontSize: '13.5px', color: '#272727', fontWeight: 600 }}>{label}</span>
                      <button
                        onClick={() => setEditForm({ ...editForm, [key]: (editForm as any)[key] === '1' ? '0' : '1' })}
                        style={{
                          width: '46px', height: '26px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                          background: (editForm as any)[key] === '1' ? '#8B3E23' : '#D5CEC7',
                          transition: 'background 0.2s', position: 'relative',
                        }}
                      >
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                          position: 'absolute', top: '3px', transition: 'left 0.2s',
                          left: (editForm as any)[key] === '1' ? '23px' : '3px',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                        }} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={saveNotifications}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      marginTop: '16px',
                      borderRadius: '100px',
                      backgroundColor: '#8B3E23',
                      color: '#FFFFFF',
                      border: 'none',
                      cursor: 'pointer',
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? 'Saving…' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            )}

            {/* ── EMERGENCY CONTACTS ────────────────────────────── */}
            {section === 'emergency' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#272727', fontWeight: 700 }}>Emergency Contacts</h3>
                  <button onClick={() => setAddingContact(!addingContact)} style={{ background: '#8B3E23', border: 'none', color: '#fff', borderRadius: '999px', padding: '7px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={14} /> Add
                  </button>
                </div>

                {addingContact && (
                  <div style={{ background: '#fff', border: '1px solid rgba(139,62,35,0.2)', borderRadius: '16px', padding: '18px', marginBottom: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { key: 'name', label: 'Name', placeholder: 'Contact name' },
                        { key: 'relationship', label: 'Relationship', placeholder: 'e.g. Sister, Father' },
                        { key: 'phone', label: 'Phone Number', placeholder: '+852 XXXX XXXX' },
                      ].map(({ key, label, placeholder }) => (
                        <div key={key}>
                          <label style={labelStyle}>{label}</label>
                          <input value={(newContact as any)[key]} onChange={(e) => setNewContact({ ...newContact, [key]: e.target.value })} placeholder={placeholder} style={inputStyle} />
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                        <button
                          onClick={addContact}
                          disabled={loading}
                          style={{
                            flex: 1, padding: '12px', fontSize: '13px', fontWeight: 700, borderRadius: '100px',
                            backgroundColor: '#8B3E23', color: '#FFF', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1,
                          }}
                        >
                          {loading ? 'Adding…' : 'Add Contact'}
                        </button>
                        <button
                          onClick={() => setAddingContact(false)}
                          style={{
                            flex: 1, padding: '12px', fontSize: '13px', fontWeight: 600, borderRadius: '100px',
                            backgroundColor: '#EAE1D4', color: '#5A5854', border: 'none', cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {contacts.length === 0 && !addingContact && (
                  <div style={{ textAlign: 'center', color: '#8A8580', fontSize: '13px', padding: '35px 0', background: '#FFF', borderRadius: '16px' }}>No emergency contacts added.</div>
                )}

                {contacts.map((c) => (
                  <div key={c.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '14px', padding: '16px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(139,62,35,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={20} color="#8B3E23" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#272727' }}>{c.name}</div>
                      <div style={{ fontSize: '12px', color: '#8A8580', wordBreak: 'break-word' }}>{c.relation} • {c.phone}</div>
                    </div>
                    <button onClick={() => deleteContact(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '6px' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── PASSWORD ──────────────────────────────────────── */}
            {section === 'password' && (
              <div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#272727', marginBottom: '14px', fontWeight: 700 }}>
                  Change Password
                </h3>

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#8B3E23', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    <Sparkles size={14} /> SIGNED IN VIA OTP / NO PASSWORD SET?
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#6B655F', margin: '0 0 12px 0', lineHeight: 1.5 }}>
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
                        padding: '10px 18px',
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
                          {(showPass as any)[showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={changePassword}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '14px',
                      fontSize: '14px',
                      fontWeight: 700,
                      marginTop: '8px',
                      borderRadius: '100px',
                      backgroundColor: '#8B3E23',
                      color: '#FFFFFF',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 6px 18px rgba(139,62,35,0.3)',
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? 'Changing…' : 'Change Password'}
                  </button>
                </div>
              </div>
            )}

            {/* ── SUPPORT TICKETS ───────────────────────────────── */}
            {section === 'tickets' && (
              <div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#272727', marginBottom: '16px', fontWeight: 700 }}>
                  Help & Support Tickets
                </h3>

                {/* Form */}
                <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', padding: '18px', marginBottom: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8B3E23', marginBottom: '12px' }}>
                    Submit a New Inquiry / Ticket
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Subject *</label>
                      <input
                        value={newTicket.subject}
                        onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                        placeholder="Brief title (e.g. Booking issue, Payment query)"
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Details / Message *</label>
                      <textarea
                        value={newTicket.message}
                        onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                        placeholder="Describe your question or issue in detail..."
                        rows={4}
                        style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', height: 'auto' }}
                      />
                    </div>

                    {/* Optional Screenshot Attachment */}
                    <div>
                      <label style={labelStyle}>Attachment (Optional Screenshot ≤ 4MB)</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label
                          htmlFor="ticket-screenshot"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            backgroundColor: '#FAF6F0',
                            border: '1px solid #EBE4D8',
                            borderRadius: '10px',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            color: '#8B3E23',
                            cursor: 'pointer'
                          }}
                        >
                          <Camera size={15} />
                          <span>{screenshotFile ? 'Change Screenshot' : 'Upload Screenshot (JPG/PNG)'}</span>
                        </label>
                        <input
                          id="ticket-screenshot"
                          type="file"
                          accept="image/png, image/jpeg, image/gif"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              if (f.size > 4 * 1024 * 1024) {
                                showToast('File size must be under 4 MB.', 'error');
                                return;
                              }
                              setScreenshotFile(f);
                            }
                          }}
                          style={{ display: 'none' }}
                        />
                        {screenshotFile && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#00381F', fontWeight: 600 }}>
                            <span>{screenshotFile.name}</span>
                            <button
                              type="button"
                              onClick={() => setScreenshotFile(null)}
                              style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '2px' }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={submitTicket}
                      disabled={loading}
                      style={{
                        padding: '12px',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        borderRadius: '100px',
                        backgroundColor: '#8B3E23',
                        color: '#FFF',
                        border: 'none',
                        cursor: 'pointer',
                        opacity: loading ? 0.7 : 1,
                        marginTop: '4px'
                      }}
                    >
                      {loading ? 'Submitting Ticket…' : 'Submit Ticket'}
                    </button>
                  </div>
                </div>

                {/* Sub-tabs: Open vs Closed Tickets */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #EBE4D8', paddingBottom: '8px' }}>
                  <button
                    onClick={() => setTicketTab('open')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: ticketTab === 'open' ? '#8B3E23' : 'transparent',
                      color: ticketTab === 'open' ? '#FFF' : '#6B655F',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Active Tickets ({openTickets.length})
                  </button>

                  <button
                    onClick={() => setTicketTab('closed')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: ticketTab === 'closed' ? '#8B3E23' : 'transparent',
                      color: ticketTab === 'closed' ? '#FFF' : '#6B655F',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Resolved History ({closedTickets.length})
                  </button>
                </div>

                {/* Tickets list */}
                {((ticketTab === 'open' ? openTickets : closedTickets).length === 0) ? (
                  <div style={{ textAlign: 'center', color: '#8A8580', fontSize: '13px', padding: '28px 0', background: '#FFF', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.06)' }}>
                    No {ticketTab === 'open' ? 'active' : 'resolved'} support tickets.
                  </div>
                ) : (
                  (ticketTab === 'open' ? openTickets : closedTickets).map((t) => {
                    const cleanMessage = (t.message || '').replace(/<[^>]*>?/gm, '').trim();
                    return (
                      <div key={t.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '14px', padding: '16px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '8px' }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#272727' }}>{t.subject}</div>
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '3px 10px',
                              borderRadius: '999px',
                              background: t.state === '0' ? 'rgba(139,62,35,0.12)' : 'rgba(0,181,148,0.12)',
                              color: t.state === '0' ? '#8B3E23' : '#007A63',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              flexShrink: 0
                            }}
                          >
                            {t.state === '0' ? 'Open' : 'Closed'}
                          </span>
                        </div>

                        <div style={{ fontSize: '12.5px', color: '#5A5854', lineHeight: 1.5 }}>
                          {cleanMessage}
                        </div>

                        {t.image && (
                          <div style={{ marginTop: '8px' }}>
                            <a
                              href={t.image.startsWith('http') ? t.image : `https://pragyayog.com/${t.image}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: '11.5px', color: '#8B3E23', fontWeight: 600, textDecoration: 'underline' }}
                            >
                              View Attached Screenshot 🖼️
                            </a>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#8A8580', marginTop: '8px' }}>
                          {t.ticket && <span>Ticket #{t.ticket}</span>}
                          {t.created_at && <span>{t.created_at}</span>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── CHECK-IN QR ───────────────────────────────────── */}
            {section === 'checkin' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#272727', marginBottom: '8px', fontWeight: 700 }}>Check-in QR Code</h3>
                <p style={{ fontSize: '13px', color: '#8A8580', marginBottom: '24px' }}>Show this code at the front desk to check into your class.</p>
                {qrData ? (
                  <div style={{ display: 'inline-block', background: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
                    <img src={qrData.startsWith('data:') ? qrData : `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}`} alt="Check-in QR" style={{ width: '220px', height: '220px', display: 'block' }} />
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '40px 0' }}>
                    <QrCode size={48} color="#D5CEC7" />
                    <div style={{ fontSize: '13px', color: '#8A8580' }}>QR code unavailable. Please check at the front desk.</div>
                  </div>
                )}
                <div>
                  <button onClick={loadQr} style={{ marginTop: '24px', background: 'none', border: '1.5px solid rgba(139,62,35,0.3)', borderRadius: '999px', padding: '10px 24px', fontSize: '13px', fontWeight: 700, color: '#8B3E23', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw size={14} /> Refresh QR Code
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};
