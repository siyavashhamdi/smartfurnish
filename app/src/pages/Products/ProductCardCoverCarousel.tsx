import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from "react";
import { createPortal } from "react-dom";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ChairRoundedIcon from "@mui/icons-material/ChairRounded";
import { IconButton } from "@mui/material";

import { CachedFileImage } from "../../shared/display/CachedFileImage";
import { resolveFileAccessUrl } from "../../utils/fileAccessUrl.util";
import type { FileAccessUrl } from "../../utils/fileAccessUrl.util";
import styles from "./styles/ProductCard.module.scss";

const SWIPE_COMMIT_PX = 52;
const SWIPE_CANCEL_CLICK_PX = 8;
const SWIPE_PREFETCH_PX = 24;

function createInitialLoadedIndices(): Set<number> {
  return new Set([0]);
}

/** Maps logical slide index to horizontal translate (first image anchored on the right). */
function getTrackOffsetPx(activeIndex: number, imageCount: number, slideWidthPx: number): number {
  if (imageCount <= 1 || slideWidthPx <= 0) {
    return 0;
  }

  return -(imageCount - 1 - activeIndex) * slideWidthPx;
}

function getSlideStyle(slideWidthPx: number): CSSProperties | undefined {
  if (slideWidthPx <= 0) {
    return undefined;
  }

  const width = `${slideWidthPx}px`;
  return {
    flex: `0 0 ${width}`,
    inlineSize: width,
    minInlineSize: width,
    maxInlineSize: width,
  };
}

function getTrackStyle(
  slideWidthPx: number,
  imageCount: number,
  transform: string
): CSSProperties {
  const style: CSSProperties = { transform };

  if (slideWidthPx > 0 && imageCount > 1) {
    style.inlineSize = `${slideWidthPx * imageCount}px`;
  }

  return style;
}

type ProductCardCoverCarouselProps = {
  readonly title: string;
  readonly coverImageAccessUrls: readonly FileAccessUrl[];
  readonly onActiveAccessUrlChange: (accessUrl: FileAccessUrl | null) => void;
  readonly onCarouselInteraction: () => void;
  readonly dotsContainer?: HTMLDivElement | null;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  offsetX: number;
  isHorizontal: boolean;
  decided: boolean;
};

const INITIAL_DRAG_STATE: DragState = {
  pointerId: -1,
  startX: 0,
  startY: 0,
  offsetX: 0,
  isHorizontal: false,
  decided: false,
};

function ProductCardCoverSlide({
  accessUrl,
  title,
  slideIndex,
  shouldLoad,
  slideWidthPx,
}: {
  readonly accessUrl: FileAccessUrl;
  readonly title: string;
  readonly slideIndex: number;
  readonly shouldLoad: boolean;
  readonly slideWidthPx: number;
}): ReactElement {
  const networkUrl = resolveFileAccessUrl(accessUrl);

  return (
    <div className={styles.coverCarouselSlide} style={getSlideStyle(slideWidthPx)}>
      {shouldLoad ? (
        <CachedFileImage
          accessUrl={accessUrl}
          networkUrl={networkUrl}
          fileId={accessUrl.fileId}
          alt={`${title} — تصویر ${(slideIndex + 1).toLocaleString("fa-IR")}`}
          className={styles.coverImage}
          draggable={false}
        />
      ) : null}
    </div>
  );
}

export function ProductCardCoverCarousel({
  title,
  coverImageAccessUrls,
  onActiveAccessUrlChange,
  onCarouselInteraction,
  dotsContainer,
}: ProductCardCoverCarouselProps): ReactElement {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [slideWidthPx, setSlideWidthPx] = useState(0);
  const [enableTrackTransition, setEnableTrackTransition] = useState(false);
  const [loadedIndices, setLoadedIndices] = useState(createInitialLoadedIndices);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState>(INITIAL_DRAG_STATE);

  const imageCount = coverImageAccessUrls.length;
  const safeIndex = Math.min(activeIndex, Math.max(imageCount - 1, 0));
  const hasMultipleImages = imageCount > 1;
  const activeAccessUrl = coverImageAccessUrls[safeIndex] ?? null;

  const requestSlideLoad = useCallback((index: number): void => {
    if (index < 0 || index >= imageCount) {
      return;
    }

    setLoadedIndices((current) => {
      if (current.has(index)) {
        return current;
      }

      const next = new Set(current);
      next.add(index);
      return next;
    });
  }, [imageCount]);

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
  }, [slideWidthPx, coverImageAccessUrls]);

  useEffect(() => {
    setActiveIndex(0);
    setDragOffsetX(0);
    setIsDragging(false);
    setEnableTrackTransition(false);
    setLoadedIndices(createInitialLoadedIndices());
    dragStateRef.current = INITIAL_DRAG_STATE;
  }, [coverImageAccessUrls]);

  useEffect(() => {
    requestSlideLoad(safeIndex);
  }, [requestSlideLoad, safeIndex]);

  useEffect(() => {
    if (!isDragging || Math.abs(dragOffsetX) < SWIPE_PREFETCH_PX) {
      return;
    }

    requestSlideLoad(dragOffsetX > 0 ? safeIndex + 1 : safeIndex - 1);
  }, [dragOffsetX, isDragging, requestSlideLoad, safeIndex]);

  useEffect(() => {
    onActiveAccessUrlChange(activeAccessUrl);
  }, [activeAccessUrl, onActiveAccessUrlChange]);

  const markInteraction = useCallback((): void => {
    onCarouselInteraction();
  }, [onCarouselInteraction]);

  const goToIndex = useCallback(
    (nextIndex: number): void => {
      if (!hasMultipleImages) {
        return;
      }

      const clampedIndex = Math.max(0, Math.min(imageCount - 1, nextIndex));
      if (clampedIndex === safeIndex) {
        return;
      }

      markInteraction();
      requestSlideLoad(clampedIndex);
      setDragOffsetX(0);
      setIsDragging(false);
      setActiveIndex(clampedIndex);
    },
    [hasMultipleImages, imageCount, markInteraction, requestSlideLoad, safeIndex]
  );

  const goToPrevious = useCallback((): void => {
    goToIndex(safeIndex - 1);
  }, [goToIndex, safeIndex]);

  const goToNext = useCallback((): void => {
    goToIndex(safeIndex + 1);
  }, [goToIndex, safeIndex]);

  const resetDrag = useCallback((): void => {
    dragStateRef.current = INITIAL_DRAG_STATE;
    setDragOffsetX(0);
    setIsDragging(false);
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!hasMultipleImages || event.button !== 0) {
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    event.stopPropagation();
    viewport.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: 0,
      isHorizontal: false,
      decided: false,
    };
    setIsDragging(true);
    setDragOffsetX(0);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const dragState = dragStateRef.current;
    if (!hasMultipleImages || dragState.pointerId !== event.pointerId) {
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
        viewportRef.current?.releasePointerCapture(event.pointerId);
        resetDrag();
        return;
      }
    }

    if (!dragState.isHorizontal) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    let nextOffset = deltaX;
    if (safeIndex === 0 && nextOffset < 0) {
      nextOffset *= 0.35;
    }
    if (safeIndex === imageCount - 1 && nextOffset > 0) {
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

    event.stopPropagation();
    viewportRef.current?.releasePointerCapture(event.pointerId);

    if (dragState.isHorizontal && Math.abs(dragState.offsetX) >= SWIPE_COMMIT_PX) {
      markInteraction();
      if (dragState.offsetX > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
      resetDrag();
      return;
    }

    if (dragState.isHorizontal && Math.abs(dragState.offsetX) >= SWIPE_CANCEL_CLICK_PX) {
      markInteraction();
    }

    resetDrag();
  };

  const baseOffsetPx = getTrackOffsetPx(safeIndex, imageCount, slideWidthPx);
  const trackTransform = `translate3d(${Math.round(baseOffsetPx + dragOffsetX)}px, 0, 0)`;

  const carouselDots = hasMultipleImages ? (
    <div
      className={styles.coverCarouselDots}
      role="tablist"
      aria-label="تصاویر محصول"
      onClick={(event) => event.stopPropagation()}
    >
      {[...coverImageAccessUrls].reverse().map((accessUrl, reverseIndex) => {
        const index = imageCount - 1 - reverseIndex;

        return (
          <button
            key={accessUrl.fileId ?? `${accessUrl.url}-dot-${index}`}
            type="button"
            role="tab"
            aria-selected={index === safeIndex}
            aria-label={`تصویر ${(index + 1).toLocaleString("fa-IR")}`}
            className={`${styles.coverCarouselDot}${
              index === safeIndex ? ` ${styles.coverCarouselDotActive}` : ""
            }`}
            onClick={(event) => {
              event.stopPropagation();
              goToIndex(index);
            }}
          />
        );
      })}
    </div>
  ) : null;

  return (
    <>
      <div
        ref={viewportRef}
        className={styles.coverCarouselRoot}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        {imageCount > 0 ? (
          <div
            className={`${styles.coverCarouselTrack}${
              isDragging || !enableTrackTransition ? ` ${styles.coverCarouselTrackDragging}` : ""
            }`}
            style={getTrackStyle(slideWidthPx, imageCount, trackTransform)}
          >
            {[...coverImageAccessUrls].reverse().map((accessUrl, reverseIndex) => {
              const slideIndex = imageCount - 1 - reverseIndex;

              return (
                <ProductCardCoverSlide
                  key={accessUrl.fileId ?? `${accessUrl.url}-${slideIndex}`}
                  accessUrl={accessUrl}
                  title={title}
                  slideIndex={slideIndex}
                  shouldLoad={loadedIndices.has(slideIndex)}
                  slideWidthPx={slideWidthPx}
                />
              );
            })}
          </div>
        ) : (
          <>
            <div className={styles.defaultCoverGlow} aria-hidden="true" />
            <span className={styles.defaultCoverIcon}>
              <ChairRoundedIcon />
            </span>
          </>
        )}
      </div>

      {hasMultipleImages ? (
        <div className={styles.coverCarouselControls}>
          <IconButton
            type="button"
            size="small"
            className={styles.coverNavButton}
            aria-label="تصویر بعدی"
            disabled={safeIndex === imageCount - 1}
            onClick={(event) => {
              event.stopPropagation();
              goToNext();
            }}
          >
            <ChevronLeftRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton
            type="button"
            size="small"
            className={styles.coverNavButton}
            aria-label="تصویر قبلی"
            disabled={safeIndex === 0}
            onClick={(event) => {
              event.stopPropagation();
              goToPrevious();
            }}
          >
            <ChevronRightRoundedIcon fontSize="small" />
          </IconButton>
        </div>
      ) : null}

      {carouselDots && dotsContainer ? createPortal(carouselDots, dotsContainer) : null}
    </>
  );
}
