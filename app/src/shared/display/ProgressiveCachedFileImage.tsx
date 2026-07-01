import type { ImgHTMLAttributes, ReactElement } from "react";

import { useCachedFileAccessUrl } from "../../hooks/useCachedFileAccessUrl";
import type { FileAccessUrl } from "../../utils/fileAccessUrl.util";

type ProgressiveCachedFileImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src"
> & {
  readonly accessUrl?: FileAccessUrl | null;
  readonly loadFull?: boolean;
  readonly frameClassName?: string;
};

export function ProgressiveCachedFileImage({
  accessUrl,
  loadFull = false,
  alt,
  className,
  frameClassName,
  draggable,
}: ProgressiveCachedFileImageProps): ReactElement | null {
  const { url: thumbnailUrl } = useCachedFileAccessUrl(accessUrl, {
    enabled: accessUrl != null,
    variant: "thumbnail",
  });
  const { url: fullUrl, isLoading: isFullLoading } = useCachedFileAccessUrl(accessUrl, {
    enabled: loadFull && accessUrl != null,
    variant: "full",
  });
  const showFullImage = loadFull && Boolean(fullUrl) && !isFullLoading;
  const showThumbnail = Boolean(thumbnailUrl) && !showFullImage;

  if (!showThumbnail && !showFullImage) {
    return null;
  }

  return (
    <div className={frameClassName}>
      {showThumbnail ? (
        <img
          src={thumbnailUrl ?? undefined}
          alt={showFullImage ? "" : alt}
          className={className}
          draggable={draggable}
          aria-hidden={showFullImage ? true : undefined}
        />
      ) : null}
      {showFullImage ? (
        <img
          src={fullUrl ?? undefined}
          alt={alt}
          className={className}
          draggable={draggable}
        />
      ) : null}
    </div>
  );
}
