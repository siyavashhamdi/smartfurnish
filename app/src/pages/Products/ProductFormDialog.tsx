import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { NetworkStatus } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import {
  Box,
  CircularProgress,
  DialogContentText,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { useMutationWithSnackbar } from "../../hooks/useMutationWithSnackbar";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useTranslation } from "../../hooks/useTranslation";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../lib/graphql/generated";
import EntityConfirmDialogShell from "../../shared/crud/EntityConfirmDialogShell";
import EntityModalShell from "../../shared/crud/EntityModalShell";
import { PRODUCT_CREATE_MUTATION } from "../../graphql/mutations/productCreate.mutation";
import { PRODUCT_UPDATE_MUTATION } from "../../graphql/mutations/productUpdate.mutation";
import { PRODUCT_DETAIL_QUERY } from "../../graphql/queries/productDetail.query";
import CatalogSection from "./product-form-dialog/CatalogSection";
import MainInfoSection from "./product-form-dialog/MainInfoSection";
import ProductFormSectionTabs from "./ProductFormSectionTabs";
import ProductReviewsAdminSection from "./ProductReviewsAdminSection";
import type { ProductSectionTab } from "./product-section-tabs.shared";
import formSectionStyles from "./product-form-dialog/styles/ProductFormSections.module.scss";
import type {
  ProductDetailQuery,
  ProductDetailQueryVariables,
  ProductEditRecord,
} from "./product-list.api";
import { mapProductDetailRowToRecord } from "./product-list.api";
import type { DiscountKind, DraftCoverImage, DraftFabric, DraftMaterialProfile, DraftSetPiece, DraftVendor } from "./product-form-dialog/types";
import { getFileIdFromAccessUrl } from "../../utils/fileAccessUrl.util";
import {
  FILE_UPLOAD_POLICY,
  FILE_UPLOAD_POLICY_MAX_SIZE_BYTES,
} from "../../constants/fileUploadPolicies";
import { uploadFile, FileUploadError } from "../../utils/fileUpload.util";
import { hasFormChanges } from "../../utils/formChange.util";
import {
  buildProductWriteMutationInput,
  createDraftsFromProduct,
  parseOptionalNumber,
  type UploadedProductFileMap,
} from "./product-form-dialog/product-form.state.util";
import {
  calculateBatchUploadPercent,
  getFieldUploadPercent,
  type UploadProgressEntry,
} from "../../utils/uploadProgress.util";
import ModalFooterActions from "../../shared/crud/ModalFooterActions";
import { validateProductForm } from "./product-form-validation.util";

type ProductFormDialogProps = {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSaved?: () => void;
  readonly productId?: string | null;
  readonly onDelete?: () => void;
};

type ProductWriteMutationResult = {
  productCreate: { id: string };
  productUpdate: { id: string };
};

type ProductWriteMutationVariables = {
  input: Record<string, unknown>;
};

type UploadTask = {
  readonly fieldId: string;
  readonly file: File;
  readonly errorMessage: string;
  readonly applyUploadedId: (
    uploadedFileId: string,
    files: UploadedProductFileMap
  ) => UploadedProductFileMap;
};

function getCoverUploadFieldId(coverId: string): string {
  return `product-cover-image-${coverId}`;
}

function getSetPieceImageUploadFieldId(imageId: string): string {
  return `product-set-piece-image-${imageId}`;
}

function getFabricColorImageUploadFieldId(imageId: string): string {
  return `product-fabric-color-image-${imageId}`;
}

function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

function stripNumberSeparators(value: string): string {
  return normalizeDigits(value).replace(/[,٬\s]/g, "");
}

function formatIntegerWithThousands(value: string): string {
  const digits = stripNumberSeparators(value).replace(/\D/g, "");
  if (!digits) {
    return "";
  }
  return Number(digits).toLocaleString("en-US");
}

function sanitizePercentageValue(value: string): string {
  const cleanValue = stripNumberSeparators(value).replace(/[^\d.]/g, "");
  if (!cleanValue) {
    return "";
  }
  const parsedValue = Number(cleanValue);
  if (!Number.isFinite(parsedValue)) {
    return "";
  }
  return parsedValue > 100 ? "100" : cleanValue.replace(/^0(?=\d)/, "");
}

function hasPendingLocalFileSelections(
  coverImages: DraftCoverImage[],
  setPieces: DraftSetPiece[],
  fabrics: DraftFabric[]
): boolean {
  if (coverImages.some((cover) => cover.file != null)) {
    return true;
  }
  if (setPieces.some((piece) => piece.images.some((image) => image.file != null))) {
    return true;
  }
  return fabrics.some((fabric) =>
    fabric.colors.some((color) => color.aiImage.file != null)
  );
}

type ProductFormSnapshot = {
  readonly title: string;
  readonly summary: string;
  readonly fullDescription: string;
  readonly notes: string;
  readonly priceIrt: string;
  readonly tags: string[];
  readonly isActive: boolean;
  readonly isReviewSubmissionEnabled: boolean;
  readonly isReviewsSectionVisible: boolean;
  readonly discountEnabled: boolean;
  readonly discountKind: DiscountKind;
  readonly discountValue: string;
  readonly coverImageCount: number;
  readonly setPieceCount: number;
  readonly fabricCount: number;
};

function buildProductFormSnapshot(input: {
  title: string;
  summary: string;
  fullDescription: string;
  notes: string;
  priceIrt: string;
  tags: string[];
  isActive: boolean;
  isReviewSubmissionEnabled: boolean;
  isReviewsSectionVisible: boolean;
  discountEnabled: boolean;
  discountKind: DiscountKind;
  discountValue: string;
  coverImages: DraftCoverImage[];
  setPieces: DraftSetPiece[];
  fabrics: DraftFabric[];
}): ProductFormSnapshot {
  return {
    title: input.title,
    summary: input.summary,
    fullDescription: input.fullDescription,
    notes: input.notes,
    priceIrt: input.priceIrt,
    tags: input.tags,
    isActive: input.isActive,
    isReviewSubmissionEnabled: input.isReviewSubmissionEnabled,
    isReviewsSectionVisible: input.isReviewsSectionVisible,
    discountEnabled: input.discountEnabled,
    discountKind: input.discountKind,
    discountValue: input.discountValue,
    coverImageCount: input.coverImages.length,
    setPieceCount: input.setPieces.length,
    fabricCount: input.fabrics.length,
  };
}

const ProductFormDialog = ({
  open,
  onClose,
  onSaved,
  productId,
  onDelete,
}: ProductFormDialogProps): ReactElement => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showError, updateUploadProgress, hideUploadProgress } = useSnackbar();
  const isEditMode = Boolean(productId);
  const isSuperAdmin = user?.roles?.includes(UserRole.SUPER_ADMIN) === true;
  const useEditSectionTabs = isEditMode && isSuperAdmin;
  const [activeFormSectionTab, setActiveFormSectionTab] = useState<ProductSectionTab>("intro");
  const [reviewsRefreshToken, setReviewsRefreshToken] = useState(0);
  const isIntroFormTabActive = !useEditSectionTabs || activeFormSectionTab === "intro";
  const isReviewsFormTabActive = useEditSectionTabs && activeFormSectionTab === "reviews";
  const showIntroFormSection = !useEditSectionTabs || activeFormSectionTab === "intro";
  const showContentFormSection = !useEditSectionTabs || activeFormSectionTab === "content";
  const showReviewsFormSection = isReviewsFormTabActive && Boolean(productId);

  const { data, loading: detailLoading, networkStatus, refetch: refetchProductDetail } =
    useQuery<ProductDetailQuery, ProductDetailQueryVariables>(PRODUCT_DETAIL_QUERY, {
      variables: { input: { id: productId ?? "" } },
      skip: !open || !productId,
      fetchPolicy: "network-only",
      nextFetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
    });

  const detailProduct = useMemo(() => {
    if (!productId || data?.productDetail?.id !== productId) {
      return null;
    }
    return mapProductDetailRowToRecord(data.productDetail);
  }, [productId, data]);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [coverImages, setCoverImages] = useState<DraftCoverImage[]>([]);
  const [priceIrt, setPriceIrt] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isReviewSubmissionEnabled, setIsReviewSubmissionEnabled] = useState(true);
  const [isReviewsSectionVisible, setIsReviewsSectionVisible] = useState(true);
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountKind, setDiscountKind] = useState<DiscountKind>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [vendor, setVendor] = useState<DraftVendor>({ name: "", phone: "", address: "", notes: "" });
  const [materialProfile, setMaterialProfile] = useState<DraftMaterialProfile>({
    texture: "",
    primaryMaterial: "",
    secondaryMaterials: [],
    composition: [],
    careInstructions: "",
  });
  const [setPieces, setSetPieces] = useState<DraftSetPiece[]>([]);
  const [fabrics, setFabrics] = useState<DraftFabric[]>([]);
  const [freeProductConfirmOpen, setFreeProductConfirmOpen] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState<ProductFormSnapshot | null>(null);
  const appliedFormKeyRef = useRef<string | null>(null);

  const parsedPriceIrt = parseOptionalNumber(priceIrt);
  const hasPositivePrice = parsedPriceIrt != null && parsedPriceIrt > 0;

  const currentSnapshot = useMemo(
    () =>
      buildProductFormSnapshot({
        title,
        summary,
        fullDescription,
        notes,
        priceIrt,
        tags,
        isActive,
        isReviewSubmissionEnabled,
        isReviewsSectionVisible,
        discountEnabled,
        discountKind,
        discountValue,
        coverImages,
        setPieces,
        fabrics,
      }),
    [
      coverImages,
      discountEnabled,
      discountKind,
      discountValue,
      fabrics,
      fullDescription,
      isActive,
      isReviewSubmissionEnabled,
      isReviewsSectionVisible,
      notes,
      priceIrt,
      setPieces,
      summary,
      tags,
      title,
    ]
  );

  const applyFormState = (nextProduct?: ProductEditRecord | null): void => {
    const drafts = createDraftsFromProduct(nextProduct ?? null);
    const nextPriceIrt =
      typeof nextProduct?.priceIrt === "number"
        ? formatIntegerWithThousands(String(nextProduct.priceIrt))
        : "";
    const nextDiscountEnabled = nextProduct?.discount != null;
    const nextDiscountKind = nextProduct?.discount?.type ?? "PERCENTAGE";
    const nextDiscountValue = nextProduct?.discount
      ? nextProduct.discount.type === "PERCENTAGE"
        ? sanitizePercentageValue(String(nextProduct.discount.value))
        : formatIntegerWithThousands(String(nextProduct.discount.value))
      : "";

    setTitle(nextProduct?.title ?? "");
    setSummary(nextProduct?.summary ?? "");
    setFullDescription(nextProduct?.fullDescription ?? "");
    setNotes(nextProduct?.notes ?? "");
    setCoverImages(drafts.coverImages);
    setPriceIrt(nextPriceIrt);
    setTags(nextProduct?.tags ?? []);
    setIsActive(nextProduct?.isActive ?? false);
    setIsReviewSubmissionEnabled(nextProduct?.isReviewSubmissionEnabled ?? true);
    setIsReviewsSectionVisible(nextProduct?.isReviewsSectionVisible ?? true);
    setDiscountEnabled(nextDiscountEnabled);
    setDiscountKind(nextDiscountKind);
    setDiscountValue(nextDiscountValue);
    setVendor(drafts.vendor);
    setMaterialProfile(drafts.materialProfile);
    setSetPieces(drafts.setPieces);
    setFabrics(drafts.fabrics);
    setInitialSnapshot(
      buildProductFormSnapshot({
        title: nextProduct?.title ?? "",
        summary: nextProduct?.summary ?? "",
        fullDescription: nextProduct?.fullDescription ?? "",
        notes: nextProduct?.notes ?? "",
        priceIrt: nextPriceIrt,
        tags: nextProduct?.tags ?? [],
        isActive: nextProduct?.isActive ?? false,
        isReviewSubmissionEnabled: nextProduct?.isReviewSubmissionEnabled ?? true,
        isReviewsSectionVisible: nextProduct?.isReviewsSectionVisible ?? true,
        discountEnabled: nextDiscountEnabled,
        discountKind: nextDiscountKind,
        discountValue: nextDiscountValue,
        coverImages: drafts.coverImages,
        setPieces: drafts.setPieces,
        fabrics: drafts.fabrics,
      })
    );
  };

  const resetForm = (): void => {
    appliedFormKeyRef.current = null;
    applyFormState(null);
  };

  const closeDialog = (): void => {
    setFreeProductConfirmOpen(false);
    onClose();
    resetForm();
  };

  useEffect(() => {
    if (!open) {
      appliedFormKeyRef.current = null;
      return;
    }
    if (!isEditMode) {
      if (appliedFormKeyRef.current === "__create__") {
        return;
      }
      applyFormState(null);
      appliedFormKeyRef.current = "__create__";
      return;
    }
    if (!detailProduct || !productId) {
      return;
    }
    if (appliedFormKeyRef.current === productId) {
      return;
    }
    applyFormState(detailProduct);
    appliedFormKeyRef.current = productId;
  }, [productId, detailProduct, isEditMode, open]);

  const [createProduct, createProductResult] = useMutationWithSnackbar<
    ProductWriteMutationResult,
    ProductWriteMutationVariables
  >(PRODUCT_CREATE_MUTATION, {
    successMessage: "محصول جدید با موفقیت ایجاد شد.",
    onSuccess: () => {
      closeDialog();
      onSaved?.();
    },
  });

  const [updateProduct, updateProductResult] = useMutationWithSnackbar<
    ProductWriteMutationResult,
    ProductWriteMutationVariables
  >(PRODUCT_UPDATE_MUTATION, {
    successMessage: "محصول با موفقیت ویرایش شد.",
    onSuccess: () => {
      onSaved?.();
      appliedFormKeyRef.current = null;
      void refetchProductDetail();
    },
  });

  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadProgressByFieldId, setUploadProgressByFieldId] = useState<
    Record<string, UploadProgressEntry>
  >({});
  const isSubmitting =
    createProductResult.loading || updateProductResult.loading || isUploadingFiles;
  const isInitialEditFormLoading = isEditMode && detailProduct == null && detailLoading;
  const isProductDetailTabRefetching = isEditMode && networkStatus === NetworkStatus.refetch;
  const isEditFormReady = !isEditMode || detailProduct != null;
  const hasCreateInput = title.trim().length > 0;
  const hasEditFormChanges =
    initialSnapshot != null &&
    (hasFormChanges(initialSnapshot, currentSnapshot) ||
      hasPendingLocalFileSelections(coverImages, setPieces, fabrics));
  const canSubmit =
    isEditFormReady && !isSubmitting && (isEditMode ? hasEditFormChanges : hasCreateInput);
  const uploadingFieldIds = useMemo(
    () => new Set(Object.keys(uploadProgressByFieldId)),
    [uploadProgressByFieldId]
  );

  useEffect(() => {
    if (Object.keys(uploadProgressByFieldId).length === 0) {
      hideUploadProgress();
      return;
    }
    updateUploadProgress(calculateBatchUploadPercent(uploadProgressByFieldId));
  }, [hideUploadProgress, updateUploadProgress, uploadProgressByFieldId]);

  useEffect(() => {
    if (open) {
      setActiveFormSectionTab("intro");
      setReviewsRefreshToken(0);
    }
  }, [open, productId]);

  const handleFormSectionTabChange = (tab: ProductSectionTab): void => {
    if (tab === activeFormSectionTab) {
      return;
    }
    setActiveFormSectionTab(tab);
    if (!isEditMode || !productId) {
      return;
    }
    if (tab === "intro" || tab === "content") {
      void refetchProductDetail({ input: { id: productId } }, { fetchPolicy: "no-cache" }).then(
        (result) => {
          const row = result.data?.productDetail;
          if (!row || row.id !== productId) {
            return;
          }
          applyFormState(mapProductDetailRowToRecord(row));
          appliedFormKeyRef.current = productId;
        }
      );
      return;
    }
    if (tab === "reviews") {
      setReviewsRefreshToken((previous) => previous + 1);
    }
  };

  const uploadAndGetFileId = async (file: File, fieldId: string): Promise<string | null> => {
    const uploadPolicy = FILE_UPLOAD_POLICY.PRODUCT_COVER;
    setUploadProgressByFieldId((previous) => ({
      ...previous,
      [fieldId]: { loaded: 0, total: file.size },
    }));
    try {
      const result = await uploadFile(file, {
        policy: uploadPolicy,
        accept: "image/*",
        allowedFormatsLabel: "تصویر",
        maxSizeBytes: FILE_UPLOAD_POLICY_MAX_SIZE_BYTES[uploadPolicy],
        onProgress: (progress) => {
          setUploadProgressByFieldId((previous) => ({
            ...previous,
            [fieldId]: {
              loaded: Math.round((progress.percent / 100) * file.size),
              total: file.size,
            },
          }));
        },
      });
      setUploadProgressByFieldId((previous) => {
        const next = { ...previous };
        delete next[fieldId];
        return next;
      });
      return getFileIdFromAccessUrl(result.accessUrl);
    } catch (error) {
      setUploadProgressByFieldId((previous) => {
        const next = { ...previous };
        delete next[fieldId];
        return next;
      });
      if (error instanceof FileUploadError && error.message.trim()) {
        showError(error.message);
      }
      return null;
    }
  };

  const uploadSelectedFiles = async (): Promise<UploadedProductFileMap | null> => {
    const uploadTasks: UploadTask[] = [];

    for (const cover of coverImages) {
      if (!cover.file) {
        continue;
      }
      const fieldId = getCoverUploadFieldId(cover.id);
      uploadTasks.push({
        fieldId,
        file: cover.file,
        errorMessage: "آپلود تصویر کاور انجام نشد.",
        applyUploadedId: (uploadedFileId, files) => ({
          ...files,
          coverImageFileIdsByDraftId: {
            ...files.coverImageFileIdsByDraftId,
            [cover.id]: uploadedFileId,
          },
        }),
      });
    }

    for (const piece of setPieces) {
      for (const image of piece.images) {
        if (!image.file) {
          continue;
        }
        const fieldId = getSetPieceImageUploadFieldId(image.id);
        uploadTasks.push({
          fieldId,
          file: image.file,
          errorMessage: "آپلود تصویر قطعه انجام نشد.",
          applyUploadedId: (uploadedFileId, files) => ({
            ...files,
            setPieceImageFileIds: {
              ...files.setPieceImageFileIds,
              [image.id]: uploadedFileId,
            },
          }),
        });
      }
    }

    for (const fabric of fabrics) {
      for (const color of fabric.colors) {
        if (!color.aiImage.file) {
          continue;
        }
        const fieldId = getFabricColorImageUploadFieldId(color.aiImage.id);
        uploadTasks.push({
          fieldId,
          file: color.aiImage.file,
          errorMessage: "آپلود تصویر پارچه انجام نشد.",
          applyUploadedId: (uploadedFileId, files) => ({
            ...files,
            fabricColorImageFileIds: {
              ...files.fabricColorImageFileIds,
              [color.aiImage.id]: uploadedFileId,
            },
          }),
        });
      }
    }

    const uploadResults = await Promise.all(
      uploadTasks.map(async (task) => ({
        task,
        uploadedFileId: await uploadAndGetFileId(task.file, task.fieldId),
      }))
    );

    const failedUpload = uploadResults.find((result) => !result.uploadedFileId);
    if (failedUpload) {
      showError(failedUpload.task.errorMessage);
      return null;
    }

    return uploadResults.reduce<UploadedProductFileMap>(
      (files, result) =>
        result.task.applyUploadedId(result.uploadedFileId ?? "", files),
      {
        coverImageFileIdsByDraftId: {},
        setPieceImageFileIds: {},
        fabricColorImageFileIds: {},
      }
    );
  };

  const isFreeProductCandidate = (): boolean => {
    const parsedDiscountValue = parseOptionalNumber(discountValue);
    return (
      parsedPriceIrt == null ||
      parsedPriceIrt === 0 ||
      (discountEnabled &&
        hasPositivePrice &&
        discountKind === "PERCENTAGE" &&
        parsedDiscountValue === 100)
    );
  };

  const handleSubmit = async (skipFreeConfirmation = false): Promise<void> => {
    const validationResult = validateProductForm({
      title,
      parsedPriceIrt,
      discountEnabled,
      hasPositivePrice,
      discountKind,
      discountValue,
      vendor,
      setPieces,
      fabrics,
      parseOptionalNumber,
    });

    if (!validationResult.valid) {
      if (useEditSectionTabs) {
        setActiveFormSectionTab(validationResult.section);
      }
      showError(validationResult.message);
      return;
    }

    if (!skipFreeConfirmation && isFreeProductCandidate()) {
      setFreeProductConfirmOpen(true);
      return;
    }

    setFreeProductConfirmOpen(false);
    const parsedDiscountValue = parseOptionalNumber(discountValue);
    setIsUploadingFiles(true);
    setUploadProgressByFieldId({});
    let uploadedFiles: UploadedProductFileMap | null = null;
    try {
      uploadedFiles = await uploadSelectedFiles();
    } finally {
      setIsUploadingFiles(false);
      setUploadProgressByFieldId({});
    }
    if (!uploadedFiles) {
      return;
    }

    const mutationInput = buildProductWriteMutationInput({
      isEditMode,
      productId,
      title,
      summary,
      fullDescription,
      notes,
      priceIrt: parsedPriceIrt ?? 0,
      isActive,
      isReviewSubmissionEnabled,
      isReviewsSectionVisible,
      tags,
      discountEnabled,
      hasPositivePrice,
      discountKind,
      parsedDiscountValue,
      coverImages,
      vendor,
      materialProfile,
      setPieces,
      fabrics,
      uploadedFiles,
    });

    void (isEditMode ? updateProduct : createProduct)({
      variables: { input: mutationInput },
    });
  };

  return (
    <>
      <EntityModalShell
        open={open}
        onClose={closeDialog}
        disableClose={isSubmitting}
        hasUnsavedChanges={canSubmit}
        title={isEditMode ? "ویرایش محصول" : "محصول جدید"}
        subtitle={
          isEditMode
            ? t("pages.products.form.edit.subtitle")
            : t("pages.products.form.create.subtitle")
        }
        maxWidth="lg"
        pinFooterToBottomOnMobile
        resetKey={isEditMode ? `${productId ?? ""}-${isEditFormReady}` : undefined}
        footer={
          <ModalFooterActions
            actions={[
              {
                key: "close",
                isCloseButton: true,
                onClick: closeDialog,
                disabled: isSubmitting,
              },
              ...(isEditMode && onDelete && isIntroFormTabActive
                ? [
                    {
                      key: "delete",
                      label: "حذف محصول",
                      onClick: onDelete,
                      isDestructive: true,
                      disabled: isSubmitting,
                      icon: <DeleteRoundedIcon />,
                    },
                  ]
                : []),
              ...(isReviewsFormTabActive
                ? []
                : [
                    {
                      key: "submit",
                      label: isEditMode ? "ذخیره تغییرات" : "ایجاد محصول",
                      onClick: () => void handleSubmit(),
                      variant: "contained" as const,
                      color: "primary" as const,
                      icon: <AddRoundedIcon />,
                      disabled: !canSubmit,
                    },
                  ]),
            ]}
          />
        }
      >
        <Box sx={{ display: "grid", gap: "0.95rem" }}>
          {isInitialEditFormLoading ? (
            <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ minHeight: 320 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                در حال دریافت اطلاعات محصول...
              </Typography>
            </Stack>
          ) : (
            <>
              {useEditSectionTabs ? (
                <ProductFormSectionTabs
                  activeTab={activeFormSectionTab}
                  onChange={handleFormSectionTabChange}
                />
              ) : null}

              {isProductDetailTabRefetching &&
              (activeFormSectionTab === "intro" || activeFormSectionTab === "content") ? (
                <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ minHeight: 240 }}>
                  <CircularProgress size={28} />
                  <Typography variant="body2" color="text.secondary">
                    در حال بروزرسانی اطلاعات...
                  </Typography>
                </Stack>
              ) : (
                <>
                  {showIntroFormSection ? (
                    <div
                      id={useEditSectionTabs ? "product-form-intro" : undefined}
                      className={
                        useEditSectionTabs ? formSectionStyles.sectionScrollTarget : undefined
                      }
                    >
                      <MainInfoSection
                        title={title}
                        onTitleChange={setTitle}
                        summary={summary}
                        onSummaryChange={setSummary}
                        fullDescription={fullDescription}
                        onFullDescriptionChange={setFullDescription}
                        notes={notes}
                        onNotesChange={setNotes}
                        showAdminNotes={isSuperAdmin}
                        coverImages={coverImages}
                        onCoverImagesChange={setCoverImages}
                        priceIrt={priceIrt}
                        onPriceIrtChange={setPriceIrt}
                        tags={tags}
                        onTagsChange={setTags}
                        isActive={isActive}
                        onIsActiveChange={setIsActive}
                        isReviewSubmissionEnabled={isReviewSubmissionEnabled}
                        onIsReviewSubmissionEnabledChange={setIsReviewSubmissionEnabled}
                        isReviewsSectionVisible={isReviewsSectionVisible}
                        onIsReviewsSectionVisibleChange={setIsReviewsSectionVisible}
                        hasPositivePrice={hasPositivePrice}
                        discountEnabled={discountEnabled}
                        onDiscountEnabledChange={setDiscountEnabled}
                        discountKind={discountKind}
                        onDiscountKindChange={(kind) => {
                          setDiscountKind(kind);
                          setDiscountValue("");
                        }}
                        discountValue={discountValue}
                        onDiscountValueChange={setDiscountValue}
                        formatIntegerWithThousands={formatIntegerWithThousands}
                        sanitizePercentageValue={sanitizePercentageValue}
                        getCoverUploadFieldId={getCoverUploadFieldId}
                        uploadingFieldIds={uploadingFieldIds}
                        getFieldUploadPercent={(fieldId) =>
                          getFieldUploadPercent(uploadProgressByFieldId[fieldId])
                        }
                      />
                    </div>
                  ) : null}

                  {!useEditSectionTabs ? <Divider /> : null}

                  {showContentFormSection ? (
                    <div
                      id={useEditSectionTabs ? "product-form-content" : undefined}
                      className={
                        useEditSectionTabs ? formSectionStyles.sectionScrollTarget : undefined
                      }
                    >
                      <CatalogSection
                        vendor={vendor}
                        onVendorChange={setVendor}
                        materialProfile={materialProfile}
                        onMaterialProfileChange={setMaterialProfile}
                        setPieces={setPieces}
                        onSetPiecesChange={setSetPieces}
                        fabrics={fabrics}
                        onFabricsChange={setFabrics}
                        uploadProgressByFieldId={uploadProgressByFieldId}
                      />
                    </div>
                  ) : null}

                  {showReviewsFormSection ? (
                    <section
                      id="product-form-reviews"
                      className={`${formSectionStyles.reviewsSection} ${formSectionStyles.reviewsSectionPanel}`}
                    >
                      <div className={formSectionStyles.reviewsHeader}>
                        <Typography component="h3" variant="h6">
                          امتیاز و نظرات
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          مدیریت و بررسی نظرات ثبت‌شده برای این محصول
                        </Typography>
                      </div>
                      <ProductReviewsAdminSection
                        productId={productId!}
                        refreshToken={reviewsRefreshToken}
                      />
                    </section>
                  ) : null}
                </>
              )}
            </>
          )}
        </Box>
      </EntityModalShell>

      <EntityConfirmDialogShell
        open={freeProductConfirmOpen}
        onClose={() => setFreeProductConfirmOpen(false)}
        title={isEditMode ? "تایید ویرایش محصول رایگان" : "تایید ایجاد محصول رایگان"}
        footer={
          <ModalFooterActions
            actions={[
              { key: "close", isCloseButton: true, onClick: () => setFreeProductConfirmOpen(false) },
              {
                key: "submit",
                label: isEditMode ? "ذخیره محصول رایگان" : "ایجاد محصول رایگان",
                onClick: () => void handleSubmit(true),
                variant: "contained",
                color: "primary",
                disabled: isSubmitting,
              },
            ]}
          />
        }
      >
        <DialogContentText>
          {isEditMode
            ? "این محصول به‌صورت رایگان ذخیره می‌شود. آیا مطمئن هستید؟"
            : "این محصول به‌صورت رایگان ایجاد می‌شود. آیا مطمئن هستید؟"}
        </DialogContentText>
      </EntityConfirmDialogShell>
    </>
  );
};

export default ProductFormDialog;
