import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DailyQuoteBanner } from './components/DailyQuoteBanner';
import { ExperiencesGrid } from './components/ExperiencesGrid';
import { WhyChooseUs } from './components/WhyChooseUs';
import { WellnessJourney } from './components/WellnessJourney';
import { ProgramsEvents } from './components/ProgramsEvents';
import { InteractiveSchedule } from './components/InteractiveSchedule';
import { TeachersShowcase } from './components/TeachersShowcase';
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
import { ScrollProgressBar, BackToTopButton } from './components/ScrollUI';
import { Instructor, UpcomingEvent } from './types';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'about' | 'classes' | 'teachers' | 'teacher-detail' | 'membership' | 'events' | 'event-detail'>('home');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingType, setBookingType] = useState('class');
  const [bookingTitle, setBookingTitle] = useState('Book a Class');
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Instructor | null>(null);
  const [selectedTeacherForPage, setSelectedTeacherForPage] = useState<Instructor | null>(null);
  const [selectedEventForPage, setSelectedEventForPage] = useState<UpcomingEvent | null>(null);
  const [pageVisible, setPageVisible] = useState(true);
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
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.06,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const STAGGER_DELAYS = ['delay-1','delay-2','delay-3','delay-4','delay-5','delay-6'];

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
          // Only add stagger if no explicit delay class already set
          const hasDelay = STAGGER_DELAYS.some((d) => el.classList.contains(d)) ||
            el.classList.contains('delay-100') ||
            el.classList.contains('delay-200') ||
            el.classList.contains('delay-300') ||
            el.classList.contains('delay-400') ||
            el.classList.contains('delay-500');

          if (!hasDelay) {
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

  const handleOpenBooking = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F5EFE5' }}>
      {/* Scroll progress bar — fixed at very top */}
      <ScrollProgressBar />

      {/* Back-to-top floating button */}
      <BackToTopButton />

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
          />
        ) : currentView === 'membership' ? (
          <MembershipPage
            onOpenBooking={handleOpenBooking}
            onNavigateSection={handleNavigateSection}
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
        ) : (
          <>
            <Hero
              onOpenBooking={handleOpenBooking}
              onNavigateSection={handleNavigateSection}
            />

            <WhyChooseUs />

            <TeachersShowcase onOpenTeacherModal={handleOpenTeacherDetail} />

            <ProgramsEvents
              onOpenBooking={handleOpenBooking}
              onOpenEventDetail={handleOpenEventDetail}
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
    </div>
  );
};

export default App;
