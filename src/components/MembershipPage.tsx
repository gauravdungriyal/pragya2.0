import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, Award, Compass, Zap, UserCheck, Gift, Calendar, Layers } from 'lucide-react';
import { getDynamicPackages } from '../services/api';
import { DynamicPackage, PackageType } from '../types';
import { TeacherTrainingCard } from './packages/TeacherTrainingCard';
import { WorkshopCard } from './packages/WorkshopCard';
import { EventCard } from './packages/EventCard';
import { RetreatCard } from './packages/RetreatCard';
import { RegularPackageCard } from './packages/RegularPackageCard';
import { PrivatePackageCard } from './packages/PrivatePackageCard';
import { FreeClassCard } from './packages/FreeClassCard';
import { PackageDetailModal } from './packages/PackageDetailModal';

interface MembershipPageProps {
  onOpenBooking: (type?: string, title?: string, details?: any) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const MembershipPage: React.FC<MembershipPageProps> = ({ onOpenBooking }) => {
  const [packages, setPackages] = useState<DynamicPackage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedDetailPackage, setSelectedDetailPackage] = useState<DynamicPackage | null>(null);

  const fetchPackagesData = async () => {
    setLoading(true);
    const data = await getDynamicPackages('all');
    setPackages(data.filter(p => p.isActive));
    setLoading(false);
  };

  useEffect(() => {
    fetchPackagesData();
  }, []);

  const categories = [
    { id: 'ALL', label: 'All Offerings', icon: Layers },
    { id: 'teacher_training', label: 'Teacher Training', icon: Award },
    { id: 'workshop', label: 'Workshops', icon: Zap },
    { id: 'event', label: 'Events', icon: Calendar },
    { id: 'retreat', label: 'Retreats', icon: Compass },
    { id: 'regular', label: 'Memberships', icon: Sparkles },
    { id: 'private', label: 'Private 1-on-1', icon: UserCheck },
    { id: 'free_class', label: 'Free Trial', icon: Gift },
  ];

  const filteredPackages = packages.filter(p => {
    if (activeCategory === 'ALL') return true;
    return p.type === activeCategory;
  });

  const handleBookPackage = (pkg: DynamicPackage) => {
    onOpenBooking(pkg.type, pkg.title, {
      id: pkg.id,
      amount: pkg.discountPrice || pkg.price,
      currency: pkg.currency,
      package: pkg
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans pt-28 pb-24">
      {/* Hero Header Section */}
      <section className="relative px-6 md:px-12 max-w-7xl mx-auto text-center space-y-6 mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Dynamic Sanctuary Offerings</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Tailored Offerings for Every Stage of Your Yogic Journey
        </h1>

        <p className="text-base md:text-lg text-neutral-300 font-light max-w-2xl mx-auto leading-relaxed">
          From internationally accredited teacher trainings and immersive retreats to daily studio memberships, specialized workshops, and 1-on-1 private sessions.
        </p>

        {/* Category Filter Pills */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-2 md:gap-3 max-w-5xl mx-auto">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-950/50 scale-105 font-bold'
                    : 'bg-neutral-900/80 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Catalog Grid */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-amber-400" />
            <p className="text-xs text-neutral-400">Loading dynamic sanctuary packages...</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-neutral-900/50 border border-neutral-800 space-y-3">
            <Layers className="w-10 h-10 mx-auto text-neutral-600" />
            <h3 className="text-xl font-serif font-semibold text-white">No Packages Found in this Category</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Please select another category tab or manage packages dynamically from the admin panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map(pkg => {
              if (pkg.type === 'teacher_training') {
                return (
                  <TeacherTrainingCard
                    key={pkg.id}
                    pkg={pkg}
                    onBook={handleBookPackage}
                    onOpenDetails={setSelectedDetailPackage}
                  />
                );
              }
              if (pkg.type === 'workshop') {
                return (
                  <WorkshopCard
                    key={pkg.id}
                    pkg={pkg}
                    onBook={handleBookPackage}
                    onOpenDetails={setSelectedDetailPackage}
                  />
                );
              }
              if (pkg.type === 'event') {
                return (
                  <EventCard
                    key={pkg.id}
                    pkg={pkg}
                    onBook={handleBookPackage}
                    onOpenDetails={setSelectedDetailPackage}
                  />
                );
              }
              if (pkg.type === 'retreat') {
                return (
                  <RetreatCard
                    key={pkg.id}
                    pkg={pkg}
                    onBook={handleBookPackage}
                    onOpenDetails={setSelectedDetailPackage}
                  />
                );
              }
              if (pkg.type === 'regular') {
                return (
                  <RegularPackageCard
                    key={pkg.id}
                    pkg={pkg}
                    onBook={handleBookPackage}
                    onOpenDetails={setSelectedDetailPackage}
                  />
                );
              }
              if (pkg.type === 'private') {
                return (
                  <PrivatePackageCard
                    key={pkg.id}
                    pkg={pkg}
                    onBook={handleBookPackage}
                    onOpenDetails={setSelectedDetailPackage}
                  />
                );
              }
              if (pkg.type === 'free_class') {
                return (
                  <FreeClassCard
                    key={pkg.id}
                    pkg={pkg}
                    onBook={handleBookPackage}
                    onOpenDetails={setSelectedDetailPackage}
                  />
                );
              }

              // Fallback
              return (
                <RegularPackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onBook={handleBookPackage}
                  onOpenDetails={setSelectedDetailPackage}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Detail Modal */}
      <PackageDetailModal
        pkg={selectedDetailPackage}
        onClose={() => setSelectedDetailPackage(null)}
        onBook={handleBookPackage}
      />
    </div>
  );
};
