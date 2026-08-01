import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollProgressBar
 * -----------------
 * A slim, animated progress bar fixed at the very top of the viewport.
 * Fills from left to right as the user scrolls the page.
 * Uses the Pragya Yog terracotta → gold gradient palette.
 */
export const ScrollProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(pct, 100));
    };

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 9999,
        backgroundColor: 'rgba(148, 68, 38, 0.12)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #944426 0%, #D9AE29 100%)',
          transition: 'width 0.08s linear',
          boxShadow: '0 0 8px rgba(217, 174, 41, 0.5)',
          borderRadius: '0 2px 2px 0',
        }}
      />
    </div>
  );
};

/**
 * BackToTopButton
 * ---------------
 * A floating button that appears after scrolling 400px.
 * Smoothly animates in/out. Clicking it scrolls to the top.
 */
export const BackToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Back to top"
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '20px',
        zIndex: 1000,
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: hovered
          ? 'linear-gradient(135deg, #944426, #D9AE29)'
          : '#21201E',
        color: '#F5EFE5',
        boxShadow: hovered
          ? '0 8px 24px rgba(148, 68, 38, 0.45)'
          : '0 4px 16px rgba(0,0,0,0.25)',
        transform: visible
          ? hovered ? 'translateY(-4px) scale(1.08)' : 'translateY(0) scale(1)'
          : 'translateY(20px) scale(0.85)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* Up Arrow SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: 'transform 0.3s ease',
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        }}
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
};
