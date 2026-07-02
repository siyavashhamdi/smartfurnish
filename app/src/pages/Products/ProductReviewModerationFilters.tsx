import { Chip } from "@mui/material";
import { type ReactElement } from "react";

import { PRODUCT_REVIEW_MODERATION_FILTER_OPTIONS } from "./product-reviews.api";
import styles from "./styles/ProductReviewsSection.module.scss";

type ProductReviewModerationFiltersProps = {
  readonly pendingModerationOnly: boolean;
  readonly onChange: (pendingModerationOnly: boolean) => void;
  readonly disabled?: boolean;
};

const ProductReviewModerationFilters = ({
  pendingModerationOnly,
  onChange,
  disabled = false,
}: ProductReviewModerationFiltersProps): ReactElement => {
  return (
    <div className={styles.moderationFilters} role="group" aria-label="فیلتر وضعیت تایید">
      {PRODUCT_REVIEW_MODERATION_FILTER_OPTIONS.map((option) => {
        const isActive = pendingModerationOnly === option.value;

        return (
          <Chip
            key={option.label}
            label={option.label}
            size="small"
            clickable={!disabled}
            disabled={disabled}
            color={isActive ? "primary" : "default"}
            variant={isActive ? "filled" : "outlined"}
            onClick={() => onChange(option.value)}
          />
        );
      })}
    </div>
  );
};

export default ProductReviewModerationFilters;
