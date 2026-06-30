import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import StraightenRoundedIcon from "@mui/icons-material/StraightenRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import WeekendRoundedIcon from "@mui/icons-material/WeekendRounded";
import { PAYMENTS_ENABLED } from "../../constants/payments.constants";
import { useAuth } from "../../contexts/AuthContext";
import { isMobileAppLayoutViewport } from "../../hooks/useMobileAppLayout";
import { APP_SHELL_ROUTES } from "../../routing/app-shell-routes";
import { PRODUCT_ROUTE_ID_PARAM, PRODUCTS_ROUTE_PATH } from "../../routing/product-route-path";
import { isMaxRoutePathname } from "../../routing/max-route.util";
import {
  buildProductLoginReturnState,
  buildProductPostLoginRedirect,
  setPostLoginRedirect,
} from "../../routing/post-login-redirect";
import { resolveFileAccessUrl } from "../../utils/fileAccessUrl.util";
import { CachedFileImage } from "../../shared/display/CachedFileImage";
import { useCachedFileAccessUrl } from "../../hooks/useCachedFileAccessUrl";
import PageBackNavigation from "../../shared/PageBackNavigation";
import { USER_PRODUCT_DETAIL_QUERY } from "../../graphql/queries/userProductDetail.query";
import { useProductPaymentStatusNotificationRefetch } from "../../hooks/useProductPaymentStatusNotificationRefetch";
import { useSnackbar } from "../../hooks/useSnackbar";
import { usePageSeoOverride } from "../../hooks/usePageSeoOverride";
import { useTranslation } from "../../hooks/useTranslation";
import { API_CONFIG } from "../../config";
import {
  buildBreadcrumbStructuredData,
  buildProductStructuredData,
} from "../../seo/build-structured-data";
import { resolveAppBaseUrl } from "../../seo/build-page-seo";
import type { PageSeoOverride } from "../../seo/seo.types";
import { buildSeoDescription, htmlToPlainText, resolveAbsoluteUrl } from "../../seo/seo-text.util";
import { resolveErrorMessageFromCode } from "../../utilities/graphql-error.util";
import { ProductPurchaseDialog } from "./ProductPurchaseDialog";
import ProductDetailSectionTabs, { type ProductDetailSectionTab } from "./ProductDetailSectionTabs";
import ProductReviewsSection from "./ProductReviewsSection";
import {
  canUseAdminProductReviewList,
  isStaffProductReviewer,
  resolveCanSubmitProductReview,
} from "./product-reviews.api";
import { useProductReviewList } from "./useProductReviewList";
import {
  resolveProductDetailSectionFromScroll,
  scrollToProductDetailSection,
} from "./product-detail-section-scroll.util";
import { PRODUCT_SECTION_TABS } from "./product-section-tabs.shared";
import {
  formatProductPrice,
  formatSetPieceDimensionText,
  getDiscountedPrice,
  getPurchaseCardAccessCaption,
  type ProductDetailRecord,
  type UserProductDetailQuery,
  type UserProductDetailQueryVariables,
} from "./product-detail.api";
import {
  getPrimaryCoverImageAccessUrl,
  type ProductFabricColorRow,
  type ProductFabricRow,
  type ProductMaterialProfileRow,
  type ProductSetPieceRow,
  type ProductVendorRow,
} from "./product-list.api";
import RichTextBox from "../../shared/forms/RichTextBox";
import styles from "./styles/ProductDetail.module.scss";

type CoverImageGalleryProps = {
  readonly title: string;
  readonly coverImageAccessUrls: ProductDetailRecord["coverImageAccessUrls"];
};

function CoverImageGallery({
  title,
  coverImageAccessUrls,
}: CoverImageGalleryProps): ReactElement {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = Math.min(activeIndex, Math.max(coverImageAccessUrls.length - 1, 0));
  const activeAccessUrl = coverImageAccessUrls[safeIndex] ?? null;
  const activeNetworkUrl = resolveFileAccessUrl(activeAccessUrl);
  const { url: activeImageUrl } = useCachedFileAccessUrl(activeAccessUrl);
  const hasMultipleImages = coverImageAccessUrls.length > 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [coverImageAccessUrls]);

  if (!activeImageUrl) {
    return (
      <div className={styles.heroMedia}>
        <div className={styles.heroGlow} />
        <WeekendRoundedIcon className={styles.heroIcon} />
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.galleryMain}>
        <CachedFileImage
          accessUrl={activeAccessUrl}
          networkUrl={activeNetworkUrl}
          alt={title}
          className={styles.heroCoverImage}
        />
      </div>
      {hasMultipleImages ? (
        <div className={styles.galleryThumbnails} role="tablist" aria-label="تصاویر محصول">
          {coverImageAccessUrls.map((accessUrl, index) => (
            <CoverThumbnailButton
              key={accessUrl.fileId ?? `${accessUrl.url}-${index}`}
              accessUrl={accessUrl}
              title={title}
              index={index}
              isActive={index === safeIndex}
              onSelect={() => setActiveIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CoverThumbnailButton({
  accessUrl,
  title,
  index,
  isActive,
  onSelect,
}: {
  readonly accessUrl: ProductDetailRecord["coverImageAccessUrls"][number];
  readonly title: string;
  readonly index: number;
  readonly isActive: boolean;
  readonly onSelect: () => void;
}): ReactElement {
  const networkUrl = resolveFileAccessUrl(accessUrl);
  const { url } = useCachedFileAccessUrl(accessUrl);

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-label={`تصویر ${(index + 1).toLocaleString("fa-IR")}`}
      className={`${styles.galleryThumb}${isActive ? ` ${styles.galleryThumbActive}` : ""}`}
      onClick={onSelect}
    >
      {url ? (
        <CachedFileImage
          accessUrl={accessUrl}
          networkUrl={networkUrl}
          alt={`${title} — تصویر ${(index + 1).toLocaleString("fa-IR")}`}
          className={styles.galleryThumbImage}
        />
      ) : (
        <span className={styles.galleryThumbPlaceholder} />
      )}
    </button>
  );
}

type FabricSelectorProps = {
  readonly fabrics: ProductFabricRow[];
};

function FabricSelector({ fabrics }: FabricSelectorProps): ReactElement | null {
  const activeFabrics = useMemo(
    () =>
      [...fabrics]
        .filter((fabric) => fabric.isActive)
        .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0)),
    [fabrics]
  );
  const [selectedFabricKey, setSelectedFabricKey] = useState<string | null>(null);
  const [selectedColorKey, setSelectedColorKey] = useState<string | null>(null);

  useEffect(() => {
    if (activeFabrics.length === 0) {
      setSelectedFabricKey(null);
      setSelectedColorKey(null);
      return;
    }

    setSelectedFabricKey((current) =>
      current && activeFabrics.some((fabric) => fabric.key === current) ?
        current
      : activeFabrics[0].key
    );
  }, [activeFabrics]);

  const selectedFabric = useMemo(() => {
    if (activeFabrics.length === 0) {
      return null;
    }

    return activeFabrics.find((fabric) => fabric.key === selectedFabricKey) ?? activeFabrics[0];
  }, [activeFabrics, selectedFabricKey]);

  const activeColors = useMemo(() => {
    if (!selectedFabric) {
      return [];
    }

    return [...selectedFabric.colors]
      .filter((color) => color.isActive)
      .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
  }, [selectedFabric]);

  useEffect(() => {
    if (!selectedFabric) {
      setSelectedColorKey(null);
      return;
    }

    setSelectedColorKey((current) =>
      current && activeColors.some((color) => color.key === current) ?
        current
      : activeColors[0]?.key ?? null
    );
  }, [activeColors, selectedFabric]);

  const selectedColor = useMemo(() => {
    if (activeColors.length === 0) {
      return null;
    }

    return activeColors.find((color) => color.key === selectedColorKey) ?? activeColors[0];
  }, [activeColors, selectedColorKey]);

  if (activeFabrics.length === 0) {
    return null;
  }

  return (
    <Paper className={styles.fabricSelector} elevation={0}>
      <div className={styles.fabricSelectorHeader}>
        <PaletteRoundedIcon fontSize="small" />
        <div>
          <h3>انتخاب پارچه و رنگ</h3>
          <p>الگو و رنگ دلخواه را انتخاب کنید و پیش‌نمایش هوشمند را ببینید.</p>
        </div>
      </div>

      <div className={styles.fabricPatterns} role="tablist" aria-label="الگوهای پارچه">
        {activeFabrics.map((fabric) => (
          <button
            key={fabric.key}
            type="button"
            role="tab"
            aria-selected={selectedFabric?.key === fabric.key}
            className={`${styles.fabricPatternChip}${
              selectedFabric?.key === fabric.key ? ` ${styles.fabricPatternChipActive}` : ""
            }`}
            onClick={() => {
              setSelectedFabricKey(fabric.key);
              const firstColor = [...fabric.colors]
                .filter((color) => color.isActive)
                .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))[0];
              setSelectedColorKey(firstColor?.key ?? null);
            }}
          >
            {fabric.patternName}
          </button>
        ))}
      </div>

      {activeColors.length > 0 ? (
        <div className={styles.fabricColors} role="list" aria-label="رنگ‌های پارچه">
          {activeColors.map((color) => (
            <FabricColorSwatch
              key={color.key}
              color={color}
              isSelected={selectedColor?.key === color.key}
              onSelect={() => setSelectedColorKey(color.key)}
            />
          ))}
        </div>
      ) : null}

      {selectedColor?.aiProductImageAccessUrl ? (
        <FabricAiPreview color={selectedColor} patternName={selectedFabric?.patternName ?? ""} />
      ) : null}
    </Paper>
  );
}

function FabricColorSwatch({
  color,
  isSelected,
  onSelect,
}: {
  readonly color: ProductFabricColorRow;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}): ReactElement {
  const swatchStyle =
    color.hexCode?.trim() ?
      ({ backgroundColor: color.hexCode.trim() } as const)
    : undefined;

  return (
    <button
      type="button"
      role="listitem"
      aria-label={color.name}
      aria-pressed={isSelected}
      className={`${styles.fabricColorSwatch}${isSelected ? ` ${styles.fabricColorSwatchActive}` : ""}`}
      onClick={onSelect}
    >
      <span className={styles.fabricColorSwatchInner} style={swatchStyle} />
      <span className={styles.fabricColorSwatchLabel}>{color.name}</span>
    </button>
  );
}

function FabricAiPreview({
  color,
  patternName,
}: {
  readonly color: ProductFabricColorRow;
  readonly patternName: string;
}): ReactElement {
  const networkUrl = resolveFileAccessUrl(color.aiProductImageAccessUrl);
  const { url } = useCachedFileAccessUrl(color.aiProductImageAccessUrl);

  return (
    <div className={styles.fabricPreview}>
      <div className={styles.fabricPreviewHeader}>
        <span>پیش‌نمایش هوشمند</span>
        <strong>
          {patternName} — {color.name}
        </strong>
      </div>
      {url ? (
        <CachedFileImage
          accessUrl={color.aiProductImageAccessUrl}
          networkUrl={networkUrl}
          alt={`پیش‌نمایش ${patternName} — ${color.name}`}
          className={styles.fabricPreviewImage}
        />
      ) : (
        <div className={styles.fabricPreviewPlaceholder}>
          <CircularProgress size={28} />
        </div>
      )}
    </div>
  );
}

function MaterialProfileCard({
  materialProfile,
}: {
  readonly materialProfile: ProductMaterialProfileRow;
}): ReactElement {
  const composition = materialProfile.composition ?? [];
  const secondaryMaterials = materialProfile.secondaryMaterials ?? [];

  return (
    <Paper className={styles.catalogCard} elevation={0}>
      <div className={styles.catalogCardHeader}>
        <CategoryRoundedIcon fontSize="small" />
        <h3>پروفایل متریال</h3>
      </div>
      <dl className={styles.catalogCardList}>
        {materialProfile.primaryMaterial?.trim() ? (
          <div>
            <dt>متریال اصلی</dt>
            <dd>{materialProfile.primaryMaterial.trim()}</dd>
          </div>
        ) : null}
        {materialProfile.texture?.trim() ? (
          <div>
            <dt>بافت</dt>
            <dd>{materialProfile.texture.trim()}</dd>
          </div>
        ) : null}
        {secondaryMaterials.length > 0 ? (
          <div>
            <dt>متریال‌های فرعی</dt>
            <dd>{secondaryMaterials.join("، ")}</dd>
          </div>
        ) : null}
      </dl>
      {composition.length > 0 ? (
        <ul className={styles.catalogCompositionList}>
          {composition.map((entry, index) => (
            <li key={`${entry.label}-${index}`}>
              <strong>{entry.label}</strong>
              <span>
                {[entry.material, entry.texture, entry.percentage != null ? `${entry.percentage.toLocaleString("fa-IR")}٪` : null]
                  .filter(Boolean)
                  .join(" — ")}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {materialProfile.careInstructions?.trim() ? (
        <p className={styles.catalogCardNote}>{materialProfile.careInstructions.trim()}</p>
      ) : null}
    </Paper>
  );
}

function VendorCard({ vendor }: { readonly vendor: ProductVendorRow }): ReactElement {
  return (
    <Paper className={styles.catalogCard} elevation={0}>
      <div className={styles.catalogCardHeader}>
        <StorefrontRoundedIcon fontSize="small" />
        <h3>اطلاعات فروشنده</h3>
      </div>
      <dl className={styles.catalogCardList}>
        <div>
          <dt>نام</dt>
          <dd>{vendor.name}</dd>
        </div>
        {vendor.phone?.trim() ? (
          <div>
            <dt>تلفن</dt>
            <dd>{vendor.phone.trim()}</dd>
          </div>
        ) : null}
        {vendor.address?.trim() ? (
          <div>
            <dt>آدرس</dt>
            <dd>{vendor.address.trim()}</dd>
          </div>
        ) : null}
      </dl>
      {vendor.notes?.trim() ? <p className={styles.catalogCardNote}>{vendor.notes.trim()}</p> : null}
    </Paper>
  );
}

function SetPieceCard({ setPiece }: { readonly setPiece: ProductSetPieceRow }): ReactElement {
  const imageAccessUrl = getPrimaryCoverImageAccessUrl(setPiece.imageAccessUrls);
  const networkUrl = resolveFileAccessUrl(imageAccessUrl);
  const { url: imageUrl } = useCachedFileAccessUrl(imageAccessUrl);
  const dimensions = [...setPiece.dimensions].sort(
    (left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0)
  );

  return (
    <article className={styles.setPieceCard}>
      <div className={styles.setPieceImageWrap}>
        {imageUrl ? (
          <CachedFileImage
            accessUrl={imageAccessUrl}
            networkUrl={networkUrl}
            alt={setPiece.name}
            className={styles.setPieceImage}
          />
        ) : (
          <div className={styles.setPieceImagePlaceholder}>
            <ViewModuleRoundedIcon />
          </div>
        )}
      </div>
      <div className={styles.setPieceBody}>
        <h4>{setPiece.name}</h4>
        {setPiece.description?.trim() ? <p>{setPiece.description.trim()}</p> : null}
        {dimensions.length > 0 ? (
          <ul className={styles.setPieceDimensions}>
            {dimensions.map((dimension, index) => {
              const text = formatSetPieceDimensionText(dimension);
              if (!text) {
                return null;
              }

              return (
                <li key={`${dimension.label ?? "dimension"}-${index}`}>
                  <StraightenRoundedIcon fontSize="inherit" />
                  <span>{text}</span>
                </li>
              );
            })}
          </ul>
        ) : null}
        {typeof setPiece.weightKg === "number" ? (
          <span className={styles.setPieceWeight}>
            وزن: {setPiece.weightKg.toLocaleString("fa-IR")} کیلوگرم
          </span>
        ) : null}
      </div>
    </article>
  );
}

const ProductDetail = (): ReactElement => {
  const params = useParams<Record<typeof PRODUCT_ROUTE_ID_PARAM, string | undefined>>();
  const productId = params[PRODUCT_ROUTE_ID_PARAM] ?? "";
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const { showError, showSuccess, showWarning } = useSnackbar();
  const { t } = useTranslation();
  const purchaseCardRef = useRef<HTMLElement | null>(null);
  const productDetailVariables = useMemo(
    (): UserProductDetailQueryVariables => ({ input: { id: productId || "" } }),
    [productId]
  );

  const { data, previousData, loading, error, refetch } = useQuery<
    UserProductDetailQuery,
    UserProductDetailQueryVariables
  >(USER_PRODUCT_DETAIL_QUERY, {
    variables: productDetailVariables,
    skip: !productId,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
  });

  const refetchProductDetail = useCallback(async () => {
    await refetch();
  }, [refetch]);

  useProductPaymentStatusNotificationRefetch({
    enabled: isAuthenticated && Boolean(productId),
    productId,
    refetch: () => {
      void refetchProductDetail();
    },
  });

  const product = data?.product ?? previousData?.product;
  const isStaffViewer = isStaffProductReviewer(user?.roles);
  const isReviewsSectionHiddenForEndUser =
    !isStaffViewer && product?.isReviewsSectionVisible === false;

  const reviewList = useProductReviewList({
    productId: productId || "",
    mode: isStaffViewer ? "admin" : "endUser",
    enabled:
      Boolean(productId) &&
      !isReviewsSectionHiddenForEndUser &&
      (isStaffViewer ? isAuthenticated && canUseAdminProductReviewList(user?.roles) : true),
    starsFilter: null,
    scrollRoot: "parent",
  });

  const primaryCoverAccessUrl = product ?
    getPrimaryCoverImageAccessUrl(product.coverImageAccessUrls)
  : null;
  const coverImageNetworkUrl = resolveFileAccessUrl(primaryCoverAccessUrl);
  const { url: coverImageUrl } = useCachedFileAccessUrl(primaryCoverAccessUrl);
  const discountedPrice = product ? getDiscountedPrice(product.priceIrt, product.discount) : null;
  const displayPrice = discountedPrice ?? product?.priceIrt ?? null;
  const discountLabel =
    product?.discount && discountedPrice != null ?
      product.discount.type === "PERCENTAGE" ?
        `${Math.min(product.discount.value, 100).toLocaleString("fa-IR")}٪ تخفیف`
      : `${formatProductPrice(product.discount.value)} تخفیف`
    : null;
  const isPaidPurchase = product?.purchaseStatus === "PAID" || product?.isPurchased === true;
  const hasPendingManualReview = product?.isFree !== true && product?.purchaseStatus === "PENDING";
  const hasPendingPurchase = hasPendingManualReview;
  const canAccessProduct = product?.isFree === true || isPaidPurchase;
  const isPaymentsDisabled = !PAYMENTS_ENABLED;
  const isPurchaseBlocked =
    isPaymentsDisabled && product?.isFree !== true && !canAccessProduct && !hasPendingPurchase;
  const shouldShowPrice = !isPaidPurchase;
  const shouldShowMobilePinnedPriceBar =
    !canAccessProduct && !hasPendingPurchase && !isPurchaseBlocked;
  const sortedSetPieces = useMemo(() => {
    if (!product) {
      return [];
    }

    return [...product.setPieces].sort(
      (left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0)
    );
  }, [product]);

  const [activeSectionTab, setActiveSectionTab] = useState<ProductDetailSectionTab>("intro");
  const [isMobilePriceBarVisible, setIsMobilePriceBarVisible] = useState(false);
  const isPurchaseDialogOpen = location.pathname.endsWith("/purchase");
  const isMaxRouteOpen = isMaxRoutePathname(location.pathname);

  const pageSeoOverride = useMemo((): PageSeoOverride | null => {
    if (!product) {
      return null;
    }

    const descriptionSource =
      product.fullDescription?.trim() || product.summary?.trim() || "";
    const plainDescription =
      descriptionSource ?
        htmlToPlainText(descriptionSource)
      : t("seo.pages.productDetail.description", { title: product.title });
    const seoDescription = buildSeoDescription(plainDescription);
    const appUrl = resolveAppBaseUrl(API_CONFIG.APP_URL);
    const canonicalPath = `${APP_SHELL_ROUTES.products}/${product.id}`;

    return {
      title: isPurchaseDialogOpen ? `${product.title} — تکمیل خرید` : product.title,
      description: seoDescription,
      keywords: [product.title, ...product.tags, "نمایشگاه مجازی مبلمان", "محصول دکوراسیون"].join(
        ", "
      ),
      image: coverImageNetworkUrl ?? undefined,
      imageAlt: product.title,
      canonicalPath,
      ogType: "product",
      noIndex: isPurchaseDialogOpen || isMaxRouteOpen,
      jsonLd: [
        ...buildProductStructuredData({
          appUrl,
          canonicalUrl: resolveAbsoluteUrl(appUrl, canonicalPath),
          productId: product.id,
          title: product.title,
          description: seoDescription,
          imageUrl: coverImageNetworkUrl ?? undefined,
          keywords: product.tags.join(", "),
          isFree: product.isFree,
          priceIrt: displayPrice,
        }),
        ...buildBreadcrumbStructuredData({
          appUrl,
          items: [
            {
              name: t("app.pageTitles.products"),
              url: resolveAbsoluteUrl(appUrl, PRODUCTS_ROUTE_PATH),
            },
            {
              name: product.title,
              url: resolveAbsoluteUrl(appUrl, `${APP_SHELL_ROUTES.products}/${product.id}`),
            },
          ],
        }),
      ],
    };
  }, [product, coverImageNetworkUrl, displayPrice, isMaxRouteOpen, isPurchaseDialogOpen, t]);

  usePageSeoOverride(pageSeoOverride);

  const purchaseIntentHandledRef = useRef(false);
  const pendingSectionTabRef = useRef<ProductDetailSectionTab | null>(null);
  const pendingSectionTabClearTimerRef = useRef<number | null>(null);

  const clearPendingSectionTab = useCallback((): void => {
    const tab = pendingSectionTabRef.current;
    pendingSectionTabRef.current = null;

    if (pendingSectionTabClearTimerRef.current != null) {
      window.clearTimeout(pendingSectionTabClearTimerRef.current);
      pendingSectionTabClearTimerRef.current = null;
    }

    if (tab) {
      setActiveSectionTab(tab);
    }
  }, []);

  useEffect(() => {
    purchaseIntentHandledRef.current = false;
  }, [productId]);

  const redirectToLoginForPurchase = useCallback((): void => {
    if (!productId) {
      return;
    }

    const redirect = buildProductPostLoginRedirect(productId);
    setPostLoginRedirect(redirect);
    const loginPath = isMobileAppLayoutViewport() ?
      APP_SHELL_ROUTES.profileLogin
    : APP_SHELL_ROUTES.login;
    navigate(loginPath, { state: buildProductLoginReturnState(productId) });
  }, [productId, navigate]);

  useEffect(() => {
    if (purchaseIntentHandledRef.current) {
      return;
    }

    if (isPaymentsDisabled) {
      return;
    }

    const locationState = location.state as { openProductPurchase?: boolean } | null;
    if (!locationState?.openProductPurchase) {
      return;
    }

    if (!isAuthenticated || loading || !product || canAccessProduct || hasPendingPurchase) {
      return;
    }

    purchaseIntentHandledRef.current = true;
    navigate(`${APP_SHELL_ROUTES.products}/${productId}/purchase`, { replace: true, state: null });
  }, [
    canAccessProduct,
    product,
    productId,
    hasPendingPurchase,
    isAuthenticated,
    isPaymentsDisabled,
    loading,
    location.pathname,
    location.search,
    location.state,
    navigate,
  ]);

  useEffect(() => {
    if (!isPaymentsDisabled || !isPurchaseDialogOpen || !productId) {
      return;
    }

    navigate(`${APP_SHELL_ROUTES.products}/${productId}`, { replace: true });
  }, [isPaymentsDisabled, isPurchaseDialogOpen, navigate, productId]);

  useEffect(() => {
    if (isAuthenticated || !isPurchaseDialogOpen || !productId) {
      return;
    }

    redirectToLoginForPurchase();
  }, [productId, isAuthenticated, isPurchaseDialogOpen, redirectToLoginForPurchase]);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (!paymentStatus) {
      return;
    }

    const refId = searchParams.get("refId");
    const reason = searchParams.get("reason");

    if (paymentStatus === "success") {
      showSuccess(
        refId ?
          `پرداخت با موفقیت انجام شد. کد پیگیری: ${refId}`
        : "پرداخت با موفقیت انجام شد و دسترسی محصول فعال شد."
      );
      void refetchProductDetail();
    } else if (paymentStatus === "cancelled") {
      showWarning("پرداخت لغو شد.");
    } else {
      showError(resolveErrorMessageFromCode(reason || "ZARINPAL_VERIFICATION_FAILED"));
    }

    setSearchParams({}, { replace: true });
  }, [refetchProductDetail, searchParams, setSearchParams, showError, showSuccess, showWarning]);

  useEffect(() => {
    setIsMobilePriceBarVisible(false);

    if (!product || canAccessProduct || hasPendingPurchase) {
      return;
    }

    const purchaseCard = purchaseCardRef.current;
    if (!purchaseCard) {
      return;
    }

    const mobileMediaQuery = window.matchMedia("(max-width: 37.5rem)");
    const updatePinnedPriceBar = (): void => {
      if (!mobileMediaQuery.matches) {
        setIsMobilePriceBarVisible(false);
        return;
      }

      const rect = purchaseCard.getBoundingClientRect();
      setIsMobilePriceBarVisible(rect.bottom <= 0);
    };

    updatePinnedPriceBar();
    window.addEventListener("scroll", updatePinnedPriceBar, { passive: true });
    window.addEventListener("resize", updatePinnedPriceBar);
    mobileMediaQuery.addEventListener("change", updatePinnedPriceBar);

    return () => {
      window.removeEventListener("scroll", updatePinnedPriceBar);
      window.removeEventListener("resize", updatePinnedPriceBar);
      mobileMediaQuery.removeEventListener("change", updatePinnedPriceBar);
    };
  }, [canAccessProduct, product, hasPendingPurchase]);

  const handleSectionTabChange = useCallback(
    (tab: ProductDetailSectionTab): void => {
      pendingSectionTabRef.current = tab;
      setActiveSectionTab(tab);

      if (pendingSectionTabClearTimerRef.current != null) {
        window.clearTimeout(pendingSectionTabClearTimerRef.current);
      }

      scrollToProductDetailSection(tab);

      pendingSectionTabClearTimerRef.current = window.setTimeout(() => {
        clearPendingSectionTab();
      }, 900);
    },
    [clearPendingSectionTab]
  );

  useEffect(() => {
    const handleScrollEnd = (): void => {
      if (pendingSectionTabRef.current) {
        clearPendingSectionTab();
      }
    };

    window.addEventListener("scrollend", handleScrollEnd, { passive: true });

    return () => {
      window.removeEventListener("scrollend", handleScrollEnd);
    };
  }, [clearPendingSectionTab]);

  useEffect(() => {
    if (!product) {
      return undefined;
    }

    const visibleTabs = PRODUCT_SECTION_TABS.map((tab) => tab.value);

    const syncActiveTabFromScroll = (): void => {
      if (pendingSectionTabRef.current) {
        return;
      }

      setActiveSectionTab(resolveProductDetailSectionFromScroll(visibleTabs));
    };

    syncActiveTabFromScroll();
    window.addEventListener("scroll", syncActiveTabFromScroll, { passive: true });
    window.addEventListener("resize", syncActiveTabFromScroll);

    return () => {
      window.removeEventListener("scroll", syncActiveTabFromScroll);
      window.removeEventListener("resize", syncActiveTabFromScroll);
    };
  }, [product]);

  const handlePrimaryProductAction = (): void => {
    if (canAccessProduct) {
      document.getElementById("product-content")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (hasPendingPurchase || isPurchaseBlocked) {
      return;
    }

    if (!isAuthenticated) {
      redirectToLoginForPurchase();
      return;
    }

    navigate(`${APP_SHELL_ROUTES.products}/${productId}/purchase`);
  };

  const closePurchaseDialog = (): void => {
    if (!productId) {
      return;
    }
    navigate(`${APP_SHELL_ROUTES.products}/${productId}`);
  };

  const handlePurchaseSuccess = (): void => {
    closePurchaseDialog();
    void refetchProductDetail();
  };

  if (!productId) {
    return (
      <Alert severity="error" className={styles.alert}>
        شناسه محصول معتبر نیست.
      </Alert>
    );
  }

  if (loading && !product) {
    return (
      <section className={styles.page}>
        <Skeleton variant="rounded" height={320} />
        <Skeleton variant="rounded" height={180} />
        <Skeleton variant="rounded" height={180} />
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className={styles.page}>
        <Alert
          severity="error"
          className={styles.alert}
          action={
            <Button color="inherit" size="small" onClick={() => void refetchProductDetail()}>
              تلاش دوباره
            </Button>
          }
        >
          دریافت جزئیات محصول با خطا مواجه شد.
        </Alert>
      </section>
    );
  }

  const purchaseCardAccessCaption = getPurchaseCardAccessCaption();
  const catalogStatsLabel = [
    sortedSetPieces.length > 0 ?
      `${sortedSetPieces.length.toLocaleString("fa-IR")} قطعه`
    : null,
    product.fabrics.length > 0 ? `${product.fabrics.length.toLocaleString("fa-IR")} پارچه` : null,
  ]
    .filter(Boolean)
    .join(" / ");

  return (
    <section className={`${styles.page} ${styles.pageWithSectionTabs}`}>
      <ProductDetailSectionTabs
        activeTab={activeSectionTab}
        onChange={handleSectionTabChange}
        tabs={PRODUCT_SECTION_TABS}
      />

      <Paper
        id="product-intro"
        className={`${styles.hero} ${styles.sectionScrollTarget}`}
        elevation={0}
      >
        <div className={styles.heroBackNav}>
          <PageBackNavigation
            label="بازگشت به محصولات"
            fallbackTo={PRODUCTS_ROUTE_PATH}
            mobileOverlay
          />
        </div>

        <div className={styles.heroMediaWrap}>
          <CoverImageGallery title={product.title} coverImageAccessUrls={product.coverImageAccessUrls} />
          {catalogStatsLabel ? (
            <div className={styles.heroStats}>
              <span>{catalogStatsLabel}</span>
            </div>
          ) : null}
        </div>

        <div className={styles.heroBody}>
          <h1>{product.title}</h1>
          {product.summary?.trim() ? <p>{product.summary.trim()}</p> : null}

          {product.tags.length > 0 ? (
            <div className={styles.tags}>
              {product.tags.map((tag) => (
                <Chip key={tag} size="small" label={tag} variant="outlined" />
              ))}
            </div>
          ) : null}
        </div>

        <aside ref={purchaseCardRef} className={styles.purchaseCard}>
          {shouldShowPrice ? (
            <>
              {!product.isFree ? <span className={styles.purchaseEyebrow}>قیمت محصول</span> : null}
              <strong className={styles.currentPrice}>
                {product.isFree ? "دسترسی رایگان" : formatProductPrice(displayPrice)}
              </strong>
            </>
          ) : (
            <Typography variant="body2" color="success.main" fontWeight={800}>
              شما این محصول را خریده‌اید.
            </Typography>
          )}
          {shouldShowPrice && discountedPrice != null ? (
            <div className={styles.discountLine}>
              <span className={styles.originalPrice}>{formatProductPrice(product.priceIrt)}</span>
              {discountLabel ? <span className={styles.discountBadge}>{discountLabel}</span> : null}
            </div>
          ) : null}
          <Button
            variant="contained"
            size="large"
            startIcon={canAccessProduct ? <ViewModuleRoundedIcon /> : <ShoppingCartRoundedIcon />}
            onClick={handlePrimaryProductAction}
            disabled={hasPendingPurchase || isPurchaseBlocked}
          >
            {canAccessProduct ?
              "مشاهده کاتالوگ"
            : hasPendingManualReview ?
              "در انتظار تایید پرداخت"
            : isPurchaseBlocked ?
              "خرید موقتاً غیرفعال"
            : "خرید محصول"}
          </Button>
          {isPurchaseBlocked ?
            <Typography variant="caption" color="text.secondary">
              {t("errors.exceptions.PAYMENTS_TEMPORARILY_DISABLED")}
            </Typography>
          : hasPendingManualReview ?
            <Typography variant="caption" color="text.secondary">
              درخواست پرداخت شما ثبت شده و در حال بررسی است. پس از تایید، دسترسی محصول فعال می‌شود.
            </Typography>
          : !canAccessProduct ?
            <Typography variant="caption" color="text.secondary">
              {purchaseCardAccessCaption}
            </Typography>
          : null}
        </aside>
      </Paper>

      {shouldShowMobilePinnedPriceBar ?
        <div
          className={`${styles.mobilePinnedPriceBar}${
            isMobilePriceBarVisible ? ` ${styles.mobilePinnedPriceBarVisible}` : ""
          }`}
          data-opaque-shell
          aria-hidden={!isMobilePriceBarVisible}
        >
          <div className={styles.mobilePinnedPriceInfo}>
            <span>{product.isFree ? "دسترسی رایگان" : "قیمت محصول"}</span>
            <div className={styles.mobilePinnedPriceLine}>
              <strong>{formatProductPrice(displayPrice)}</strong>
              {discountedPrice != null && discountLabel ?
                <span className={styles.mobilePinnedDiscountBadge}>{discountLabel}</span>
              : null}
            </div>
          </div>
          <Button
            size="small"
            variant="contained"
            startIcon={<ShoppingCartRoundedIcon />}
            tabIndex={isMobilePriceBarVisible ? undefined : -1}
            onClick={handlePrimaryProductAction}
          >
            خرید
          </Button>
        </div>
      : null}

      <div id="product-content" className={`${styles.contentLayout} ${styles.sectionScrollTarget}`}>
        <div className={styles.contentHeader}>
          <div>
            <h2>کاتالوگ و مشخصات</h2>
            <p>
              {canAccessProduct ?
                "جزئیات قطعات، متریال، پارچه‌ها و اطلاعات تکمیلی محصول را در این بخش ببینید."
              : "برای مشاهده کاتالوگ کامل، ابتدا محصول را خریداری کنید."}
            </p>
          </div>
          {loading ? <CircularProgress size={22} /> : null}
        </div>

        {canAccessProduct ?
          <>
            {product.fabrics.length > 0 ? <FabricSelector fabrics={product.fabrics} /> : null}

            {sortedSetPieces.length > 0 ?
              <div className={styles.setPieceGrid}>
                {sortedSetPieces.map((setPiece) => (
                  <SetPieceCard key={setPiece.key} setPiece={setPiece} />
                ))}
              </div>
            : (
              <p className={styles.emptyCatalogMessage}>قطعه‌ای برای این محصول ثبت نشده است.</p>
            )}

            <div className={styles.catalogCardsRow}>
              {product.materialProfile ? (
                <MaterialProfileCard materialProfile={product.materialProfile} />
              ) : null}
              {product.vendor ? <VendorCard vendor={product.vendor} /> : null}
            </div>

            {product.fullDescription?.trim() ?
              <Paper className={styles.catalogDescriptionCard} elevation={0}>
                <h3>توضیحات کامل</h3>
                <RichTextBox mode="render" label="" value={product.fullDescription.trim()} hideLabel />
              </Paper>
            : null}
          </>
        : (
          <div className={styles.contentLockedNotice}>
            <LockRoundedIcon />
            <div>
              <strong>کاتالوگ محصول قفل است</strong>
              <p>برای مشاهده قطعات، پارچه‌ها و پیش‌نمایش هوشمند، محصول را خریداری کنید.</p>
            </div>
          </div>
        )}
      </div>

      <div className={styles.sectionContentSeparator} role="separator" aria-hidden="true" />

      <section
        id="product-reviews"
        className={`${styles.reviewsSection} ${styles.sectionScrollTarget}${
          isReviewsSectionHiddenForEndUser ? ` ${styles.reviewsSectionDisabled}` : ""
        }`}
        aria-labelledby="product-reviews-heading"
      >
        <div className={styles.reviewsHeader}>
          <h2 id="product-reviews-heading">امتیاز و نظرات</h2>
          <p>امتیاز شرکت‌کنندگان و تجربه واقعی استفاده از محصول</p>
        </div>

        {productId ?
          <ProductReviewsSection
            productId={productId}
            reviewList={reviewList}
            isFree={product.isFree}
            isReviewsSectionVisible={product.isReviewsSectionVisible !== false}
            isReviewSubmissionEnabled={product.isReviewSubmissionEnabled !== false}
            canSubmitReview={resolveCanSubmitProductReview({
              isAuthenticated,
              isFree: product?.isFree,
              isPurchased: product?.isPurchased,
              purchaseStatus: product?.purchaseStatus,
              roles: user?.roles,
              isReviewsSectionVisible: product?.isReviewsSectionVisible,
              isReviewSubmissionEnabled: product?.isReviewSubmissionEnabled,
            })}
          />
        : null}
      </section>

      {PAYMENTS_ENABLED ?
        <ProductPurchaseDialog
          open={isPurchaseDialogOpen}
          onClose={closePurchaseDialog}
          onPurchaseSuccess={handlePurchaseSuccess}
          product={product}
          displayPrice={displayPrice}
          originalPrice={product.priceIrt}
          discountLabel={discountLabel}
          coverImageUrl={coverImageUrl}
        />
      : null}
    </section>
  );
};

export default ProductDetail;
