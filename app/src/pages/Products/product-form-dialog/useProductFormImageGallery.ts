import { useCallback, useEffect, useState } from "react";

import { clampCarouselIndex } from "../carousel-track.util";
import {
  canAddGallerySlot,
  findGalleryIndexById,
  removeGalleryImage,
} from "./cover-gallery.util";
import type { DraftGalleryImage } from "./types";
import type { ProductFormImageGalleryLabels } from "./useProductFormImageGalleryLabels";

type UseProductFormImageGalleryArgs<T extends DraftGalleryImage> = {
  readonly title: string;
  readonly images: T[];
  readonly onImagesChange: (images: T[]) => void;
  readonly createEmptyImage: () => T;
  readonly labels: ProductFormImageGalleryLabels;
};

export function useProductFormImageGallery<T extends DraftGalleryImage>({
  title,
  images,
  onImagesChange,
  createEmptyImage,
  labels,
}: UseProductFormImageGalleryArgs<T>) {
  const [activeIndex, setActiveIndex] = useState(0);

  const slideCount = images.length;
  const safeIndex = clampCarouselIndex(activeIndex, slideCount);
  const hasMultipleSlides = slideCount > 1;
  const displayTitle = title.trim() || labels.defaultTitle;
  const canAddImage = canAddGallerySlot(images);

  useEffect(() => {
    setActiveIndex((current) => clampCarouselIndex(current, slideCount));
  }, [slideCount]);

  const goToIndex = useCallback(
    (nextIndex: number): void => {
      if (!hasMultipleSlides) {
        return;
      }

      const clampedIndex = clampCarouselIndex(nextIndex, slideCount);
      if (clampedIndex === safeIndex) {
        return;
      }

      setActiveIndex(clampedIndex);
    },
    [hasMultipleSlides, safeIndex, slideCount]
  );

  const goToPrevious = useCallback((): void => {
    goToIndex(safeIndex - 1);
  }, [goToIndex, safeIndex]);

  const goToNext = useCallback((): void => {
    goToIndex(safeIndex + 1);
  }, [goToIndex, safeIndex]);

  const handleAddImage = useCallback((): void => {
    if (!canAddImage) {
      return;
    }

    const nextImages = [...images, createEmptyImage()];
    onImagesChange(nextImages);
    setActiveIndex(nextImages.length - 1);
  }, [canAddImage, createEmptyImage, images, onImagesChange]);

  const handleRemoveImage = useCallback(
    (imageId: string, slideIndex: number): void => {
      if (images.length <= 1) {
        return;
      }

      const nextImages = removeGalleryImage(images, imageId);
      onImagesChange(nextImages);
      setActiveIndex(Math.min(slideIndex, nextImages.length - 1));
    },
    [images, onImagesChange]
  );

  const handleReorder = useCallback(
    (nextImages: T[]): void => {
      const activeImageId = images[safeIndex]?.id;
      onImagesChange(nextImages);

      const nextActiveIndex = findGalleryIndexById(nextImages, activeImageId);
      if (nextActiveIndex >= 0) {
        setActiveIndex(nextActiveIndex);
      }
    },
    [images, onImagesChange, safeIndex]
  );

  return {
    safeIndex,
    slideCount,
    hasMultipleSlides,
    displayTitle,
    canAddImage,
    setActiveIndex,
    goToPrevious,
    goToNext,
    handleAddImage,
    handleRemoveImage,
    handleReorder,
  };
}
