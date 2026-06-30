import { useEffect, useMemo, useState, type ReactElement } from "react";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import { IconButton } from "@mui/material";

import { ProductDetailCoverCarousel } from "./ProductDetailCoverCarousel";
import { ProductDetailCoverThumbnails } from "./ProductDetailCoverThumbnails";
import { ProductDetailImageViewerDialog } from "./ProductDetailImageViewerDialog";
import {
  buildSetPieceSlideEntries,
  buildSetPieceSpecLine,
  getSetPieceCoverUrls,
} from "./set-piece-gallery.util";
import type { ProductSetPieceRow } from "./product-list.api";
import styles from "./styles/ProductDetail.module.scss";

type ProductSetPiecesGalleryProps = {
  readonly title: string;
  readonly setPieces: readonly ProductSetPieceRow[];
};

function SetPieceCoverDetails({
  setPiece,
  variant,
}: {
  readonly setPiece: ProductSetPieceRow;
  readonly variant: "overlay" | "viewer";
}): ReactElement {
  const specLine = buildSetPieceSpecLine(setPiece);
  const isOverlay = variant === "overlay";

  return (
    <>
      {isOverlay ? <h4>{setPiece.name}</h4> : null}
      {setPiece.description?.trim() ? <p>{setPiece.description.trim()}</p> : null}
      {specLine ? (
        <p className={isOverlay ? styles.setPiecesCoverSpecs : styles.setPieceViewerSpecs}>
          {specLine}
        </p>
      ) : null}
    </>
  );
}

export function ProductSetPiecesGallery({
  title,
  setPieces,
}: ProductSetPiecesGalleryProps): ReactElement {
  const slideEntries = useMemo(() => buildSetPieceSlideEntries(setPieces), [setPieces]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const safeIndex = Math.min(activeIndex, Math.max(slideEntries.length - 1, 0));
  const activeEntry = slideEntries[safeIndex];
  const coverImageAccessUrls = useMemo(
    () => getSetPieceCoverUrls(slideEntries),
    [slideEntries]
  );
  const hasMultipleSlides = slideEntries.length > 1;

  useEffect(() => {
    setActiveIndex(0);
    setIsViewerOpen(false);
  }, [slideEntries]);

  if (slideEntries.length === 0 || !activeEntry) {
    return (
      <p className={styles.emptyCatalogMessage}>قطعه‌ای برای این محصول ثبت نشده است.</p>
    );
  }

  const activeSetPiece = activeEntry.setPiece;

  const goToPrevious = (): void => {
    if (!hasMultipleSlides || safeIndex <= 0) {
      return;
    }
    setActiveIndex(safeIndex - 1);
  };

  const goToNext = (): void => {
    if (!hasMultipleSlides || safeIndex >= slideEntries.length - 1) {
      return;
    }
    setActiveIndex(safeIndex + 1);
  };

  return (
    <>
      <div className={styles.setPiecesGallery}>
        <div className={`${styles.setPiecesCoverWrap} ${styles.galleryMainExpandable}`}>
          <ProductDetailCoverCarousel
            title={title}
            coverImageAccessUrls={coverImageAccessUrls}
            activeIndex={safeIndex}
            onActiveIndexChange={setActiveIndex}
            onActivate={() => setIsViewerOpen(true)}
            placeholderIcon={<ViewModuleRoundedIcon />}
          />

          {hasMultipleSlides ? (
            <div className={styles.setPiecesCarouselControls}>
              <IconButton
                type="button"
                size="small"
                className={styles.setPiecesCarouselNavButton}
                aria-label="تصویر بعدی"
                disabled={safeIndex >= slideEntries.length - 1}
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
                className={styles.setPiecesCarouselNavButton}
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

          <div className={styles.setPiecesCoverContent}>
            <SetPieceCoverDetails setPiece={activeSetPiece} variant="overlay" />
          </div>
        </div>

        {hasMultipleSlides ? (
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
        title={activeSetPiece.name}
        coverImageAccessUrls={coverImageAccessUrls}
        activeIndex={safeIndex}
        onActiveIndexChange={setActiveIndex}
        onClose={() => setIsViewerOpen(false)}
        placeholderIcon={<ViewModuleRoundedIcon />}
        footer={<SetPieceCoverDetails setPiece={activeSetPiece} variant="viewer" />}
      />
    </>
  );
}
