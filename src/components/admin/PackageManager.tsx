import React, { useState } from 'react';
import { Package, Calendar, Plus, Edit2, Trash2, CheckCircle, XCircle, Star, Layers, Tag, CheckSquare, Square } from 'lucide-react';
import { DynamicPackage, UpcomingEvent, BundleItem } from '../../types';
import { PackageModal } from './PackageModal';
import { EventModal } from './EventModal';

interface PackageManagerProps {
  packages: DynamicPackage[];
  events: UpcomingEvent[];
  bundles: BundleItem[];
  onSavePackage: (pkg: DynamicPackage) => void;
  onDeletePackage: (id: string) => void;
  onSaveEvent: (evt: UpcomingEvent) => void;
  onDeleteEvent: (id: string) => void;
  onSaveBundle: (bundle: BundleItem) => void;
}

export const PackageManager: React.FC<PackageManagerProps> = ({
  packages,
  events,
  bundles,
  onSavePackage,
  onDeletePackage,
  onSaveEvent,
  onDeleteEvent,
  onSaveBundle,
}) => {
  const [subTab, setSubTab] = useState<'packages' | 'bundles' | 'events'>('packages');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<DynamicPackage | null>(null);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<UpcomingEvent | null>(null);

  // Bundle Configurator State
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [newBundleTitle, setNewBundleTitle] = useState('');
  const [newBundlePrice, setNewBundlePrice] = useState<number>(0);
  const [newBundleOrigPrice, setNewBundleOrigPrice] = useState<number>(0);

  const filteredPackages = packages.filter((pkg) => {
    if (categoryFilter === 'ALL') return true;
    if (categoryFilter === 'teacher_training' || categoryFilter === 'ttc') {
      return (
        pkg.type === 'teacher_training' ||
        pkg.type === 'ttc' ||
        pkg.id.toLowerCase().includes('ttc') ||
        pkg.title.toLowerCase().includes('ttc') ||
        pkg.title.toLowerCase().includes('teacher') ||
        pkg.subtitle?.toLowerCase().includes('ttc') ||
        pkg.subtitle?.toLowerCase().includes('teacher')
      );
    }
    return pkg.type === categoryFilter;
  });

  const handleOpenAddPackage = () => {
    setSelectedPackage(null);
    setPackageModalOpen(true);
  };

  const handleOpenEditPackage = (pkg: DynamicPackage) => {
    setSelectedPackage(pkg);
    setPackageModalOpen(true);
  };

  const handleOpenAddEvent = () => {
    setSelectedEvent(null);
    setEventModalOpen(true);
  };

  const handleOpenEditEvent = (evt: UpcomingEvent) => {
    setSelectedEvent(evt);
    setEventModalOpen(true);
  };

  // Toggle package selection in Bundle Configurator
  const togglePackageForBundle = (pkg: DynamicPackage) => {
    setSelectedPackageIds((prev) => {
      const isSelected = prev.includes(pkg.id);
      const nextIds = isSelected ? prev.filter((id) => id !== pkg.id) : [...prev, pkg.id];
      
      const selectedPkgs = packages.filter((p) => nextIds.includes(p.id));
      const autoTitle = selectedPkgs.map((p) => p.title).join(' + ');
      const origSum = selectedPkgs.reduce((sum, p) => sum + (p.price || 0), 0);

      setNewBundleTitle(autoTitle);
      setNewBundleOrigPrice(origSum);
      return nextIds;
    });
  };

  const handleAddBundleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBundleTitle.trim() || newBundlePrice <= 0) return;

    const selectedPkgs = packages.filter((p) => selectedPackageIds.includes(p.id));
    const origTotal = newBundleOrigPrice || selectedPkgs.reduce((sum, p) => sum + (p.price || 0), 0) || newBundlePrice;
    const calcSavings = origTotal > newBundlePrice ? origTotal - newBundlePrice : 0;

    const newBundle: BundleItem = {
      id: `bndl-${Date.now()}`,
      name: newBundleTitle.trim(),
      original_price: origTotal,
      discounted_price: Number(newBundlePrice),
      final_price: Number(newBundlePrice),
      bundle_discount: calcSavings,
      savings: calcSavings,
      packages: selectedPkgs.map((p) => ({
        id: Number(p.id) || Date.now(),
        packageID: p.id,
        title: p.title,
        price: p.price,
        amount: p.price,
        payment_type: 1,
        category: p.type,
      }) as any),
    };

    onSaveBundle(newBundle);
    setSelectedPackageIds([]);
    setNewBundleTitle('');
    setNewBundlePrice(0);
    setNewBundleOrigPrice(0);
  };

  const selectedPkgsCount = selectedPackageIds.length;
  const currentOrigTotal = newBundleOrigPrice;
  const currentSavings = currentOrigTotal > newBundlePrice && newBundlePrice > 0 ? currentOrigTotal - newBundlePrice : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Tab Switcher & Action Bar */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '20px 28px', borderRadius: '16px', border: '1px solid #E7E5E4', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setSubTab('packages')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: subTab === 'packages' ? 'none' : '1px solid #E7E5E4',
              backgroundColor: subTab === 'packages' ? '#B45309' : '#F5F5F4',
              color: subTab === 'packages' ? '#FFFFFF' : '#44403C',
            }}
          >
            <Package className="w-4 h-4" /> Dynamic Packages ({packages.length})
          </button>

          <button
            onClick={() => setSubTab('bundles')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: subTab === 'bundles' ? 'none' : '1px solid #E7E5E4',
              backgroundColor: subTab === 'bundles' ? '#B45309' : '#F5F5F4',
              color: subTab === 'bundles' ? '#FFFFFF' : '#44403C',
            }}
          >
            <Layers className="w-4 h-4" /> Bundles & Cross-sells ({bundles.length})
          </button>

          <button
            onClick={() => setSubTab('events')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: subTab === 'events' ? 'none' : '1px solid #E7E5E4',
              backgroundColor: subTab === 'events' ? '#B45309' : '#F5F5F4',
              color: subTab === 'events' ? '#FFFFFF' : '#44403C',
            }}
          >
            <Calendar className="w-4 h-4" /> Event Spotlight ({events.length})
          </button>
        </div>

        {subTab === 'packages' && (
          <button
            onClick={handleOpenAddPackage}
            style={{
              padding: '12px 24px',
              backgroundColor: '#B45309',
              color: '#FFFFFF',
              fontWeight: 800,
              borderRadius: '12px',
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 3px 10px rgba(180,83,9,0.3)',
            }}
          >
            <Plus className="w-4 h-4" /> Add Package
          </button>
        )}

        {subTab === 'events' && (
          <button
            onClick={handleOpenAddEvent}
            style={{
              padding: '12px 24px',
              backgroundColor: '#B45309',
              color: '#FFFFFF',
              fontWeight: 800,
              borderRadius: '12px',
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 3px 10px rgba(180,83,9,0.3)',
            }}
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: DYNAMIC PACKAGES MANAGER */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === 'packages' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '4px 0 12px 0' }}>
            {['ALL', 'regular', 'teacher_training', 'retreat', 'workshop', 'private', 'free_class'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '999px',
                  textTransform: 'capitalize',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: categoryFilter === cat ? 'none' : '1px solid #E7E5E4',
                  backgroundColor: categoryFilter === cat ? '#B45309' : '#FFFFFF',
                  color: categoryFilter === cat ? '#FFFFFF' : '#57534E',
                  boxShadow: categoryFilter === cat ? '0 2px 8px rgba(180,83,9,0.2)' : 'none',
                }}
              >
                {cat === 'ALL' ? 'All Packages' : (cat === 'teacher_training' ? 'TTC' : cat.replace('_', ' '))}
              </button>
            ))}
          </div>

          {/* Package Grid with Generous Outer Gaps & Padding */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E7E5E4',
                  borderRadius: '20px',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '24px',
                  minHeight: '340px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: '999px', backgroundColor: '#FEF3C7', color: '#78350F', border: '1px solid #FDE68A' }}>
                      {pkg.type === 'teacher_training' || pkg.type === 'ttc' ? 'TTC' : pkg.type.replace('_', ' ')}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {pkg.isFeatured && (
                        <span style={{ fontSize: '12px', color: '#D97706', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }} title="Featured on Homepage">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> Featured
                        </span>
                      )}
                      <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', backgroundColor: pkg.isActive ? '#ECFDF5' : '#FEF2F2', color: pkg.isActive ? '#065F46' : '#991B1B', border: pkg.isActive ? '1px solid #A7F3D0' : '1px solid #FECDD3' }}>
                        {pkg.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontWeight: 800, color: '#1C1917', fontSize: '19px', lineHeight: '1.4', margin: '6px 0 4px 0' }}>{pkg.title}</h3>
                    {pkg.subtitle && (
                      <p style={{ color: '#78716C', fontSize: '13px', margin: '4px 0 0 0', lineHeight: '1.5' }}>{pkg.subtitle}</p>
                    )}
                  </div>

                  <div style={{ margin: '8px 0', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    <span style={{ fontSize: '28px', fontWeight: 900, color: '#1C1917', letterSpacing: '-0.02em' }}>
                      {pkg.currency || 'HKD'} ${pkg.price}
                    </span>
                    {pkg.discountPrice && (
                      <span style={{ fontSize: '13px', color: '#A8A29E', textDecoration: 'line-through', fontWeight: 600 }}>
                        ${pkg.discountPrice}
                      </span>
                    )}
                  </div>

                  {pkg.features && pkg.features.length > 0 && (
                    <ul style={{ margin: '4px 0 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {pkg.features.slice(0, 3).map((f, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#44403C', lineHeight: '1.5' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#B45309', marginTop: '7px', flexShrink: 0 }} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Footer Controls with Padding & Margin */}
                <div style={{ paddingTop: '16px', marginTop: '12px', borderTop: '1px solid #F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button
                    onClick={() => onSavePackage({ ...pkg, isActive: !pkg.isActive })}
                    style={{ fontSize: '12px', color: '#57534E', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {pkg.isActive ? <XCircle className="w-4 h-4 text-rose-500" /> : <CheckCircle className="w-4 h-4 text-emerald-600" />}
                    {pkg.isActive ? 'Deactivate' : 'Activate'}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenEditPackage(pkg)}
                      style={{ padding: '8px 12px', backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: '10px', border: '1px solid #FDE68A', cursor: 'pointer' }}
                      title="Edit Package"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeletePackage(pkg.id)}
                      style={{ padding: '8px 12px', backgroundColor: '#FEF2F2', color: '#991B1B', borderRadius: '10px', border: '1px solid #FECDD3', cursor: 'pointer' }}
                      title="Delete Package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: INTERACTIVE BUNDLE CONFIGURATOR */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === 'bundles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Bundle Creator Card */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', padding: '28px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1917', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag className="w-5 h-5 text-amber-700" /> Create Custom Cross-Sell Bundle
              </h3>
              <p style={{ fontSize: '13px', color: '#78716C', margin: '4px 0 0 0' }}>
                Select 2 or more store packages below to bundle them together with a discounted price.
              </p>
            </div>

            {/* Step 1: Package Selector Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#44403C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Step 1: Choose Packages to Include ({selectedPkgsCount} Selected)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                {packages.map((pkg) => {
                  const isSelected = selectedPackageIds.includes(pkg.id);
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => togglePackageForBundle(pkg)}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: isSelected ? '2px solid #B45309' : '1px solid #E7E5E4',
                        backgroundColor: isSelected ? '#FEF3C7' : '#FAF7F2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-amber-700 shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-stone-400 shrink-0" />
                        )}
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '13px', color: '#1C1917' }}>{pkg.title}</div>
                          <div style={{ fontSize: '11px', color: '#78716C', textTransform: 'uppercase', fontWeight: 700, marginTop: '2px' }}>
                            {pkg.type === 'teacher_training' || pkg.type === 'ttc' ? 'TTC' : pkg.type}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontWeight: 900, fontSize: '14px', color: '#1C1917' }}>
                        ${pkg.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Bundle Title & Price Configuration */}
            <form onSubmit={handleAddBundleSubmit} style={{ borderTop: '1px solid #F5F5F4', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', backgroundColor: '#F5F5F4', padding: '14px 20px', borderRadius: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#57534E' }}>
                  Combined Original Price: <span style={{ color: '#1C1917', fontWeight: 900 }}>HKD ${currentOrigTotal.toLocaleString()}</span>
                </span>
                {currentSavings > 0 && (
                  <span style={{ fontSize: '12px', fontWeight: 800, backgroundColor: '#ECFDF5', color: '#047857', padding: '4px 12px', borderRadius: '999px', border: '1px solid #A7F3D0' }}>
                    🎉 Customer Savings: HKD ${currentSavings.toLocaleString()}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '6px', fontSize: '13px' }}>Bundle Name *</label>
                  <input
                    type="text"
                    required
                    value={newBundleTitle}
                    onChange={(e) => setNewBundleTitle(e.target.value)}
                    placeholder="e.g. 200-Hr TTC + 1 Month Pass"
                    style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '6px', fontSize: '13px' }}>Special Bundle Price (HKD) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newBundlePrice || ''}
                    onChange={(e) => setNewBundlePrice(Number(e.target.value))}
                    placeholder="e.g. 19500"
                    style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={selectedPkgsCount === 0 || !newBundleTitle.trim() || newBundlePrice <= 0}
                style={{
                  padding: '14px 28px',
                  backgroundColor: selectedPkgsCount === 0 || !newBundleTitle.trim() || newBundlePrice <= 0 ? '#E7E5E4' : '#B45309',
                  color: selectedPkgsCount === 0 || !newBundleTitle.trim() || newBundlePrice <= 0 ? '#A8A29E' : '#FFFFFF',
                  fontWeight: 800,
                  borderRadius: '12px',
                  border: 'none',
                  cursor: selectedPkgsCount === 0 || !newBundleTitle.trim() || newBundlePrice <= 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: selectedPkgsCount === 0 ? 'none' : '0 3px 10px rgba(180,83,9,0.3)',
                }}
              >
                <Plus className="w-4 h-4" /> Create Bundle Offer
              </button>

            </form>

          </div>

          {/* Active Bundles List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {bundles.map((bundle) => (
              <div key={bundle.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', padding: '24px 28px', borderRadius: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                    <h4 style={{ fontWeight: 800, fontSize: '17px', color: '#1C1917', margin: 0, lineHeight: '1.4' }}>{bundle.name}</h4>
                    {bundle.savings && bundle.savings > 0 ? (
                      <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: '#ECFDF5', color: '#047857', padding: '4px 10px', borderRadius: '999px', border: '1px solid #A7F3D0', flexShrink: 0 }}>
                        Save ${bundle.savings}
                      </span>
                    ) : null}
                  </div>

                  {bundle.packages && bundle.packages.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {bundle.packages.map((pkg, i) => (
                        <span key={i} style={{ backgroundColor: '#F5F5F4', color: '#44403C', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, border: '1px solid #E7E5E4' }}>
                          {pkg.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ paddingTop: '14px', borderTop: '1px solid #F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 900, color: '#B45309' }}>
                      ${bundle.final_price || bundle.discounted_price}
                    </span>
                    {bundle.original_price && bundle.original_price > (bundle.final_price || bundle.discounted_price) && (
                      <span style={{ fontSize: '13px', color: '#A8A29E', textDecoration: 'line-through', fontWeight: 600 }}>
                        ${bundle.original_price}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onSaveBundle}
                    style={{ padding: '8px 12px', backgroundColor: '#FEF2F2', color: '#991B1B', borderRadius: '10px', border: '1px solid #FECDD3', cursor: 'pointer' }}
                    title="Delete Bundle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 3: EVENT SPOTLIGHT */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === 'events' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {events.map((evt) => (
            <div key={evt.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', padding: '24px', borderRadius: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ backgroundColor: '#FEF3C7', color: '#78350F', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, border: '1px solid #FDE68A' }}>
                    {evt.category || 'Event'}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#B45309' }}>
                    {evt.price || (evt.amount ? `$${evt.amount}` : 'Free')}
                  </span>
                </div>

                <h3 style={{ fontWeight: 800, color: '#1C1917', fontSize: '17px', margin: '2px 0 0 0', lineHeight: '1.4' }}>
                  {evt.title || evt.name}
                </h3>
              </div>

              <div style={{ paddingTop: '14px', borderTop: '1px solid #F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  onClick={() => handleOpenEditEvent(evt)}
                  style={{ padding: '8px 16px', backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: '10px', fontSize: '12px', fontWeight: 800, border: '1px solid #FDE68A', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Details
                </button>

                <button
                  onClick={() => onDeleteEvent(evt.id)}
                  style={{ padding: '8px 12px', backgroundColor: '#FEF2F2', color: '#991B1B', borderRadius: '10px', border: '1px solid #FECDD3', cursor: 'pointer' }}
                  title="Delete Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <PackageModal
        isOpen={packageModalOpen}
        onClose={() => setPackageModalOpen(false)}
        onSave={onSavePackage}
        initialData={selectedPackage}
      />

      <EventModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onSave={onSaveEvent}
        initialData={selectedEvent}
      />

    </div>
  );
};
