import React, { useState } from 'react';
import { Sparkles, ShoppingBag, ArrowRight, CheckSquare, Square, Tag, Info, Plus } from 'lucide-react';
import { BundleItem, PackageItem } from '../types';
import { trackBundleEvent } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface FrequentlyBoughtTogetherProps {
  bundles: BundleItem[];
  packageTitle?: string;
  onSelectBundle: (bundle: BundleItem, selectedPackageIds?: (string | number)[]) => void;
  onAddToCartBundle?: (bundle: BundleItem, selectedItems?: PackageItem[]) => void;
}

// Fallback images for bundle packages based on category or instructor
const getPackageThumbnail = (pkg: PackageItem): string => {
  if ((pkg as any).image) return (pkg as any).image;
  const title = (pkg.title || '').toLowerCase();
  const category = (pkg.category || '').toLowerCase();

  if (title.includes('shoaib') || title.includes('1-1') || title.includes('2-1')) {
    return '/shoaib.webp';
  }
  if (category.includes('workshop') || title.includes('therapy 2.0') || title.includes('realign')) {
    return 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=600&auto=format&fit=crop';
  }
  if (category.includes('private')) {
    return 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop';
};

// Sub-descriptions for bundle items if API description is empty
const getPackageSubDescription = (pkg: PackageItem): string => {
  if (pkg.description && pkg.description.trim().length > 10) return pkg.description;
  const title = (pkg.title || '').toLowerCase();
  if (title.includes('shoaib') && (title.includes('1-1') || title.includes('health consultation'))) {
    return 'A personalised 1-hour session with expert therapist Shoaib, focusing on spinal assessment, manual adjustment, and tailored guidance to relieve pain, correct imbalances, and restore mobility.';
  }
  if (title.includes('shoaib') && title.includes('2-1')) {
    return 'A 1-hour dual therapy session with Master Shoaib for couples or pairs, focusing on joint alignment and chronic pain recovery.';
  }
  if (title.includes('realign') || title.includes('therapy 2.0')) {
    return 'Join our multi-session certification masterclass to learn evidence-based techniques for managing lower back, sciatica, hips & knee health.';
  }
  return 'Personalized guidance and expert practice led by senior Pragya Yog masters.';
};

export const FrequentlyBoughtTogether: React.FC<FrequentlyBoughtTogetherProps> = ({
  bundles,
  packageTitle,
  onSelectBundle,
  onAddToCartBundle,
}) => {
  const { user } = useAuth();

  // Track checked package IDs per bundle ID
  const [selectedMap, setSelectedMap] = useState<Record<string | number, (string | number)[]>>(() => {
    const initialMap: Record<string | number, (string | number)[]> = {};
    if (Array.isArray(bundles)) {
      bundles.forEach((bundle) => {
        if (bundle.packages && Array.isArray(bundle.packages)) {
          initialMap[bundle.id] = bundle.packages.map((pkg) => pkg.id);
        } else {
          initialMap[bundle.id] = [];
        }
      });
    }
    return initialMap;
  });

  if (!bundles || bundles.length === 0) return null;

  const toggleItem = (bundleId: string | number, pkgId: string | number) => {
    setSelectedMap((prev) => {
      const currentSelected = prev[bundleId] || [];
      const isSelected = currentSelected.map(String).includes(String(pkgId));
      let updated: (string | number)[];

      if (isSelected) {
        // Prevent deselecting if only 1 item left
        if (currentSelected.length <= 1) return prev;
        updated = currentSelected.filter((id) => String(id) !== String(pkgId));
      } else {
        updated = [...currentSelected, pkgId];
      }

      return { ...prev, [bundleId]: updated };
    });
  };

  const handleAction = (bundle: BundleItem, action: 'reserve' | 'cart') => {
    trackBundleEvent(bundle.id, 'click', user?.access_token).catch(() => {});

    const allPackages = bundle.packages || [];
    const bundlePkgIds = allPackages.map((p) => p.id);
    const selectedIds = selectedMap[bundle.id] || bundlePkgIds;
    const isAllSelected = selectedIds.length === allPackages.length && allPackages.length > 0;
    const bundleDiscount = Number(bundle.bundle_discount || bundle.discount_value || bundle.savings || 0);

    const selectedPkgs = allPackages
      .filter((p) => selectedIds.map(String).includes(String(p.id)))
      .map((pkg, idx) => {
        const isMainItem = idx === 0;
        const origPrice = Number(pkg.amount) || 0;
        const discountedPrice = (!isMainItem && isAllSelected && bundleDiscount > 0)
          ? Math.max(0, origPrice - bundleDiscount)
          : origPrice;

        return {
          ...pkg,
          amount: discountedPrice,
          original_amount: origPrice,
        };
      });

    if (action === 'cart' && onAddToCartBundle) {
      onAddToCartBundle(bundle, selectedPkgs);
    } else {
      onSelectBundle(bundle, selectedIds);
    }
  };

  return (
    <div
      style={{
        marginTop: '36px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
      }}
    >
      {bundles.map((bundle) => {
        const allPackages = bundle.packages || [];
        const totalCount = allPackages.length;
        const currentSelectedIds = selectedMap[bundle.id] || allPackages.map((p) => p.id);
        const isAllSelected = currentSelectedIds.length === totalCount && totalCount > 0;

        // Bundle Prices
        const bundleDiscount = Number(bundle.bundle_discount || bundle.discount_value || bundle.savings || 0);
        const fullOrigPrice = Number(bundle.original_price || allPackages.reduce((sum, p) => sum + (Number(p.amount) || 0), 0));
        const fullFinalPrice = Number(bundle.final_price || bundle.discounted_price || (fullOrigPrice - bundleDiscount));

        // Dynamic price calculation based on selected packages
        const currentSelectedPkgs = allPackages.filter((p) => currentSelectedIds.map(String).includes(String(p.id)));
        const selectedOrigSum = currentSelectedPkgs.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const selectedFinalPrice = isAllSelected ? fullFinalPrice : selectedOrigSum;

        // Add-on item calculations (items beyond the first main item)
        const mainPkg = allPackages[0];
        const addonPkgs = allPackages.slice(1);
        const selectedAddonPkgs = addonPkgs.filter((p) => currentSelectedIds.map(String).includes(String(p.id)));

        const addonOrigSum = addonPkgs.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const addonFinalSum = isAllSelected
          ? Math.max(0, addonOrigSum - bundleDiscount)
          : selectedAddonPkgs.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        return (
          <div
            key={bundle.id}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '28px 28px',
              border: '1.5px solid #EAE3D9',
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
            }}
          >
            {/* Header Title & Discount Badge */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#944426" />
                  <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: '#944426', textTransform: 'uppercase' }}>
                    BUNDLE & SAVE SPECIAL
                  </span>
                </div>
                {bundleDiscount > 0 && isAllSelected && (
                  <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '11.5px', fontWeight: 800, padding: '4px 12px', borderRadius: '999px' }}>
                    SAVE HK$ {bundleDiscount.toLocaleString()}
                  </span>
                )}
              </div>

              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: '#21201E', margin: '8px 0 4px 0', fontWeight: 700 }}>
                {bundle.name}
              </h4>
              {bundle.description && (
                <p style={{ fontSize: '13.5px', color: '#6A655F', margin: 0 }}>
                  {bundle.description}
                </p>
              )}
            </div>

            {/* Visual Thumbnail Row with "+" Connectors */}
            {allPackages.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px',
                  padding: '16px',
                  backgroundColor: '#FBF8F4',
                  borderRadius: '16px',
                  border: '1px solid #F0E9DF',
                  overflowX: 'auto',
                }}
              >
                {allPackages.map((pkg, idx) => {
                  const isChecked = currentSelectedIds.map(String).includes(String(pkg.id));
                  const imgUrl = getPackageThumbnail(pkg);

                  return (
                    <React.Fragment key={pkg.id || idx}>
                      <div
                        style={{
                          position: 'relative',
                          width: '100px',
                          height: '75px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: isChecked ? '2px solid #944426' : '2px solid transparent',
                          opacity: isChecked ? 1 : 0.45,
                          transition: 'all 0.2s ease',
                          flexShrink: 0,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt={pkg.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.15)' }}></div>
                      </div>

                      {idx < allPackages.length - 1 && (
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#EAE3D9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Plus size={14} color="#5A554F" strokeWidth={2.5} />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* Checklist items section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {allPackages.map((pkg, idx) => {
                const isChecked = currentSelectedIds.map(String).includes(String(pkg.id));
                const isMainItem = idx === 0;
                const origPrice = Number(pkg.amount) || 0;
                
                // For add-on item in bundle, show discounted price if full bundle is active
                const discountedPrice = (!isMainItem && isAllSelected && bundleDiscount > 0)
                  ? Math.max(0, origPrice - bundleDiscount)
                  : origPrice;

                const subDesc = getPackageSubDescription(pkg);

                return (
                  <div
                    key={pkg.id || idx}
                    onClick={() => toggleItem(bundle.id, pkg.id)}
                    style={{
                      padding: '16px 18px',
                      borderRadius: '16px',
                      backgroundColor: isChecked ? '#FAF6F0' : '#FFFFFF',
                      border: isChecked ? '1.5px solid #D9A726' : '1.5px solid #EFEAE4',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                        <div style={{ marginTop: '2px', flexShrink: 0 }}>
                          {isChecked ? (
                            <CheckSquare size={20} color="#944426" />
                          ) : (
                            <Square size={20} color="#A39C93" />
                          )}
                        </div>

                        <div>
                          <span style={{ fontSize: '14.5px', fontWeight: 700, color: isChecked ? '#21201E' : '#7A756F' }}>
                            {isMainItem ? `This item: ${pkg.title}` : `1 × ${pkg.title}`}
                          </span>

                          {subDesc && (
                            <p style={{ fontSize: '12.5px', color: '#6A655F', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                              {subDesc}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Price tag display */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        {discountedPrice < origPrice ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span style={{ fontSize: '12px', color: '#A39C93', textDecoration: 'line-through' }}>
                              HK$ {origPrice.toLocaleString()}
                            </span>
                            <span style={{ fontSize: '15px', fontWeight: 800, color: '#944426' }}>
                              HK$ {discountedPrice.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '15px', fontWeight: 700, color: isChecked ? '#21201E' : '#A39C93' }}>
                            HK$ {origPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price calculation summary */}
            <div
              style={{
                borderTop: '1px solid #EFEAE4',
                paddingTop: '18px',
                marginBottom: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {addonOrigSum > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#6A655F' }}>
                  <span>Additional price:</span>
                  <span>
                    {isAllSelected && bundleDiscount > 0 ? (
                      <>
                        <span style={{ textDecoration: 'line-through', marginRight: '6px', color: '#A39C93' }}>
                          HK$ {addonOrigSum.toLocaleString()}
                        </span>
                        <strong style={{ color: '#944426' }}>HK$ {addonFinalSum.toLocaleString()}</strong>
                      </>
                    ) : (
                      <strong>HK$ {addonFinalSum.toLocaleString()}</strong>
                    )}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', fontWeight: 700, color: '#21201E' }}>
                <span>Total:</span>
                <div style={{ textAlign: 'right' }}>
                  {isAllSelected && fullOrigPrice > selectedFinalPrice && (
                    <span style={{ fontSize: '14px', color: '#A39C93', textDecoration: 'line-through', marginRight: '8px', fontWeight: 500 }}>
                      HK$ {fullOrigPrice.toLocaleString()}
                    </span>
                  )}
                  <span style={{ fontSize: '22px', fontWeight: 800, color: '#944426' }}>
                    HK$ {selectedFinalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button: Single Add Bundle to Cart CTA */}
            <button
              type="button"
              onClick={() => handleAction(bundle, 'cart')}
              style={{
                width: '100%',
                padding: '16px 24px',
                backgroundColor: '#D9A726',
                color: '#21201E',
                fontWeight: 800,
                fontSize: '15px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 18px rgba(217, 167, 38, 0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              <ShoppingBag size={18} />
              <span>Add Bundle to Cart</span>
              <ArrowRight size={17} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default FrequentlyBoughtTogether;
