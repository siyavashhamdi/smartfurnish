import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { IconButton } from "@mui/material";
import type { ReactElement, SyntheticEvent } from "react";

import productStyles from "../styles/ProductDetail.module.scss";

type ProductFormCoverCarouselNavProps = {
  readonly safeIndex: number;
  readonly slideCount: number;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
};

function stopNavEvent(event: SyntheticEvent): void {
  event.stopPropagation();
}

export function ProductFormCoverCarouselNav({
  safeIndex,
  slideCount,
  onPrevious,
  onNext,
}: ProductFormCoverCarouselNavProps): ReactElement {
  return (
    <div className={productStyles.galleryCarouselControls}>
      <IconButton
        type="button"
        size="small"
        className={productStyles.galleryCarouselNavButton}
        aria-label="تصویر بعدی"
        disabled={safeIndex >= slideCount - 1}
        onClick={(event) => {
          stopNavEvent(event);
          onNext();
        }}
      >
        <ChevronLeftRoundedIcon fontSize="small" />
      </IconButton>
      <IconButton
        type="button"
        size="small"
        className={productStyles.galleryCarouselNavButton}
        aria-label="تصویر قبلی"
        disabled={safeIndex <= 0}
        onClick={(event) => {
          stopNavEvent(event);
          onPrevious();
        }}
      >
        <ChevronRightRoundedIcon fontSize="small" />
      </IconButton>
    </div>
  );
}
