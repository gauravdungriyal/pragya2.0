import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { UpcomingEvent } from '../../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: UpcomingEvent) => void;
  initialData?: UpcomingEvent | null;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Workshop');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [level, setLevel] = useState('All Levels');
  const [instructorName, setInstructorName] = useState('');
  const [spotsLabel, setSpotsLabel] = useState('15 Spots Available');
  const [bannerUrl, setBannerUrl] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || initialData.name || '');
      setCategory(initialData.category || 'Workshop');
      setDescription(initialData.description || '');
      setDate(initialData.date || '');
      setTime(initialData.time || '');
      setLocation(initialData.location || '');
      setPrice(initialData.price || '');
      setAmount(initialData.amount || 0);
      setLevel(initialData.level || 'All Levels');
      setInstructorName(initialData.instructor_name || initialData.instructor?.name || '');
      setSpotsLabel(initialData.spots_label || '');
      setBannerUrl(initialData.banner_image?.url || initialData.image || '');
    } else {
      setTitle('');
      setCategory('Workshop');
      setDescription('');
      setDate('');
      setTime('');
      setLocation('');
      setPrice('');
      setAmount(0);
      setLevel('All Levels');
      setInstructorName('');
      setSpotsLabel('15 Spots Available');
      setBannerUrl('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updatedEvent: UpcomingEvent = {
      id: initialData?.id || `evt-${Date.now()}`,
      title: title.trim(),
      name: title.trim(),
      category,
      description: description.trim(),
      date: date.trim(),
      time: time.trim(),
      location: location.trim(),
      price: price.trim() || `$${amount}`,
      amount: Number(amount) || 0,
      level,
      instructor_name: instructorName.trim(),
      spots_label: spotsLabel.trim(),
      banner_image: bannerUrl ? { url: bannerUrl.trim() } : undefined,
      image: bannerUrl.trim() || undefined,
    };

    onSave(updatedEvent);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: '24px', backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', color: '#1C1917', borderRadius: '20px', width: '100%', maxWidth: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        
        {/* Modal Header Bar with Generous Padding */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1C1917', margin: 0 }}>
            {initialData ? 'Edit Event / Workshop' : 'Add New Event'}
          </h2>
          <button
            onClick={onClose}
            style={{ padding: '8px', color: '#78716C', borderRadius: '10px', backgroundColor: '#F5F5F4', border: '1px solid #E7E5E4', cursor: 'pointer' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body with Explicit Spacing & Vertical Gaps */}
        <form onSubmit={handleSubmit} style={{ padding: '28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '14px' }}>
          
          <div>
            <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Event Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Backbend Intensive Training 2026"
              style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              >
                <option value="Workshop">Workshop</option>
                <option value="Masterclass">Masterclass</option>
                <option value="Retreat">Retreat</option>
                <option value="Special Event">Special Event</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Difficulty Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              >
                <option value="All Levels">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Event Date</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. Oct 18, 2026"
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Timing</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 10:00 AM - 1:00 PM"
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Venue / Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Central Studio, HK"
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Price / Fee</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. $480 or HK$ 650"
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Lead Instructor</label>
              <input
                type="text"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                placeholder="e.g. Master Gurudev"
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Seat Capacity / Label</label>
              <input
                type="text"
                value={spotsLabel}
                onChange={(e) => setSpotsLabel(e.target.value)}
                placeholder="e.g. 12 Spots Available"
                style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Banner Image URL</label>
            <input
              type="text"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://..."
              style={{ width: '100%', backgroundColor: '#FAF7F2', border: '1px solid #D6D3D1', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1C1917', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#44403C', fontWeight: 700, marginBottom: '8px', fontSize: '13px' }}>Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed event description..."
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
              <Save className="w-4 h-4" /> Save Event
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
