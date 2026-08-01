import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DailyQuoteBanner } from './components/DailyQuoteBanner';
import { ExperiencesGrid } from './components/ExperiencesGrid';
import { WhyChooseUs } from './components/WhyChooseUs';
import { WellnessJourney } from './components/WellnessJourney';
import { ProgramsEvents } from './components/ProgramsEvents';
import { InteractiveSchedule } from './components/InteractiveSchedule';
import { TeachersShowcase } from './components/TeachersShowcase';
import { MembershipSection } from './components/MembershipSection';
import { LocationsSection } from './components/LocationsSection';
import { TestimonialsCarousel } from './components/TestimonialsCarousel';
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

  // Global Scroll Reveal Observer effect for necessary elements only
  useEffect(() => {
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
      rootMargin: '0px 0px -30px 0px',
      threshold: 0.05
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const attachObservers = () => {
      // Only target explicitly designated reveal elements
      const elements = document.querySelectorAll('.reveal-on-scroll');
      elements.forEach((el, idx) => {
        // Skip header nav items, top hero section, and fixed modal overlays
        if (el.closest('header') || el.closest('#hero') || el.closest('.modal-backdrop') || el.closest('.modal-content')) {
          el.classList.add('is-revealed');
          return;
        }
        if (!el.classList.contains('is-revealed')) {
          const delayClass = `delay-${((idx % 3) + 1) * 100}`;
          el.classList.add(delayClass);
          observer.observe(el);
        }
      });
    };

    attachObservers();
    const timer = setTimeout(attachObservers, 300);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [currentView, selectedTeacherForPage]);

  const handleOpenBooking = (type: string = 'class', title: string = 'Book a Class', details: any = null) => {
    setBookingType(type);
    setBookingTitle(title);
    setBookingDetails(details);
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
      {/* Sticky Navigation Header */}
      <Header
        onOpenBooking={handleOpenBooking}
        onOpenSearch={() => setSearchModalOpen(true)}
        onNavigateSection={handleNavigateSection}
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
      />

      {/* Main Content Sections */}
      <main style={{ flexGrow: 1 }}>
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

            <ProgramsEvents onOpenBooking={handleOpenBooking} />

            <InteractiveSchedule onOpenBooking={handleOpenBooking} />

            <TestimonialsCarousel />

            <MembershipSection onOpenBooking={handleOpenBooking} />

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
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        bookingType={bookingType}
        bookingTitle={bookingTitle}
        bookingDetails={bookingDetails}
      />

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
