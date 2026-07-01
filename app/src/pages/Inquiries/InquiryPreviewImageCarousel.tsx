import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import { Chip, IconButton, Stack } from "@mui/material";
import { useEffect, useMemo, useState, type ReactElement } from "react";

import { ProductDetailCoverCarousel } from "../Products/ProductDetailCoverCarousel";
import { ProductDetailImageViewerDialog } from "../Products/ProductDetailImageViewerDialog";
import { normalizeFabricHexColor } from "../Products/fabric-selection.util";
import type { UserProductInquiryDetailPreview } from "./inquiry-detail.api";
import { useTranslation } from "../../hooks/useTranslation";
import type { FileAccessUrl } from "../../utils/fileAccessUrl.util";
import productStyles from "../Products/styles/ProductDetail.module.scss";
import styles from "./styles/InquiryViewModal.module.scss";

type PreviewCarouselSlide = {
  readonly key: string;
  readonly label: string;
  readonly accessUrl: FileAccessUrl;
};

type InquiryPreviewImageCarouselProps = {
  readonly preview: UserProductInquiryDetailPreview;
  readonly title: string;
};

function buildPreviewSlides(
  preview: UserProductInquiryDetailPreview,
  labels: {
    readonly resultFile: string;
    readonly environmentFile: string;
    readonly sourceProductImageFile: string;
  },
): readonly PreviewCarouselSlide[] {
  const candidates: readonly (PreviewCarouselSlide | null)[] = [
    preview.resultFileAccessUrl
      ? {
          key: "result",
          label: labels.resultFile,
          accessUrl: preview.resultFileAccessUrl,
        }
      : null,
    preview.environmentFileAccessUrl
      ? {
          key: "environment",
          label: labels.environmentFile,
          accessUrl: preview.environmentFileAccessUrl,
        }
      : null,
    preview.sourceProductImageFileAccessUrl
      ? {
          key: "source-product",
          label: labels.sourceProductImageFile,
          accessUrl: preview.sourceProductImageFileAccessUrl,
        }
      : null,
  ];

  return candidates.filter((slide): slide is PreviewCarouselSlide => slide != null);
}

function InquiryPreviewImageCarousel({
  preview,
  title,
}: InquiryPreviewImageCarouselProps): ReactElement | null {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const slides = useMemo(
    () =>
      buildPreviewSlides(preview, {
        resultFile: t("pages.inquiries.viewModal.fields.resultFile"),
        environmentFile: t("pages.inquiries.viewModal.fields.environmentFile"),
        sourceProductImageFile: t("pages.inquiries.viewModal.fields.sourceProductImageFile"),
      }),
    [preview, t],
  );

  const slideCount = slides.length;
  const safeIndex = Math.min(activeIndex, Math.max(slideCount - 1, 0));
  const hasMultipleSlides = slideCount > 1;
  const activeSlide = slides[safeIndex];
  const coverImageAccessUrls = useMemo(
    () => slides.map((slide) => slide.accessUrl),
    [slides],
  );
  const viewerTitle = activeSlide ? `${title} — ${activeSlide.label}` : title;
  const fabricPatternName = preview.fabric.patternName.trim();
  const fabricColorName = preview.fabric.colorName.trim();
  const fabricColorHex = normalizeFabricHexColor(preview.fabric.colorHex ?? null);

  useEffect(() => {
    setActiveIndex(0);
    setIsViewerOpen(false);
  }, [
    preview.resultFileId,
    preview.environmentFileId,
    preview.sourceProductImageFileId,
    preview.generatedAt,
  ]);

  if (!activeSlide) {
    return null;
  }

  const goToPrevious = (): void => {
    if (!hasMultipleSlides || safeIndex <= 0) {
      return;
    }

    setActiveIndex(safeIndex - 1);
  };

  const goToNext = (): void => {
    if (!hasMultipleSlides || safeIndex >= slideCount - 1) {
      return;
    }

    setActiveIndex(safeIndex + 1);
  };

  return (
    <>
      <div className={styles.previewCarousel}>
        <div
          className={`${productStyles.galleryMain} ${productStyles.galleryMainExpandable} ${styles.previewCarouselStage}`}
        >
          <ProductDetailCoverCarousel
            title={title}
            coverImageAccessUrls={coverImageAccessUrls}
            activeIndex={safeIndex}
            onActiveIndexChange={setActiveIndex}
            onActivate={() => setIsViewerOpen(true)}
            placeholderIcon={<ImageNotSupportedOutlinedIcon />}
          />
          <Stack
            direction="row"
            spacing={0.5}
            className={styles.previewCarouselSlideTag}
            useFlexGap
            flexWrap="wrap"
          >
            <Chip
              className={styles.previewCarouselTag}
              label={activeSlide.label}
              size="small"
              variant="filled"
            />
          </Stack>
          <Stack
            direction="row"
            spacing={0.5}
            className={styles.previewCarouselFabricTags}
            useFlexGap
            flexWrap="wrap"
          >
            {fabricPatternName ? (
              <Chip
                className={styles.previewCarouselTag}
                label={fabricPatternName}
                size="small"
                variant="filled"
              />
            ) : null}
            {fabricColorName ? (
              <Chip
                className={styles.previewCarouselTag}
                label={
                  <Stack direction="row" spacing={0.5} alignItems="center" component="span">
                    <span>{fabricColorName}</span>
                    <span
                      className={styles.previewCarouselColorSwatch}
                      style={{
                        backgroundColor: fabricColorHex ?? "transparent",
                      }}
                    />
                  </Stack>
                }
                size="small"
                variant="filled"
              />
            ) : null}
          </Stack>
          {hasMultipleSlides ? (
            <div className={productStyles.galleryCarouselControls}>
              <IconButton
                type="button"
                size="small"
                className={productStyles.galleryCarouselNavButton}
                aria-label={t("pages.inquiries.viewModal.previewCarousel.nextImage")}
                disabled={safeIndex >= slideCount - 1}
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
                className={productStyles.galleryCarouselNavButton}
                aria-label={t("pages.inquiries.viewModal.previewCarousel.previousImage")}
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
      </div>

      <ProductDetailImageViewerDialog
        open={isViewerOpen}
        title={viewerTitle}
        coverImageAccessUrls={coverImageAccessUrls}
        activeIndex={safeIndex}
        onActiveIndexChange={setActiveIndex}
        onClose={() => setIsViewerOpen(false)}
        placeholderIcon={<ImageNotSupportedOutlinedIcon />}
      />
    </>
  );
}

export default InquiryPreviewImageCarousel;
