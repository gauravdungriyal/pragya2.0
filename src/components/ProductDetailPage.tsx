import React, { useState } from 'react';
import {
  ShoppingBag, Star, CheckCircle2, Truck, ShieldCheck, RefreshCw,
  ChevronRight, ArrowLeft, Check, AlertCircle, Clock
} from 'lucide-react';
import { MerchandiseItem, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';

interface ProductDetailPageProps {
  product: MerchandiseItem;
  onBackToStore: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onBackToStore }) => {
  const { addToCart } = useCart();
  
  // Available Variants or Base Product
  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    hasVariants ? product.variants![0] : null
  );

  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [addedToBagAlert, setAddedToBagAlert] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Dynamic price & stock based on selected variant or base product
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant 
    ? selectedVariant.discountPrice 
    : product.discountPrice;
  
  const currentStockStatus = selectedVariant 
    ? selectedVariant.stockStatus 
    : (product.stockStatus || 'In Stock');

  const isOutOfStock = currentStockStatus === 'Out of Stock';
  const isBackorder = currentStockStatus === 'On Backorder' || currentStockStatus === 'Pre-Order';

  const discountPercent = currentOriginalPrice && currentOriginalPrice > currentPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 0;

  // Pure Multi-Image Gallery Assembly (Uses product.gallery directly if provided)
  const galleryImages = product.gallery && product.gallery.length > 0
    ? Array.from(new Set(product.gallery.filter(Boolean)))
    : [product.image];

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    const variantLabel = selectedVariant ? selectedVariant.variantTitle : undefined;
    addToCart({
      id: `${product.id}${selectedVariant ? `-${selectedVariant.id}` : ''}`,
      title: variantLabel ? `${product.title} (${variantLabel})` : product.title,
      price: currentPrice,
      originalPrice: currentOriginalPrice || undefined,
      category: product.category,
      type: 'merchandise',
      coverImage: product.image,
    });
    setAddedToBagAlert(true);
    setTimeout(() => setAddedToBagAlert(false), 3000);
  };

  return (
    <div style={{ backgroundColor: '#F5EFE5', minHeight: '100vh', color: '#282C3F', fontFamily: 'var(--font-sans), "Assistant", sans-serif' }}>
      
      {/* ── Top Breadcrumbs Navigation Bar ───────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid #E5DEC9', backgroundColor: '#F5EFE5', padding: '12px 28px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#535766', fontWeight: 500 }}>
            <button 
              onClick={onBackToStore}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#944426', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}
            >
              <ArrowLeft size={16} /> Store
            </button>
            <ChevronRight size={13} color="#A8A29E" />

            <button 
              onClick={onBackToStore}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#44403C', fontWeight: 600, textTransform: 'capitalize', padding: 0 }}
            >
              {product.category}
            </button>

            {product.brand && (
              <>
                <ChevronRight size={13} color="#A8A29E" />
                <span style={{ fontWeight: 600, color: '#44403C' }}>{product.brand}</span>
              </>
            )}

            <ChevronRight size={13} color="#A8A29E" />
            <span style={{ fontWeight: 800, color: '#1C1917', maxWidth: '360px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.title}
            </span>
          </div>

        </div>
      </div>

      {/* ── Main Product Detail Layout Container ────────────────────────────── */}
      <div className="pdp-main-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 28px 60px 28px' }}>
        
        {addedToBagAlert && (
          <div style={{ position: 'fixed', top: '80px', right: '28px', zIndex: 99999, backgroundColor: '#059669', color: '#FFFFFF', padding: '14px 20px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '14px' }}>
            <CheckCircle2 size={20} />
            <span>Added "{product.title}" to your Shopping Bag!</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px', alignItems: 'flex-start' }}>
          
          {/* ── LEFT SECTION: Gallery (Desktop Grid & Mobile Flipkart/Myntra Carousel) ── */}
          <div>
            {/* Desktop 2-Column Multi-Image Grid */}
            <div className="pdp-desktop-gallery">
              <div style={{ display: 'grid', gridTemplateColumns: galleryImages.length > 1 ? '1fr 1fr' : '1fr', gap: '12px', marginBottom: '16px' }}>
                {galleryImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#F5F5F6',
                      cursor: 'pointer',
                      border: 'none',
                      aspectRatio: galleryImages.length === 1 ? '4/3' : '3/4'
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.title} view ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Flipkart/Myntra App Style Carousel Slider */}
            <div className="pdp-mobile-carousel" style={{ marginBottom: '20px' }}>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  backgroundColor: '#FAF7F2',
                  border: '1px solid #E5DEC9',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
                }}
              >
                <img
                  src={galleryImages[activeImageIndex] || product.image}
                  alt={product.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Mobile Pagination Dot Indicators (Flipkart Style) */}
                {galleryImages.length > 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'rgba(0, 0, 0, 0.45)',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    {galleryImages.map((_, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        style={{
                          width: activeImageIndex === idx ? '16px' : '6px',
                          height: '6px',
                          borderRadius: '999px',
                          backgroundColor: activeImageIndex === idx ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Horizontal Thumbnail Selector Strip */}
              {galleryImages.length > 1 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '12px',
                    overflowX: 'auto',
                    paddingBottom: '4px'
                  }}
                >
                  {galleryImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      style={{
                        minWidth: '60px',
                        width: '60px',
                        height: '60px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: activeImageIndex === idx ? '2px solid #944426' : '1px solid #E5DEC9',
                        opacity: activeImageIndex === idx ? 1 : 0.7,
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                      }}
                    >
                      <img src={imgUrl} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Feature Highlights Grid beneath images */}
            <div style={{ display: 'grid', gridTemplateColumns: product.materialInfo ? '1fr 1fr' : '1fr', gap: '12px', marginTop: '16px' }}>
              {product.materialInfo && (
                <div style={{ border: '1px solid #E5DEC9', borderRadius: '12px', padding: '14px', backgroundColor: '#EFE7DA' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#944426', textTransform: 'uppercase' }}>CRAFTSMANSHIP & MATERIAL</span>
                  <p style={{ fontSize: '12px', color: '#535766', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                    {product.materialInfo}
                  </p>
                </div>
              )}
              <div style={{ border: '1px solid #E5DEC9', borderRadius: '12px', padding: '14px', backgroundColor: '#EFE7DA' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>AUTHENTIC GUARANTEE</span>
                <p style={{ fontSize: '12px', color: '#535766', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                  100% Authentic product with quality assurance.
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT SECTION: Product Details & Buying Actions ────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Header Titles */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                {product.brand ? (
                  <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#282C3F', margin: 0, letterSpacing: '-0.01em' }}>
                    {product.brand}
                  </h1>
                ) : (
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {product.category}
                  </span>
                )}
                
                {/* Stock Status Badge */}
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    backgroundColor: isOutOfStock ? '#FEF2F2' : isBackorder ? '#FEF3C7' : '#ECFDF5',
                    color: isOutOfStock ? '#991B1B' : isBackorder ? '#78350F' : '#065F46',
                    border: isOutOfStock ? '1px solid #FECDD3' : isBackorder ? '1px solid #FDE68A' : '1px solid #A7F3D0',
                  }}
                >
                  {currentStockStatus}
                </span>
              </div>

              <p style={{ fontSize: '17px', color: '#535665', margin: '4px 0 12px 0', fontWeight: 400 }}>
                {product.title}
              </p>

              {/* Rating Pill (Rendered ONLY if product has rating data) */}
              {product.rating && product.ratingCount && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #E5DEC9', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, backgroundColor: '#EFE7DA' }}>
                  <span>{product.rating}</span>
                  <Star size={13} fill="#059669" color="#059669" />
                  <span style={{ color: '#A8A29E', fontWeight: 400 }}>|</span>
                  <span style={{ color: '#44403C', fontWeight: 600 }}>{product.ratingCount} Ratings & Reviews</span>
                </div>
              )}
            </div>

            <div style={{ height: '1px', backgroundColor: '#E5DEC9' }} />

            {/* Price Block */}
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <span style={{ fontSize: '26px', fontWeight: 800, color: '#282C3F' }}>
                  {product.currency || 'HK$'} {currentPrice.toLocaleString()}
                </span>
                {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                  <>
                    <span style={{ fontSize: '16px', color: '#94969F', textDecoration: 'line-through' }}>
                      MRP {product.currency || 'HK$'} {currentOriginalPrice.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#FF905A' }}>
                      ({discountPercent}% OFF)
                    </span>
                  </>
                )}
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#03A685', display: 'block', marginTop: '4px' }}>
                inclusive of all taxes
              </span>
            </div>

            {/* Variable Options (Rendered ONLY if Product has Variants) */}
            {hasVariants && (() => {
              const detectedAttribute = product.variationAttribute 
                ? product.variationAttribute.toUpperCase() 
                : (product.variants && product.variants[0]?.variantTitle.includes(':') 
                    ? product.variants[0].variantTitle.split(':')[0].trim().toUpperCase() 
                    : 'OPTION');

              return (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#282C3F', letterSpacing: '0.04em' }}>
                      SELECT {detectedAttribute}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {product.variants!.map((v) => {
                      const cleanValue = v.variantTitle.includes(':')
                        ? v.variantTitle.split(':').slice(1).join(':').trim()
                        : v.variantTitle;

                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          style={{
                            padding: '10px 24px',
                            borderRadius: '999px',
                            border: selectedVariant?.id === v.id ? '2px solid #944426' : '1px solid #D4D5D9',
                            backgroundColor: selectedVariant?.id === v.id ? '#FDF6F0' : '#FFFFFF',
                            color: selectedVariant?.id === v.id ? '#944426' : '#282C3F',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '100px',
                            transition: 'all 0.2s ease',
                            boxShadow: selectedVariant?.id === v.id ? '0 2px 8px rgba(148, 68, 38, 0.15)' : 'none'
                          }}
                        >
                          <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', lineHeight: 1.2 }}>
                            {cleanValue}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 600, marginTop: '2px', color: selectedVariant?.id === v.id ? '#944426' : '#535766' }}>
                            {product.currency || 'HK$'} {v.price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Backorder / Out of Stock Banner Notice */}
            {isOutOfStock && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECDD3', borderRadius: '8px', padding: '12px 16px', color: '#991B1B', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> Currently Out of Stock.
              </div>
            )}

            {isBackorder && (
              <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', padding: '12px 16px', color: '#78350F', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} /> Available on Backorder / Pre-Order.
              </div>
            )}

            {/* Action Buttons Bar (ADD TO BAG) */}
            <div style={{ marginTop: '12px' }}>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: isOutOfStock ? '#9CA3AF' : '#944426',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  letterSpacing: '0.05em',
                  boxShadow: isOutOfStock ? 'none' : '0 4px 12px rgba(148, 68, 38, 0.3)'
                }}
              >
                <ShoppingBag size={18} /> {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}
              </button>
            </div>

            {/* Store-Wide Benefits */}
            <div style={{ border: '1px solid #E5DEC9', borderRadius: '12px', padding: '16px 18px', backgroundColor: '#EFE7DA', marginTop: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: '#282C3F' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={16} color="#059669" />
                  <span>100% Original Authentic Products</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Truck size={16} color="#059669" />
                  <span>Pay on delivery available</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <RefreshCw size={16} color="#059669" />
                  <span>Easy 7 days returns and exchanges</span>
                </div>
              </div>
            </div>

            {/* Product Details & Specifications */}
            {(product.description || (product.specs && product.specs.length > 0) || product.sku || product.materialInfo || product.stockQuantity !== undefined) && (
              <div style={{ borderTop: '1px solid #E5DEC9', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#282C3F', margin: '0 0 12px 0', letterSpacing: '0.04em' }}>
                  PRODUCT DETAILS & SPECIFICATIONS
                </h3>
                
                {product.description && (
                  <p style={{ fontSize: '13px', color: '#535665', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                    {product.description}
                  </p>
                )}

                {product.specs && product.specs.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#282C3F', display: 'block', marginBottom: '8px' }}>
                      Key Features:
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {product.specs.map((sp, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#535766' }}>
                          <Check size={14} color="#059669" />
                          <span>{sp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specifications Table */}
                <div style={{ backgroundColor: '#EFE7DA', borderRadius: '12px', padding: '16px', border: '1px solid #E5DEC9' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#282C3F', display: 'block', marginBottom: '12px' }}>
                    TECHNICAL SPECIFICATIONS
                  </span>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                    <div>
                      <span style={{ color: '#94969F', display: 'block' }}>Category</span>
                      <span style={{ fontWeight: 700, color: '#282C3F', textTransform: 'capitalize' }}>{product.category}</span>
                    </div>

                    {(selectedVariant?.stockQuantity !== undefined || product.stockQuantity !== undefined) && (
                      <div>
                        <span style={{ color: '#94969F', display: 'block' }}>Stock Quantity</span>
                        <span style={{ fontWeight: 700, color: isOutOfStock ? '#DC2626' : '#059669' }}>
                          {selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity} Units
                        </span>
                      </div>
                    )}

                    {product.materialInfo && (
                      <div>
                        <span style={{ color: '#94969F', display: 'block' }}>Material Composition</span>
                        <span style={{ fontWeight: 700, color: '#282C3F' }}>{product.materialInfo}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default ProductDetailPage;
