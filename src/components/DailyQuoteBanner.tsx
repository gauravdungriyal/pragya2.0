import React, { useEffect, useState } from 'react';
import { Quote, Sparkles } from 'lucide-react';
import { getDailyQuotes, DEFAULT_QUOTES } from '../services/api';
import { DailyQuote } from '../types';

export const DailyQuoteBanner: React.FC = () => {
  const [quotesList, setQuotesList] = useState<DailyQuote[]>(DEFAULT_QUOTES);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    getDailyQuotes().then((data) => {
      if (data && data.length > 0) setQuotesList(data);
    });
  }, []);

  useEffect(() => {
    if (quotesList.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % quotesList.length);
        setIsFading(false);
      }, 400);
    }, 5000);

    return () => clearInterval(timer);
  }, [quotesList.length, isHovered]);

  const currentQuote = quotesList[currentIdx];
  if (!currentQuote) return null;

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        <div className="reveal-blur" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#D9AE29', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
          <Sparkles size={14} />
          <span>Daily Mindful Inspiration</span>
        </div>
        
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start',
            justifyContent: 'center',
            opacity: isFading ? 0 : 1,
            transform: isFading ? 'translateY(4px)' : 'translateY(0)',
            transition: 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out'
          }}
        >
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
              "{currentQuote.q}"
            </blockquote>
            <cite style={{ fontSize: '14px', color: '#D9AE29', fontStyle: 'normal', fontWeight: 600, letterSpacing: '0.04em' }}>
              — {currentQuote.a}
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
};
