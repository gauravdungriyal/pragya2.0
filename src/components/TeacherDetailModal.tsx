import React from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Instructor } from '../types';

interface TeacherDetailModalProps {
  teacher: Instructor | null;
  onClose: () => void;
  onOpenBooking: (type?: string, title?: string) => void;
}

export const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({
  teacher,
  onClose,
  onOpenBooking
}) => {
  if (!teacher) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '36px', maxWidth: '640px' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(39,39,39,0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#272727'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#944426',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-serif)',
              fontSize: '28px',
              fontWeight: 600,
              flexShrink: 0
            }}
          >
            {teacher.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#944426', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {teacher.designation || 'Master Faculty'}
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: '#272727', margin: '4px 0 0 0' }}>
              {teacher.name}
            </h3>
          </div>
        </div>

        <div style={{ fontSize: '15px', color: '#5A5854', lineHeight: 1.7, marginBottom: '24px', backgroundColor: '#FAF6F0', padding: '20px', borderRadius: '16px' }}>
          {teacher.description}
        </div>

        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#272727', marginBottom: '12px' }}>
          Core Specializations & Lineage:
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
          {(teacher.specialization || ['Classical Hatha', 'Pranayama', 'Yogic Philosophy']).map((spec) => (
            <span
              key={spec}
              style={{
                backgroundColor: 'rgba(148, 68, 38, 0.1)',
                color: '#944426',
                borderRadius: '999px',
                padding: '6px 16px',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              {spec}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={() => {
              onClose();
              onOpenBooking('private', `1-on-1 Session with ${teacher.name}`);
            }}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700 }}
          >
            <span>Book Private 1-on-1 Session</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
