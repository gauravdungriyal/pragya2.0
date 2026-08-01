import React, { useState } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateSection
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const quickLinks = [
    { title: 'Morning Hatha & Pranayama', section: 'schedule', category: 'Class' },
    { title: 'Reformer Pilates & Core Sculpt', section: 'experiences', category: 'Experience' },
    { title: 'Master Aarya Kuldeep Profile', section: 'teachers', category: 'Faculty' },
    { title: 'Sun-Kissed Morning Beach Reset', section: 'programs', category: 'Event' },
    { title: 'Sanctuary Unlimited Membership', section: 'membership', category: 'Pricing' },
    { title: 'The Lotus Main Sanctuary Location', section: 'locations', category: 'Location' }
  ];

  const filteredLinks = query
    ? quickLinks.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()) || item.category.toLowerCase().includes(query.toLowerCase()))
    : quickLinks;

  const handleSelect = (section: string) => {
    onClose();
    onNavigateSection(section);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '32px', maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#944426', fontSize: '14px', fontWeight: 700 }}>
            <Search size={18} />
            <span>Search Pragya Sanctuary</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#272727' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <Search size={20} color="#8A8580" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            autoFocus
            placeholder="Search classes, teachers, retreats, or passes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '48px', fontSize: '16px' }}
          />
        </div>

        <div style={{ fontSize: '12px', fontWeight: 700, color: '#8A8580', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
          {query ? 'Search Results' : 'Suggested Destinations'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
          {filteredLinks.map((item) => (
            <button
              key={item.title}
              onClick={() => handleSelect(item.section)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '14px',
                border: '1px solid rgba(39,39,39,0.06)',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FAF6F0';
                e.currentTarget.style.borderColor = '#944426';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = 'rgba(39,39,39,0.06)';
              }}
            >
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: '#272727' }}>{item.title}</div>
                <div style={{ fontSize: '11px', color: '#944426', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>{item.category}</div>
              </div>
              <ArrowRight size={16} color="#8A8580" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
