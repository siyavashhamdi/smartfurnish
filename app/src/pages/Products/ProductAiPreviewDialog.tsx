import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { Alert, Typography } from "@mui/material";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from "react";

import { FabricSelector } from "./FabricSelector";
import { ProductAiPreviewGenerationProgress } from "./ProductAiPreviewGenerationProgress";
import { ProductAiPreviewResult } from "./ProductAiPreviewResult";
import { ProductAiPreviewRoomUploader } from "./ProductAiPreviewRoomUploader";
import { ProductDetailCoverGallery } from "./ProductDetailCoverGallery";
import {
  fetchProductAiPreviewStagingDurationSeconds,
  getProductAiPreviewErrorMessage,
  stageProductAiPreview,
  uploadProductAiPreviewRoomPhoto,
  type ProductAiPreviewProgress,
  type ProductAiPreviewStageResult,
} from "./product-ai-preview.api";
import {
  PRODUCT_AI_PREVIEW_GENERATE_LABEL,
} from "./product-ai-preview.constants";
import type { FabricSelectionController } from "./useFabricSelection";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "../../hooks/useTranslation";
import { resolveFileAccessUrl, type FileAccessUrl } from "../../utils/fileAccessUrl.util";
import EntityModalShell from "../../shared/crud/EntityModalShell";
import ModalFooterActions from "../../shared/crud/ModalFooterActions";
import styles from "./styles/ProductAiPreviewDialog.module.scss";

type ProductAiPreviewDialogProps = {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly productId: string;
  readonly productTitle: string;
  readonly coverImageAccessUrls: readonly FileAccessUrl[];
  readonly fabricSelection: FabricSelectionController;
  readonly onInPersonVisitClick: () => void;
};

export function ProductAiPreviewDialog({
  open,
  onClose,
  productId,
  productTitle,
  coverImageAccessUrls,
  fabricSelection,
  onInPersonVisitClick,
}: ProductAiPreviewDialogProps): ReactElement {
  const { t } = useTranslation();
  const { isAuthenticated, accessToken } = useAuth();
  const [roomFile, setRoomFile] = useState<File | null>(null);
  const [roomPreviewUrl, setRoomPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProductAiPreviewProgress | null>(null);
  const [estimatedDurationSeconds, setEstimatedDurationSeconds] = useState<number | null>(
    null,
  );
  const [result, setResult] = useState<ProductAiPreviewStageResult | null>(null);

  const selectedProductImageUrl = useMemo(() => {
    return resolveFileAccessUrl(
      fabricSelection.selectedColor?.aiProductImageAccessUrl ?? null,
    );
  }, [fabricSelection.selectedColor?.aiProductImageAccessUrl]);

  const canGenerate = Boolean(
    isAuthenticated &&
      productId &&
      fabricSelection.selectedFabricKey &&
      fabricSelection.selectedColorKey &&
      roomFile &&
      selectedProductImageUrl &&
      !submitting,
  );

  const resetGenerationState = useCallback((): void => {
    setSubmitting(false);
    setGenerationError(null);
    setProgress(null);
    setResult(null);
  }, []);

  const resetDialogState = useCallback((): void => {
    setRoomFile(null);
    setRoomPreviewUrl(null);
    resetGenerationState();
  }, [resetGenerationState]);

  useEffect(() => {
    if (!open) {
      resetDialogState();
    }
  }, [open, resetDialogState]);

  useEffect(() => {
    if (!roomFile) {
      setRoomPreviewUrl(null);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(roomFile);
    setRoomPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [roomFile]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    fetchProductAiPreviewStagingDurationSeconds()
      .then((durationSeconds) => {
        if (!cancelled) {
          setEstimatedDurationSeconds(durationSeconds);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEstimatedDurationSeconds(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleGenerate = useCallback(async (): Promise<void> => {
    if (
      !roomFile ||
      !fabricSelection.selectedFabricKey ||
      !fabricSelection.selectedColorKey
    ) {
      return;
    }

    setSubmitting(true);
    setGenerationError(null);
    setProgress(null);
    setResult(null);

    try {
      const environmentFileId = await uploadProductAiPreviewRoomPhoto(
        roomFile,
        accessToken,
      );
      const nextResult = await stageProductAiPreview({
        accessToken,
        colorKey: fabricSelection.selectedColorKey,
        environmentFileId,
        fabricKey: fabricSelection.selectedFabricKey,
        onProgress: setProgress,
        productId,
      });
      setResult(nextResult);
    } catch (error) {
      setGenerationError(
        getProductAiPreviewErrorMessage(
          error,
          "امکان تولید پیش‌نمایش هوشمند وجود ندارد. لطفاً دوباره تلاش کنید.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    accessToken,
    fabricSelection.selectedColorKey,
    fabricSelection.selectedFabricKey,
    productId,
    roomFile,
  ]);

  const handleDismissError = useCallback((): void => {
    setGenerationError(null);
    setSubmitting(false);
  }, []);

  const handleTryAgain = useCallback((): void => {
    resetGenerationState();
  }, [resetGenerationState]);

  const missingProductImage = !selectedProductImageUrl;

  return (
    <>
      <EntityModalShell
        open={open}
        onClose={onClose}
        title={t("app.pageTitles.productAiPreview")}
        maxWidth={result ? "lg" : "md"}
        footer={
          <ModalFooterActions
            actions={[
              { key: "close", isCloseButton: true, onClick: onClose },
              ...(result
                ? [
                    {
                      key: "try-again",
                      label: "پیش‌نمایش جدید",
                      variant: "outlined" as const,
                      color: "primary" as const,
                      icon: <RefreshRoundedIcon />,
                      onClick: handleTryAgain,
                    },
                  ]
                : [
                    {
                      key: "generate",
                      label: PRODUCT_AI_PREVIEW_GENERATE_LABEL,
                      variant: "contained" as const,
                      color: "primary" as const,
                      icon: <AutoAwesomeRoundedIcon />,
                      onClick: () => {
                        void handleGenerate();
                      },
                      disabled: !canGenerate,
                    },
                  ]),
            ]}
          />
        }
      >
        <div className={styles.body}>
          {result ? (
            <ProductAiPreviewResult
              fabricLabel={result.fabric.label}
              imageUrl={result.image}
              onInPersonVisitClick={onInPersonVisitClick}
              productTitle={result.product.title}
            />
          ) : (
            <>
              <section className={styles.section}>
                <ProductDetailCoverGallery
                  title={productTitle}
                  coverImageAccessUrls={coverImageAccessUrls}
                />
              </section>

              <section className={styles.section}>
                <Typography className={styles.sectionTitle} component="h3" variant="subtitle1">
                  انتخاب پارچه و رنگ
                </Typography>
                <FabricSelector fabricSelection={fabricSelection} showSectionTitle={false} />
              </section>

              {missingProductImage ? (
                <Alert severity="warning">
                  برای رنگ انتخاب‌شده تصویر AI محصول تنظیم نشده است. لطفاً رنگ دیگری
                  انتخاب کنید.
                </Alert>
              ) : null}

              {!isAuthenticated ? (
                <Alert severity="info">
                  برای بارگذاری عکس فضای خانه و تولید پیش‌نمایش هوشمند، ابتدا وارد حساب
                  کاربری خود شوید.
                </Alert>
              ) : null}

              <section className={styles.section}>
                <Typography className={styles.sectionTitle} component="h3" variant="subtitle1">
                  عکس فضای خانه شما
                </Typography>
                <ProductAiPreviewRoomUploader
                  disabled={submitting || missingProductImage || !isAuthenticated}
                  file={roomFile}
                  onChange={setRoomFile}
                  previewUrl={roomPreviewUrl}
                />
              </section>
            </>
          )}
        </div>
      </EntityModalShell>

      <ProductAiPreviewGenerationProgress
        error={generationError}
        estimatedDurationSeconds={estimatedDurationSeconds}
        onDismissError={handleDismissError}
        open={submitting || Boolean(generationError)}
        progress={progress}
      />
    </>
  );
}
