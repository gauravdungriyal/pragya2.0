import React, { useEffect, useState } from 'react';
import { Quote, Sparkles } from 'lucide-react';
import { getDailyQuote } from '../services/api';
import { DailyQuote } from '../types';

export const DailyQuoteBanner: React.FC = () => {
  const [quote, setQuote] = useState<DailyQuote | null>(null);

  useEffect(() => {
    getDailyQuote().then((data) => setQuote(data));
  }, []);

  if (!quote) return null;

  return (
    <section
      style={{
        backgroundColor: '#00381F',
        color: '#F5EFE5',
        padding: '36px 24px',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(217, 174, 41, 0.2)',
        borderBottom: '1px solid rgba(217, 174, 41, 0.2)'
      }}
    >
      <div className="container" style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#D9AE29', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
          <Sparkles size={14} />
          <span>Daily Mindful Inspiration</span>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', justifyContent: 'center' }}>
          <Quote size={28} color="#D9AE29" style={{ opacity: 0.6, flexShrink: 0, marginTop: '4px' }} />
          <div>
            <blockquote
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(18px, 2.4vw, 26px)',
                fontWeight: 400,
                lineHeight: 1.4,
                fontStyle: 'italic',
                color: '#FAF6F0',
                marginBottom: '12px'
              }}
            >
              "{quote.q}"
            </blockquote>
            <cite style={{ fontSize: '14px', color: '#D9AE29', fontStyle: 'normal', fontWeight: 600, letterSpacing: '0.04em' }}>
              — {quote.a}
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
};
