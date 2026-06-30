import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Dialog, IconButton } from "@mui/material";
import type { ReactElement, ReactNode } from "react";

import type { FileAccessUrl } from "../../utils/fileAccessUrl.util";
import { ProductDetailCoverCarousel } from "./ProductDetailCoverCarousel";
import { ProductDetailCoverThumbnails } from "./ProductDetailCoverThumbnails";
import styles from "./styles/ProductDetail.module.scss";

type ProductDetailImageViewerDialogProps = {
  readonly open: boolean;
  readonly title: string;
  readonly coverImageAccessUrls: readonly (FileAccessUrl | null)[];
  readonly activeIndex: number;
  readonly onActiveIndexChange: (index: number) => void;
  readonly onClose: () => void;
  readonly placeholderIcon?: ReactNode;
  readonly footer?: ReactNode;
};

export function ProductDetailImageViewerDialog({
  open,
  title,
  coverImageAccessUrls,
  activeIndex,
  onActiveIndexChange,
  onClose,
  placeholderIcon,
  footer,
}: ProductDetailImageViewerDialogProps): ReactElement {
  const safeIndex = Math.min(activeIndex, Math.max(coverImageAccessUrls.length - 1, 0));
  const hasMultipleImages = coverImageAccessUrls.length > 1;

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      aria-labelledby="product-image-viewer-title"
      PaperProps={{ className: styles.mediaDialogPaper }}
    >
      <div className={styles.imageViewerDialogLayout}>
        <header className={styles.mediaDialogHeader}>
          <strong id="product-image-viewer-title">{title}</strong>
          <IconButton
            type="button"
            size="small"
            className={styles.mediaDialogCloseButton}
            aria-label="بستن نمایش تصویر"
            onClick={onClose}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </header>

        <div className={styles.imageViewerDialogStage}>
          <ProductDetailCoverCarousel
            variant="viewer"
            title={title}
            coverImageAccessUrls={coverImageAccessUrls}
            activeIndex={safeIndex}
            onActiveIndexChange={onActiveIndexChange}
            placeholderIcon={placeholderIcon}
          />
        </div>

        {hasMultipleImages ? (
          <ProductDetailCoverThumbnails
            title={title}
            coverImageAccessUrls={coverImageAccessUrls}
            activeIndex={safeIndex}
            onSelect={onActiveIndexChange}
            className={styles.imageViewerDialogThumbnails}
            thumbClassName={styles.imageViewerDialogThumb}
            thumbActiveClassName={styles.imageViewerDialogThumbActive}
            thumbImageClassName={styles.imageViewerDialogThumbImage}
          />
        ) : null}

        {footer ? <div className={styles.setPieceViewerDetails}>{footer}</div> : null}
      </div>
    </Dialog>
  );
}
