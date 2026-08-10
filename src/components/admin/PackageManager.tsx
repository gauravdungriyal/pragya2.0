import React, { useState, useEffect } from 'react';
import { Package, Calendar, Star, Layers, ShoppingBag, ShieldCheck, Tag } from 'lucide-react';
import { DynamicPackage, UpcomingEvent, BundleItem, MerchandiseItem } from '../../types';
import { getMerchandiseItems } from '../../services/api';

interface PackageManagerProps {
  packages: DynamicPackage[];
  events: UpcomingEvent[];
  bundles: BundleItem[];
}

export const PackageManager: React.FC<PackageManagerProps> = ({
  packages,
  events,
  bundles,
}) => {
  const [subTab, setSubTab] = useState<'packages' | 'merchandise' | 'bundles' | 'events'>('packages');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [merchandiseItems, setMerchandiseItems] = useState<MerchandiseItem[]>([]);
  const [isLoadingMerch, setIsLoadingMerch] = useState(false);

  useEffect(() => {
    const fetchMerch = async () => {
      setIsLoadingMerch(true);
      try {
        const data = await getMerchandiseItems();
        if (data) {
          setMerchandiseItems(data);
        }
      } catch (err) {
        console.warn('Failed to load merchandise in Admin View:', err);
      } finally {
        setIsLoadingMerch(false);
      }
    };
    fetchMerch();
  }, []);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Sub-Tab Navigation Bar */}
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
            <Package className="w-4 h-4" /> Live Packages ({packages.length})
          </button>

          <button
            onClick={() => setSubTab('merchandise')}
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
              border: subTab === 'merchandise' ? 'none' : '1px solid #E7E5E4',
              backgroundColor: subTab === 'merchandise' ? '#B45309' : '#F5F5F4',
              color: subTab === 'merchandise' ? '#FFFFFF' : '#44403C',
            }}
          >
            <ShoppingBag className="w-4 h-4" /> Merchandise Store ({merchandiseItems.length})
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
            <Layers className="w-4 h-4" /> Live Bundles ({bundles.length})
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
            <Calendar className="w-4 h-4" /> Scheduled Events ({events.length})
          </button>
        </div>

        <span style={{ fontSize: '12px', color: '#047857', fontWeight: 800, backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '6px 14px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> API Single Source of Truth
        </span>

      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: DYNAMIC PACKAGES CATALOG VIEWER */}
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

          {/* Package Grid (Read-Only) */}
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
                  minHeight: '320px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
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
                        {pkg.isActive ? 'Active API' : 'Hidden'}
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
                      {pkg.features.slice(0, 4).map((f, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#44403C', lineHeight: '1.5' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#B45309', marginTop: '7px', flexShrink: 0 }} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div style={{ paddingTop: '16px', marginTop: '12px', borderTop: '1px solid #F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#78716C' }}>
                  <span>ID: <code style={{ color: '#1C1917', fontWeight: 700 }}>#{pkg.id}</code></span>
                  <span style={{ fontWeight: 700, color: '#B45309' }}>Live Store Offering</span>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: STORE MERCHANDISE CATALOG VIEWER */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === 'merchandise' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {isLoadingMerch ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#78716C', fontWeight: 700 }}>Fetching Store Merchandise from API...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '28px' }}>
              {merchandiseItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E7E5E4',
                    borderRadius: '20px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '20px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: '999px', backgroundColor: '#FEF3C7', color: '#78350F', border: '1px solid #FDE68A' }}>
                        {item.category.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', backgroundColor: item.isActive ? '#ECFDF5' : '#FEF2F2', color: item.isActive ? '#065F46' : '#991B1B', border: item.isActive ? '1px solid #A7F3D0' : '1px solid #FECDD3' }}>
                        {item.isActive ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    <div style={{ height: '140px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#FAF7F2' }}>
                      <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div>
                      <h3 style={{ fontWeight: 800, color: '#1C1917', fontSize: '17px', margin: '4px 0 2px 0', lineHeight: '1.4' }}>{item.title}</h3>
                      {item.subtitle && <p style={{ fontSize: '12px', color: '#78716C', margin: 0 }}>{item.subtitle}</p>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '22px', fontWeight: 900, color: '#B45309' }}>
                        {item.currency || 'HK$'} {item.price}
                      </span>
                      {item.discountPrice && (
                        <span style={{ fontSize: '12px', color: '#A8A29E', textDecoration: 'line-through', fontWeight: 600 }}>
                          ${item.discountPrice}
                        </span>
                      )}
                    </div>

                  </div>

                  <div style={{ paddingTop: '14px', borderTop: '1px solid #F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#78716C' }}>
                    <span>Product Code: <code style={{ color: '#1C1917', fontWeight: 700 }}>#{item.id}</code></span>
                    <span style={{ fontWeight: 700, color: '#047857' }}>Store Catalog</span>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 3: LIVE BUNDLES VIEWER */}
      {/* ───────────────────────────────────────────────────────────── */}
      {subTab === 'bundles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#78716C', backgroundColor: '#FAF7F2', padding: '4px 10px', borderRadius: '8px', border: '1px solid #E7E5E4' }}>
                    Live Bundle API
                  </span>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 4: SCHEDULED EVENTS SPOTLIGHT */}
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
                  <span style={{ fontSize: '14px', fontWeight: 900, color: '#B45309' }}>
                    {evt.price || (evt.amount ? `$${evt.amount}` : 'Free')}
                  </span>
                </div>

                <h3 style={{ fontWeight: 800, color: '#1C1917', fontSize: '17px', margin: '2px 0 0 0', lineHeight: '1.4' }}>
                  {evt.title || evt.name}
                </h3>
                {evt.description && (
                  <p style={{ fontSize: '13px', color: '#78716C', margin: 0, lineHeight: '1.5' }}>{evt.description}</p>
                )}
              </div>

              <div style={{ paddingTop: '14px', borderTop: '1px solid #F5F5F4', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#44403C' }}>
                {evt.date && <div>📅 Date: <strong>{evt.date}</strong> {evt.time ? `(${evt.time})` : ''}</div>}
                {evt.location && <div>📍 Location: <strong>{evt.location}</strong></div>}
                {evt.instructor_name && <div>🧘 Instructor: <strong>{evt.instructor_name}</strong></div>}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
