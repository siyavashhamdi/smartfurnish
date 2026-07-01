import type { ReactElement } from "react";

import { CachedFileImage } from "../../shared/display/CachedFileImage";
import { useCachedFileAccessUrl } from "../../hooks/useCachedFileAccessUrl";
import { resolveFileAccessUrl } from "../../utils/fileAccessUrl.util";
import type { FileAccessUrl } from "../../utils/fileAccessUrl.util";
import styles from "./styles/ProductDetail.module.scss";

type ProductDetailCoverThumbnailsProps = {
  readonly title: string;
  readonly coverImageAccessUrls: readonly (FileAccessUrl | null)[];
  readonly activeIndex: number;
  readonly onSelect: (index: number) => void;
  readonly className?: string;
  readonly thumbClassName?: string;
  readonly thumbActiveClassName?: string;
  readonly thumbImageClassName?: string;
  readonly thumbPlaceholderClassName?: string;
};

function ProductDetailCoverThumbnailButton({
  accessUrl,
  title,
  index,
  isActive,
  onSelect,
  thumbClassName,
  thumbActiveClassName,
  thumbImageClassName,
  thumbPlaceholderClassName,
}: {
  readonly accessUrl: FileAccessUrl | null;
  readonly title: string;
  readonly index: number;
  readonly isActive: boolean;
  readonly onSelect: () => void;
  readonly thumbClassName?: string;
  readonly thumbActiveClassName?: string;
  readonly thumbImageClassName?: string;
  readonly thumbPlaceholderClassName?: string;
}): ReactElement {
  const networkUrl = resolveFileAccessUrl(accessUrl, undefined, "thumbnail");
  const { url } = useCachedFileAccessUrl(accessUrl, { variant: "thumbnail" });
  const thumbClass = thumbClassName ?? styles.galleryThumb;
  const thumbActiveClass = thumbActiveClassName ?? styles.galleryThumbActive;
  const thumbImageClass = thumbImageClassName ?? styles.galleryThumbImage;
  const thumbPlaceholderClass = thumbPlaceholderClassName ?? styles.galleryThumbPlaceholder;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-label={`تصویر ${(index + 1).toLocaleString("fa-IR")}`}
      className={`${thumbClass}${isActive ? ` ${thumbActiveClass}` : ""}`}
      onClick={onSelect}
    >
      {url && accessUrl ? (
        <CachedFileImage
          accessUrl={accessUrl}
          networkUrl={networkUrl}
          variant="thumbnail"
          alt={`${title} — تصویر ${(index + 1).toLocaleString("fa-IR")}`}
          className={thumbImageClass}
        />
      ) : (
        <span className={thumbPlaceholderClass} />
      )}
    </button>
  );
}

export function ProductDetailCoverThumbnails({
  title,
  coverImageAccessUrls,
  activeIndex,
  onSelect,
  className,
  thumbClassName,
  thumbActiveClassName,
  thumbImageClassName,
  thumbPlaceholderClassName,
}: ProductDetailCoverThumbnailsProps): ReactElement {
  return (
    <div
      className={className ?? styles.galleryThumbnails}
      role="tablist"
      aria-label="تصاویر محصول"
    >
      {coverImageAccessUrls.map((accessUrl, index) => (
        <ProductDetailCoverThumbnailButton
          key={accessUrl?.fileId ?? `thumb-${index}`}
          accessUrl={accessUrl}
          title={title}
          index={index}
          isActive={index === activeIndex}
          onSelect={() => onSelect(index)}
          thumbClassName={thumbClassName}
          thumbActiveClassName={thumbActiveClassName}
          thumbImageClassName={thumbImageClassName}
          thumbPlaceholderClassName={thumbPlaceholderClassName}
        />
      ))}
    </div>
  );
}
