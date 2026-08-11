import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingBag, Star, CheckCircle, Shield, ArrowRight, Eye, MessageCircle, X, Search, Filter, Sparkles } from 'lucide-react';
import { MerchandiseItem } from '../types';
import { getMerchandiseItems } from '../services/api';

interface MerchandiseStorePageProps {
  onBackToHome?: () => void;
}

export const MerchandiseStorePage: React.FC<MerchandiseStorePageProps> = () => {
  const [items, setItems] = useState<MerchandiseItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<MerchandiseItem | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      const data = await getMerchandiseItems();
      setItems(data.filter((i) => i.isActive));
    };
    loadItems();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProduct]);

  const categories = [
    { id: 'ALL', label: 'All Products' },
    { id: 'apparel', label: 'Apparel' },
    { id: 'mats', label: 'Mats & Props' },
    { id: 'meditation', label: 'Wellness & Oils' },
    { id: 'bundles', label: 'Special Bundles' },
  ];

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesQuery = !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const handleWhatsAppOrder = (item: MerchandiseItem) => {
    const text = encodeURIComponent(
      `Hello Pragya Yog Team! I am interested in purchasing:\n\n*Product:* ${item.title}\n*Price:* ${item.currency || 'HK$'} ${item.price}\n\nPlease share delivery options and availability.`
    );
    window.open(`https://wa.me/85290001000?text=${text}`, '_blank');
  };

  return (
    <div style={{ backgroundColor: '#FAF7F2', minHeight: '100vh', color: '#1C1917', fontFamily: 'var(--font-sans), sans-serif', paddingBottom: '100px' }}>

      {/* ── Top Header Section ────────────────────────────────────────────── */}
      <section className="shop-header-section" style={{ backgroundColor: '#FAF7F2', borderBottom: '1px solid #E7E5E4', padding: '50px 24px 40px 24px' }}>
        <div
          className="shop-header-container"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            alignItems: 'center'
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', color: '#944426', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              — PRAGYA SANCTUARY STORE —
            </span>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 'clamp(32px, 5.5vw, 64px)',
                fontWeight: 400,
                color: '#21201E',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                margin: 0
              }}
            >
              Merchandise &{' '}
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: '#944426'
                }}
              >
                Yogic Wear
              </span>
            </h1>
          </div>

          <div>
            <p
              style={{
                fontFamily: "'Neue Montreal', -apple-system, sans-serif",
                fontSize: 'clamp(14px, 1.8vw, 16px)',
                color: '#6B655F',
                lineHeight: 1.6,
                margin: 0,
                maxWidth: '520px'
              }}
            >
              Explore our sanctuary products, organic cotton apparel, non-slip jute mats, and authentic handcrafted essentials for your daily practice.
            </p>
          </div>
        </div>
      </section>

      {/* ── Main Catalog Grid & Control Bar ────────────────────────────────────────── */}
      <section
        className="shop-catalog-section"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '32px 24px 60px 24px'
        }}
      >
        {/* Category Filters Bar + Search Box */}
        <div
          className="shop-controls-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '32px',
            paddingBottom: '20px',
            borderBottom: '1px solid #E7E5E4'
          }}
        >
          {/* Category Filter Pills (Scrollable track on mobile) */}
          <div
            className="shop-categories-track"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '6px',
              paddingRight: '20px',
              maxWidth: '100%',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '999px',
                  fontSize: '12.5px',
                  fontWeight: selectedCategory === cat.id ? 700 : 600,
                  backgroundColor: selectedCategory === cat.id ? '#1C1917' : '#FFFFFF',
                  color: selectedCategory === cat.id ? '#FFFFFF' : '#44403C',
                  border: selectedCategory === cat.id ? '1.5px solid #1C1917' : '1px solid #E7E5E4',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  boxShadow: selectedCategory === cat.id ? '0 4px 12px rgba(28,25,23,0.15)' : 'none'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box Input */}
          <div className="shop-search-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '320px', flex: '0 1 320px' }}>
            <Search
              size={18}
              className="shop-search-icon"
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#A8A29E',
                pointerEvents: 'none',
                width: '18px',
                height: '18px',
                zIndex: 2
              }}
            />
            <input
              type="text"
              className="shop-search-input"
              placeholder="Search merchandise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 36px 10px 40px',
                borderRadius: '999px',
                border: '1.5px solid #D6D3D1',
                backgroundColor: '#FFFFFF',
                fontSize: '13px',
                color: '#1C1917',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  color: '#A8A29E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Product Cards Grid (Responsive 1/2/3 Column Grid) */}
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#78716C' }}>
            <p style={{ fontSize: '15px', margin: 0 }}>No merchandise items found matching your criteria.</p>
          </div>
        ) : (
          <div
            className="shop-products-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}
          >
            {filteredItems.map((item) => {
              const features = item.specs && item.specs.length > 0 ? item.specs : [
                '100% Sustainable & Authentic Materials',
                'Quality Verified by Master Yogis',
                'Complimentary Eco-packaging Included'
              ];

              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '24px',
                    border: '1.5px solid #E7E5E4',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                  className="shop-product-card"
                >
                  <div>
                    {/* Product Cover Image with Category Tag */}
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 10', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#FAF7F2', marginBottom: '16px' }}>
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(6px)', padding: '4px 10px', borderRadius: '999px', fontSize: '9.5px', fontWeight: 800, letterSpacing: '0.08em', color: '#78350F', border: '1px solid #FDE68A', textTransform: 'uppercase' }}>
                        {item.category || 'Store Item'}
                      </div>
                    </div>

                    {/* Subtitle Label */}
                    <span style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.08em', color: '#944426', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                      {item.subtitle || 'PRAGYA ESSENTIAL'}
                    </span>

                    {/* Title */}
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1C1917', margin: '0 0 8px 0', lineHeight: 1.25 }}>
                      {item.title}
                    </h3>

                    {/* Price Pill */}
                    <div style={{ backgroundColor: '#FAF7F2', border: '1px solid #E7E5E4', borderRadius: '12px', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '17px', fontWeight: 800, color: '#1C1917' }}>
                        {item.currency || 'HK$'} {item.price.toLocaleString()}
                      </span>
                      {item.discountPrice && (
                        <span style={{ fontSize: '12.5px', color: '#A8A29E', textDecoration: 'line-through' }}>
                          {item.currency || 'HK$'} {item.discountPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: '13px', color: '#57534E', lineHeight: 1.5, margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description}
                    </p>

                    {/* Features List */}
                    <div style={{ borderTop: '1px solid #F5F5F4', paddingTop: '12px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#944426' }}>
                        HIGHLIGHTS & BENEFITS:
                      </span>
                      {features.slice(0, 3).map((feat: string, idx: number) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: '#44403C' }}>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" style={{ marginTop: '1px' }} />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Responsive Dual Action Buttons */}
                  <div className="shop-card-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '12px', borderTop: '1px solid #F5F5F4' }}>
                    <button
                      onClick={() => setSelectedProduct(item)}
                      style={{
                        padding: '11px 12px',
                        borderRadius: '12px',
                        border: '1px solid #D6D3D1',
                        backgroundColor: '#FFFFFF',
                        color: '#292524',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-700" /> Details
                    </button>

                    <button
                      onClick={() => handleWhatsAppOrder(item)}
                      style={{
                        padding: '11px 12px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: '#1C1917',
                        color: '#FFFFFF',
                        fontSize: '12.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 14px rgba(28,25,23,0.18)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Order Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Product Quick View Modal (Rendered at Body Portal for viewport centering) ────────────────────────── */}
      {selectedProduct && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>

            <button
              onClick={() => setSelectedProduct(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#F5F5F4', border: '1px solid #E7E5E4', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
            >
              <X className="w-5 h-5 text-stone-700" />
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: '#FAF7F2', border: '1px solid #E7E5E4' }}>
                <img src={selectedProduct.image} alt={selectedProduct.title} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
              </div>

              <div>
                <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#944426', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {selectedProduct.category || 'Store Offering'}
                </span>

                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1C1917', margin: '4px 0 8px 0' }}>
                  {selectedProduct.title}
                </h2>

                <div style={{ fontSize: '22px', fontWeight: 900, color: '#B45309', marginBottom: '12px' }}>
                  {selectedProduct.currency || 'HK$'} {selectedProduct.price.toLocaleString()}
                </div>

                <p style={{ fontSize: '13.5px', color: '#57534E', lineHeight: 1.5, marginBottom: '18px' }}>
                  {selectedProduct.description}
                </p>

                <button
                  onClick={() => {
                    handleWhatsAppOrder(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  style={{ width: '100%', padding: '13px', backgroundColor: '#1C1917', color: '#FFFFFF', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '13.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <ShoppingBag className="w-4 h-4" /> Order via WhatsApp / Inquiry
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ── CSS Responsive Styles ────────────────────────────────────────── */}
      <style>{`
        .shop-categories-track::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .shop-categories-track {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .shop-product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 32px rgba(28,25,23,0.1) !important;
          border-color: #D6D3D1 !important;
        }

        @media (max-width: 768px) {
          .shop-header-section {
            padding: 24px 16px 20px 16px !important;
          }
          .shop-catalog-section {
            padding: 16px 16px 40px 16px !important;
          }
          .shop-controls-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            margin-bottom: 16px !important;
            padding-bottom: 12px !important;
          }
          .shop-categories-track {
            width: 100% !important;
            padding-bottom: 4px !important;
          }
          .shop-search-wrapper {
            max-width: 100% !important;
            width: 100% !important;
            flex: none !important;
            height: auto !important;
          }
          .shop-search-icon {
            display: none !important;
          }
          .shop-search-input {
            padding-left: 16px !important;
          }
          .shop-products-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MerchandiseStorePage;
