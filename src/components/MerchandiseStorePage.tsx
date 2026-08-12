import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ShoppingBag, Star, CheckCircle, Eye, X, Search, Filter,
  RotateCcw, SlidersHorizontal, Check, ArrowRight, Sparkles
} from 'lucide-react';
import { MerchandiseItem } from '../types';
import { getMerchandiseItems } from '../services/api';

interface MerchandiseStorePageProps {
  onBackToHome?: () => void;
}

export const MerchandiseStorePage: React.FC<MerchandiseStorePageProps> = ({ onBackToHome }) => {
  const [items, setItems] = useState<MerchandiseItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // E-commerce Sidebar Filter States
  const [selectedAudience, setSelectedAudience] = useState<string>('ALL'); // ALL | Women | Men | Unisex
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>('ALL'); // ALL | under-350 | 350-600 | above-600
  const [sortBy, setSortBy] = useState<string>('recommended'); // recommended | price-low | price-high | rating | discount

  // Quick View Modal & Mobile Filter Drawer
  const [selectedProduct, setSelectedProduct] = useState<MerchandiseItem | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadItems = async () => {
      const data = await getMerchandiseItems();
      setItems(data.filter((i) => i.isActive));
    };
    loadItems();
  }, []);

  useEffect(() => {
    if (selectedProduct || mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProduct, mobileFilterOpen]);

  const categories = [
    { id: 'apparel', label: 'Apparel & Yogic Wear' },
    { id: 'mats', label: 'Mats & Accessories' },
    { id: 'wellness', label: 'Wellness & Oils' },
    { id: 'meditation', label: 'Meditation Essentials' },
    { id: 'props', label: 'Blocks & Props' },
  ];

  const availableBrands = [
    'Pragya Sanctuary',
    'Himalayan Craft',
    'Rishikesh Handloom',
    'Sattva Essentials',
  ];

  const handleCategoryToggle = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const handleBrandToggle = (brandName: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName) ? prev.filter((b) => b !== brandName) : [...prev, brandName]
    );
  };

  const handleResetFilters = () => {
    setSelectedAudience('ALL');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange('ALL');
    setSearchQuery('');
    setSortBy('recommended');
  };

  const activeFiltersCount =
    (selectedAudience !== 'ALL' ? 1 : 0) +
    selectedCategories.length +
    selectedBrands.length +
    (priceRange !== 'ALL' ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const filteredItems = items.filter((item) => {
    // Audience filter
    if (selectedAudience !== 'ALL') {
      const aud = item.audience || 'Unisex';
      if (selectedAudience === 'Women' && aud !== 'Women' && aud !== 'Unisex') return false;
      if (selectedAudience === 'Men' && aud !== 'Men' && aud !== 'Unisex') return false;
      if (selectedAudience === 'Unisex' && aud !== 'Unisex') return false;
    }

    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) {
      return false;
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      const brand = item.brand || 'Pragya Sanctuary';
      if (!selectedBrands.includes(brand)) return false;
    }

    // Price range filter
    if (priceRange === 'under-350' && item.price >= 350) return false;
    if (priceRange === '350-600' && (item.price < 350 || item.price > 600)) return false;
    if (priceRange === 'above-600' && item.price <= 600) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchSub = item.subtitle?.toLowerCase().includes(q);
      const matchBrand = item.brand?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchSub && !matchBrand) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 4.8) - (a.rating || 4.8);
    if (sortBy === 'discount') {
      const discA = a.discountPrice ? ((a.discountPrice - a.price) / a.discountPrice) : 0;
      const discB = b.discountPrice ? ((b.discountPrice - b.price) / b.discountPrice) : 0;
      return discB - discA;
    }
    return 0;
  });

  const handleWhatsAppOrder = (item: MerchandiseItem) => {
    const text = encodeURIComponent(
      `Hello Pragya Yog Team! I am interested in purchasing:\n\n*Product:* ${item.title}\n*Brand:* ${item.brand || 'Pragya Sanctuary'}\n*Price:* ${item.currency || 'HK$'} ${item.price}\n\nPlease share delivery options and availability.`
    );
    window.open(`https://wa.me/85290001000?text=${text}`, '_blank');
  };

  // Category counts helper
  const getCategoryCount = (catId: string) => {
    return items.filter((i) => i.category === catId).length;
  };

  // Brand counts helper
  const getBrandCount = (brandName: string) => {
    return items.filter((i) => (i.brand || 'Pragya Sanctuary') === brandName).length;
  };

  // Shared Sidebar Filters Content component
  const SidebarFiltersContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. AUDIENCE / GENDER */}
      <div>
        <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1C1917', marginBottom: '14px' }}>
          Audience
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'ALL', label: 'All Items' },
            { id: 'Unisex', label: 'Unisex Practice Essentials' },
            { id: 'Women', label: 'Women' },
            { id: 'Men', label: 'Men' },
          ].map((aud) => (
            <label
              key={aud.id}
              onClick={() => setSelectedAudience(aud.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                color: selectedAudience === aud.id ? '#944426' : '#44403C',
                fontWeight: selectedAudience === aud.id ? 700 : 500,
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <input
                type="radio"
                name="audienceFilter"
                checked={selectedAudience === aud.id}
                onChange={() => {}}
                style={{ accentColor: '#944426', cursor: 'pointer', width: '15px', height: '15px' }}
              />
              <span>{aud.label}</span>
            </label>
          ))}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #E7E5E4', margin: 0 }} />

      {/* 2. CATEGORIES */}
      <div>
        <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1C1917', marginBottom: '14px' }}>
          Categories
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {categories.map((cat) => {
            const isSelected = selectedCategories.includes(cat.id);
            const count = getCategoryCount(cat.id);
            return (
              <label
                key={cat.id}
                onClick={() => handleCategoryToggle(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  color: isSelected ? '#1C1917' : '#57534E',
                  fontWeight: isSelected ? 700 : 400,
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    style={{ accentColor: '#944426', cursor: 'pointer', width: '15px', height: '15px' }}
                  />
                  <span>{cat.label}</span>
                </div>
                <span style={{ fontSize: '11px', color: '#A8A29E', fontWeight: 600 }}>
                  ({count})
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #E7E5E4', margin: 0 }} />

      {/* 3. BRAND / COLLECTION */}
      <div>
        <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1C1917', marginBottom: '14px' }}>
          Collection & Artisan Brand
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {availableBrands.map((bName) => {
            const isSelected = selectedBrands.includes(bName);
            const count = getBrandCount(bName);
            return (
              <label
                key={bName}
                onClick={() => handleBrandToggle(bName)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  color: isSelected ? '#1C1917' : '#57534E',
                  fontWeight: isSelected ? 700 : 400,
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    style={{ accentColor: '#944426', cursor: 'pointer', width: '15px', height: '15px' }}
                  />
                  <span>{bName}</span>
                </div>
                <span style={{ fontSize: '11px', color: '#A8A29E', fontWeight: 600 }}>
                  ({count})
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #E7E5E4', margin: 0 }} />

      {/* 4. PRICE RANGE */}
      <div>
        <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1C1917', marginBottom: '14px' }}>
          Price Range
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'ALL', label: 'All Prices' },
            { id: 'under-350', label: 'Under HK$ 350' },
            { id: '350-600', label: 'HK$ 350 - HK$ 600' },
            { id: 'above-600', label: 'HK$ 600+' },
          ].map((p) => (
            <label
              key={p.id}
              onClick={() => setPriceRange(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                color: priceRange === p.id ? '#944426' : '#44403C',
                fontWeight: priceRange === p.id ? 700 : 400,
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <input
                type="radio"
                name="priceRangeFilter"
                checked={priceRange === p.id}
                onChange={() => {}}
                style={{ accentColor: '#944426', cursor: 'pointer', width: '15px', height: '15px' }}
              />
              <span>{p.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#FAF7F2', minHeight: '100vh', color: '#1C1917', fontFamily: 'var(--font-sans), sans-serif', paddingBottom: '100px' }}>

      {/* ── 1. TOP HERO SECTION (Image 2 Style) ──────────────────────────────────────── */}
      <section className="shop-hero-section" style={{ backgroundColor: '#FAF7F2', borderBottom: '1px solid #E7E5E4', padding: '48px 24px 40px 24px' }}>
        <div
          className="shop-hero-container"
          style={{
            maxWidth: '1360px',
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
                fontSize: 'clamp(32px, 5.2vw, 60px)',
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
                maxWidth: '540px'
              }}
            >
              Explore our sanctuary products, organic cotton apparel, non-slip jute mats, and authentic handcrafted essentials for your daily practice.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. CATALOG HEADER & BREADCRUMB ROW ────────────────────────────────────── */}
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '24px 24px 0 24px' }}>

        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#78716C', marginBottom: '12px' }}>
          <span
            onClick={onBackToHome}
            style={{ cursor: 'pointer', transition: 'color 0.2s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#1C1917')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#78716C')}
          >
            Home
          </span>
          <span>/</span>
          <span style={{ color: '#1C1917', fontWeight: 600 }}>Merchandise & Yogic Wear</span>
        </div>

        {/* Title & Total Count Header */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1C1917', margin: 0 }}>
            Merchandise & Yogic Wear
          </h2>
          <span style={{ fontSize: '14px', color: '#78716C', fontWeight: 500 }}>
            - {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* ── 3. TOP QUICK CONTROLS BAR (Image 1 Style) ────────────────────────────── */}
        <div
          className="shop-top-controls-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
            padding: '16px 20px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E7E5E4',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            marginBottom: '28px'
          }}
        >
          {/* Left: FILTERS Header & Mobile Trigger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="desktop-filters-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.06em', color: '#1C1917', textTransform: 'uppercase' }}>
                FILTERS
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#F5F5F4',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#944426',
                    cursor: 'pointer'
                  }}
                  title="Clear all active filters"
                >
                  <RotateCcw size={11} /> Clear All ({activeFiltersCount})
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              className="mobile-filter-trigger"
              onClick={() => setMobileFilterOpen(true)}
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: '#1C1917',
                color: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <SlidersHorizontal size={14} /> Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
            </button>

            {/* Quick Search Input */}
            <div className="shop-top-search" style={{ position: 'relative', width: '240px' }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#A8A29E',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 30px 7px 34px',
                  borderRadius: '999px',
                  border: '1px solid #D6D3D1',
                  backgroundColor: '#FAF7F2',
                  fontSize: '12.5px',
                  color: '#1C1917',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#A8A29E', display: 'flex', alignItems: 'center' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Right: Sort By Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12.5px', color: '#78716C', fontWeight: 500 }}>
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '7px 14px',
                borderRadius: '10px',
                border: '1px solid #D6D3D1',
                backgroundColor: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#1C1917',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 4. MAIN LAYOUT: LEFT SIDEBAR + PRODUCT GRID (Image 1 Style) ──────────── */}
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '32px',
          alignItems: 'start'
        }}
        className="shop-main-layout"
      >
        {/* DESKTOP LEFT FILTER SIDEBAR */}
        <aside
          className="shop-desktop-sidebar"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E7E5E4',
            padding: '24px',
            position: 'sticky',
            top: '100px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1C1917', margin: 0 }}>
              FILTERS
            </h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                style={{ background: 'none', border: 'none', color: '#944426', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
              >
                Clear All
              </button>
            )}
          </div>

          <SidebarFiltersContent />
        </aside>

        {/* PRODUCT CARDS CATALOG GRID */}
        <main>
          {filteredItems.length === 0 ? (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                border: '1px dashed #D6D3D1',
                padding: '60px 20px',
                textAlign: 'center',
                color: '#78716C'
              }}
            >
              <p style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0', color: '#1C1917' }}>
                No merchandise items match your criteria.
              </p>
              <p style={{ fontSize: '13px', margin: '0 0 20px 0' }}>
                Try adjusting your search query or clearing active category and audience filters.
              </p>
              <button
                onClick={handleResetFilters}
                style={{
                  padding: '10px 20px',
                  borderRadius: '999px',
                  backgroundColor: '#1C1917',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className="shop-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '24px'
              }}
            >
              {filteredItems.map((item) => {
                const brandName = item.brand || 'Pragya Sanctuary';
                const ratingVal = item.rating || 4.8;
                const ratingCountVal = item.ratingCount || 120;
                const originalPrice = item.discountPrice || Math.round(item.price * 1.18);
                const discountPercent = Math.round(((originalPrice - item.price) / originalPrice) * 100);

                return (
                  <div
                    key={item.id}
                    className="shop-product-card"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '18px',
                      border: '1px solid #E7E5E4',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <div>
                      {/* Product Image Wrapper with Badges & Rating Overlay */}
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          aspectRatio: '1 / 1',
                          backgroundColor: '#FAF7F2',
                          overflow: 'hidden'
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.4s ease'
                          }}
                          className="product-card-image"
                        />

                        {/* Top Badge Overlay */}
                        {item.badge && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              backgroundColor: item.badgeColor === 'emerald' ? '#065F46' : '#944426',
                              color: '#FFFFFF',
                              padding: '4px 9px',
                              borderRadius: '6px',
                              fontSize: '9.5px',
                              fontWeight: 800,
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}
                          >
                            {item.badge}
                          </div>
                        )}

                        {/* Bottom-Left Rating Pill Overlay (Image 1 Style) */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '10px',
                            left: '10px',
                            backgroundColor: 'rgba(255, 255, 255, 0.92)',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(231, 229, 228, 0.8)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#1C1917'
                          }}
                        >
                          <span>{ratingVal.toFixed(1)}</span>
                          <Star size={11} fill="#D97706" color="#D97706" />
                          <span style={{ color: '#78716C', fontWeight: 500 }}>|</span>
                          <span style={{ color: '#78716C', fontSize: '10.5px' }}>{ratingCountVal > 1000 ? `${(ratingCountVal/1000).toFixed(1)}k` : ratingCountVal}</span>
                        </div>
                      </div>

                      {/* Card Information Section */}
                      <div style={{ padding: '16px 16px 12px 16px' }}>
                        {/* Bold Brand / Collection Name (Image 1 Style) */}
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: 800,
                            color: '#1C1917',
                            letterSpacing: '0.02em',
                            marginBottom: '3px',
                            textTransform: 'uppercase'
                          }}
                        >
                          {brandName}
                        </div>

                        {/* Product Title / Subtitle */}
                        <h3
                          style={{
                            fontSize: '13.5px',
                            fontWeight: 500,
                            color: '#57534E',
                            margin: '0 0 10px 0',
                            lineHeight: 1.35,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: '36px'
                          }}
                          title={item.title}
                        >
                          {item.title}
                        </h3>

                        {/* Price Block: Current Price + Strikethrough + Discount Tag */}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: '#1C1917' }}>
                            {item.currency || 'HK$'} {item.price.toLocaleString()}
                          </span>

                          {originalPrice > item.price && (
                            <>
                              <span style={{ fontSize: '11.5px', color: '#A8A29E', textDecoration: 'line-through' }}>
                                {item.currency || 'HK$'} {originalPrice.toLocaleString()}
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 800, color: '#D97706' }}>
                                ({discountPercent}% OFF)
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dual Action Buttons Bar */}
                    <div
                      style={{
                        padding: '12px 16px',
                        borderTop: '1px solid #F5F5F4',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      <button
                        onClick={() => setSelectedProduct(item)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1px solid #D6D3D1',
                          backgroundColor: '#FFFFFF',
                          color: '#292524',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Eye size={13} color="#944426" /> Details
                      </button>

                      <button
                        onClick={() => handleWhatsAppOrder(item)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: '#1C1917',
                          color: '#FFFFFF',
                          fontSize: '11.5px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <ShoppingBag size={13} /> Order
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ── 5. MOBILE OFF-CANVAS FILTER DRAWER ─────────────────────────────────── */}
      {mobileFilterOpen && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              width: '100%',
              maxWidth: '340px',
              height: '100%',
              overflowY: 'auto',
              padding: '24px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.2)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #E7E5E4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={18} color="#944426" />
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1C1917', margin: 0 }}>
                    Filters & Refinements
                  </h3>
                </div>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} color="#1C1917" />
                </button>
              </div>

              <SidebarFiltersContent />
            </div>

            <div style={{ paddingTop: '24px', marginTop: '24px', borderTop: '1px solid #E7E5E4', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={handleResetFilters}
                style={{ padding: '12px', borderRadius: '10px', border: '1px solid #D6D3D1', backgroundColor: '#FFFFFF', color: '#1C1917', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                style={{ padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#1C1917', color: '#FFFFFF', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── 6. QUICK VIEW PRODUCT DETAIL MODAL ──────────────────────────────────── */}
      {selectedProduct && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                backgroundColor: '#F5F5F4',
                border: '1px solid #E7E5E4',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={18} color="#44403C" />
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', alignItems: 'flex-start' }}>
              <div style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: '#FAF7F2', border: '1px solid #E7E5E4', position: 'relative' }}>
                <img src={selectedProduct.image} alt={selectedProduct.title} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: '12px', left: '12px', backgroundColor: 'rgba(255,255,255,0.92)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{selectedProduct.rating || 4.8}</span>
                  <Star size={12} fill="#D97706" color="#D97706" />
                  <span style={{ color: '#78716C' }}>({selectedProduct.ratingCount || 120} reviews)</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#944426', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                  {selectedProduct.brand || 'Pragya Sanctuary'} • {selectedProduct.category.toUpperCase()}
                </span>

                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1C1917', margin: '0 0 10px 0', lineHeight: 1.25 }}>
                  {selectedProduct.title}
                </h2>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: '#1C1917' }}>
                    {selectedProduct.currency || 'HK$'} {selectedProduct.price.toLocaleString()}
                  </span>
                  {selectedProduct.discountPrice && (
                    <span style={{ fontSize: '14px', color: '#A8A29E', textDecoration: 'line-through' }}>
                      {selectedProduct.currency || 'HK$'} {selectedProduct.discountPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '13.5px', color: '#57534E', lineHeight: 1.6, marginBottom: '20px' }}>
                  {selectedProduct.description}
                </p>

                {selectedProduct.specs && selectedProduct.specs.length > 0 && (
                  <div style={{ marginBottom: '24px', backgroundColor: '#FAF7F2', padding: '14px', borderRadius: '12px', border: '1px solid #E7E5E4' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', color: '#944426', display: 'block', marginBottom: '8px' }}>
                      PRODUCT SPECIFICATIONS
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedProduct.specs.map((spec, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#44403C' }}>
                          <CheckCircle size={14} color="#059669" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    handleWhatsAppOrder(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#1C1917',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                  }}
                >
                  <ShoppingBag size={16} /> Order via WhatsApp / Inquiry
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── 7. RESPONSIVE CSS STYLES ───────────────────────────────────────────── */}
      <style>{`
        .shop-product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(28,25,23,0.08) !important;
          border-color: #D6D3D1 !important;
        }
        .shop-product-card:hover .product-card-image {
          transform: scale(1.05);
        }

        @media (max-width: 992px) {
          .shop-main-layout {
            grid-template-columns: 1fr !important;
          }
          .shop-desktop-sidebar {
            display: none !important;
          }
          .desktop-filters-header {
            display: none !important;
          }
          .mobile-filter-trigger {
            display: flex !important;
          }
        }

        @media (max-width: 640px) {
          .shop-hero-section {
            padding: 32px 16px 28px 16px !important;
          }
          .shop-top-controls-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .shop-top-search {
            width: 100% !important;
          }
          .shop-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
            gap: 14px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MerchandiseStorePage;
