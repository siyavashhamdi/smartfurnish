import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Dialog, IconButton } from "@mui/material";
import { memo, type ReactElement } from "react";

import detailStyles from "./styles/ProductDetail.module.scss";

type ProductAiPreviewImageViewerDialogProps = {
  readonly open: boolean;
  readonly title: string;
  readonly imageUrl: string;
  readonly onClose: () => void;
};

function ProductAiPreviewImageViewerDialogInner({
  open,
  title,
  imageUrl,
  onClose,
}: ProductAiPreviewImageViewerDialogProps): ReactElement {
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      aria-labelledby="product-ai-preview-viewer-title"
      disableAutoFocus
      disableEnforceFocus
      disableRestoreFocus
      PaperProps={{ className: detailStyles.mediaDialogPaper }}
    >
      <div className={detailStyles.imageViewerDialogLayout}>
        <header className={detailStyles.mediaDialogHeader}>
          <strong id="product-ai-preview-viewer-title">{title}</strong>
          <IconButton
            type="button"
            size="small"
            className={detailStyles.mediaDialogCloseButton}
            aria-label="بستن نمایش تصویر"
            onClick={onClose}
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
  );
}

export const ProductAiPreviewImageViewerDialog = memo(ProductAiPreviewImageViewerDialogInner);
