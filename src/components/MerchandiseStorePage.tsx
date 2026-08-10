import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, CheckCircle, Shield, ArrowRight, Eye, MessageCircle, X, ChevronLeft, ChevronRight, Truck, RefreshCw, Sparkles, Award } from 'lucide-react';
import { MerchandiseItem, MerchandiseCategory } from '../types';
import { getMerchandiseItems } from '../services/api';

interface MerchandiseStorePageProps {
  onBackToHome?: () => void;
}

const HERO_SLIDES = [
  {
    id: 'mats',
    headline: 'YOGA MATS & GEAR',
    subtitle: 'Natural Tree Rubber & Laser-Alignment Jute Mats',
    categoryFilter: 'mats',
    leftImage: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=900&q=80',
    rightProduct1: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=500&q=80',
    rightProduct2: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=500&q=80',
    tagLeft: 'PRO 5MM CUSHION',
    tagRight: 'NON-SLIP JUTE',
  },
  {
    id: 'meditation',
    headline: 'SOUND & MEDITATION',
    subtitle: 'Himalayan 7-Metal Singing Bowls & Zafu Cushions',
    categoryFilter: 'meditation',
    leftImage: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=900&q=80',
    rightProduct1: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=500&q=80',
    rightProduct2: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=500&q=80',
    tagLeft: 'ACOUSTIC GRADE',
    tagRight: '108 JAPA MALA',
  },
  {
    id: 'apparel',
    headline: 'ORGANIC YOGIC WEAR',
    subtitle: 'Unbleached Cotton Kurtas, Wraps & Activewear',
    categoryFilter: 'apparel',
    leftImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80',
    rightProduct1: 'https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?auto=format&fit=crop&w=500&q=80',
    rightProduct2: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=500&q=80',
    tagLeft: '100% GOTS COTTON',
    tagRight: 'RISHIKESH CRAFTED',
  }
];

export const MerchandiseStorePage: React.FC<MerchandiseStorePageProps> = ({ onBackToHome }) => {
  const [items, setItems] = useState<MerchandiseItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<MerchandiseItem | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const loadItems = async () => {
      const data = await getMerchandiseItems();
      setItems(data.filter(i => i.isActive));
    };
    loadItems();
  }, []);

  // Auto carousel slide rotation every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const currentSlide = HERO_SLIDES[currentSlideIndex];

  const filteredItems = items.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  const handleWhatsAppOrder = (item: MerchandiseItem) => {
    const text = encodeURIComponent(
      `Hello Pragya Yog Team! I am interested in purchasing:\n\n*Product:* ${item.title}\n*Price:* ${item.currency || 'HK$'} ${item.price}\n\nPlease share delivery options and availability.`
    );
    window.open(`https://wa.me/85290001000?text=${text}`, '_blank');
  };

  const handleExploreSlide = (catFilter: string) => {
    setSelectedCategory(catFilter);
    const catalogElem = document.getElementById('store-catalog');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#1C1917', fontFamily: 'sans-serif' }}>
      
      {/* ───────────────────────────────────────────────────────────── */}
      {/* HIGH-IMPACT E-COMMERCE HERO CAROUSEL */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#FFFFFF', position: 'relative', overflow: 'hidden', borderBottom: '1px solid #E7E5E4' }}>
        
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '40px 24px 20px 24px', position: 'relative' }}>
          
          {/* Main Slide Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) auto minmax(280px, 1fr)', alignItems: 'center', gap: '24px', minHeight: '440px' }}>
            
            {/* Left Model Showcase Image */}
            <div style={{ position: 'relative', height: '380px', borderRadius: '24px', overflow: 'hidden', backgroundColor: '#FAF7F2', border: '1px solid #E7E5E4' }}>
              <img
                src={currentSlide.leftImage}
                alt={currentSlide.headline}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.6s ease' }}
              />
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(6px)', padding: '6px 16px', borderRadius: '999px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.08em', color: '#1C1917', border: '1px solid #E7E5E4' }}>
                {currentSlide.tagLeft}
              </div>
            </div>

            {/* Center High-Impact Title & Call-to-Action Button */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '0 20px', minWidth: '320px' }}>
              
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#FEF3C7', color: '#78350F', border: '1px solid #FDE68A', padding: '5px 16px', borderRadius: '999px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Pragya Yog Collection
              </div>

              <h1 style={{ fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 900, color: '#1C1917', margin: 0, lineHeight: 1, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
                {currentSlide.headline}
              </h1>

              <p style={{ fontSize: '15px', color: '#78716C', margin: 0, fontWeight: 600, maxWidth: '420px', lineHeight: 1.5 }}>
                {currentSlide.subtitle}
              </p>

              {/* TAP TO EXPLORE Button */}
              <button
                onClick={() => handleExploreSlide(currentSlide.categoryFilter)}
                style={{
                  marginTop: '8px',
                  padding: '14px 32px',
                  backgroundColor: '#FFFFFF',
                  color: '#1C1917',
                  border: '2px solid #1C1917',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                }}
              >
                TAP TO EXPLORE
              </button>

            </div>

            {/* Right Product Showcase Cuts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: '20px', overflow: 'hidden', backgroundColor: '#FAF7F2', border: '1px solid #E7E5E4' }}>
                <img
                  src={currentSlide.rightProduct1}
                  alt="Product Showcase 1"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.6s ease' }}
                />
              </div>

              <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: '20px', overflow: 'hidden', backgroundColor: '#FAF7F2', border: '1px solid #E7E5E4' }}>
                <img
                  src={currentSlide.rightProduct2}
                  alt="Product Showcase 2"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.6s ease' }}
                />
                <div style={{ position: 'absolute', bottom: '12px', right: '12px', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(6px)', padding: '4px 12px', borderRadius: '999px', fontSize: '10px', fontWeight: 900, letterSpacing: '0.08em', color: '#1C1917', border: '1px solid #E7E5E4' }}>
                  {currentSlide.tagRight}
                </div>
              </div>
            </div>

          </div>

          {/* Left / Right Carousel Controls */}
          <button
            onClick={handlePrevSlide}
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', color: '#1C1917' }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNextSlide}
            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', color: '#1C1917' }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Carousel Dot Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                style={{
                  width: currentSlideIndex === idx ? '28px' : '8px',
                  height: '8px',
                  borderRadius: '999px',
                  backgroundColor: currentSlideIndex === idx ? '#B45309' : '#D6D3D1',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* VALUE PROPOSITION RIBBON (Exact 3-Column Banner like reference) */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div style={{ backgroundColor: '#EFF6FF', borderTop: '1px solid #DBEAFE', borderBottom: '1px solid #DBEAFE', padding: '16px 24px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8' }}>
                <Award className="w-5 h-5" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E3A8A' }}>100% Sustainable & Authentic</div>
                <div style={{ fontSize: '11px', color: '#3B82F6', fontWeight: 600 }}>Himalayan Handcrafted Essentials</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8' }}>
                <RefreshCw className="w-5 h-5" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E3A8A' }}>30 Days Easy Exchange</div>
                <div style={{ fontSize: '11px', color: '#3B82F6', fontWeight: 600 }}>Quality Verified by Master Yogis</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8' }}>
                <Truck className="w-5 h-5" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E3A8A' }}>Free & Fast Delivery</div>
                <div style={{ fontSize: '11px', color: '#3B82F6', fontWeight: 600 }}>Express Studio & Home Shipping</div>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* NEW IN FEATURED COLLECTIONS BANNER GRID (Match screenshot design) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '48px 0', borderBottom: '1px solid #E7E5E4' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#1C1917', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
            NEW IN
          </h2>
        </div>

        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            
            {/* Collection Card 1: Pragya Tree Rubber & Jute Mats */}
            <div
              onClick={() => handleExploreSlide('mats')}
              style={{ position: 'relative', height: '360px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #E7E5E4' }}
            >
              <img
                src="https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80"
                alt="Yoga Mats Collection"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: '24px', left: '20px', right: '20px', color: '#FFFFFF' }}>
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#FDE68A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  HIMALAYAN CRAFTED
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', marginTop: '2px' }}>
                  ALIGNMENT YOGA MATS
                </div>
              </div>
            </div>

            {/* Collection Card 2: Hand-Hammered Sound Bowls */}
            <div
              onClick={() => handleExploreSlide('meditation')}
              style={{ position: 'relative', height: '360px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #E7E5E4' }}
            >
              <img
                src="https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=800&q=80"
                alt="Singing Bowls Collection"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: '24px', left: '20px', right: '20px', color: '#FFFFFF' }}>
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#FDE68A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  7-METAL SACRED ALLOY
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', marginTop: '2px' }}>
                  HIMALAYAN SINGING BOWLS
                </div>
              </div>
            </div>

            {/* Collection Card 3: Organic Yogic Attire */}
            <div
              onClick={() => handleExploreSlide('apparel')}
              style={{ position: 'relative', height: '360px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #E7E5E4' }}
            >
              <img
                src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
                alt="Organic Yogic Apparel"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: '24px', left: '20px', right: '20px', color: '#FFFFFF' }}>
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#FDE68A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  100% GOTS COTTON
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', marginTop: '2px' }}>
                  PRANAYAMA PRACTICE WEAR
                </div>
              </div>
            </div>

            {/* Collection Card 4: Ayurvedic Tamra Vessels */}
            <div
              onClick={() => handleExploreSlide('wellness')}
              style={{ position: 'relative', height: '360px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #E7E5E4' }}
            >
              <img
                src="https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80"
                alt="Ayurvedic Wellness Tools"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: '24px', left: '20px', right: '20px', color: '#FFFFFF' }}>
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#FDE68A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  PURE COPPER & KANSA
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', marginTop: '2px' }}>
                  AYURVEDIC TAMRA VESSELS
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MAIN STORE CATALOG SECTION */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section id="store-catalog" style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px 90px 24px' }}>
        
        {/* Category Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '44px' }}>
          {[
            { id: 'ALL', label: 'All Products' },
            { id: 'mats', label: 'Yoga Mats & Bags' },
            { id: 'apparel', label: 'Yogic Apparel' },
            { id: 'props', label: 'Props & Gear' },
            { id: 'meditation', label: 'Meditation & Sound' },
            { id: 'wellness', label: 'Ayurvedic Wellness' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '10px 22px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: selectedCategory === cat.id ? 'none' : '1px solid #E7E5E4',
                backgroundColor: selectedCategory === cat.id ? '#B45309' : '#FFFFFF',
                color: selectedCategory === cat.id ? '#FFFFFF' : '#57534E',
                boxShadow: selectedCategory === cat.id ? '0 4px 12px rgba(180,83,9,0.25)' : '0 2px 4px rgba(0,0,0,0.02)',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Cards Grid with Generous Gaps & Luxury Styling */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '32px' }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E7E5E4',
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                transition: 'all 0.3s ease',
              }}
            >
              <div>
                {/* Product Image Container with Badge */}
                <div style={{ position: 'relative', height: '240px', backgroundColor: '#FAF7F2', overflow: 'hidden' }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  />

                  {item.badge && (
                    <span style={{ position: 'absolute', top: '14px', left: '14px', backgroundColor: item.badgeColor === 'emerald' ? '#ECFDF5' : '#FEF3C7', color: item.badgeColor === 'emerald' ? '#047857' : '#78350F', border: item.badgeColor === 'emerald' ? '1px solid #A7F3D0' : '1px solid #FDE68A', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.04em' }}>
                      {item.badge}
                    </span>
                  )}

                  <span style={{ position: 'absolute', bottom: '14px', right: '14px', backgroundColor: 'rgba(255,255,255,0.92)', color: '#1C1917', backdropFilter: 'blur(4px)', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, border: '1px solid #E7E5E4' }}>
                    {item.stockStatus || 'In Stock'}
                  </span>
                </div>

                {/* Product Details Section */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 900, color: '#1C1917', letterSpacing: '-0.02em' }}>
                      {item.currency || 'HK$'} {item.price}
                    </span>
                    {item.discountPrice && (
                      <span style={{ fontSize: '13px', color: '#A8A29E', textDecoration: 'line-through', fontWeight: 600 }}>
                        {item.currency || 'HK$'} {item.discountPrice}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1917', margin: 0, lineHeight: 1.35 }}>
                    {item.title}
                  </h3>

                  {item.subtitle && (
                    <p style={{ fontSize: '13px', color: '#78716C', margin: 0, lineHeight: 1.5 }}>
                      {item.subtitle}
                    </p>
                  )}

                  {/* Bullet Specs Preview */}
                  {item.specs && item.specs.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {item.specs.slice(0, 2).map((spec, i) => (
                        <div key={i} style={{ fontSize: '12px', color: '#57534E', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: 1.4 }}>
                          <span style={{ color: '#B45309', fontWeight: 900 }}>•</span> {spec}
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>

              {/* Action Buttons Footer */}
              <div style={{ padding: '16px 24px 24px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', borderTop: '1px solid #F5F5F4' }}>
                <button
                  onClick={() => setSelectedProduct(item)}
                  style={{ padding: '10px 14px', backgroundColor: '#FAF7F2', color: '#44403C', borderRadius: '12px', fontSize: '13px', fontWeight: 800, border: '1px solid #E7E5E4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Eye className="w-4 h-4" /> Quick View
                </button>

                <button
                  onClick={() => handleWhatsAppOrder(item)}
                  style={{ padding: '10px 14px', backgroundColor: '#B45309', color: '#FFFFFF', borderRadius: '12px', fontSize: '13px', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(180,83,9,0.25)' }}
                >
                  <MessageCircle className="w-4 h-4" /> Buy Now
                </button>
              </div>

            </div>
          ))}
        </div>

      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* QUICK VIEW PRODUCT MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: '24px', backdropFilter: 'blur(4px)' }}>
          <style>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none !important;
              width: 0 !important;
              height: 0 !important;
            }
            .no-scrollbar {
              -ms-overflow-style: none !important;
              scrollbar-width: none !important;
            }
          `}</style>
          <div
            className="no-scrollbar"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '780px',
              maxHeight: '90vh',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
            }}
          >
            
            <div style={{ padding: '20px 28px', borderBottom: '1px solid #F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78350F', backgroundColor: '#FEF3C7', padding: '4px 12px', borderRadius: '999px', border: '1px solid #FDE68A' }}>
                {selectedProduct.category.toUpperCase()}
              </span>
              <button
                onClick={() => setSelectedProduct(null)}
                style={{ padding: '8px', color: '#78716C', borderRadius: '10px', backgroundColor: '#F5F5F4', border: '1px solid #E7E5E4', cursor: 'pointer' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              
              {/* Image Preview */}
              <div style={{ backgroundColor: '#FAF7F2', borderRadius: '18px', overflow: 'hidden', height: '320px', border: '1px solid #E7E5E4' }}>
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Product Info & Specs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1C1917', margin: 0, lineHeight: 1.3 }}>
                    {selectedProduct.title}
                  </h2>
                  <p style={{ fontSize: '13px', color: '#78716C', marginTop: '4px', margin: 0 }}>
                    {selectedProduct.subtitle}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 900, color: '#B45309' }}>
                    {selectedProduct.currency || 'HK$'} {selectedProduct.price}
                  </span>
                  {selectedProduct.discountPrice && (
                    <span style={{ fontSize: '14px', color: '#A8A29E', textDecoration: 'line-through', fontWeight: 600 }}>
                      {selectedProduct.currency || 'HK$'} {selectedProduct.discountPrice}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '14px', color: '#44403C', lineHeight: 1.6, margin: 0 }}>
                  {selectedProduct.description}
                </p>

                {selectedProduct.materialInfo && (
                  <div style={{ backgroundColor: '#FAF7F2', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E7E5E4', fontSize: '13px', fontWeight: 700, color: '#57534E' }}>
                    🌱 Material Spec: <span style={{ color: '#1C1917', fontWeight: 800 }}>{selectedProduct.materialInfo}</span>
                  </div>
                )}

                {selectedProduct.specs && selectedProduct.specs.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: '#78350F', letterSpacing: '0.06em' }}>
                      Key Features & Specifications:
                    </div>
                    {selectedProduct.specs.map((spec, i) => (
                      <div key={i} style={{ fontSize: '13px', color: '#44403C', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: 1.5 }}>
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => handleWhatsAppOrder(selectedProduct)}
                  style={{ marginTop: '12px', padding: '14px 28px', backgroundColor: '#B45309', color: '#FFFFFF', borderRadius: '14px', fontSize: '15px', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 14px rgba(180,83,9,0.3)' }}
                >
                  <MessageCircle className="w-5 h-5" /> Order via WhatsApp / Inquiry
                </button>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
