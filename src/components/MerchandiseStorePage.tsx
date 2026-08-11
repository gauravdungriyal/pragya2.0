import React, { useState, useEffect } from 'react';
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
      
      {/* ── Top Header Section (Matching Events & Workshops Header) ───────────── */}
      <section style={{ backgroundColor: '#FAF7F2', borderBottom: '1px solid #E7E5E4', padding: '60px 32px 50px 32px' }}>
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            alignItems: 'center'
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 'clamp(44px, 6.5vw, 76px)',
                fontWeight: 400,
                color: '#21201E',
                lineHeight: 1.08,
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
                  color: '#21201E'
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
                fontSize: '16px',
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
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '40px 32px 60px 32px'
        }}
      >
        {/* Category Filters Bar + Search Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap',
            marginBottom: '40px',
            paddingBottom: '24px',
            borderBottom: '1px solid #E7E5E4'
          }}
        >
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: selectedCategory === cat.id ? 700 : 500,
                  backgroundColor: selectedCategory === cat.id ? '#1C1917' : '#FFFFFF',
                  color: selectedCategory === cat.id ? '#FFFFFF' : '#44403C',
                  border: selectedCategory === cat.id ? '1px solid #1C1917' : '1px solid #E7E5E4',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedCategory === cat.id ? '0 4px 12px rgba(28,25,23,0.15)' : 'none'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box Input */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search className="w-4 h-4 text-stone-400" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search merchandise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 40px',
                borderRadius: '999px',
                border: '1px solid #D6D3D1',
                backgroundColor: '#FFFFFF',
                fontSize: '13px',
                color: '#1C1917',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Product Cards Grid (Package-Style Layout) */}
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#78716C' }}>
            <p style={{ fontSize: '16px', margin: 0 }}>No merchandise items found matching your criteria.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
            {filteredItems.map((item) => {
              const features = item.highlights && item.highlights.length > 0 ? item.highlights : [
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
                    border: '1px solid #E7E5E4',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  }}
                  className="hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div>
                    {/* Product Cover Image with Category Tag */}
                    <div style={{ position: 'relative', width: '100%', height: '230px', borderRadius: '18px', overflow: 'hidden', backgroundColor: '#FAF7F2', marginBottom: '18px' }}>
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', top: '14px', right: '14px', backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)', padding: '5px 12px', borderRadius: '999px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em', color: '#78350F', border: '1px solid #FDE68A', textTransform: 'uppercase' }}>
                        {item.category || 'Store Item'}
                      </div>
                    </div>

                    {/* Category Label */}
                    <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', color: '#944426', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      {item.subtitle || 'PRAGYA ESSENTIAL'}
                    </span>

                    {/* Title */}
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', margin: '0 0 10px 0', lineHeight: 1.25 }}>
                      {item.title}
                    </h3>

                    {/* Price Pill */}
                    <div style={{ backgroundColor: '#FAF7F2', border: '1px solid #E7E5E4', borderRadius: '12px', padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: '#1C1917' }}>
                        {item.currency || 'HK$'} {item.price.toLocaleString()}
                      </span>
                      {item.originalPrice && (
                        <span style={{ fontSize: '13px', color: '#A8A29E', textDecoration: 'line-through' }}>
                          {item.currency || 'HK$'} {item.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: '13.5px', color: '#57534E', lineHeight: 1.5, margin: '0 0 18px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description}
                    </p>

                    {/* Features List */}
                    <div style={{ borderTop: '1px solid #F5F5F4', paddingTop: '14px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#944426' }}>
                        HIGHLIGHTS & BENEFITS:
                      </span>
                      {features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', color: '#44403C' }}>
                          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" style={{ marginTop: '1px' }} />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dual Action Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '12px', paddingTop: '14px', borderTop: '1px solid #F5F5F4' }}>
                    <button
                      onClick={() => setSelectedProduct(item)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid #D6D3D1',
                        backgroundColor: '#FFFFFF',
                        color: '#292524',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Eye className="w-4 h-4 text-amber-700" /> View Details
                    </button>

                    <button
                      onClick={() => handleWhatsAppOrder(item)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: '#1C1917',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 14px rgba(28,25,23,0.18)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <ShoppingBag className="w-4 h-4" /> Order Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Product Quick View Modal ────────────────────────────────────────── */}
      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px', position: 'relative', boxShadow: '0 20px 45px rgba(0,0,0,0.2)' }}>
            
            <button
              onClick={() => setSelectedProduct(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: '#F5F5F4', border: '1px solid #E7E5E4', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X className="w-5 h-5 text-stone-700" />
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', alignItems: 'flex-start' }}>
              <div style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: '#FAF7F2', border: '1px solid #E7E5E4' }}>
                <img src={selectedProduct.image} alt={selectedProduct.title} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#944426', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {selectedProduct.category || 'Store Offering'}
                </span>

                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1C1917', margin: '4px 0 10px 0' }}>
                  {selectedProduct.title}
                </h2>

                <div style={{ fontSize: '24px', fontWeight: 900, color: '#B45309', marginBottom: '14px' }}>
                  {selectedProduct.currency || 'HK$'} {selectedProduct.price.toLocaleString()}
                </div>

                <p style={{ fontSize: '14px', color: '#57534E', lineHeight: 1.6, marginBottom: '20px' }}>
                  {selectedProduct.description}
                </p>

                <button
                  onClick={() => {
                    handleWhatsAppOrder(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  style={{ width: '100%', padding: '14px', backgroundColor: '#1C1917', color: '#FFFFFF', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <ShoppingBag className="w-5 h-5" /> Order via WhatsApp / Inquiry
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
