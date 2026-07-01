import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Alert, Chip, Dialog, IconButton, Paper, Typography } from "@mui/material";
import { memo, useCallback, useState, type ReactElement } from "react";

import { PRODUCT_AI_PREVIEW_RESULT_DISCLAIMER } from "./product-ai-preview.constants";
import detailStyles from "./styles/ProductDetail.module.scss";
import styles from "./styles/ProductAiPreviewResult.module.scss";

type ProductAiPreviewResultProps = {
  readonly imageUrl: string;
  readonly productTitle: string;
  readonly fabricLabel: string;
};

function ProductAiPreviewResultInner({
  imageUrl,
  productTitle,
  fabricLabel,
}: ProductAiPreviewResultProps): ReactElement {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const viewerTitle = `${productTitle} — ${fabricLabel}`;

  const handleOpenViewer = useCallback((): void => {
    setIsViewerOpen(true);
  }, []);

  const handleCloseViewer = useCallback((): void => {
    setIsViewerOpen(false);
  }, []);

  return (
    <>
      <div className={styles.root}>
        <Paper className={styles.resultCard} elevation={0}>
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
              onClick={handleOpenViewer}
            >
              <img
                alt="پیش‌نمایش هوشمند مبل در فضای خانه"
                className={styles.image}
                src={imageUrl}
              />
            </button>
          </div>

          <Alert
            className={styles.disclaimerBanner}
            icon={<AutoAwesomeRoundedIcon fontSize="inherit" />}
            severity="info"
          >
            {PRODUCT_AI_PREVIEW_RESULT_DISCLAIMER}
          </Alert>
        </Paper>
      </div>

      <Dialog
        fullScreen
        open={isViewerOpen}
        onClose={handleCloseViewer}
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
              onClick={handleCloseViewer}
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

export const ProductAiPreviewResult = memo(ProductAiPreviewResultInner);
