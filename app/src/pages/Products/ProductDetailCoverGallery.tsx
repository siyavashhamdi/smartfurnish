import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import WeekendRoundedIcon from "@mui/icons-material/WeekendRounded";
import { IconButton } from "@mui/material";
import { useEffect, useState, type ReactElement } from "react";

import { ProductDetailCoverCarousel } from "./ProductDetailCoverCarousel";
import { ProductDetailCoverThumbnails } from "./ProductDetailCoverThumbnails";
import { ProductDetailImageViewerDialog } from "./ProductDetailImageViewerDialog";
import type { FileAccessUrl } from "../../utils/fileAccessUrl.util";
import styles from "./styles/ProductDetail.module.scss";

type ProductDetailCoverGalleryProps = {
  readonly title: string;
  readonly coverImageAccessUrls: readonly FileAccessUrl[];
};

export function ProductDetailCoverGallery({
  title,
  coverImageAccessUrls,
}: ProductDetailCoverGalleryProps): ReactElement {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const safeIndex = Math.min(activeIndex, Math.max(coverImageAccessUrls.length - 1, 0));
  const hasMultipleImages = coverImageAccessUrls.length > 1;

  useEffect(() => {
    setActiveIndex(0);
    setIsViewerOpen(false);
  }, [coverImageAccessUrls]);

  if (coverImageAccessUrls.length === 0) {
    return (
      <div className={styles.heroMedia}>
        <div className={styles.heroGlow} />
        <WeekendRoundedIcon className={styles.heroIcon} />
      </div>
    );
  }

  const goToPrevious = (): void => {
    if (!hasMultipleImages || safeIndex <= 0) {
      return;
    }
    setActiveIndex(safeIndex - 1);
  };

  const goToNext = (): void => {
    if (!hasMultipleImages || safeIndex >= coverImageAccessUrls.length - 1) {
      return;
    }
    setActiveIndex(safeIndex + 1);
  };

  return (
    <>
      <div className={styles.gallery}>
        <div className={`${styles.galleryMain} ${styles.galleryMainExpandable}`}>
          <ProductDetailCoverCarousel
            title={title}
            coverImageAccessUrls={coverImageAccessUrls}
            activeIndex={safeIndex}
            onActiveIndexChange={setActiveIndex}
            onActivate={() => setIsViewerOpen(true)}
          />
          {hasMultipleImages ? (
            <div className={styles.galleryCarouselControls}>
              <IconButton
                type="button"
                size="small"
                className={styles.galleryCarouselNavButton}
                aria-label="تصویر بعدی"
                disabled={safeIndex >= coverImageAccessUrls.length - 1}
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
                className={styles.galleryCarouselNavButton}
                aria-label="تصویر قبلی"
                disabled={safeIndex <= 0}
                onClick={(event) => {
                  event.stopPropagation();
                  goToPrevious();
                }}
              >
                <ChevronRightRoundedIcon fontSize="small" />
              </IconButton>
            </div>
          ) : null}
        </div>
        {hasMultipleImages ? (
          <ProductDetailCoverThumbnails
            title={title}
            coverImageAccessUrls={coverImageAccessUrls}
            activeIndex={safeIndex}
            onSelect={setActiveIndex}
          />
        ) : null}
      </div>

      <ProductDetailImageViewerDialog
        open={isViewerOpen}
        title={title}
        coverImageAccessUrls={coverImageAccessUrls}
        activeIndex={safeIndex}
        onActiveIndexChange={setActiveIndex}
        onClose={() => setIsViewerOpen(false)}
      />
    </>
  );
}
