import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Chip, Dialog, IconButton, Paper, Typography } from "@mui/material";
import { useState, type ReactElement } from "react";

import detailStyles from "./styles/ProductDetail.module.scss";
import styles from "./styles/ProductAiPreviewResult.module.scss";

type ProductAiPreviewResultProps = {
  readonly imageUrl: string;
  readonly productTitle: string;
  readonly fabricLabel: string;
};

export function ProductAiPreviewResult({
  imageUrl,
  productTitle,
  fabricLabel,
}: ProductAiPreviewResultProps): ReactElement {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const viewerTitle = `${productTitle} — ${fabricLabel}`;

  return (
    <>
      <Paper className={styles.root} elevation={0}>
        <div className={styles.header}>
          <div className={styles.headerCopy}>
            <Typography component="h3" variant="subtitle1">
              پیش‌نمایش در فضای شما
            </Typography>
            <Typography className={styles.headerSubtext} variant="body2">
              {viewerTitle}
            </Typography>
          </div>
          <Chip className={styles.readyChip} label="آماده" size="small" variant="outlined" />
        </div>

        <div className={styles.imageStage}>
          <button
            type="button"
            className={styles.imageButton}
            aria-label="بزرگ‌نمایی پیش‌نمایش"
            onClick={() => setIsViewerOpen(true)}
          >
            <img
              alt="پیش‌نمایش هوشمند مبل در فضای خانه"
              className={styles.image}
              src={imageUrl}
            />
          </button>
        </div>
      </Paper>

      <Dialog
        fullScreen
        open={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        aria-labelledby="product-ai-preview-viewer-title"
        PaperProps={{ className: detailStyles.mediaDialogPaper }}
      >
        <div className={detailStyles.imageViewerDialogLayout}>
          <header className={detailStyles.mediaDialogHeader}>
            <strong id="product-ai-preview-viewer-title">{viewerTitle}</strong>
            <IconButton
              type="button"
              size="small"
              className={detailStyles.mediaDialogCloseButton}
              aria-label="بستن نمایش تصویر"
              onClick={() => setIsViewerOpen(false)}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </header>

          <div className={detailStyles.imageViewerDialogStage}>
            <div className={detailStyles.imageViewerCarousel}>
              <img
                alt="پیش‌نمایش هوشمند مبل در فضای خانه"
                className={detailStyles.imageViewerImage}
                src={imageUrl}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
