import type { ImgHTMLAttributes, ReactElement } from "react";

import { useCachedFileAccessUrl, useCachedFileUrl } from "../../hooks/useCachedFileAccessUrl";
import {
  pickFileAccessUrlDescriptor,
  type FileAccessUrl,
  type FileAccessUrlVariant,
} from "../../utils/fileAccessUrl.util";

type CachedFileImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  readonly accessUrl?: FileAccessUrl | null;
  readonly networkUrl?: string | null;
  readonly fileId?: string | null;
  /** When false, skips sqlite fetch/cache resolution for this image. */
  readonly cacheEnabled?: boolean;
  readonly variant?: FileAccessUrlVariant;
};

export function CachedFileImage({
  accessUrl,
  networkUrl,
  fileId,
  alt,
  cacheEnabled = true,
  variant = "thumbnail",
  ...imageProps
}: CachedFileImageProps): ReactElement | null {
  const displayAccessUrl = pickFileAccessUrlDescriptor(accessUrl, variant);
  const fromAccess = useCachedFileAccessUrl(displayAccessUrl, {
    enabled: cacheEnabled && displayAccessUrl != null,
  });
  const fromUrl = useCachedFileUrl({
    fileId,
    networkUrl,
    enabled: cacheEnabled && displayAccessUrl == null,
  });
  const resolved = displayAccessUrl != null ? fromAccess : fromUrl;

  if (!cacheEnabled || !resolved.url) {
    return null;
  }

  return <img {...imageProps} src={resolved.url} alt={alt} />;
}
