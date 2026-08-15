import React, { useState } from 'react';
import { ArrowLeft, Save, X, Plus, Image as ImageIcon, CheckCircle, Eye, Tag, Sparkles, AlertCircle, Trash2, Layers, Package, Layers2 } from 'lucide-react';
import { MerchandiseItem, MerchandiseCategory, ProductType, StockStatus, ProductVariant } from '../../types';
import { saveMerchandiseItem } from '../../services/api';

interface AddProductPageProps {
  onBack: () => void;
  onProductSaved: (updatedItems: MerchandiseItem[]) => void;
  initialData?: MerchandiseItem | null;
}

export const AddProductPage: React.FC<AddProductPageProps> = ({ onBack, onProductSaved, initialData }) => {
  // Product Type & Core State
  const [productType, setProductType] = useState<ProductType>(
    initialData?.productType || (initialData?.variants && initialData.variants.length > 0 ? 'variable' : 'simple')
  );
  const [variationAttribute, setVariationAttribute] = useState<string>(
    initialData?.variationAttribute || 'Size'
  );
  const [sku, setSku] = useState(initialData?.sku || `PRAGYA-${Math.floor(1000 + Math.random() * 9000)}`);
  const [title, setTitle] = useState(initialData?.title || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [brand, setBrand] = useState(initialData?.brand || 'Pragya Sanctuary');
  const [category, setCategory] = useState<MerchandiseCategory>(initialData?.category || 'mats');
  const [audience, setAudience] = useState<'Unisex' | 'Women' | 'Men' | 'Kids'>(initialData?.audience || 'Unisex');
  
  // Pricing & Simple Product Stock
  const [price, setPrice] = useState<string>(initialData?.price ? String(initialData.price) : '');
  const [discountPrice, setDiscountPrice] = useState<string>(initialData?.discountPrice ? String(initialData.discountPrice) : '');
  const [stockStatus, setStockStatus] = useState<StockStatus>(initialData?.stockStatus || 'In Stock');
  const [stockQuantity, setStockQuantity] = useState<string>(initialData?.stockQuantity ? String(initialData.stockQuantity) : '50');

  // Dual Media Upload Manager (Main Image + Gallery)
  const [mainImage, setMainImage] = useState(initialData?.image || '');
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    initialData?.gallery && initialData.gallery.length > 0
      ? initialData.gallery
      : [
          'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1000&q=80'
        ]
  );
  const [newGalleryInput, setNewGalleryInput] = useState('');

  // Variable Product Variants List
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialData?.variants && initialData.variants.length > 0
      ? initialData.variants
      : [
          {
            id: 'var-1',
            sku: `${sku}-S`,
            variantTitle: 'Size: S',
            price: initialData?.price || 390,
            discountPrice: initialData?.discountPrice || 499,
            stockQuantity: 20,
            stockStatus: 'In Stock'
          },
          {
            id: 'var-2',
            sku: `${sku}-M`,
            variantTitle: 'Size: M',
            price: initialData?.price ? initialData.price + 30 : 420,
            discountPrice: initialData?.discountPrice ? initialData.discountPrice + 30 : 599,
            stockQuantity: 25,
            stockStatus: 'In Stock'
          }
        ]
  );

  // Variant Form Input Draft
  const [vTitle, setVTitle] = useState('');
  const [vPrice, setVPrice] = useState('');
  const [vDiscountPrice, setVDiscountPrice] = useState('');
  const [vStockQty, setVStockQty] = useState('10');
  const [vStockStatus, setVStockStatus] = useState<StockStatus>('In Stock');

  // Descriptions & Specs
  const [badge, setBadge] = useState(initialData?.badge || '');
  const [materialInfo, setMaterialInfo] = useState(initialData?.materialInfo || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [specsText, setSpecsText] = useState(initialData?.specs ? initialData.specs.join('\n') : '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Gallery URL handlers
  const handleAddGalleryUrl = () => {
    if (newGalleryInput.trim()) {
      setGalleryUrls([...galleryUrls, newGalleryInput.trim()]);
      setNewGalleryInput('');
    }
  };

  const handleRemoveGalleryUrl = (index: number) => {
    setGalleryUrls(galleryUrls.filter((_, i) => i !== index));
  };

  // Variant handlers
  const handleAddVariant = () => {
    if (!vTitle.trim() || !vPrice || parseFloat(vPrice) <= 0) {
      alert('Please enter variant title and valid price.');
      return;
    }
    const newVar: ProductVariant = {
      id: `var-${Date.now()}`,
      sku: `${sku}-${vTitle.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || Date.now()}`,
      variantTitle: vTitle.trim(),
      price: parseFloat(vPrice),
      discountPrice: vDiscountPrice ? parseFloat(vDiscountPrice) : undefined,
      stockQuantity: parseInt(vStockQty) || 0,
      stockStatus: vStockStatus,
    };
    setVariants([...variants, newVar]);
    setVTitle('');
    setVPrice('');
    setVDiscountPrice('');
    setVStockQty('10');
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please enter a product title.');
      return;
    }

    if (productType === 'simple' && (!price || parseFloat(price) <= 0)) {
      setErrorMessage('Please enter a valid price for the Simple Product.');
      return;
    }

    if (productType === 'variable' && variants.length === 0) {
      setErrorMessage('Please add at least one product variation for a Variable Product.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const specsArray = specsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const mainCover = mainImage.trim() || galleryUrls[0] || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1000&q=80';

    const basePrice = productType === 'simple' ? parseFloat(price) : (variants[0]?.price || 420);
    const baseDiscountPrice = productType === 'simple' ? (discountPrice ? parseFloat(discountPrice) : undefined) : (variants[0]?.discountPrice);

    const newProd: MerchandiseItem = {
      id: initialData?.id || `MERCH-${Date.now()}`,
      sku: sku.trim() || `PRAGYA-${Date.now()}`,
      productType,
      variationAttribute: productType === 'variable' ? (variationAttribute.trim() || 'Option') : undefined,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      brand: brand.trim() || 'Pragya Sanctuary',
      category,
      audience,
      price: basePrice,
      discountPrice: baseDiscountPrice,
      currency: 'HK$',
      image: mainCover,
      gallery: galleryUrls.length > 0 ? galleryUrls : [mainCover],
      badge: badge.trim() || undefined,
      badgeColor: badge.toLowerCase().includes('organic') ? 'emerald' : 'amber',
      description: description.trim() || 'Handcrafted premium yogic lifestyle product.',
      specs: specsArray.length > 0 ? specsArray : ['Eco-friendly material', 'Non-slip surface grip'],
      materialInfo: materialInfo.trim() || undefined,
      isActive: true,
      stockStatus: productType === 'simple' ? stockStatus : (variants[0]?.stockStatus || 'In Stock'),
      stockQuantity: productType === 'simple' ? (parseInt(stockQuantity) || 0) : variants.reduce((acc, v) => acc + v.stockQuantity, 0),
      variants: productType === 'variable' ? variants : undefined,
      rating: initialData?.rating || 4.9,
      ratingCount: initialData?.ratingCount || 18,
    };

    try {
      const updatedItems = await saveMerchandiseItem(newProd);
      setIsSubmitting(false);
      onProductSaved(updatedItems);
      onBack();
    } catch (err: any) {
      console.error('Failed to save product:', err);
      setErrorMessage('Failed to save product. Please check your data.');
      setIsSubmitting(false);
    }
  };

  const previewPrice = productType === 'simple' ? (price ? parseFloat(price) : 420) : (variants[0]?.price || 420);
  const previewOriginalPrice = productType === 'simple' ? (discountPrice ? parseFloat(discountPrice) : undefined) : (variants[0]?.discountPrice);
  const previewImage = mainImage || galleryUrls[0] || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1000&q=80';

  return (
    <div style={{ backgroundColor: '#FAF7F2', minHeight: '100vh', paddingBottom: '80px', color: '#1C1917', fontFamily: 'var(--font-sans), sans-serif' }}>
      
      {/* ── Header Navigation Bar ────────────────────────────────────────── */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E7E5E4', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={onBack}
              style={{
                padding: '10px 18px',
                backgroundColor: '#F5F5F4',
                color: '#292524',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid #E7E5E4',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft className="w-4 h-4 text-amber-700" /> Back to Store Catalog
            </button>

            <div style={{ height: '24px', width: '1px', backgroundColor: '#E7E5E4' }} />

            <div>
              <div style={{ fontSize: '11px', color: '#78716C', fontWeight: 600 }}>Admin Panel &gt; Store &gt; {initialData ? 'Edit Product' : 'Add Product'}</div>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1917', margin: 0, lineHeight: 1.2 }}>
                {initialData ? 'Edit Merchandise Product' : 'Create Merchandise Product'}
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={onBack}
              style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #D6D3D1', backgroundColor: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                padding: '10px 24px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#944426',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(148,68,38,0.25)'
              }}
            >
              <Save className="w-4 h-4" /> {isSubmitting ? 'Saving Product...' : 'Save Product'}
            </button>
          </div>

        </div>
      </div>

      {/* ── Main Canvas Content Container ───────────────────────────────────── */}
      <div style={{ maxWidth: '1280px', margin: '32px auto 0 auto', padding: '0 28px' }}>
        
        {errorMessage && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECDD3', color: '#991B1B', padding: '14px 20px', borderRadius: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700 }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px', alignItems: 'flex-start' }}>
          
          {/* ── LEFT COLUMN: Form Inputs ────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Card 1: Product Type Switcher */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#1C1917', display: 'block', marginBottom: '12px' }}>
                SELECT PRODUCT TYPE
              </label>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setProductType('simple')}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: productType === 'simple' ? '2px solid #944426' : '1px solid #E7E5E4',
                    backgroundColor: productType === 'simple' ? '#FEF3C7' : '#FFFFFF',
                    color: productType === 'simple' ? '#78350F' : '#44403C',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Package className="w-4 h-4" /> Simple Product
                </button>

                <button
                  type="button"
                  onClick={() => setProductType('variable')}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: productType === 'variable' ? '2px solid #944426' : '1px solid #E7E5E4',
                    backgroundColor: productType === 'variable' ? '#FEF3C7' : '#FFFFFF',
                    color: productType === 'variable' ? '#78350F' : '#44403C',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Layers2 className="w-4 h-4" /> Variable Product (Size / Variations)
                </button>
              </div>

              <p style={{ fontSize: '12px', color: '#78716C', margin: '10px 0 0 0' }}>
                {productType === 'simple' 
                  ? 'A standalone product with a single fixed price and stock level.'
                  : 'A product with multiple options (e.g. Size S, M, L, XL or Colors), each with its own price & stock count.'}
              </p>
            </div>

            {/* Card 2: Essential Details */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1C1917', margin: 0, paddingBottom: '14px', borderBottom: '1px solid #F5F5F4' }}>
                Basic Product Info & SKU
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '6px' }}>
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Pragya Pro Alignment Jute Yoga Mat"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6D3D1', fontSize: '13.5px', outline: 'none', backgroundColor: '#FAF7F2' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '6px' }}>
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="PRAGYA-MAT-101"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6D3D1', fontSize: '13.5px', outline: 'none', backgroundColor: '#FAF7F2', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '6px' }}>
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Pragya Sanctuary"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6D3D1', fontSize: '13.5px', outline: 'none', backgroundColor: '#FAF7F2' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '6px' }}>
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MerchandiseCategory)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6D3D1', fontSize: '13.5px', outline: 'none', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="mats">Mats & Bags</option>
                    <option value="apparel">Apparel & Wear</option>
                    <option value="wellness">Wellness & Oils</option>
                    <option value="meditation">Meditation Essentials</option>
                    <option value="props">Blocks & Props</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '6px' }}>
                    Audience
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as any)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6D3D1', fontSize: '13.5px', outline: 'none', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '6px' }}>
                  Subtitle / Highlight Line
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. 5mm Cushioning with Laser-Etched Alignment Guidelines"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6D3D1', fontSize: '13.5px', outline: 'none', backgroundColor: '#FAF7F2' }}
                />
              </div>
            </div>

            {/* Card 3: Simple Product Pricing & Inventory */}
            {productType === 'simple' && (
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1C1917', margin: 0, paddingBottom: '14px', borderBottom: '1px solid #F5F5F4' }}>
                  Pricing & Stock Inventory (Simple Product)
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '6px' }}>
                      Regular Sale Price (HK$) *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="420"
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6D3D1', fontSize: '13.5px', outline: 'none', backgroundColor: '#FAF7F2' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '6px' }}>
                      MRP / Original Price (Crossed Out)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      placeholder="599"
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6D3D1', fontSize: '13.5px', outline: 'none', backgroundColor: '#FAF7F2' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '6px' }}>
                      Stock Status *
                    </label>
                    <select
                      value={stockStatus}
                      onChange={(e) => setStockStatus(e.target.value as StockStatus)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6D3D1', fontSize: '13.5px', outline: 'none', backgroundColor: '#FFFFFF' }}
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                      <option value="On Backorder">On Backorder / Pre-Order</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '6px' }}>
                      Stock Quantity (Units)
                    </label>
                    <input
                      type="number"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      placeholder="50"
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6D3D1', fontSize: '13.5px', outline: 'none', backgroundColor: '#FAF7F2' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Card 4: Variable Product Variations Builder */}
            {productType === 'variable' && (
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid #F5F5F4' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1C1917', margin: 0 }}>
                    Product Variations Manager ({variants.length})
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '6px' }}>
                    Variable Setup
                  </span>
                </div>

                {/* 1. Define Variation Attribute Name once */}
                <div style={{ backgroundColor: '#FAF7F2', border: '1px solid #E7E5E4', borderRadius: '14px', padding: '16px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '6px' }}>
                    Variation Type / Attribute Name (e.g. Thickness, Size, Color, Volume) *
                  </label>
                  <input
                    type="text"
                    value={variationAttribute}
                    onChange={(e) => setVariationAttribute(e.target.value)}
                    placeholder="e.g. Thickness"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: '10px', border: '1px solid #D6D3D1', fontSize: '13.5px', outline: 'none', backgroundColor: '#FFFFFF', fontWeight: 700, color: '#944426' }}
                  />
                  <p style={{ fontSize: '11.5px', color: '#78716C', margin: '6px 0 0 0' }}>
                    This name will appear once as the section title on the product page (e.g. SELECT THICKNESS).
                  </p>
                </div>

                {/* Variants List Table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {variants.map((v) => (
                    <div
                      key={v.id}
                      style={{ border: '1px solid #E7E5E4', borderRadius: '12px', padding: '14px', backgroundColor: '#FAF7F2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
                    >
                      <div>
                        <strong style={{ fontSize: '14px', color: '#1C1917' }}>
                          {variationAttribute || 'Option'}: {v.variantTitle}
                        </strong>
                        <div style={{ fontSize: '12px', color: '#78716C', marginTop: '2px', display: 'flex', gap: '12px' }}>
                          <span>SKU: <code>{v.sku}</code></span>
                          <span>Price: <strong>HK$ {v.price}</strong> {v.discountPrice && <s>HK$ {v.discountPrice}</s>}</span>
                          <span>Qty: <strong>{v.stockQuantity}</strong> ({v.stockStatus})</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(v.id)}
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                        title="Remove Variant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Variant Row Form */}
                <div style={{ border: '1px dashed #D6D3D1', borderRadius: '14px', padding: '20px', backgroundColor: '#FFFFFF', marginTop: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#944426', display: 'block', marginBottom: '16px' }}>
                    + ADD {variationAttribute ? variationAttribute.toUpperCase() : 'VARIATION'} OPTION VALUE
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '4px' }}>
                        Option Value (e.g. {variationAttribute || 'Option'} Value: 6mm, 10mm, L, XL) *
                      </label>
                      <input
                        type="text"
                        placeholder={variationAttribute.toLowerCase().includes('thick') ? 'e.g. 10mm' : variationAttribute.toLowerCase().includes('color') ? 'e.g. Deep Blue' : 'e.g. XL'}
                        value={vTitle}
                        onChange={(e) => setVTitle(e.target.value)}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D6D3D1', fontSize: '13px', outline: 'none', backgroundColor: '#FAF7F2' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '4px' }}>
                          Price (HK$) *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 420"
                          value={vPrice}
                          onChange={(e) => setVPrice(e.target.value)}
                          style={{ width: '100%', boxSizing: 'border-box', minWidth: 0, padding: '10px 12px', borderRadius: '10px', border: '1px solid #D6D3D1', fontSize: '13px', outline: 'none' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '4px' }}>
                          MRP Price (Optional)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 599"
                          value={vDiscountPrice}
                          onChange={(e) => setVDiscountPrice(e.target.value)}
                          style={{ width: '100%', boxSizing: 'border-box', minWidth: 0, padding: '10px 12px', borderRadius: '10px', border: '1px solid #D6D3D1', fontSize: '13px', outline: 'none' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '4px' }}>
                          Stock Qty
                        </label>
                        <input
                          type="number"
                          placeholder="10"
                          value={vStockQty}
                          onChange={(e) => setVStockQty(e.target.value)}
                          style={{ width: '100%', boxSizing: 'border-box', minWidth: 0, padding: '10px 12px', borderRadius: '10px', border: '1px solid #D6D3D1', fontSize: '13px', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'flex-end', marginTop: '4px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '4px' }}>
                          Stock Status
                        </label>
                        <select
                          value={vStockStatus}
                          onChange={(e) => setVStockStatus(e.target.value as StockStatus)}
                          style={{ width: '100%', boxSizing: 'border-box', minWidth: 0, padding: '10px 12px', borderRadius: '10px', border: '1px solid #D6D3D1', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF' }}
                        >
                          <option value="In Stock">In Stock</option>
                          <option value="Out of Stock">Out of Stock</option>
                          <option value="On Backorder">On Backorder</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddVariant}
                        style={{ padding: '10px 16px', backgroundColor: '#944426', color: '#FFFFFF', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '40px' }}
                      >
                        <Plus className="w-4 h-4" /> Add Variation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Card 5: Dual Media Manager (Main Featured Image + Product Gallery URLs) */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1C1917', margin: 0, paddingBottom: '14px', borderBottom: '1px solid #F5F5F4' }}>
                Media Upload Manager (Main Image & Gallery)
              </h3>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '6px' }}>
                  📷 Main Featured Cover Image URL (Shown in Box 1 & Catalog Card)
                </label>
                <input
                  type="url"
                  value={mainImage}
                  onChange={(e) => setMainImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6D3D1', fontSize: '13.5px', outline: 'none', backgroundColor: '#FAF7F2' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '8px' }}>
                  🖼️ Additional Product Gallery Images ({galleryUrls.length} added)
                </label>

                {/* Gallery List Preview Thumbnails */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                  {galleryUrls.map((gUrl, idx) => (
                    <div key={idx} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid #E7E5E4', aspectRatio: '1/1', backgroundColor: '#FAF7F2' }}>
                      <img src={gUrl} alt={`Gallery ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryUrl(idx)}
                        style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        title="Remove Image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="url"
                    value={newGalleryInput}
                    onChange={(e) => setNewGalleryInput(e.target.value)}
                    placeholder="Paste gallery image URL..."
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #D6D3D1', fontSize: '13px', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryUrl}
                    style={{ padding: '10px 16px', backgroundColor: '#292524', color: '#FFFFFF', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus className="w-4 h-4" /> Add Gallery Image
                  </button>
                </div>
              </div>
            </div>

            {/* Card 6: Specs & Description */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1C1917', margin: 0, paddingBottom: '14px', borderBottom: '1px solid #F5F5F4' }}>
                Specifications & Description
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '6px' }}>
                    Badge Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Best Seller / 100% Organic"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6D3D1', fontSize: '13.5px', outline: 'none', backgroundColor: '#FAF7F2' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '6px' }}>
                    Material Info Line
                  </label>
                  <input
                    type="text"
                    value={materialInfo}
                    onChange={(e) => setMaterialInfo(e.target.value)}
                    placeholder="e.g. 100% Natural Cork & Tree Rubber"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6D3D1', fontSize: '13.5px', outline: 'none', backgroundColor: '#FAF7F2' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '6px' }}>
                  Feature Specifications (One per line)
                </label>
                <textarea
                  rows={3}
                  value={specsText}
                  onChange={(e) => setSpecsText(e.target.value)}
                  placeholder="5mm Ultra-Density Cushioning&#10;Laser-Etched Alignment Guidelines&#10;Sweat-Proof Non-Slip Surface"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6D3D1', fontSize: '13.5px', outline: 'none', backgroundColor: '#FAF7F2', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44403C', display: 'block', marginBottom: '6px' }}>
                  Product Story & Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed product story, craftsmanship, and benefits..."
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #D6D3D1', fontSize: '13.5px', outline: 'none', backgroundColor: '#FAF7F2', resize: 'vertical' }}
                />
              </div>

            </div>

          </div>

          {/* ── RIGHT COLUMN: Live Product Card Preview ───────────────────────── */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #F5F5F4' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#944426', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  LIVE STORE PREVIEW
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#FEF3C7', color: '#B45309', padding: '2px 8px', borderRadius: '6px' }}>
                  {productType === 'simple' ? 'Simple Product' : 'Variable Product'}
                </span>
              </div>

              {/* Sample Product Card Mockup */}
              <div style={{ border: '1px solid #E7E5E4', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: '#FAF7F2' }}>
                  <img src={previewImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {badge && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#944426', color: '#FFFFFF', padding: '4px 9px', borderRadius: '6px', fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase' }}>
                      {badge}
                    </div>
                  )}
                </div>

                <div style={{ padding: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#78716C', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    {brand || 'PRAGYA SANCTUARY'} • {category.toUpperCase()}
                  </span>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917', margin: '0 0 8px 0', lineHeight: 1.3 }}>
                    {title || 'Product Title Placeholder'}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 900, color: '#1C1917' }}>
                      HK$ {previewPrice.toLocaleString()}
                    </span>
                    {previewOriginalPrice && previewOriginalPrice > previewPrice && (
                      <span style={{ fontSize: '12px', color: '#A8A29E', textDecoration: 'line-through' }}>
                        HK$ {previewOriginalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ padding: '12px 16px', borderTop: '1px solid #F5F5F4', backgroundColor: '#FAF7F2', fontSize: '12px', color: '#78716C', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>SKU: <code style={{ color: '#1C1917', fontWeight: 700 }}>#{sku}</code></span>
                  <span style={{ color: stockStatus === 'In Stock' ? '#059669' : stockStatus === 'Out of Stock' ? '#DC2626' : '#D97706', fontWeight: 800 }}>
                    {stockStatus}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #F5F5F4', display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={onBack}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #D6D3D1', backgroundColor: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#944426', color: '#FFFFFF', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Save className="w-4 h-4" /> Save Product
                </button>
              </div>

            </div>
          </div>

        </form>

      </div>

    </div>
  );
};

export default AddProductPage;
