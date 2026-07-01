import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";

import { CachedFileImage } from "../../shared/display/CachedFileImage";
import { ProgressiveCachedFileImage } from "../../shared/display/ProgressiveCachedFileImage";
import {
  resolveFileAccessUrl,
  type FileAccessUrl,
  type FileAccessUrlVariant,
} from "../../utils/fileAccessUrl.util";
import styles from "./styles/ProductDetail.module.scss";

const SWIPE_COMMIT_PX = 52;
const SWIPE_CANCEL_CLICK_PX = 8;

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

function getTrackStyle(slideWidthPx: number, imageCount: number, transform: string): CSSProperties {
  const style: CSSProperties = { transform };

  if (slideWidthPx > 0 && imageCount > 1) {
    style.inlineSize = `${slideWidthPx * imageCount}px`;
  }

  return style;
}

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

type ProductDetailCoverCarouselProps = {
  readonly title: string;
  readonly coverImageAccessUrls: readonly (FileAccessUrl | null)[];
  readonly activeIndex: number;
  readonly onActiveIndexChange: (index: number) => void;
  readonly variant?: "hero" | "viewer";
  readonly onActivate?: () => void;
  readonly placeholderIcon?: ReactNode;
};

function ProductDetailCoverSlide({
  accessUrl,
  title,
  slideIndex,
  slideWidthPx,
  imageClassName,
  slideClassName,
  placeholderClassName,
  placeholderIcon,
  imageVariant,
  useProgressiveFullLoad = false,
  loadFullImage = false,
}: {
  readonly accessUrl: FileAccessUrl | null;
  readonly title: string;
  readonly slideIndex: number;
  readonly slideWidthPx: number;
  readonly imageClassName: string;
  readonly slideClassName: string;
  readonly placeholderClassName: string;
  readonly placeholderIcon?: ReactNode;
  readonly imageVariant: FileAccessUrlVariant;
  readonly useProgressiveFullLoad?: boolean;
  readonly loadFullImage?: boolean;
}): ReactElement {
  if (!accessUrl) {
    return (
      <div className={slideClassName} style={getSlideStyle(slideWidthPx)}>
        <div className={placeholderClassName} aria-hidden="true">
          {placeholderIcon}
        </div>
      </div>
    );
  }

  const slideAlt = `${title} — تصویر ${(slideIndex + 1).toLocaleString("fa-IR")}`;

  return (
    <div className={slideClassName} style={getSlideStyle(slideWidthPx)}>
      {useProgressiveFullLoad ? (
        <ProgressiveCachedFileImage
          accessUrl={accessUrl}
          loadFull={loadFullImage}
          alt={slideAlt}
          className={imageClassName}
          frameClassName={styles.progressiveImageFrame}
          draggable={false}
        />
      ) : (
        <CachedFileImage
          accessUrl={accessUrl}
          networkUrl={resolveFileAccessUrl(accessUrl, undefined, imageVariant)}
          fileId={accessUrl.fileId}
          variant={imageVariant}
          alt={slideAlt}
          className={imageClassName}
          draggable={false}
        />
      )}
    </div>
  );
}

export function ProductDetailCoverCarousel({
  title,
  coverImageAccessUrls,
  activeIndex,
  onActiveIndexChange,
  variant = "hero",
  onActivate,
  placeholderIcon,
}: ProductDetailCoverCarouselProps): ReactElement {
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [slideWidthPx, setSlideWidthPx] = useState(0);
  const [enableTrackTransition, setEnableTrackTransition] = useState(false);
  const [loadedFullIndices, setLoadedFullIndices] = useState<Set<number>>(() => new Set());
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState>(INITIAL_DRAG_STATE);

  const imageCount = coverImageAccessUrls.length;
  const safeIndex = Math.min(activeIndex, Math.max(imageCount - 1, 0));
  const hasMultipleImages = imageCount > 1;
  const isViewer = variant === "viewer";
  const imageVariant: FileAccessUrlVariant = "thumbnail";
  const carouselClassName = isViewer ? styles.imageViewerCarousel : styles.galleryCarousel;
  const trackClassName = isViewer ? styles.imageViewerCarouselTrack : styles.galleryCarouselTrack;
  const trackDraggingClassName = isViewer
    ? styles.imageViewerCarouselTrackDragging
    : styles.galleryCarouselTrackDragging;
  const slideClassName =
    (isViewer ? styles.imageViewerCarouselSlide : styles.galleryCarouselSlide) ?? "";
  const imageClassName = (isViewer ? styles.imageViewerImage : styles.heroCoverImage) ?? "";
  const placeholderClassName = styles.carouselPlaceholder ?? "";

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
    setDragOffsetX(0);
    setIsDragging(false);
    setEnableTrackTransition(false);
    dragStateRef.current = INITIAL_DRAG_STATE;
  }, [coverImageAccessUrls]);

  useEffect(() => {
    if (!isViewer) {
      setLoadedFullIndices(new Set());
      return;
    }

    setLoadedFullIndices(new Set([safeIndex]));
  }, [coverImageAccessUrls, isViewer]);

  useEffect(() => {
    if (!isViewer) {
      return;
    }

    setLoadedFullIndices((current) => {
      if (current.has(safeIndex)) {
        return current;
      }

      const next = new Set(current);
      next.add(safeIndex);
      return next;
    });
  }, [isViewer, safeIndex]);

  const goToIndex = useCallback(
    (nextIndex: number): void => {
      if (!hasMultipleImages) {
        return;
      }

      const clampedIndex = Math.max(0, Math.min(imageCount - 1, nextIndex));
      if (clampedIndex === safeIndex) {
        return;
      }

      setDragOffsetX(0);
      setIsDragging(false);
      onActiveIndexChange(clampedIndex);
    },
    [hasMultipleImages, imageCount, onActiveIndexChange, safeIndex]
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

    viewportRef.current?.releasePointerCapture(event.pointerId);

    if (dragState.isHorizontal && Math.abs(dragState.offsetX) >= SWIPE_COMMIT_PX) {
      if (dragState.offsetX > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
      resetDrag();
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    const isTap =
      !dragState.decided ||
      (Math.abs(deltaX) < SWIPE_CANCEL_CLICK_PX && Math.abs(deltaY) < SWIPE_CANCEL_CLICK_PX);

    if (isTap) {
      onActivate?.();
    }

    resetDrag();
  };

  const baseOffsetPx = getTrackOffsetPx(safeIndex, imageCount, slideWidthPx);
  const trackTransform = `translate3d(${Math.round(baseOffsetPx + dragOffsetX)}px, 0, 0)`;

  if (imageCount === 0) {
    return <div className={carouselClassName} />;
  }

  if (imageCount === 1) {
    const accessUrl = coverImageAccessUrls[0];

    return (
      <div
        className={carouselClassName}
        onClick={onActivate}
        onKeyDown={
          onActivate
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onActivate();
                }
              }
            : undefined
        }
        role={onActivate ? "button" : undefined}
        tabIndex={onActivate ? 0 : undefined}
      >
        {accessUrl ? (
          isViewer ? (
            <ProgressiveCachedFileImage
              accessUrl={accessUrl}
              loadFull={loadedFullIndices.has(0)}
              alt={title}
              className={imageClassName}
              frameClassName={styles.progressiveImageFrame}
              draggable={false}
            />
          ) : (
            <CachedFileImage
              accessUrl={accessUrl}
              networkUrl={resolveFileAccessUrl(accessUrl, undefined, imageVariant)}
              variant={imageVariant}
              alt={title}
              className={imageClassName}
              draggable={false}
            />
          )
        ) : (
          <div className={placeholderClassName} aria-hidden="true">
            {placeholderIcon}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      className={carouselClassName}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <div
        className={`${trackClassName}${
          isDragging || !enableTrackTransition ? ` ${trackDraggingClassName}` : ""
        }`}
        style={getTrackStyle(slideWidthPx, imageCount, trackTransform)}
      >
        {[...coverImageAccessUrls].reverse().map((accessUrl, reverseIndex) => {
          const slideIndex = imageCount - 1 - reverseIndex;

          return (
            <ProductDetailCoverSlide
              key={accessUrl?.fileId ?? `slide-${slideIndex}`}
              accessUrl={accessUrl}
              title={title}
              slideIndex={slideIndex}
              slideWidthPx={slideWidthPx}
              imageClassName={imageClassName}
              slideClassName={slideClassName}
              placeholderClassName={placeholderClassName}
              placeholderIcon={placeholderIcon}
              imageVariant={imageVariant}
              useProgressiveFullLoad={isViewer}
              loadFullImage={loadedFullIndices.has(slideIndex)}
            />
          );
        })}
      </div>
    </div>
  );
}
