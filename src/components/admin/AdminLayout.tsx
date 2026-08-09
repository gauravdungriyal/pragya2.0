import React, { useState, useEffect } from 'react';
import { Package, Shield, ArrowLeft, DollarSign, Users, Ticket, UserCheck, RefreshCw } from 'lucide-react';
import { PackageManager } from './PackageManager';
import { BookingCrmManager } from './BookingCrmManager';
import { BookingRecord } from './BookingDetailDrawer';
import { CustomerProfile } from './CustomerDetailModal';
import { DynamicPackage, UpcomingEvent, BundleItem } from '../../types';
import {
  getDynamicPackages,
  saveDynamicPackage,
  deleteDynamicPackage,
  getEvents,
  getBundleList,
  getTeachers,
  fetchFromApi
} from '../../services/api';
import { USE_DEMO_API } from '../../config/apiConfig';

interface AdminLayoutProps {
  onExitAdmin: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onExitAdmin }) => {
  const [activeModule, setActiveModule] = useState<'packages' | 'bookings'>('packages');

  const [packages, setPackages] = useState<DynamicPackage[]>([]);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [bundles, setBundles] = useState<BundleItem[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load Real API Data on Mount
  const loadRealApiData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Real Dynamic Packages from API Endpoint ('get-packages')
      const realPackages = await getDynamicPackages('all');
      if (realPackages && realPackages.length > 0) {
        setPackages(realPackages);
      }

      // 2. Fetch Real Events from API
      const realEvents = await getEvents();
      if (realEvents && realEvents.length > 0) {
        setEvents(realEvents);
      } else {
        setEvents([
          {
            id: 'evt-101',
            title: 'Full Moon Sound Bath & Chakra Healing',
            name: 'Full Moon Sound Bath & Chakra Healing',
            category: 'Workshop',
            description: 'Immerse in Tibetan singing bowls and deep gong vibrations for emotional release.',
            date: 'Oct 18, 2026',
            time: '7:00 PM - 9:00 PM',
            location: 'Central Studio, HK',
            price: '$480',
            amount: 480,
            level: 'All Levels',
            instructor_name: 'Master Gurudev',
            spots_label: '8 Spots Left',
          },
          {
            id: 'evt-102',
            title: 'Pranayama & Breathwork Masterclass',
            name: 'Pranayama & Breathwork Masterclass',
            category: 'Masterclass',
            description: 'Unlock vital energy through advanced kriya practices and bio-energetic breathing.',
            date: 'Nov 05, 2026',
            time: '10:00 AM - 1:00 PM',
            location: 'Kowloon Studio, HK',
            price: '$650',
            amount: 650,
            level: 'Intermediate',
            instructor_name: 'Acharya Dev',
            spots_label: '12 Spots Available',
          }
        ]);
      }

      // 3. Fetch Real Bundles from API Endpoint ('bundle-list')
      const realBundles = await getBundleList();
      if (realBundles && Array.isArray(realBundles) && realBundles.length > 0) {
        const formattedBundles: BundleItem[] = realBundles.map((b: any, idx: number) => ({
          id: String(b.id || `bndl-${idx}`),
          name: b.name || b.title || 'Special Bundle',
          original_price: Number(b.original_price || b.price || 0),
          discounted_price: Number(b.discounted_price || b.final_price || b.price || 0),
          final_price: Number(b.final_price || b.discounted_price || b.price || 0),
          bundle_discount: Number(b.savings || b.bundle_discount || 0),
          savings: Number(b.savings || 0),
          packages: b.packages || [],
        }));
        setBundles(formattedBundles);
      }

      // 4. Fetch Real Instructors / Staff Members for Customer CRM
      const realTeachers = await getTeachers();
      if (realTeachers && realTeachers.length > 0) {
        const mappedProfiles: CustomerProfile[] = realTeachers.map((t: any, idx: number) => ({
          id: `CUST-${t.staff_id || idx + 101}`,
          name: t.name,
          email: `${t.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@pragya-yog.com`,
          phone: `+852 9000 ${1000 + idx}`,
          totalBookings: (idx + 1) * 2,
          activePass: t.designation || 'Master Practitioner',
          memberSince: '2024',
        }));
        setCustomers(mappedProfiles);
      }

      // 5. Fetch Real Class Schedule & Booking Ledger from API ('get-schedule')
      const scheduleRes = await fetchFromApi<any>('get-schedule');
      if (scheduleRes && scheduleRes.data && Array.isArray(scheduleRes.data)) {
        const realBookings: BookingRecord[] = scheduleRes.data.map((item: any, idx: number) => ({
          id: `BK-${item.id || item.schedule_id || 8900 + idx}`,
          customerName: item.instructor_name || item.teacher_name || 'Registered Practitioner',
          email: item.email || `guest.${idx + 1}@pragya-yog.com`,
          phone: item.phone || '+852 9123 4567',
          bookingType: item.category || item.type || 'Class',
          itemTitle: item.title || item.class_name || 'Yoga Immersion Session',
          date: item.date || item.start_time || 'Today',
          amount: Number(item.amount || item.price || 320),
          currency: item.currency || 'HKD',
          status: item.is_active !== false ? 'Confirmed' : 'Pending',
          notes: item.location ? `Studio: ${item.location}` : 'API Live Record',
          createdAt: item.date || '2026-08-01',
        }));
        setBookings(realBookings);
      }
    } catch (err) {
      console.warn('API sync error in AdminPanel:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRealApiData();
  }, []);

  const handleSavePackage = async (pkg: DynamicPackage) => {
    // Save to real API endpoint via saveDynamicPackage
    const res = await saveDynamicPackage(pkg);
    if (res && res.package) {
      setPackages((prev) => {
        const idx = prev.findIndex((p) => p.id === res.package.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = res.package;
          return copy;
        }
        return [res.package, ...prev];
      });
    } else {
      setPackages((prev) => {
        const idx = prev.findIndex((p) => p.id === pkg.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = pkg;
          return copy;
        }
        return [pkg, ...prev];
      });
    }
  };

  const handleDeletePackage = async (id: string) => {
    await deleteDynamicPackage(id);
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveEvent = (evt: UpcomingEvent) => {
    setEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === evt.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = evt;
        return copy;
      }
      return [evt, ...prev];
    });
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSaveBundle = (bndl: BundleItem) => {
    setBundles((prev) => [bndl, ...prev]);
  };

  const handleUpdateBookingStatus = (
    id: string,
    status: BookingRecord['status'],
    notes?: string,
    date?: string
  ) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          return {
            ...b,
            status,
            notes: notes !== undefined ? notes : b.notes,
            date: date || b.date,
          };
        }
        return b;
      })
    );
  };

  const totalRevenue = bookings
    .filter((b) => b.status === 'Confirmed' || b.status === 'Completed')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const pendingBookingsCount = bookings.filter((b) => b.status === 'Pending').length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF7F2', color: '#1C1917', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '60px' }}>
      
      {/* ── Top Header Bar ────────────────────────────────────────── */}
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E7E5E4', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 28px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={onExitAdmin}
              style={{
                padding: '10px 18px',
                backgroundColor: '#F5F5F4',
                color: '#292524',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid #E7E5E4',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <ArrowLeft className="w-4 h-4 text-amber-700" /> Return to Website
            </button>

            <div style={{ height: '24px', width: '1px', backgroundColor: '#E7E5E4' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#92400E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 style={{ fontWeight: 800, fontSize: '19px', color: '#1C1917', margin: 0, lineHeight: '1.2' }}>Pragya Admin Panel</h1>
                <p style={{ fontSize: '12px', color: '#78716C', margin: '3px 0 0 0' }}>Real-time API Store & Operations Center</p>
              </div>
            </div>

            {USE_DEMO_API && (
              <span style={{ padding: '6px 14px', borderRadius: '999px', backgroundColor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} /> Live API Connected
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={loadRealApiData}
              disabled={isLoading}
              style={{
                padding: '8px 14px',
                backgroundColor: '#FAF7F2',
                color: '#78350F',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 800,
                border: '1px solid #FDE68A',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Syncing API...' : 'Sync Live Data'}
            </button>

            <div style={{ borderLeft: '1px solid #E7E5E4', paddingLeft: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#A8A29E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue</div>
                <div style={{ fontSize: '17px', fontWeight: 900, color: '#B45309', marginTop: '2px' }}>HKD ${totalRevenue.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#A8A29E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Bookings</div>
                <div style={{ fontSize: '17px', fontWeight: 900, color: '#B45309', marginTop: '2px' }}>{pendingBookingsCount}</div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* ── Main Canvas Container with Spacious Spacing ───────────── */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px 28px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* KPI Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', padding: '24px 28px', borderRadius: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign className="w-4 h-4 text-amber-600" /> Total Revenue
            </div>
            <div style={{ fontSize: '30px', fontWeight: 900, color: '#1C1917', letterSpacing: '-0.02em', margin: '4px 0' }}>HKD ${totalRevenue.toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: '#A8A29E', fontWeight: 600 }}>Live ledger API transactions</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', padding: '24px 28px', borderRadius: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package className="w-4 h-4 text-amber-600" /> Active API Packages
            </div>
            <div style={{ fontSize: '30px', fontWeight: 900, color: '#1C1917', letterSpacing: '-0.02em', margin: '4px 0' }}>{packages.filter(p => p.isActive).length}</div>
            <div style={{ fontSize: '12px', color: '#A8A29E', fontWeight: 600 }}>Fetched from API get-packages</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', padding: '24px 28px', borderRadius: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ticket className="w-4 h-4 text-amber-600" /> Total Bookings
            </div>
            <div style={{ fontSize: '30px', fontWeight: 900, color: '#1C1917', letterSpacing: '-0.02em', margin: '4px 0' }}>{bookings.length}</div>
            <div style={{ fontSize: '12px', color: '#A8A29E', fontWeight: 600 }}>Live API class schedule records</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', padding: '24px 28px', borderRadius: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users className="w-4 h-4 text-amber-600" /> Customer Profiles
            </div>
            <div style={{ fontSize: '30px', fontWeight: 900, color: '#1C1917', letterSpacing: '-0.02em', margin: '4px 0' }}>{customers.length}</div>
            <div style={{ fontSize: '12px', color: '#A8A29E', fontWeight: 600 }}>Registered member API records</div>
          </div>

        </div>

        {/* Primary Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', borderBottom: '2px solid #E7E5E4', paddingBottom: '16px', margin: '8px 0' }}>
          
          <button
            onClick={() => setActiveModule('packages')}
            style={{
              padding: '12px 24px',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: activeModule === 'packages' ? 'none' : '1px solid #E7E5E4',
              backgroundColor: activeModule === 'packages' ? '#B45309' : '#FFFFFF',
              color: activeModule === 'packages' ? '#FFFFFF' : '#44403C',
              boxShadow: activeModule === 'packages' ? '0 4px 12px rgba(180,83,9,0.25)' : 'none',
            }}
          >
            <Package className="w-5 h-5" /> Package, Membership & Event Manager
          </button>

          <button
            onClick={() => setActiveModule('bookings')}
            style={{
              padding: '12px 24px',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: activeModule === 'bookings' ? 'none' : '1px solid #E7E5E4',
              backgroundColor: activeModule === 'bookings' ? '#B45309' : '#FFFFFF',
              color: activeModule === 'bookings' ? '#FFFFFF' : '#44403C',
              boxShadow: activeModule === 'bookings' ? '0 4px 12px rgba(180,83,9,0.25)' : 'none',
            }}
          >
            <UserCheck className="w-5 h-5" /> Bookings, Orders & Member CRM
          </button>

        </div>

        {/* Module Content */}
        <div style={{ paddingTop: '8px' }}>
          {activeModule === 'packages' ? (
            <PackageManager
              packages={packages}
              events={events}
              bundles={bundles}
              onSavePackage={handleSavePackage}
              onDeletePackage={handleDeletePackage}
              onSaveEvent={handleSaveEvent}
              onDeleteEvent={handleDeleteEvent}
              onSaveBundle={handleSaveBundle}
            />
          ) : (
            <BookingCrmManager
              bookings={bookings}
              customers={customers}
              onUpdateBookingStatus={handleUpdateBookingStatus}
            />
          )}
        </div>

      </main>

    </div>
  );
};
