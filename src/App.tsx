import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DailyQuoteBanner } from './components/DailyQuoteBanner';
import { ExperiencesGrid } from './components/ExperiencesGrid';
import { WhyChooseUs } from './components/WhyChooseUs';
import { WellnessJourney } from './components/WellnessJourney';
import { ProgramsEvents } from './components/ProgramsEvents';
import { InteractiveSchedule } from './components/InteractiveSchedule';
import { TeachersShowcase } from './components/TeachersShowcase';
import { GiftOfYoga } from './components/GiftOfYoga';
import { LocationsSection } from './components/LocationsSection';
import { FaqSection } from './components/FaqSection';
import { NewsletterFooter } from './components/NewsletterFooter';
import { BookingModal } from './components/BookingModal';
import { QuickSearchModal } from './components/QuickSearchModal';
import { TeacherDetailModal } from './components/TeacherDetailModal';
import { AboutPage } from './components/AboutPage';
import { ClassesPage } from './components/ClassesPage';
import { TeachersPage } from './components/TeachersPage';
import { TeacherDetailPage } from './components/TeacherDetailPage';
import { MembershipPage } from './components/MembershipPage';
import { EventsPage } from './components/EventsPage';
import { EventDetailPage } from './components/EventDetailPage';
import { ScrollProgressBar } from './components/ScrollUI';
import { AIChatWidget } from './components/AIChatWidget';
import { AiAssistantPage } from './components/AiAssistantPage';
import { PackageDetailPage } from './components/PackageDetailPage';
import { PackageReserveModal } from './components/PackageReserveModal';
import { GuestBookingModal } from './components/GuestBookingModal';
import { CartPage } from './components/CartPage';
import { PolicyPage } from './components/PolicyPage';
import { MerchandiseStorePage } from './components/MerchandiseStorePage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLogin } from './components/admin/AdminLogin';
import { Instructor, UpcomingEvent, DynamicPackage } from './types';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'about' | 'classes' | 'teachers' | 'teacher-detail' | 'membership' | 'events' | 'event-detail' | 'package-detail' | 'merchandise' | 'ai-assistant' | 'cart' | 'policy' | 'admin'>('home');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('pragya_admin_auth') === 'true';
  });

  // Listen to route /pragya-admin or #pragya-admin
  useEffect(() => {
    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('pragya-admin') || hash.includes('pragya-admin')) {
        setCurrentView('admin');
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);
    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, []);
  const [membershipCategory, setMembershipCategory] = useState<string>('ALL');
  const [selectedPolicyId, setSelectedPolicyId] = useState<number>(3);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingType, setBookingType] = useState('class');
  const [bookingTitle, setBookingTitle] = useState('Book a Class');
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // Package Reserve Modal state
  const [packageReserveOpen, setPackageReserveOpen] = useState(false);
  const [reservePackageData, setReservePackageData] = useState<{ id: string | number; title: string; price?: number } | null>(null);

  // Guest Class Booking Modal state
  const [guestBookingOpen, setGuestBookingOpen] = useState(false);
  const [guestBookingData, setGuestBookingData] = useState<{ scheduleId: string | number; title: string; timing?: string; classDetails?: any } | null>(null);

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Instructor | null>(null);
  const [selectedTeacherForPage, setSelectedTeacherForPage] = useState<Instructor | null>(null);
  const [selectedEventForPage, setSelectedEventForPage] = useState<UpcomingEvent | null>(null);
  const [selectedPackageForPage, setSelectedPackageForPage] = useState<DynamicPackage | null>(null);
  const [pageVisible, setPageVisible] = useState(true);

  const handleOpenPackageDetail = useCallback((pkg: DynamicPackage) => {
    setSelectedPackageForPage(pkg);
    setCurrentView('package-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const mainRef = useRef<HTMLDivElement>(null);

  // ── Global Scroll-Reveal Observer ──────────────────────────────────────────
  // Supports 6 reveal variants: reveal-on-scroll, reveal-fade, reveal-left,
  // reveal-right, reveal-zoom, reveal-blur. All share the .is-revealed trigger.
  useEffect(() => {
    const REVEAL_SELECTORS = [
      '.reveal-on-scroll',
      '.reveal-fade',
      '.reveal-left',
      '.reveal-right',
      '.reveal-zoom',
      '.reveal-blur',
    ].join(', ');

    const observerCallback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    };

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '0px 0px 100px 0px',
      threshold: 0.01,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const STAGGER_DELAYS = ['delay-1', 'delay-2', 'delay-3', 'delay-4', 'delay-5', 'delay-6'];

    const attachObservers = () => {
      const elements = document.querySelectorAll(REVEAL_SELECTORS);
      let staggerIdx = 0;
      elements.forEach((el) => {
        // Skip elements already visible or inside hero/header/modal
        if (
          el.closest('header') ||
          el.closest('#hero') ||
          el.closest('.modal-backdrop') ||
          el.closest('.modal-content')
        ) {
          el.classList.add('is-revealed');
          return;
        }

        if (!el.classList.contains('is-revealed')) {
          // Do not add artificial stagger delay to top-level section containers
          const isSection = el.tagName === 'SECTION' || el.id === 'programs' || el.classList.contains('programs-section');
          const hasDelay = STAGGER_DELAYS.some((d) => el.classList.contains(d)) ||
            el.classList.contains('delay-100') ||
            el.classList.contains('delay-200') ||
            el.classList.contains('delay-300') ||
            el.classList.contains('delay-400') ||
            el.classList.contains('delay-500');

          if (!hasDelay && !isSection) {
            el.classList.add(STAGGER_DELAYS[staggerIdx % STAGGER_DELAYS.length]);
            staggerIdx++;
          }
          observer.observe(el);
        }
      });
    };

    attachObservers();
    const timer = setTimeout(attachObservers, 350);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [currentView, selectedTeacherForPage, selectedEventForPage]);

  // ── Parallax depth effect on scroll ───────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      // Update CSS custom prop for parallax layers
      document.documentElement.style.setProperty('--scroll-y', `${y}px`);

      // Subtle parallax on hero background
      const heroBg = document.querySelector('.hero-bg-desktop') as HTMLElement;
      if (heroBg) {
        heroBg.style.transform = `translate3d(0, ${y * 0.28}px, 0)`;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleOpenBooking = (type?: string, title?: string, details?: any) => {
    const pkgTypes = [
      'package', 'membership', 'private', 'journey', 'experience', 'consultation',
      'teacher_training', 'workshop', 'retreat', 'regular', 'free_class', 'event'
    ];

    // 1. Explicit Class Schedule (has schedule_id or type === 'class' with timing)
    if (details?.schedule_id || (type === 'class' && (details?.timing || details?.instructor))) {
      setGuestBookingData({
        scheduleId: details.schedule_id || details.id,
        title: title || details.title || 'Book a Class',
        timing: details.timing,
        classDetails: details,
      });
      setGuestBookingOpen(true);
      return;
    }

    // 2. Package / Consultation / Membership / Private Pass (has packageID, category, amount, or package type)
    if (
      details?.packageID ||
      details?.category ||
      details?.amount !== undefined ||
      (type && pkgTypes.includes(type)) ||
      (details?.id && !details?.schedule_id && !details?.timing)
    ) {
      if (details?.id) {
        setReservePackageData({
          id: details.id,
          title: title || details.title || 'Reserve Package',
          price: details.price || details.discountPrice || details.amount,
        });
        setPackageReserveOpen(true);
        return;
      }
    }

    // 3. Fallback: If details has scheduleId or id for class
    if (details?.scheduleId || details?.id) {
      setGuestBookingData({
        scheduleId: details.scheduleId || details.id,
        title: title || details.title || 'Book a Class',
        timing: details.timing,
        classDetails: details,
      });
      setGuestBookingOpen(true);
      return;
    }

    // Fallback generic modal — do NOT navigate away; just open the generic booking modal
    if (type) setBookingType(type);
    if (title) setBookingTitle(title);
    if (details) setBookingDetails(details);
    setBookingModalOpen(true);
  };

  const handleOpenTeacherDetail = (teacher: Instructor) => {
    setSelectedTeacherForPage(teacher);
    setCurrentView('teacher-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEventDetail = (event: UpcomingEvent) => {
    setSelectedEventForPage(event);
    setCurrentView('event-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Page view change with fade transition ─────────────────────────────────
  const handleViewChange = (view: typeof currentView) => {
    setPageVisible(false);
    setTimeout(() => {
      setCurrentView(view);
      setPageVisible(true);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }, 220);
  };

  const handleNavigateSection = (sectionId: string) => {
    if (sectionId === 'membership-regular' || sectionId === 'regular') {
      setMembershipCategory('Regular');
      setCurrentView('membership');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (sectionId === 'membership-private' || sectionId === 'private') {
      setMembershipCategory('Private');
      setCurrentView('membership');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (['classes', 'membership', 'events', 'teachers', 'about', 'home'].includes(sectionId)) {
      if (sectionId === 'membership') setMembershipCategory('ALL');
      setCurrentView(sectionId as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (sectionId.startsWith('policy-')) {
      const pid = Number(sectionId.replace('policy-', '')) || 3;
      setSelectedPolicyId(pid);
      setCurrentView('policy');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (sectionId === 'terms') {
      setSelectedPolicyId(2);
      setCurrentView('policy');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (sectionId === 'privacy') {
      setSelectedPolicyId(3);
      setCurrentView('policy');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (sectionId === 'guidelines') {
      setSelectedPolicyId(1);
      setCurrentView('policy');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const elem = document.getElementById(sectionId);
        if (elem) {
          const headerOffset = 115;
          const elementPosition = elem.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    const elem = document.getElementById(sectionId);
    if (elem) {
      const headerOffset = 115;
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Bug 26 fix: use a ref to always call the latest handleViewChange, avoiding stale closure
  const handleViewChangeRef = useRef(handleViewChange);
  useEffect(() => { handleViewChangeRef.current = handleViewChange; });

  useEffect(() => {
    const handleCartNav = () => {
      handleViewChangeRef.current('cart');
    };
    window.addEventListener('navigate-to-cart', handleCartNav);
    return () => window.removeEventListener('navigate-to-cart', handleCartNav);
  }, []);



  if (currentView === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <AdminLogin
          onAuthenticated={() => setIsAdminAuthenticated(true)}
          onExit={() => {
            if (window.location.pathname.includes('pragya-admin')) {
              window.history.pushState({}, '', '/');
            }
            setCurrentView('home');
          }}
        />
      );
    }
    return (
      <AdminLayout
        onExitAdmin={() => {
          if (window.location.pathname.includes('pragya-admin')) {
            window.history.pushState({}, '', '/');
          }
          setCurrentView('home');
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F5EFE5' }}>
      {/* Scroll progress bar — fixed at very top */}
      <ScrollProgressBar />

      {/* Back-to-top floating button */}


      {/* Sticky Navigation Header */}
      <Header
        onOpenBooking={handleOpenBooking}
        onOpenSearch={() => setSearchModalOpen(true)}
        onNavigateSection={handleNavigateSection}
        currentView={currentView}
        onViewChange={(view) => handleViewChange(view as typeof currentView)}
      />

      {/* Main Content Sections — page-level fade transition */}
      <main
        ref={mainRef}
        style={{
          flexGrow: 1,
          opacity: pageVisible ? 1 : 0,
          transform: pageVisible ? 'translate3d(0,0,0)' : 'translate3d(0,18px,0)',
          transition: 'opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
          // Bug 1 fix: add top padding on inner pages so fixed header doesn't overlap content
          paddingTop: (currentView === 'home' || currentView === 'package-detail') ? 0 : '100px',
        }}
      >
        {currentView === 'about' ? (
          <AboutPage
            onOpenBooking={handleOpenBooking}
            onNavigateSection={handleNavigateSection}
          />
        ) : currentView === 'classes' ? (
          <ClassesPage
            onOpenBooking={handleOpenBooking}
            onNavigateSection={handleNavigateSection}
          />
        ) : currentView === 'teachers' ? (
          <TeachersPage
            onOpenTeacherModal={handleOpenTeacherDetail}
            onOpenBooking={handleOpenBooking}
            onNavigateSection={handleNavigateSection}
            onOpenPackageDetail={handleOpenPackageDetail}
            onViewChange={handleViewChange}
          />
        ) : currentView === 'membership' ? (
          <MembershipPage
            onOpenBooking={handleOpenBooking}
            onNavigateSection={handleNavigateSection}
            onOpenPackageDetail={handleOpenPackageDetail}
            initialCategory={membershipCategory}
          />
        ) : currentView === 'events' ? (
          <EventsPage
            onOpenBooking={handleOpenBooking}
            onOpenEventDetail={handleOpenEventDetail}
            onNavigateSection={handleNavigateSection}
          />
        ) : currentView === 'event-detail' && selectedEventForPage ? (
          <EventDetailPage
            event={selectedEventForPage}
            onBack={() => {
              setCurrentView('events');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectEvent={handleOpenEventDetail}
            onOpenBooking={handleOpenBooking}
          />
        ) : currentView === 'teacher-detail' && selectedTeacherForPage ? (
          <TeacherDetailPage
            teacher={selectedTeacherForPage}
            onBack={() => {
              setCurrentView('teachers');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenBooking={handleOpenBooking}
          />
        ) : currentView === 'package-detail' && selectedPackageForPage ? (
          <PackageDetailPage
            pkg={selectedPackageForPage}
            onBack={() => {
              setCurrentView('membership');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenBooking={handleOpenBooking}
          />
        ) : currentView === 'ai-assistant' ? (
          <AiAssistantPage
            onBackToHome={() => handleViewChange('home')}
            onOpenBooking={handleOpenBooking}
          />
        ) : currentView === 'cart' ? (
          <CartPage
            onViewChange={(view) => handleViewChange(view as any)}
            onOpenBooking={handleOpenBooking}
          />
        ) : currentView === 'merchandise' ? (
          <MerchandiseStorePage onBackToHome={() => handleViewChange('home')} />
        ) : currentView === 'policy' ? (
          <PolicyPage
            policyId={selectedPolicyId}
            onBack={() => handleViewChange('home')}
            onSelectPolicy={(id) => setSelectedPolicyId(id)}
          />
        ) : (
          <>
            <Hero
              onOpenBooking={handleOpenBooking}
              onNavigateSection={handleNavigateSection}
              onViewChange={handleViewChange}
            />

            <WhyChooseUs />

            <GiftOfYoga />

            <ProgramsEvents
              onOpenBooking={handleOpenBooking}
              onOpenEventDetail={handleOpenEventDetail}
              onViewChange={handleViewChange}
              onOpenPackageDetail={handleOpenPackageDetail}
            />

            <InteractiveSchedule onOpenBooking={handleOpenBooking} />

            <FaqSection onOpenBooking={handleOpenBooking} />
          </>
        )}
      </main>

      {/* Footer */}
      <NewsletterFooter
        onNavigateSection={handleNavigateSection}
        onOpenBooking={handleOpenBooking}
      />

      {/* Floating AI Chatbot Widget (Always visible on all pages) */}
      <AIChatWidget
        onOpenFullPage={() => handleViewChange('ai-assistant')}
        onOpenBooking={handleOpenBooking}
      />

      {/* Interactive Modals */}

      <QuickSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigateSection={handleNavigateSection}
      />

      <TeacherDetailModal
        teacher={selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
        onOpenBooking={handleOpenBooking}
      />

      {/* Package Reserve Modal */}
      {reservePackageData && (
        <PackageReserveModal
          isOpen={packageReserveOpen}
          onClose={() => { setPackageReserveOpen(false); setReservePackageData(null); }}
          packageId={reservePackageData.id}
          packageTitle={reservePackageData.title}
          packagePrice={reservePackageData.price}
        />
      )}

      {/* Guest Class Booking Modal */}
      {guestBookingData && (
        <GuestBookingModal
          isOpen={guestBookingOpen}
          onClose={() => { setGuestBookingOpen(false); setGuestBookingData(null); }}
          scheduleId={guestBookingData.scheduleId}
          classTitle={guestBookingData.title}
          classTiming={guestBookingData.timing}
          classDetails={guestBookingData.classDetails}
        />
      )}
    </div>
  );
};

export default App;
