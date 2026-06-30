import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import { Button } from "@mui/material";
import type { ReactElement } from "react";

import {
  IN_PERSON_VISIT_BUTTON_LABEL,
  PRODUCT_AI_PREVIEW_BUTTON_LABEL,
} from "./product-ai-preview.constants";

type ProductAiPreviewButtonProps = {
  readonly className?: string;
  readonly fullWidth?: boolean;
  readonly onClick: () => void;
  readonly size?: "small" | "medium" | "large";
  readonly tabIndex?: number;
  readonly variant?: "contained" | "outlined";
};

export function ProductAiPreviewButton({
  className,
  fullWidth = false,
  onClick,
  size = "large",
  tabIndex,
}: ProductAiPreviewButtonProps): ReactElement {
  return (
    <Button
      className={className}
      variant="contained"
      size={size}
      fullWidth={fullWidth}
      startIcon={<AutoAwesomeRoundedIcon />}
      tabIndex={tabIndex}
      onClick={onClick}
    >
      {PRODUCT_AI_PREVIEW_BUTTON_LABEL}
    </Button>
  );
}

export function ProductInPersonVisitButton({
  className,
  fullWidth = false,
  onClick,
  size = "large",
  tabIndex,
  variant = "outlined",
}: ProductAiPreviewButtonProps): ReactElement {
  return (
    <Button
      className={className}
      variant={variant}
      color="primary"
      size={size}
      fullWidth={fullWidth}
      startIcon={<StorefrontRoundedIcon />}
      tabIndex={tabIndex}
      onClick={onClick}
    >
      {IN_PERSON_VISIT_BUTTON_LABEL}
    </Button>
  );
}
