import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import { Alert, Stack, Typography } from "@mui/material";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";

import { FabricSelector } from "./FabricSelector";
import {
  ProductAiPreviewBetterExperienceStep,
  type ProductAiPreviewBetterExperienceStepHandle,
} from "./ProductAiPreviewBetterExperienceStep";
import {
  ProductAiPreviewContactStep,
  type ProductAiPreviewContactStepHandle,
} from "./ProductAiPreviewContactStep";
import { ProductAiPreviewGenerationProgress } from "./ProductAiPreviewGenerationProgress";
import { ProductAiPreviewResult } from "./ProductAiPreviewResult";
import { ProductAiPreviewRoomUploader } from "./ProductAiPreviewRoomUploader";
import { ProductAiPreviewStepIndicator } from "./ProductAiPreviewStepIndicator";
import { ProductDetailCoverGallery } from "./ProductDetailCoverGallery";
import {
  getProductAiPreviewErrorMessage,
  submitUserProductInquiryPreview,
  uploadProductAiPreviewRoomPhoto,
  type ProductAiPreviewProgress,
  type ProductAiPreviewStageResult,
} from "./product-ai-preview.api";
import {
  IN_PERSON_VISIT_BUTTON_LABEL,
  PRODUCT_AI_PREVIEW_CONTACT_ME_PREFILL_SLOW_MESSAGE,
  PRODUCT_AI_PREVIEW_GENERATE_LABEL,
  PRODUCT_AI_PREVIEW_REGISTERED_FINAL_STEP_LABEL,
  PRODUCT_AI_PREVIEW_REGISTERED_FINAL_STEP_SHORT_LABEL,
  PRODUCT_AI_PREVIEW_RESULT_EMPTY_HINT,
  PRODUCT_AI_PREVIEW_RESULT_EMPTY_MESSAGE,
} from "./product-ai-preview.constants";
import {
  splitContactFullName,
  type ProductAiPreviewSubmittedContact,
} from "./product-ai-preview-contact.util";
import {
  getProductAiPreviewStepIndex,
  type ProductAiPreviewStepId,
} from "./product-ai-preview.steps";
import type { FabricSelectionController } from "./useFabricSelection";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "../../hooks/useTranslation";
import { APP_SHELL_ROUTES } from "../../routing/app-shell-routes";
import { markPostSignupSuccessForRedirect } from "../../utils/post-signup-success.util";
import { normalizeOptionalMobilePhoneToLocal } from "../../utilities/mobile-phone.util";
import { getFileIdFromAccessUrl, type FileAccessUrl } from "../../utils/fileAccessUrl.util";
import { FileImageFullscreenDialog } from "../../shared/display/FileImageFullscreenDialog";
import EntityModalShell from "../../shared/crud/EntityModalShell";
import ModalFooterActions from "../../shared/crud/ModalFooterActions";
import styles from "./styles/ProductAiPreviewDialog.module.scss";
import stepStyles from "./styles/ProductAiPreviewSteps.module.scss";

type ProductAiPreviewDialogProps = {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly initialStepId?: ProductAiPreviewStepId;
  readonly productId: string;
  readonly productTitle: string;
  readonly coverImageAccessUrls: readonly FileAccessUrl[];
  readonly fabricSelection: FabricSelectionController;
};

const GENERATE_ICON = <AutoAwesomeRoundedIcon />;
const REFRESH_ICON = <RefreshRoundedIcon />;
const VISIT_ICON = <StorefrontRoundedIcon />;

const REGISTERED_FINAL_STEP_LABEL_OVERRIDES = {
  "coming-soon": {
    label: PRODUCT_AI_PREVIEW_REGISTERED_FINAL_STEP_LABEL,
    shortLabel: PRODUCT_AI_PREVIEW_REGISTERED_FINAL_STEP_SHORT_LABEL,
  },
} as const;

export function ProductAiPreviewDialog({
  open,
  onClose,
  initialStepId,
  productId,
  productTitle,
  coverImageAccessUrls,
  fabricSelection,
}: ProductAiPreviewDialogProps): ReactElement {
  const entryStepId = initialStepId ?? "setup";
  const { t } = useTranslation();
  const { isAuthenticated, isAnonymousUser, accessToken } = useAuth();
  const contactStepRef = useRef<ProductAiPreviewContactStepHandle>(null);
  const signupStepRef = useRef<ProductAiPreviewBetterExperienceStepHandle>(null);
  const [roomFile, setRoomFile] = useState<File | null>(null);
  const [roomPreviewUrl, setRoomPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactCanSubmit, setContactCanSubmit] = useState(false);
  const [contactMePrefillSlowBanner, setContactMePrefillSlowBanner] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProductAiPreviewProgress | null>(null);
  const [estimatedDurationSeconds, setEstimatedDurationSeconds] = useState<number | null>(
    null,
  );
  const [result, setResult] = useState<ProductAiPreviewStageResult | null>(null);
  const [inquiryId, setInquiryId] = useState<string | null>(null);
  const [activeStepId, setActiveStepId] = useState<ProductAiPreviewStepId>(entryStepId);
  const [maxReachedStepIndex, setMaxReachedStepIndex] = useState(() =>
    getProductAiPreviewStepIndex(entryStepId),
  );
  const [submittedContact, setSubmittedContact] =
    useState<ProductAiPreviewSubmittedContact | null>(null);
  const [signupCompleted, setSignupCompleted] = useState(false);
  const [signupSubmitting, setSignupSubmitting] = useState(false);
  const [isResultViewerOpen, setIsResultViewerOpen] = useState(false);

  const hasSelectedProductImage = Boolean(
    getFileIdFromAccessUrl(fabricSelection.selectedColor?.aiProductImageAccessUrl ?? null),
  );

  const canGenerate = Boolean(
    isAuthenticated &&
      productId &&
      fabricSelection.selectedFabricKey &&
      fabricSelection.selectedColorKey &&
      roomFile &&
      hasSelectedProductImage &&
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
    setInquiryId(null);
    setSubmittedContact(null);
    setSignupCompleted(false);
    setSignupSubmitting(false);
    setIsResultViewerOpen(false);
    setContactSubmitting(false);
    setContactCanSubmit(false);
    setContactMePrefillSlowBanner(false);
    resetGenerationState();
  }, [resetGenerationState]);

  useEffect(() => {
    if (activeStepId !== "result") {
      setIsResultViewerOpen(false);
    }
  }, [activeStepId]);

  useEffect(() => {
    if (!open) {
      resetDialogState();
      return;
    }

    setActiveStepId(entryStepId);
    setMaxReachedStepIndex(getProductAiPreviewStepIndex(entryStepId));
  }, [entryStepId, open, resetDialogState]);

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

    try {
      const environmentFileId = await uploadProductAiPreviewRoomPhoto(
        roomFile,
        accessToken,
      );
      const nextResult = await submitUserProductInquiryPreview({
        colorKey: fabricSelection.selectedColorKey,
        environmentFileId,
        fabricKey: fabricSelection.selectedFabricKey,
        inquiryId,
        productId,
      });

      setEstimatedDurationSeconds(nextResult.stagingDurationSeconds);
      setProgress({
        step: "complete",
        label: "پیش‌نمایش هوشمند آماده است.",
        percent: 100,
      });
      setResult(nextResult);
      setInquiryId(nextResult.id);
      setActiveStepId("result");
      setMaxReachedStepIndex((current) =>
        Math.max(current, getProductAiPreviewStepIndex("contact")),
      );
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
    inquiryId,
    roomFile,
  ]);

  const handleDismissError = useCallback((): void => {
    setGenerationError(null);
    setSubmitting(false);
  }, []);

  const handleNewPreview = useCallback((): void => {
    setRoomFile(null);
    setActiveStepId("setup");
  }, []);

  const handleGoToContactStep = useCallback((): void => {
    setActiveStepId("contact");
    setMaxReachedStepIndex((current) =>
      Math.max(current, getProductAiPreviewStepIndex("contact")),
    );
  }, []);

  const handleContactSubmitted = useCallback((contact: ProductAiPreviewSubmittedContact): void => {
    setContactSubmitting(false);
    setInquiryId(contact.inquiryId);
    setSubmittedContact(contact);
    setActiveStepId("coming-soon");
    setMaxReachedStepIndex(getProductAiPreviewStepIndex("coming-soon"));
  }, []);

  const handleSignupComplete = useCallback((): void => {
    markPostSignupSuccessForRedirect();
    window.location.assign(APP_SHELL_ROUTES.products);
  }, []);

  const contactPrefill = useMemo(() => {
    if (!submittedContact) {
      return null;
    }

    const { firstName, lastName } = splitContactFullName(submittedContact.fullName);

    return {
      firstName,
      lastName,
      phone: normalizeOptionalMobilePhoneToLocal(submittedContact.phone) ?? submittedContact.phone,
    };
  }, [submittedContact]);

  const handleOpenResultViewer = useCallback((): void => {
    setIsResultViewerOpen(true);
  }, []);

  const handleCloseResultViewer = useCallback((): void => {
    setIsResultViewerOpen(false);
  }, []);

  const resultViewerTitle = useMemo((): string => {
    if (!result) {
      return productTitle.trim() || t("app.pageTitles.productAiPreview");
    }

    return `${result.product.title} — ${result.fabric.label}`;
  }, [productTitle, result, t]);

  const isContactRequestSubmitted = submittedContact !== null;

  const isStepCompleted = useCallback(
    (stepId: ProductAiPreviewStepId): boolean => {
      const activeStepIndex = getProductAiPreviewStepIndex(activeStepId);

      switch (stepId) {
        case "setup":
          return Boolean(result);
        case "result":
          if (isContactRequestSubmitted && Boolean(result)) {
            return true;
          }

          return Boolean(result) && activeStepIndex > getProductAiPreviewStepIndex("result");
        case "contact":
          return maxReachedStepIndex >= getProductAiPreviewStepIndex("coming-soon");
        case "coming-soon":
          return maxReachedStepIndex >= getProductAiPreviewStepIndex("coming-soon");
        default:
          return false;
      }
    },
    [activeStepId, isContactRequestSubmitted, maxReachedStepIndex, result],
  );

  const handleStepSelect = useCallback((stepId: ProductAiPreviewStepId): void => {
    setActiveStepId(stepId);
  }, []);

  const handleContactSubmitClick = useCallback((): void => {
    contactStepRef.current?.submit();
  }, []);

  const handleSignupSubmitClick = useCallback((): void => {
    signupStepRef.current?.submit();
  }, []);

  const showSignupFooter =
    activeStepId === "coming-soon" && isAnonymousUser && !signupCompleted && Boolean(inquiryId);

  const missingProductImage = !hasSelectedProductImage;

  const modalMaxWidth =
    activeStepId === "result"
      ? "lg"
      : activeStepId === "contact" || activeStepId === "coming-soon"
        ? "sm"
        : "md";

  const footerActions = useMemo(() => {
    const closeAction = { key: "close", isCloseButton: true, onClick: onClose };

    switch (activeStepId) {
      case "setup":
        return [
          closeAction,
          {
            key: "generate",
            label: PRODUCT_AI_PREVIEW_GENERATE_LABEL,
            variant: "contained" as const,
            color: "primary" as const,
            icon: GENERATE_ICON,
            onClick: handleGenerate,
            disabled: !canGenerate,
          },
        ];
      case "result":
        if (!result) {
          return [closeAction];
        }

        return [
          closeAction,
          {
            key: "try-again",
            label: "پیش‌نمایش جدید",
            variant: "outlined" as const,
            color: "primary" as const,
            icon: REFRESH_ICON,
            onClick: handleNewPreview,
          },
          ...(isContactRequestSubmitted
            ? []
            : [
                {
                  key: "visit",
                  label: IN_PERSON_VISIT_BUTTON_LABEL,
                  variant: "contained" as const,
                  color: "primary" as const,
                  icon: VISIT_ICON,
                  onClick: handleGoToContactStep,
                },
              ]),
        ];
      case "contact":
        if (isContactRequestSubmitted) {
          return [closeAction];
        }

        return [
          {
            ...closeAction,
            disabled: contactSubmitting,
          },
          {
            key: "submit-contact",
            label: IN_PERSON_VISIT_BUTTON_LABEL,
            type: "submit" as const,
            icon: VISIT_ICON,
            disabled: contactSubmitting || !contactCanSubmit,
            onClick: handleContactSubmitClick,
          },
        ];
      case "coming-soon":
        if (showSignupFooter) {
          return [
            {
              ...closeAction,
              disabled: signupSubmitting,
            },
            {
              key: "submit-signup",
              label: t("auth.login.signUp"),
              type: "submit" as const,
              disabled: signupSubmitting,
              onClick: handleSignupSubmitClick,
            },
          ];
        }

        return [closeAction];
      default:
        return [closeAction];
    }
  }, [
    activeStepId,
    canGenerate,
    contactCanSubmit,
    contactSubmitting,
    handleContactSubmitClick,
    handleGenerate,
    handleGoToContactStep,
    handleSignupSubmitClick,
    handleNewPreview,
    inquiryId,
    isAnonymousUser,
    isContactRequestSubmitted,
    onClose,
    result,
    showSignupFooter,
    signupCompleted,
    signupSubmitting,
    t,
  ]);

  const stepContentKey = `${activeStepId}-${result?.id ?? "none"}`;

  const stepLabelOverrides = isAnonymousUser ? undefined : REGISTERED_FINAL_STEP_LABEL_OVERRIDES;

  return (
    <>
      <EntityModalShell
        open={open}
        onClose={onClose}
        title={productTitle.trim() || t("app.pageTitles.productAiPreview")}
        maxWidth={modalMaxWidth}
        disableClose={submitting || contactSubmitting || signupSubmitting}
        headerAccessory={
          <ProductAiPreviewStepIndicator
            activeStepId={activeStepId}
            maxReachedStepIndex={maxReachedStepIndex}
            isStepCompleted={isStepCompleted}
            stepLabelOverrides={stepLabelOverrides}
            onStepSelect={handleStepSelect}
          />
        }
        footer={
          <Stack className={styles.footerStack} spacing={1}>
            {activeStepId === "contact" && contactMePrefillSlowBanner ? (
              <Alert
                className={styles.mePrefillSlowBanner}
                severity="info"
                variant="outlined"
              >
                {PRODUCT_AI_PREVIEW_CONTACT_ME_PREFILL_SLOW_MESSAGE}
              </Alert>
            ) : null}
            <ModalFooterActions actions={footerActions} />
          </Stack>
        }
      >
        <div className={styles.body}>
          <div key={stepContentKey} className={stepStyles.stepContent}>
            {activeStepId === "setup" ? (
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
            ) : null}

            {activeStepId === "result" ? (
              result ? (
                <ProductAiPreviewResult
                  fabricColorHex={result.fabric.colorHex}
                  fabricColorName={result.fabric.colorName}
                  fabricLabel={result.fabric.label}
                  fabricPatternName={result.fabric.patternName}
                  imageUrl={result.image}
                  resultFileAccessUrl={result.resultFileAccessUrl}
                  productTitle={result.product.title}
                  onImageClick={handleOpenResultViewer}
                />
              ) : (
                <div className={stepStyles.stepEmptyState}>
                  <Typography color="text.primary" fontWeight={700} variant="body2">
                    {PRODUCT_AI_PREVIEW_RESULT_EMPTY_MESSAGE}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
                    {PRODUCT_AI_PREVIEW_RESULT_EMPTY_HINT}
                  </Typography>
                </div>
              )
            ) : null}

            {activeStepId === "contact" ? (
              <ProductAiPreviewContactStep
                ref={contactStepRef}
                productId={productId}
                inquiryId={inquiryId}
                fabricKey={fabricSelection.selectedFabricKey}
                colorKey={fabricSelection.selectedColorKey}
                readonlyContact={isContactRequestSubmitted ? submittedContact : null}
                onCanSubmitChange={setContactCanSubmit}
                onMePrefillSlowBannerChange={setContactMePrefillSlowBanner}
                onSubmittingChange={setContactSubmitting}
                onSubmitted={handleContactSubmitted}
              />
            ) : null}

            {activeStepId === "coming-soon" ? (
              <ProductAiPreviewBetterExperienceStep
                ref={signupStepRef}
                contactPrefill={contactPrefill}
                inquiryId={inquiryId}
                showSignupForm={isAnonymousUser && !signupCompleted}
                onSignupComplete={handleSignupComplete}
                onSubmittingChange={setSignupSubmitting}
              />
            ) : null}
          </div>
        </div>
      </EntityModalShell>

      <ProductAiPreviewGenerationProgress
        error={generationError}
        estimatedDurationSeconds={estimatedDurationSeconds}
        onDismissError={handleDismissError}
        open={submitting || Boolean(generationError)}
        progress={progress}
      />

      <FileImageFullscreenDialog
        open={isResultViewerOpen}
        title={resultViewerTitle}
        accessUrl={result?.resultFileAccessUrl ?? null}
        onClose={handleCloseResultViewer}
      />
    </>
  );
}
