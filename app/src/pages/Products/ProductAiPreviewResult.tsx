import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { Alert, Chip, Paper, Stack, Typography } from "@mui/material";
import { memo, type ReactElement } from "react";

import { normalizeFabricHexColor } from "./fabric-selection.util";
import { PRODUCT_AI_PREVIEW_RESULT_DISCLAIMER } from "./product-ai-preview.constants";
import styles from "./styles/ProductAiPreviewResult.module.scss";

type ProductAiPreviewResultProps = {
  readonly imageUrl: string;
  readonly productTitle: string;
  readonly fabricLabel: string;
  readonly fabricPatternName: string;
  readonly fabricColorName: string;
  readonly fabricColorHex?: string | null;
  readonly onImageClick?: () => void;
};

function ProductAiPreviewResultInner({
  imageUrl,
  productTitle,
  fabricLabel,
  fabricPatternName,
  fabricColorName,
  fabricColorHex,
  onImageClick,
}: ProductAiPreviewResultProps): ReactElement {
  const viewerTitle = `${productTitle} — ${fabricLabel}`;
  const normalizedPatternName = fabricPatternName.trim();
  const normalizedColorName = fabricColorName.trim();
  const swatchColor = normalizeFabricHexColor(fabricColorHex ?? null);

  return (
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
          <div className={styles.imageFrame}>
            <button
              type="button"
              className={styles.imageButton}
              aria-label="بزرگ‌نمایی پیش‌نمایش"
              onClick={onImageClick}
            >
              <img
                alt="پیش‌نمایش هوشمند مبل در فضای خانه"
                className={styles.image}
                src={imageUrl}
              />
            </button>
            <Stack
              direction="row"
              spacing={0.5}
              className={styles.fabricBadges}
              useFlexGap
              flexWrap="wrap"
            >
              {normalizedPatternName ? (
                <Chip
                  className={styles.fabricBadge}
                  label={normalizedPatternName}
                  size="small"
                  variant="filled"
                />
              ) : null}
              {normalizedColorName ? (
                <Chip
                  className={styles.fabricBadge}
                  label={
                    <Stack direction="row" spacing={0.5} alignItems="center" component="span">
                      <span>{normalizedColorName}</span>
                      <span
                        className={styles.fabricBadgeSwatch}
                        style={{
                          backgroundColor: swatchColor ?? "transparent",
                        }}
                      />
                    </Stack>
                  }
                  size="small"
                  variant="filled"
                />
              ) : null}
            </Stack>
          </div>
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
  );
}

export const ProductAiPreviewResult = memo(ProductAiPreviewResultInner);
