import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Alert, Chip, Dialog, IconButton, Paper, Typography } from "@mui/material";
import { useState, type ReactElement } from "react";

import { ProductInPersonVisitButton } from "./ProductAiPreviewButtons";
import {
  PRODUCT_AI_PREVIEW_IN_PERSON_VISIT_DESCRIPTION,
  PRODUCT_AI_PREVIEW_IN_PERSON_VISIT_EYEBROW,
  PRODUCT_AI_PREVIEW_IN_PERSON_VISIT_TITLE,
  PRODUCT_AI_PREVIEW_RESULT_DISCLAIMER,
} from "./product-ai-preview.constants";
import detailStyles from "./styles/ProductDetail.module.scss";
import styles from "./styles/ProductAiPreviewResult.module.scss";

type ProductAiPreviewResultProps = {
  readonly imageUrl: string;
  readonly productTitle: string;
  readonly fabricLabel: string;
  readonly onInPersonVisitClick: () => void;
};

export function ProductAiPreviewResult({
  imageUrl,
  productTitle,
  fabricLabel,
  onInPersonVisitClick,
}: ProductAiPreviewResultProps): ReactElement {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const viewerTitle = `${productTitle} — ${fabricLabel}`;

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
              onClick={() => setIsViewerOpen(true)}
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

        <section
          className={styles.inPersonVisitSection}
          aria-labelledby="ai-preview-in-person-visit-title"
        >
          <div className={styles.inPersonVisitCopy}>
            <Typography className={styles.inPersonVisitEyebrow} component="p" variant="overline">
              {PRODUCT_AI_PREVIEW_IN_PERSON_VISIT_EYEBROW}
            </Typography>
            <Typography
              className={styles.inPersonVisitTitle}
              component="h4"
              id="ai-preview-in-person-visit-title"
              variant="h6"
            >
              {PRODUCT_AI_PREVIEW_IN_PERSON_VISIT_TITLE}
            </Typography>
            <Typography className={styles.inPersonVisitDescription} variant="body2">
              {PRODUCT_AI_PREVIEW_IN_PERSON_VISIT_DESCRIPTION}
            </Typography>
          </div>
          <div className={styles.inPersonVisitButtonWrap}>
            <ProductInPersonVisitButton
              fullWidth
              onClick={onInPersonVisitClick}
              variant="contained"
            />
          </div>
        </section>
      </div>

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
