import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";

import {
  CAROUSEL_SWIPE_COMMIT_PX,
  clampCarouselIndex,
  getCarouselSlideStyle,
  getCarouselTrackOffsetPx,
  getCarouselTrackStyle,
  joinClassNames,
} from "../carousel-track.util";
import productStyles from "../styles/ProductDetail.module.scss";

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  offsetX: number;
  isHorizontal: boolean;
  decided: boolean;
  captured: boolean;
};

const INITIAL_DRAG_STATE: DragState = {
  pointerId: -1,
  startX: 0,
  startY: 0,
  offsetX: 0,
  isHorizontal: false,
  decided: false,
  captured: false,
};

type ProductFormCoverCarouselProps = {
  readonly slideCount: number;
  readonly activeIndex: number;
  readonly onActiveIndexChange: (index: number) => void;
  readonly renderSlide: (slideIndex: number) => ReactNode;
  readonly getSlideKey: (slideIndex: number) => string;
};

export function ProductFormCoverCarousel({
  slideCount,
  activeIndex,
  onActiveIndexChange,
  renderSlide,
  getSlideKey,
}: ProductFormCoverCarouselProps): ReactElement {
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [slideWidthPx, setSlideWidthPx] = useState(0);
  const [enableTrackTransition, setEnableTrackTransition] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState>(INITIAL_DRAG_STATE);
  const previousSlideCountRef = useRef(slideCount);

  const safeIndex = clampCarouselIndex(activeIndex, slideCount);
  const hasMultipleSlides = slideCount > 1;

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return undefined;
    }

    const updateSlideWidth = (): void => {
      setSlideWidthPx(viewport.getBoundingClientRect().width);
    };

    updateSlideWidth();

    const observer = new ResizeObserver(updateSlideWidth);
    observer.observe(viewport);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (slideWidthPx <= 0) {
      return undefined;
    }

    setEnableTrackTransition(false);
    let innerFrameId = 0;
    const outerFrameId = requestAnimationFrame(() => {
      innerFrameId = requestAnimationFrame(() => {
        setEnableTrackTransition(true);
      });
    });

    return () => {
      cancelAnimationFrame(outerFrameId);
      cancelAnimationFrame(innerFrameId);
    };
  }, [slideWidthPx]);

  const resetDrag = useCallback((): void => {
    const dragState = dragStateRef.current;
    if (dragState.captured) {
      viewportRef.current?.releasePointerCapture(dragState.pointerId);
    }
    dragStateRef.current = INITIAL_DRAG_STATE;
    setDragOffsetX(0);
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const previousSlideCount = previousSlideCountRef.current;
    previousSlideCountRef.current = slideCount;

    resetDrag();

    if (slideCount < previousSlideCount) {
      setEnableTrackTransition(false);
    }
  }, [slideCount, resetDrag]);

  const goToIndex = useCallback(
    (nextIndex: number): void => {
      if (!hasMultipleSlides) {
        return;
      }

      const clampedIndex = clampCarouselIndex(nextIndex, slideCount);
      if (clampedIndex === safeIndex) {
        return;
      }

      setDragOffsetX(0);
      setIsDragging(false);
      onActiveIndexChange(clampedIndex);
    },
    [hasMultipleSlides, onActiveIndexChange, safeIndex, slideCount]
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!hasMultipleSlides || event.button !== 0) {
      return;
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: 0,
      isHorizontal: false,
      decided: false,
      captured: false,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const dragState = dragStateRef.current;
    if (!hasMultipleSlides || dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    if (!dragState.decided) {
      if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) {
        return;
      }

      dragState.decided = true;
      dragState.isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
      if (!dragState.isHorizontal) {
        dragStateRef.current = INITIAL_DRAG_STATE;
        return;
      }

      const viewport = viewportRef.current;
      if (viewport) {
        viewport.setPointerCapture(event.pointerId);
        dragState.captured = true;
      }
      setIsDragging(true);
    }

    if (!dragState.isHorizontal) {
      return;
    }

    event.preventDefault();

    let nextOffset = deltaX;
    if (safeIndex === 0 && nextOffset < 0) {
      nextOffset *= 0.35;
    }
    if (safeIndex === slideCount - 1 && nextOffset > 0) {
      nextOffset *= 0.35;
    }

    dragState.offsetX = nextOffset;
    setDragOffsetX(nextOffset);
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const dragState = dragStateRef.current;
    if (dragState.pointerId !== event.pointerId) {
      return;
    }

    if (dragState.captured) {
      viewportRef.current?.releasePointerCapture(event.pointerId);
    }

    if (dragState.isHorizontal && Math.abs(dragState.offsetX) >= CAROUSEL_SWIPE_COMMIT_PX) {
      goToIndex(safeIndex + (dragState.offsetX > 0 ? 1 : -1));
      resetDrag();
      return;
    }

    resetDrag();
  };

  const baseOffsetPx = getCarouselTrackOffsetPx(safeIndex, slideCount, slideWidthPx);
  const trackTransform = `translate3d(${Math.round(baseOffsetPx + dragOffsetX)}px, 0, 0)`;

  if (slideCount === 0) {
    return <div className={productStyles.galleryCarousel} />;
  }

  if (slideCount === 1) {
    return (
      <div className={productStyles.galleryCarousel}>
        <div className={productStyles.galleryCarouselSlide}>{renderSlide(0)}</div>
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      className={productStyles.galleryCarousel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <div
        className={joinClassNames(
          productStyles.galleryCarouselTrack,
          (isDragging || !enableTrackTransition) && productStyles.galleryCarouselTrackDragging
        )}
        style={getCarouselTrackStyle(slideWidthPx, slideCount, trackTransform)}
      >
        {Array.from({ length: slideCount }, (_, slideIndex) => slideIndex)
          .reverse()
          .map((slideIndex) => (
            <div
              key={getSlideKey(slideIndex)}
              className={productStyles.galleryCarouselSlide}
              style={getCarouselSlideStyle(slideWidthPx)}
            >
              {renderSlide(slideIndex)}
            </div>
          ))}
      </div>
    </div>
  );
}
