import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { DynamicPackage, PackageType } from '../../types';

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pkg: DynamicPackage) => void;
  initialData?: DynamicPackage | null;
}

const PACKAGE_TYPES: { label: string; value: PackageType }[] = [
  { label: 'TTC (Teacher Training)', value: 'teacher_training' },
  { label: 'Retreat', value: 'retreat' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Event', value: 'event' },
  { label: 'Regular Package', value: 'regular' },
  { label: 'Private Session', value: 'private' },
  { label: 'Free Class', value: 'free_class' },
];

export const PackageModal: React.FC<PackageModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<PackageType>('regular');
  const [subtitle, setSubtitle] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
  const [currency, setCurrency] = useState('HKD');
  const [badge, setBadge] = useState('');
  const [badgeColor, setBadgeColor] = useState('#D97706');
  const [coverImage, setCoverImage] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<string[]>(['']);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(1);

  const [certification, setCertification] = useState('');
  const [totalHours, setTotalHours] = useState<number | undefined>(undefined);
  const [batchDates, setBatchDates] = useState('');
  const [location, setLocation] = useState('');
  const [validityPeriod, setValidityPeriod] = useState('');
  const [classCount, setClassCount] = useState<string | number>('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setType(initialData.type || 'regular');
      setSubtitle(initialData.subtitle || '');
      setPrice(initialData.price || 0);
      setDiscountPrice(initialData.discountPrice);
      setCurrency(initialData.currency || 'HKD');
      setBadge(initialData.badge || '');
      setBadgeColor(initialData.badgeColor || '#D97706');
      setCoverImage(initialData.coverImage || '');
      setDescription(initialData.description || '');
      setFeatures(initialData.features?.length ? initialData.features : ['']);
      setIsActive(initialData.isActive ?? true);
      setIsFeatured(initialData.isFeatured ?? false);
      setDisplayOrder(initialData.displayOrder || 1);

      setCertification(initialData.metadata?.certification || '');
      setTotalHours(initialData.metadata?.totalHours);
      setBatchDates(initialData.metadata?.batchDates || '');
      setLocation(initialData.metadata?.location || '');
      setValidityPeriod(initialData.metadata?.validityPeriod || '');
      setClassCount(initialData.metadata?.classCount || '');
    } else {
      setTitle('');
      setType('regular');
      setSubtitle('');
      setPrice(0);
      setDiscountPrice(undefined);
      setCurrency('HKD');
      setBadge('');
      setBadgeColor('#D97706');
      setCoverImage('');
      setDescription('');
      setFeatures(['']);
      setIsActive(true);
      setIsFeatured(false);
      setDisplayOrder(1);
      setCertification('');
      setTotalHours(undefined);
      setBatchDates('');
      setLocation('');
      setValidityPeriod('');
      setClassCount('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddFeature = () => setFeatures([...features, '']);
  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };
  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newPkg: DynamicPackage = {
      id: initialData?.id || `pkg-${Date.now()}`,
      type,
      title: title.trim(),
      subtitle: subtitle.trim(),
      price: Number(price) || 0,
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      currency,
      badge: badge.trim() || undefined,
      badgeColor,
      coverImage: coverImage.trim() || undefined,
      description: description.trim(),
      features: features.map(f => f.trim()).filter(Boolean),
      isActive,
      isFeatured,
      displayOrder: Number(displayOrder) || 1,
      metadata: {
        certification: certification.trim() || undefined,
        totalHours: totalHours ? Number(totalHours) : undefined,
        batchDates: batchDates.trim() || undefined,
        location: location.trim() || undefined,
        validityPeriod: validityPeriod.trim() || undefined,
        classCount: classCount || undefined,
      },
    };

    onSave(newPkg);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: '24px', backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', color: '#1C1917', borderRadius: '20px', width: '100%', maxWidth: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1917', margin: 0 }}>
            {initialData ? 'Edit Package' : 'Add New Package'}
          </h2>
          <button
            onClick={onClose}
            style={{ padding: '6px', color: '#78716C', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '14px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '6px', fontSize: '13px' }}>Package Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 200-Hour Teacher Training"
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '6px', fontSize: '13px' }}>Package Category *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PackageType)}
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              >
                {PACKAGE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '6px', fontSize: '13px' }}>Subtitle / Tagline</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Transform your practice into a lifestyle"
              style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
            />
          </div>

          {/* Pricing Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '6px', fontSize: '13px' }}>Price *</label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '6px', fontSize: '13px' }}>Discount Price</label>
              <input
                type="number"
                min="0"
                value={discountPrice ?? ''}
                onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Optional"
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '6px', fontSize: '13px' }}>Currency</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              />
            </div>
          </div>

          {/* Badge & Image */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '6px', fontSize: '13px' }}>Badge Text</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. POPULAR, BEST VALUE"
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '6px', fontSize: '13px' }}>Cover Image URL</label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '6px', fontSize: '13px' }}>Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Package overview details..."
              style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', color: '#1C1917', outline: 'none', resize: 'none' }}
            />
          </div>

          {/* Features List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ color: '#44403C', fontWeight: 700, fontSize: '13px' }}>Included Features</label>
              <button
                type="button"
                onClick={handleAddFeature}
                style={{ fontSize: '12px', color: '#B45309', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus className="w-3.5 h-3.5" /> Add Feature
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {features.map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="text"
                    value={feat}
                    onChange={(e) => handleFeatureChange(idx, e.target.value)}
                    placeholder="e.g. Unlimited Mat Access"
                    style={{ flex: 1, backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', color: '#1C1917', outline: 'none' }}
                  />
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      style={{ padding: '6px', color: '#E11D48', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #F5F5F4' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '10px 20px', backgroundColor: '#F5F5F4', color: '#44403C', borderRadius: '12px', fontWeight: 700, border: '1px solid #E7E5E4', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '10px 24px', backgroundColor: '#B45309', color: '#FFFFFF', borderRadius: '12px', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 3px 10px rgba(180,83,9,0.25)' }}
            >
              <Save className="w-4 h-4" /> Save Package
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
