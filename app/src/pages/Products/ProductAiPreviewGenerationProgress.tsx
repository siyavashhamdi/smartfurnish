import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState, type ReactElement } from "react";

import type { ProductAiPreviewProgress } from "./product-ai-preview.api";
import styles from "./styles/ProductAiPreviewGenerationProgress.module.scss";

type ProductAiPreviewGenerationProgressProps = {
  readonly open: boolean;
  readonly error?: string | null;
  readonly estimatedDurationSeconds: number | null;
  readonly progress: ProductAiPreviewProgress | null;
  readonly onDismissError?: () => void;
};

const FALLBACK_DURATION_SECONDS = 75;
const ESTIMATE_TARGET_PERCENT = 90;
const ESTIMATE_TARGET_TIME_RATIO = 0.68;
const MAX_INCOMPLETE_PERCENT = 99.9;
const EASE_WINDOW_RATIO = 0.45;

function getElapsedPercent(
  startedAt: number | null,
  estimateSeconds: number | null,
  now: number,
): number {
  if (!startedAt) {
    return 0;
  }

  const estimateMs =
    Math.max(5, estimateSeconds ?? FALLBACK_DURATION_SECONDS) *
    1000 *
    ESTIMATE_TARGET_TIME_RATIO;
  const elapsedMs = now - startedAt;

  if (elapsedMs <= estimateMs) {
    return (elapsedMs / estimateMs) * ESTIMATE_TARGET_PERCENT;
  }

  const overtimeMs = elapsedMs - estimateMs;
  const easeWindowMs = estimateMs * EASE_WINDOW_RATIO;
  const easedExtraPercent =
    (MAX_INCOMPLETE_PERCENT - ESTIMATE_TARGET_PERCENT) *
    (1 - Math.exp(-overtimeMs / easeWindowMs));

  return Math.min(
    MAX_INCOMPLETE_PERCENT,
    ESTIMATE_TARGET_PERCENT + easedExtraPercent,
  );
}

export function ProductAiPreviewGenerationProgress({
  open,
  error = null,
  estimatedDurationSeconds,
  progress,
  onDismissError,
}: ProductAiPreviewGenerationProgressProps): ReactElement {
  const [elapsedPercent, setElapsedPercent] = useState(0);
  const serverPercent = progress?.percent ?? 0;
  const percent = error ? 0 : serverPercent >= 100 ? 100 : elapsedPercent;
  const displayPercent = Math.floor(percent);
  const label = progress?.label ?? "در حال آماده‌سازی پیش‌نمایش هوشمند...";

  useEffect(() => {
    if (!open || error) {
      setElapsedPercent(0);
      return undefined;
    }

    const nextStartedAt = Date.now();
    setElapsedPercent(0);

    function animate(): void {
      const nextPercent = getElapsedPercent(
        nextStartedAt,
        estimatedDurationSeconds,
        Date.now(),
      );

      setElapsedPercent((currentPercent) => Math.max(currentPercent, nextPercent));
    }

    animate();
    const intervalId = window.setInterval(animate, 200);

    return () => window.clearInterval(intervalId);
  }, [error, estimatedDurationSeconds, open]);

  return (
    <Backdrop className={styles.backdrop} open={open}>
      <Paper className={styles.panel} elevation={0}>
        <Box className={`${styles.header}${error ? ` ${styles.headerError}` : ""}`}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Box className={styles.headerIconWrap}>
              <AutoAwesomeOutlinedIcon />
            </Box>
            <Stack spacing={0.25} sx={{ flex: 1 }}>
              <Typography variant="h6">
                {error ? "خطا در تولید پیش‌نمایش" : "در حال ساخت پیش‌نمایش هوشمند"}
              </Typography>
              {!error ? (
                <Typography className={styles.headerSubtext} variant="body2">
                  {displayPercent}٪ تکمیل شده
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </Box>

        <Stack className={styles.body} spacing={2.5}>
          {error ? (
            <>
              <Alert severity="error" sx={{ alignItems: "flex-start" }}>
                {error}
              </Alert>
              {onDismissError ? (
                <Button
                  fullWidth
                  onClick={onDismissError}
                  startIcon={<CloseRoundedIcon />}
                  variant="outlined"
                >
                  بستن
                </Button>
              ) : null}
            </>
          ) : (
            <>
              <LinearProgress
                color="primary"
                sx={{ height: 8, borderRadius: 4 }}
                value={percent}
                variant="determinate"
              />
              <Typography color="text.secondary" sx={{ lineHeight: 1.65, minHeight: 44 }} variant="body2">
                {label}
              </Typography>
            </>
          )}
        </Stack>
      </Paper>
    </Backdrop>
  );
}
