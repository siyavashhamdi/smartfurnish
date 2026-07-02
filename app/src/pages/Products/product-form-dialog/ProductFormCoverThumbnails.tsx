import { useEffect, useRef, type DragEvent, type ReactElement } from "react";

import { CachedFileImage } from "../../../shared/display/CachedFileImage";
import { useCachedFileAccessUrl } from "../../../hooks/useCachedFileAccessUrl";
import { joinClassNames } from "../carousel-track.util";
import { resolveFileAccessUrl } from "../../../utils/fileAccessUrl.util";
import { formatGalleryImageOrdinal } from "./cover-gallery.util";
import type { ProductFormImageGalleryLabels } from "./useProductFormImageGalleryLabels";
import type { DraftGalleryImage } from "./types";
import {
  useCoverThumbnailReorder,
  useSuppressClickAfterDrag,
  type InsertHint,
} from "./useCoverThumbnailReorder";
import { useCoverThumbPreview } from "./useCoverThumbPreview";
import styles from "./styles/ProductFormCoverGallery.module.scss";

type ProductFormCoverThumbnailsProps<T extends DraftGalleryImage = DraftGalleryImage> = {
  readonly title: string;
  readonly images: readonly T[];
  readonly activeIndex: number;
  readonly onSelect: (index: number) => void;
  readonly onReorder: (images: T[]) => void;
  readonly labels: ProductFormImageGalleryLabels;
};

type ProductFormCoverThumbnailItemProps<T extends DraftGalleryImage> = {
  readonly image: T;
  readonly title: string;
  readonly index: number;
  readonly isActive: boolean;
  readonly isDragging: boolean;
  readonly insertHint: InsertHint | null;
  readonly onSelect: () => void;
  readonly activeThumbRef?: React.RefObject<HTMLButtonElement | null>;
  readonly onDragStart: (event: DragEvent<HTMLButtonElement>) => void;
  readonly onDragEnd: () => void;
  readonly onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  readonly onDrop: (event: DragEvent<HTMLDivElement>) => void;
};

function ProductFormCoverThumbnailItem<T extends DraftGalleryImage>({
  image,
  title,
  index,
  isActive,
  isDragging,
  insertHint,
  onSelect,
  activeThumbRef,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: ProductFormCoverThumbnailItemProps<T>): ReactElement {
  const { handleClick, handleDragEnd } = useSuppressClickAfterDrag(onDragEnd);
  const filePreviewUrl = useCoverThumbPreview(image.file);
  const networkUrl = resolveFileAccessUrl(image.accessUrl, undefined, "thumbnail");
  const { url: cachedUrl } = useCachedFileAccessUrl(image.accessUrl, { variant: "thumbnail" });
  const thumbUrl = filePreviewUrl ?? cachedUrl;
  const imageOrdinal = formatGalleryImageOrdinal(index);
  const imageLabel = `تصویر ${imageOrdinal}`;
  const imageAlt = `${title} — ${imageLabel}`;

  return (
    <div
      className={joinClassNames(
        styles.thumbItem,
        isDragging && styles.thumbItemDragging,
        insertHint?.targetId === image.id &&
          !insertHint.insertAfter &&
          styles.thumbItemInsertBefore,
        insertHint?.targetId === image.id && insertHint.insertAfter && styles.thumbItemInsertAfter
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <button
        ref={isActive ? activeThumbRef : undefined}
        type="button"
        draggable
        role="tab"
        aria-selected={isActive}
        aria-label={imageLabel}
        className={joinClassNames(styles.thumbButton, isActive && styles.thumbButtonActive)}
        onClick={() => handleClick(onSelect)}
        onDragStart={onDragStart}
        onDragEnd={handleDragEnd}
      >
        {thumbUrl && (image.file || image.accessUrl) ? (
          image.file ? (
            <img src={thumbUrl} alt={imageAlt} className={styles.thumbImage} draggable={false} />
          ) : (
            <CachedFileImage
              accessUrl={image.accessUrl}
              networkUrl={networkUrl}
              variant="thumbnail"
              alt={imageAlt}
              className={styles.thumbImage}
            />
          )
        ) : (
          <span className={styles.thumbPlaceholder} />
        )}
      </button>
    </div>
  );
}

export function ProductFormCoverThumbnails<T extends DraftGalleryImage = DraftGalleryImage>({
  title,
  images,
  activeIndex,
  onSelect,
  onReorder,
  labels,
}: ProductFormCoverThumbnailsProps<T>): ReactElement {
  const activeThumbRef = useRef<HTMLButtonElement | null>(null);
  const { draggedId, insertHint, clearDragState, handleDragStart, applyReorder } =
    useCoverThumbnailReorder({ images, onReorder });

  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [activeIndex]);

  return (
    <div className={styles.thumbnailsSection}>
      <span className={styles.thumbnailsHint}>{labels.thumbnailsHint}</span>
      <div
        className={joinClassNames(styles.thumbnails, draggedId && styles.thumbnailsDragging)}
        role="tablist"
        aria-label={labels.thumbnailsAriaLabel}
      >
        {images.map((image, index) => (
          <ProductFormCoverThumbnailItem
            key={image.id}
            image={image}
            title={title}
            index={index}
            isActive={index === activeIndex}
            isDragging={draggedId === image.id}
            insertHint={insertHint}
            onSelect={() => onSelect(index)}
            activeThumbRef={activeThumbRef}
            onDragStart={(event) => handleDragStart(event, image.id)}
            onDragEnd={clearDragState}
            onDragOver={(event) => applyReorder(event, image.id, false)}
            onDrop={(event) => applyReorder(event, image.id, true)}
          />
        ))}
      </div>
    </div>
  );
}
