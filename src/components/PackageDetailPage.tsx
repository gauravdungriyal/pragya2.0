import React from 'react';
import { DynamicPackage } from '../types';
import { TrainingDetailPage } from './templates/TrainingDetailPage';
import { WorkshopDetailPage } from './templates/WorkshopDetailPage';
import { EventDetailPage } from './templates/EventDetailPage';
import { RetreatDetailPage } from './templates/RetreatDetailPage';
import { MembershipDetailPage } from './templates/MembershipDetailPage';
import { PrivateSessionDetailPage } from './templates/PrivateSessionDetailPage';

export interface PackageDetailPageProps {
  pkg: DynamicPackage;
  onBack: () => void;
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  isPreview?: boolean;
}

export const PackageDetailPage: React.FC<PackageDetailPageProps> = ({
  pkg,
  onBack,
  onOpenBooking,
  isPreview = false
}) => {
  switch (pkg.type) {
    case 'teacher_training':
      return <TrainingDetailPage pkg={pkg} onBack={onBack} onOpenBooking={onOpenBooking} isPreview={isPreview} />;

    case 'workshop':
      return <WorkshopDetailPage pkg={pkg} onBack={onBack} onOpenBooking={onOpenBooking} isPreview={isPreview} />;

    case 'event':
      return <EventDetailPage pkg={pkg} onBack={onBack} onOpenBooking={onOpenBooking} isPreview={isPreview} />;

    case 'retreat':
      return <RetreatDetailPage pkg={pkg} onBack={onBack} onOpenBooking={onOpenBooking} isPreview={isPreview} />;

    case 'regular':
      return <MembershipDetailPage pkg={pkg} onBack={onBack} onOpenBooking={onOpenBooking} isPreview={isPreview} />;

    case 'private':
      return <PrivateSessionDetailPage pkg={pkg} onBack={onBack} onOpenBooking={onOpenBooking} isPreview={isPreview} />;

    default:
      return <TrainingDetailPage pkg={pkg} onBack={onBack} onOpenBooking={onOpenBooking} isPreview={isPreview} />;
  }
};

export default PackageDetailPage;
