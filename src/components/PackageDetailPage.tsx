import React from 'react';
import { DynamicPackage } from '../types';
import { EventDetailPage } from './templates/EventDetailPage';
import { TeacherTraining } from './templates/TeacherTraining';
import { WorkshopTemplate } from './templates/workshop';
import { PrivateTemplate } from './templates/private';
import { RegularTemplate } from './templates/regular';
import { RetreatTemplate } from './templates/retreat';

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
  const pType = (pkg.type || '').toLowerCase();
  const cat = ((pkg as any).category || (pkg as any).cat || '').toLowerCase();
  const title = (pkg.title || '').toLowerCase();

  const isTtc = pType === 'teacher_training' || cat === 'ttc' || cat.includes('teacher') || title.includes('ttc') || title.includes('teacher training');
  const isWorkshop = pType === 'workshop' || cat === 'workshop' || cat.includes('workshop') || title.includes('workshop');
  const isPrivate = pType === 'private' || cat === 'private' || cat.includes('private') || title.includes('private') || title.includes('1-on-1') || title.includes('1-1');
  const isRegular = pType === 'regular' || cat === 'regular' || cat.includes('regular') || title.includes('regular');
  const isRetreat = pType === 'retreat' || cat === 'retreat' || cat.includes('retreat') || title.includes('retreat');

  if (isTtc) {
    return (
      <TeacherTraining
        pkg={pkg}
        onBack={onBack}
        onOpenBooking={onOpenBooking}
        isPreview={isPreview}
      />
    );
  }

  if (isWorkshop) {
    return (
      <WorkshopTemplate
        pkg={pkg}
        onBack={onBack}
        onOpenBooking={onOpenBooking}
        isPreview={isPreview}
      />
    );
  }

  if (isPrivate) {
    return (
      <PrivateTemplate
        pkg={pkg}
        onBack={onBack}
        onOpenBooking={onOpenBooking}
        isPreview={isPreview}
      />
    );
  }

  if (isRegular) {
    return (
      <RegularTemplate
        pkg={pkg}
        onBack={onBack}
        onOpenBooking={onOpenBooking}
        isPreview={isPreview}
      />
    );
  }

  if (isRetreat) {
    return (
      <RetreatTemplate
        pkg={pkg}
        onBack={onBack}
        onOpenBooking={onOpenBooking}
        isPreview={isPreview}
      />
    );
  }

  return (
    <EventDetailPage
      pkg={pkg}
      onBack={onBack}
      onOpenBooking={onOpenBooking}
      isPreview={isPreview}
    />
  );
};

export default PackageDetailPage;
