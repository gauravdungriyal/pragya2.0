import React from 'react';
import { DynamicPackage, UpcomingEvent } from '../../types';
import { EventDetailPage as RealEventDetailPage } from '../EventDetailPage';

interface EventDetailPageProps {
  pkg: DynamicPackage;
  onBack: () => void;
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  isPreview?: boolean;
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({
  pkg,
  onBack,
  onOpenBooking,
  isPreview = false
}) => {
  const metadata = pkg.metadata || {};

  const mappedEvent: UpcomingEvent = {
    id: pkg.id,
    title: pkg.title,
    name: pkg.title,
    image: pkg.coverImage || 'https://images.unsplash.com/photo-1510894347713-da3ed8f4f92d?q=80&w=1600&auto=format&fit=crop',
    price: pkg.discountPrice ? `${pkg.currency || 'HK$'} ${pkg.discountPrice}` : `${pkg.currency || 'HK$'} ${pkg.price}`,
    location: metadata.venue || metadata.location || 'Pragya Yog Studio',
    duration: metadata.eventTime || '02:00 PM – 05:00 PM',
    level: pkg.badge || 'All Levels',
    description: pkg.description,
    focus: pkg.subtitle || 'Community Event',
    date: metadata.eventDate || 'Upcoming Event'
  };

  return (
    <div className="relative">
      {isPreview && (
        <div className="sticky top-0 z-[1000] bg-gradient-to-r from-[#944426] via-[#B85732] to-[#944426] text-white px-6 py-3.5 font-semibold text-xs sm:text-sm text-center shadow-xl flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center gap-2.5 mx-auto">
            <span><strong>EVENT PREVIEW MODE</strong> — Displayed in Official Event Page Template.</span>
          </div>
          <button onClick={onBack} className="bg-stone-950 hover:bg-black text-amber-300 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow shrink-0">Close Preview</button>
        </div>
      )}
      <RealEventDetailPage
        event={mappedEvent}
        onBack={onBack}
        onOpenBooking={onOpenBooking}
      />
    </div>
  );
};
