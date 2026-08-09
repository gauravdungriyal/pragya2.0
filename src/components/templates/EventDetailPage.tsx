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

  const rawPriceNum = String(pkg.discountPrice || pkg.price || (pkg as any).amount || '680')
    .replace(/₹|INR|Rs\.?/gi, '')
    .replace(/HK\$\s*/gi, '')
    .trim();
  const formattedPriceStr = `HK$ ${rawPriceNum}`;

  const mappedEvent: UpcomingEvent = {
    id: pkg.id,
    title: pkg.title,
    name: pkg.title,
    image: pkg.coverImage || 'https://images.unsplash.com/photo-1510894347713-da3ed8f4f92d?q=80&w=1600&auto=format&fit=crop',
    price: formattedPriceStr,
    amount: parseFloat(rawPriceNum) || undefined,
    location: metadata.venue || metadata.location || 'Pragya Yog Studio',
    duration: metadata.eventTime || (pkg as any).duration_label || '02:00 PM – 05:00 PM',
    level: pkg.badge || 'All Levels',
    description: pkg.description,
    focus: pkg.subtitle || 'Community Event',
    date: metadata.eventDate || 'Upcoming Event',
    benefit: (pkg as any).benefit,
    class_access: (pkg as any).class_access,
    duration_label: (pkg as any).duration_label,
    access_label: (pkg as any).access_label,
    features: pkg.features,
    frequently_bought_together: (pkg as any).frequently_bought_together,
    discount: (pkg as any).discount,
    discount_remarks: (pkg as any).discount_remarks
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
