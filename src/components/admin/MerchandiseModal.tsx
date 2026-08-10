import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { MerchandiseItem, MerchandiseCategory } from '../../types';

interface MerchandiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MerchandiseItem) => void;
  initialData?: MerchandiseItem | null;
}

export const MerchandiseModal: React.FC<MerchandiseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<MerchandiseCategory>('mats');
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
  const [image, setImage] = useState('');
  const [badge, setBadge] = useState('');
  const [stockStatus, setStockStatus] = useState<'In Stock' | 'Limited Stock' | 'Pre-Order'>('In Stock');
  const [materialInfo, setMaterialInfo] = useState('');
  const [description, setDescription] = useState('');
  const [specsText, setSpecsText] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setSubtitle(initialData.subtitle || '');
      setCategory(initialData.category || 'mats');
      setPrice(initialData.price || 0);
      setDiscountPrice(initialData.discountPrice);
      setImage(initialData.image || '');
      setBadge(initialData.badge || '');
      setStockStatus(initialData.stockStatus || 'In Stock');
      setMaterialInfo(initialData.materialInfo || '');
      setDescription(initialData.description || '');
      setSpecsText(initialData.specs ? initialData.specs.join('\n') : '');
    } else {
      setTitle('');
      setSubtitle('');
      setCategory('mats');
      setPrice(0);
      setDiscountPrice(undefined);
      setImage('');
      setBadge('Best Seller');
      setStockStatus('In Stock');
      setMaterialInfo('');
      setDescription('');
      setSpecsText('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || price <= 0) return;

    const specsArray = specsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const updatedItem: MerchandiseItem = {
      id: initialData?.id || `merch-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      category,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      currency: 'HK$',
      image: image.trim() || 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1000&q=80',
      badge: badge.trim() || undefined,
      badgeColor: badge.toLowerCase().includes('organic') ? 'emerald' : 'amber',
      description: description.trim(),
      specs: specsArray,
      materialInfo: materialInfo.trim() || undefined,
      isActive: initialData ? initialData.isActive : true,
      isFeatured: initialData ? initialData.isFeatured : false,
      stockStatus,
    };

    onSave(updatedItem);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: '24px', backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', color: '#1C1917', borderRadius: '20px', width: '100%', maxWidth: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        
        {/* Header Bar */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1917', margin: 0 }}>
            {initialData ? 'Edit Merchandise Product' : 'Add New Merchandise Product'}
          </h2>
          <button
            onClick={onClose}
            style={{ padding: '8px', color: '#78716C', borderRadius: '10px', backgroundColor: '#F5F5F4', border: '1px solid #E7E5E4', cursor: 'pointer' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '14px' }}>
          
          <div>
            <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Product Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pragya Pro Alignment Jute Yoga Mat"
              style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Subtitle / Highlight Line</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. 5mm Cushioning with Laser Alignment Markers"
              style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MerchandiseCategory)}
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              >
                <option value="mats">Mats & Bags</option>
                <option value="apparel">Yogic Apparel</option>
                <option value="props">Props & Gear</option>
                <option value="meditation">Meditation & Sound</option>
                <option value="wellness">Ayurvedic Wellness</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Stock Availability</label>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value as any)}
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              >
                <option value="In Stock">In Stock</option>
                <option value="Limited Stock">Limited Stock</option>
                <option value="Pre-Order">Pre-Order</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Price (HKD) *</label>
              <input
                type="number"
                required
                min="1"
                value={price || ''}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="e.g. 680"
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Original / Strikethrough Price (Optional)</label>
              <input
                type="number"
                value={discountPrice || ''}
                onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 780"
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Product Image URL</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Badge Tag (Optional)</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Best Seller / 100% Organic"
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Material Info Line</label>
              <input
                type="text"
                value={materialInfo}
                onChange={(e) => setMaterialInfo(e.target.value)}
                placeholder="e.g. 100% Natural Tree Rubber & Jute"
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Feature Specifications (One per line)</label>
            <textarea
              rows={3}
              value={specsText}
              onChange={(e) => setSpecsText(e.target.value)}
              placeholder="5mm Ultra-Density Cushioning&#10;Laser-Etched Alignment Guidelines&#10;Sweat-Proof Non-Slip Surface"
              style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '14px 16px', fontSize: '14px', color: '#1C1917', outline: 'none', lineHeight: '1.5', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Product Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed product story, craftsmanship, and benefits..."
              style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '14px 16px', fontSize: '14px', color: '#1C1917', outline: 'none', lineHeight: '1.6', resize: 'vertical' }}
            />
          </div>

          {/* Footer Submit Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '20px', borderTop: '1px solid #F5F5F4', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '12px 24px', backgroundColor: '#F5F5F4', color: '#44403C', borderRadius: '12px', fontWeight: 800, border: '1px solid #E7E5E4', cursor: 'pointer', fontSize: '14px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '12px 26px', backgroundColor: '#B45309', color: '#FFFFFF', borderRadius: '12px', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', boxShadow: '0 3px 10px rgba(180,83,9,0.3)' }}
            >
              <Save className="w-4 h-4" /> Save Merchandise Product
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
