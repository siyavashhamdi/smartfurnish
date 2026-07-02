import type { DraftGalleryImage } from "./types";

export function isGallerySlotFilled(image: DraftGalleryImage): boolean {
  return image.file != null || image.accessUrl != null;
}

export function isPersistedGalleryImage(image: DraftGalleryImage): boolean {
  return image.accessUrl != null;
}

export function canAddGallerySlot(images: readonly DraftGalleryImage[]): boolean {
  const lastImage = images[images.length - 1];
  return lastImage != null && isGallerySlotFilled(lastImage);
}

export function updateGalleryImage<T extends DraftGalleryImage>(
  images: readonly T[],
  imageId: string,
  patch: Partial<T>
): T[] {
  return images.map((entry) => (entry.id === imageId ? { ...entry, ...patch } : entry));
}

export function removeGalleryImage<T extends DraftGalleryImage>(
  images: readonly T[],
  imageId: string
): T[] {
  return images.filter((entry) => entry.id !== imageId);
}

export function hasArrayOrderChanged<T extends { id: string }>(
  previous: readonly T[],
  next: readonly T[]
): boolean {
  return next.some((item, index) => item.id !== previous[index]?.id);
}

export function formatGalleryImageOrdinal(index: number): string {
  return (index + 1).toLocaleString("fa-IR");
}

export function getGallerySlideKey(
  images: readonly DraftGalleryImage[],
  slideIndex: number
): string {
  return images[slideIndex]?.id ?? `slide-${slideIndex}`;
}

export function findGalleryIndexById(
  images: readonly DraftGalleryImage[],
  imageId: string | undefined
): number {
  if (!imageId) {
    return -1;
  }

  return images.findIndex((image) => image.id === imageId);
}

// Backward-compatible aliases for cover-specific call sites.
export const isCoverSlotFilled = isGallerySlotFilled;
export const isPersistedCoverImage = isPersistedGalleryImage;
export const canAddCoverSlot = canAddGallerySlot;
export const updateCoverImage = updateGalleryImage;
export const removeCoverImage = removeGalleryImage;
export const formatCoverImageOrdinal = formatGalleryImageOrdinal;
export const getCoverSlideKey = getGallerySlideKey;
export const findCoverIndexById = findGalleryIndexById;
