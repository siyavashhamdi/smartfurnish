import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Button } from "@mui/material";
import { useCallback, type ReactElement } from "react";

import { getGallerySlideKey } from "./cover-gallery.util";
import { ProductFormCoverCarousel } from "./ProductFormCoverCarousel";
import { ProductFormCoverCarouselNav } from "./ProductFormCoverCarouselNav";
import ProductFormCoverSlide from "./ProductFormCoverSlide";
import { ProductFormCoverThumbnails } from "./ProductFormCoverThumbnails";
import { createDraftCoverImage } from "./product-form.state.util";
import type { DraftGalleryImage } from "./types";
import { useProductFormImageGallery } from "./useProductFormImageGallery";
import {
  useProductFormImageGalleryLabels,
  type ProductFormImageGalleryVariant,
} from "./useProductFormImageGalleryLabels";
import styles from "./styles/ProductFormCoverGallery.module.scss";

type ProductFormCoverGalleryProps<T extends DraftGalleryImage = DraftGalleryImage> = {
  readonly title: string;
  readonly coverImages: T[];
  readonly onCoverImagesChange: (images: T[]) => void;
  readonly getCoverUploadFieldId: (imageId: string) => string;
  readonly uploadingFieldIds: ReadonlySet<string>;
  readonly getFieldUploadPercent: (fieldId: string) => number | null;
  readonly imageGalleryVariant?: ProductFormImageGalleryVariant;
  readonly createEmptyImage?: () => T;
  readonly className?: string;
  readonly embedded?: boolean;
};

export function ProductFormCoverGallery<T extends DraftGalleryImage = DraftGalleryImage>({
  title,
  coverImages,
  onCoverImagesChange,
  getCoverUploadFieldId,
  uploadingFieldIds,
  getFieldUploadPercent,
  imageGalleryVariant = "cover",
  createEmptyImage = createDraftCoverImage as () => T,
  className,
  embedded = false,
}: ProductFormCoverGalleryProps<T>): ReactElement {
  const labels = useProductFormImageGalleryLabels(imageGalleryVariant);
  const {
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
  } = useProductFormImageGallery({
    title,
    images: coverImages,
    onImagesChange: onCoverImagesChange,
    createEmptyImage,
    labels,
  });

  const renderSlide = useCallback(
    (slideIndex: number): ReactElement => {
      const image = coverImages[slideIndex];
      if (!image) {
        return <div className={styles.slideUploader} />;
      }

      return (
        <ProductFormCoverSlide
          image={image}
          slideIndex={slideIndex}
          displayTitle={displayTitle}
          imageCount={slideCount}
          images={coverImages}
          onImagesChange={onCoverImagesChange}
          onRemoveImage={handleRemoveImage}
          getUploadFieldId={getCoverUploadFieldId}
          uploadingFieldIds={uploadingFieldIds}
          getFieldUploadPercent={getFieldUploadPercent}
          labels={labels}
        />
      );
    },
    [
      coverImages,
      displayTitle,
      getCoverUploadFieldId,
      getFieldUploadPercent,
      handleRemoveImage,
      labels,
      onCoverImagesChange,
      slideCount,
      uploadingFieldIds,
    ]
  );

  return (
    <div
      className={[styles.gallery, embedded && styles.galleryEmbedded, className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.galleryMain}>
        <ProductFormCoverCarousel
          slideCount={slideCount}
          activeIndex={safeIndex}
          onActiveIndexChange={setActiveIndex}
          getSlideKey={(slideIndex) => getGallerySlideKey(coverImages, slideIndex)}
          renderSlide={renderSlide}
        />
        {hasMultipleSlides ? (
          <ProductFormCoverCarouselNav
            safeIndex={safeIndex}
            slideCount={slideCount}
            onPrevious={goToPrevious}
            onNext={goToNext}
          />
        ) : null}
      </div>

      <ProductFormCoverThumbnails
        title={displayTitle}
        images={coverImages}
        activeIndex={safeIndex}
        onSelect={setActiveIndex}
        onReorder={handleReorder}
        labels={labels}
      />

      <div className={styles.footer}>
        <Button
          size="small"
          startIcon={<AddRoundedIcon />}
          disabled={!canAddImage}
          onClick={handleAddImage}
        >
          {labels.addButton}
        </Button>
      </div>
    </div>
  );
}

export default ProductFormCoverGallery;
