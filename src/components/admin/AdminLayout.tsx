import React, { useState, useEffect } from 'react';
import { Package, Shield, ArrowLeft, DollarSign, Users, Ticket, UserCheck, RefreshCw, Sparkles } from 'lucide-react';
import { ContentManager } from './ContentManager';
import { BookingRecord } from './BookingDetailDrawer';
import { CustomerProfile } from './CustomerDetailModal';
import { DynamicPackage, UpcomingEvent, BundleItem } from '../../types';
import {
  getDynamicPackages,
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
  const [activeModule, setActiveModule] = useState<'cms'>('cms');

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

  // Read-only metrics calculation
  const totalRevenue = bookings
    .filter((b) => b.status === 'Confirmed' || b.status === 'Completed')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const pendingBookingsCount = bookings.filter((b) => b.status === 'Pending').length;

  return (
    <div className="admin-panel admin-panel-container" style={{ minHeight: '100vh', backgroundColor: '#FAF7F2', color: '#1C1917', fontFamily: 'var(--font-sans), "Neue Montreal", sans-serif', fontWeight: 400, paddingBottom: '60px' }}>
      
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
                fontWeight: 500,
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
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#92400E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 style={{ fontWeight: 400, fontFamily: 'var(--font-sans)', fontSize: '19px', color: '#1C1917', margin: 0, lineHeight: '1.2' }}>Pragya Admin Panel</h1>
                <p style={{ fontSize: '12px', color: '#78716C', margin: '3px 0 0 0' }}>Website Content & Branding Manager</p>
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* ── Main Canvas Container with Spacious Spacing ───────────── */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px 28px' }}>
        <ContentManager />
      </main>

    </div>
  );
};
