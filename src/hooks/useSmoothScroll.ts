import { useEffect, useRef } from 'react';

/**
 * useSmoothScroll
 * ---------------
 * Implements butter-smooth momentum scrolling using lerp (linear interpolation)
 * via requestAnimationFrame. Creates a native-feel but silky smooth scroll
 * experience across all pages without any external libraries.
 *
 * Works by:
 * 1. Tracking the wheel/touch delta as the "target" scroll position
 * 2. Lerping the actual scroll toward the target each frame
 * 3. Applying the visual transform on a wrapper element
 * 4. Keeping the scroll container at proper height so native scrollbars work
 */

interface SmoothScrollOptions {
  /** Lerp factor: 0.04 = very slow/dreamy, 0.12 = balanced, 0.2 = snappy */
  ease?: number;
  /** Disable on mobile to prevent conflicts with native momentum */
  disableOnMobile?: boolean;
  /** Disable on reduced-motion preference */
  respectReducedMotion?: boolean;
}

export function useSmoothScroll(options: SmoothScrollOptions = {}) {
  const {
    ease = 0.10,
    disableOnMobile = true,
    respectReducedMotion = true,
  } = options;

  const rafRef = useRef<number>(0);
  const currentY = useRef(0);
  const targetY = useRef(0);
  const isRunning = useRef(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (respectReducedMotion) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mq.matches) return;
    }

    // Disable on mobile viewports to keep native feel
    if (disableOnMobile && window.innerWidth < 768) return;

    const wrapper = document.getElementById('smooth-scroll-wrapper');
    if (!wrapper) return;

    let pageHeight = 0;

    const setBodyHeight = () => {
      pageHeight = wrapper.getBoundingClientRect().height;
      document.body.style.height = `${pageHeight}px`;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetY.current = Math.max(
        0,
        Math.min(
          targetY.current + e.deltaY * 1.2,
          document.body.scrollHeight - window.innerHeight
        )
      );
    };

    const lerp = (a: number, b: number, n: number) => a + (b - a) * n;

    const loop = () => {
      currentY.current = lerp(currentY.current, targetY.current, ease);

      const diff = targetY.current - currentY.current;

      // Apply the visual transform
      wrapper.style.transform = `translateY(-${currentY.current}px)`;

      // Sync window scroll position for anchors/links to work correctly
      window.scrollTo(0, currentY.current);

      // Skew effect: subtle horizontal lean based on scroll velocity
      const skew = Math.min(Math.max(diff * 0.04, -3), 3);
      wrapper.style.setProperty('--scroll-skew', `${skew}deg`);
      wrapper.style.setProperty('--scroll-velocity', `${Math.abs(diff)}`);

      rafRef.current = requestAnimationFrame(loop);
    };

    // Sync targetY with external scroll (e.g. anchor clicks)
    const onScroll = () => {
      if (Math.abs(window.scrollY - currentY.current) > 100) {
        currentY.current = window.scrollY;
        targetY.current = window.scrollY;
      }
    };

    // Touch support
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const delta = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      targetY.current = Math.max(
        0,
        Math.min(
          targetY.current + delta,
          document.body.scrollHeight - window.innerHeight
        )
      );
    };

    wrapper.style.position = 'fixed';
    wrapper.style.top = '0';
    wrapper.style.left = '0';
    wrapper.style.width = '100%';
    wrapper.style.willChange = 'transform';

    setBodyHeight();
    isRunning.current = true;
    rafRef.current = requestAnimationFrame(loop);

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    const resizeObserver = new ResizeObserver(setBodyHeight);
    resizeObserver.observe(wrapper);

    return () => {
      cancelAnimationFrame(rafRef.current);
      isRunning.current = false;
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      resizeObserver.disconnect();

      // Cleanup
      wrapper.style.position = '';
      wrapper.style.top = '';
      wrapper.style.left = '';
      wrapper.style.width = '';
      wrapper.style.transform = '';
      wrapper.style.willChange = '';
      document.body.style.height = '';
    };
  }, [ease, disableOnMobile, respectReducedMotion]);
}
