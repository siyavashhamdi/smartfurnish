import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";

function measureConcealMax(node: HTMLElement): number {
  const topPx = Number.parseFloat(getComputedStyle(node).top) || 0;
  return node.offsetHeight + topPx + 12;
}

export function useProgressiveHeaderReveal(
  headerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  resetKey: string
): { readonly offset: number; readonly headerHeight: number } {
  const [concealedPx, setConcealedPx] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const concealMaxRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const frameRef = useRef(0);

  useLayoutEffect(() => {
    if (!enabled) {
      setHeaderHeight(0);
      concealMaxRef.current = 0;
      return undefined;
    }

    const node = headerRef.current;
    if (!node) {
      return undefined;
    }

    const measure = (): void => {
      setHeaderHeight(node.offsetHeight);
      concealMaxRef.current = measureConcealMax(node);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, headerRef, resetKey]);

  useEffect(() => {
    setConcealedPx(0);
    lastScrollYRef.current = typeof window !== "undefined" ? window.scrollY : 0;
  }, [resetKey]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      setConcealedPx(0);
      return undefined;
    }

    lastScrollYRef.current = window.scrollY;

    const onScroll = (): void => {
      if (frameRef.current) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = 0;
        const scrollY = window.scrollY;
        const delta = scrollY - lastScrollYRef.current;
        lastScrollYRef.current = scrollY;

        if (Math.abs(delta) < 0.5) {
          return;
        }

        const max = concealMaxRef.current;
        setConcealedPx((current) => {
          const next = scrollY <= 0 ? 0 : Math.min(max, Math.max(0, current + delta));
          return next === current ? current : next;
        });
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [enabled]);

  return {
    offset: enabled ? -concealedPx : 0,
    headerHeight,
  };
}
