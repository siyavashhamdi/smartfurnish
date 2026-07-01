import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { Alert, Button, Chip, CircularProgress, Paper, Skeleton, Typography } from "@mui/material";
import { PAYMENTS_ENABLED } from "../../constants/payments.constants";
import { useAuth } from "../../contexts/AuthContext";
import { APP_SHELL_ROUTES } from "../../routing/app-shell-routes";
import { PRODUCT_ROUTE_ID_PARAM, PRODUCTS_ROUTE_PATH } from "../../routing/product-route-path";
import { isMaxRoutePathname } from "../../routing/max-route.util";
import { resolveFileAccessUrl } from "../../utils/fileAccessUrl.util";
import { useCachedFileAccessUrl } from "../../hooks/useCachedFileAccessUrl";
import PageBackNavigation from "../../shared/PageBackNavigation";
import { USER_PRODUCT_DETAIL_QUERY } from "../../graphql/queries/userProductDetail.query";
import { useProductPaymentStatusNotificationRefetch } from "../../hooks/useProductPaymentStatusNotificationRefetch";
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
import { ProductPurchaseDialog } from "./ProductPurchaseDialog";
import ProductDetailSectionTabs from "./ProductDetailSectionTabs";
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
import {
  buildVisibleProductDetailTabs,
  PRODUCT_DETAIL_SECTION_TABS,
  PRODUCT_DETAIL_SECTION_TARGETS,
  resolveProductDetailSectionTabDefinition,
  type ProductDetailSectionTab,
} from "./product-section-tabs.shared";
import {
  formatProductPrice,
  getDiscountedPrice,
  PRODUCT_PRICE_FROM_LABEL,
  type UserProductDetailQuery,
  type UserProductDetailQueryVariables,
} from "./product-detail.api";
import { resolveColorPricing, resolveProductListPricing } from "./product-pricing.util";
import {
  getPrimaryCoverImageAccessUrl,
  type ProductMaterialProfileRow,
} from "./product-list.api";
import RichTextBox from "../../shared/forms/RichTextBox";
import { ProductDetailCoverGallery } from "./ProductDetailCoverGallery";
import { FabricSelector } from "./FabricSelector";
import { ProductAiPreviewDialog } from "./ProductAiPreviewDialog";
import {
  ProductAiPreviewButton,
  ProductInPersonVisitButton,
} from "./ProductAiPreviewButtons";
import { useProductAiPreviewRoute } from "./useProductAiPreviewRoute";
import { ProductSetPiecesGallery } from "./ProductSetPiecesGallery";
import { useFabricSelection } from "./useFabricSelection";
import styles from "./styles/ProductDetail.module.scss";
import priceDisplayStyles from "./styles/product-price-display.module.scss";

function ProductDetailSectionHeader({
  section,
  loading,
}: {
  readonly section: ProductDetailSectionTab;
  readonly loading?: boolean;
}): ReactElement | null {
  const definition = resolveProductDetailSectionTabDefinition(section);
  if (!definition) {
    return null;
  }

  const headingId = `${PRODUCT_DETAIL_SECTION_TARGETS[section]}-heading`;

  return (
    <div className={styles.detailSectionHeader}>
      <h2 id={headingId}>{definition.label}</h2>
      {loading ? <CircularProgress size={22} /> : null}
    </div>
  );
}

function MaterialProfileCard({
  materialProfile,
}: {
  readonly materialProfile: ProductMaterialProfileRow;
}): ReactElement {
  const careInstructions = materialProfile.careInstructions?.trim() ?? "";

  return (
    <Paper className={styles.catalogCard} elevation={0}>
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
      </dl>
      {careInstructions ? (
        <div className={styles.catalogCardNoteBlock}>
          <p className={styles.catalogCardNoteTitle}>دستور نگهداری</p>
          <p className={styles.catalogCardNote}>{careInstructions}</p>
        </div>
      ) : null}
    </Paper>
  );
}

const ProductDetail = (): ReactElement => {
  const params = useParams<Record<typeof PRODUCT_ROUTE_ID_PARAM, string | undefined>>();
  const productId = params[PRODUCT_ROUTE_ID_PARAM] ?? "";
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isOpen: isAiPreviewDialogOpen,
    initialStepId: aiPreviewInitialStepId,
    open: openAiPreviewDialog,
    openToStep: openAiPreviewToStep,
    close: closeAiPreviewDialog,
  } = useProductAiPreviewRoute(productId);
  const { isAuthenticated, isRegisteredUser, user } = useAuth();
  const { t } = useTranslation();
  const purchaseCardRef = useRef<HTMLElement | null>(null);
  const fabricAiPreviewObserverRef = useRef<IntersectionObserver | null>(null);
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
    enabled: isRegisteredUser && Boolean(productId),
    productId,
    refetch: () => {
      void refetchProductDetail();
    },
  });

  const product = data?.product ?? previousData?.product;
  const fabricSelection = useFabricSelection(product?.fabrics ?? []);
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

  const primaryCoverAccessUrl = product
    ? getPrimaryCoverImageAccessUrl(product.coverImageAccessUrls)
    : null;
  const coverImageSeoUrl = resolveFileAccessUrl(
    primaryCoverAccessUrl,
    undefined,
    "full",
  );
  const { url: coverImageUrl } = useCachedFileAccessUrl(primaryCoverAccessUrl, {
    variant: "thumbnail",
  });
  const selectedColorPricing = resolveColorPricing(fabricSelection.selectedColor);
  const fallbackListPricing = product
    ? resolveProductListPricing(product, { activeOnly: true })
    : { priceIrt: null, discount: null };
  const activePricing =
    selectedColorPricing.priceIrt != null ? selectedColorPricing : fallbackListPricing;
  const productListPriceIrt = activePricing.priceIrt;
  const discountedPrice = product
    ? getDiscountedPrice(productListPriceIrt, activePricing.discount ?? product.discount)
    : null;
  const displayPrice = discountedPrice ?? productListPriceIrt;
  const activeDiscount = activePricing.discount ?? product?.discount ?? null;
  const discountLabel =
    activeDiscount && discountedPrice != null
      ? activeDiscount.type === "PERCENTAGE"
        ? `${Math.min(activeDiscount.value, 100).toLocaleString("fa-IR")}٪ تخفیف`
        : `${formatProductPrice(activeDiscount.value)} تخفیف`
      : null;
  const hasDisplayPrice = displayPrice != null && displayPrice > 0;
  const sortedSetPieces = useMemo(() => {
    if (!product) {
      return [];
    }

    return [...product.setPieces].sort(
      (left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0)
    );
  }, [product]);

  const visibleSectionTabs = useMemo(
    () =>
      buildVisibleProductDetailTabs({
        fabricsCount: product?.fabrics.length ?? 0,
        setPiecesCount: sortedSetPieces.length,
        hasMaterialProfile: Boolean(product?.materialProfile),
        showReviews: !isReviewsSectionHiddenForEndUser,
      }),
    [product, sortedSetPieces.length, isReviewsSectionHiddenForEndUser]
  );

  const sectionTabItems = useMemo(
    () =>
      PRODUCT_DETAIL_SECTION_TABS.filter((tab) => visibleSectionTabs.includes(tab.value)).map(
        ({ value, label }) => ({ value, label })
      ),
    [visibleSectionTabs]
  );

  const [activeSectionTab, setActiveSectionTab] = useState<ProductDetailSectionTab>("intro");
  const [isMobilePinnedAiBarEligible, setIsMobilePinnedAiBarEligible] = useState(false);
  const [isFabricAiPreviewButtonInView, setIsFabricAiPreviewButtonInView] = useState(false);
  const isMobilePinnedAiBarVisible = isMobilePinnedAiBarEligible;
  const isPurchaseDialogOpen = location.pathname.endsWith("/purchase");
  const isMaxRouteOpen = isMaxRoutePathname(location.pathname);

  const pageSeoOverride = useMemo((): PageSeoOverride | null => {
    if (!product) {
      return null;
    }

    const descriptionSource = product.fullDescription?.trim() || product.summary?.trim() || "";
    const plainDescription = descriptionSource
      ? htmlToPlainText(descriptionSource)
      : t("seo.pages.productDetail.description", { title: product.title });
    const seoDescription = buildSeoDescription(plainDescription);
    const appUrl = resolveAppBaseUrl(API_CONFIG.APP_URL);
    const canonicalPath = `${APP_SHELL_ROUTES.products}/${product.id}`;

    return {
      title: isPurchaseDialogOpen
        ? `${product.title} — تکمیل خرید`
        : isAiPreviewDialogOpen
          ? `${product.title} — ${t("app.pageTitles.productAiPreview")}`
          : product.title,
      description: seoDescription,
      keywords: [product.title, ...product.tags, "نمایشگاه مجازی مبلمان", "محصول دکوراسیون"].join(
        ", "
      ),
      image: coverImageSeoUrl ?? undefined,
      imageAlt: product.title,
      canonicalPath,
      ogType: "product",
      noIndex: isPurchaseDialogOpen || isMaxRouteOpen || isAiPreviewDialogOpen,
      jsonLd: [
        ...buildProductStructuredData({
          appUrl,
          canonicalUrl: resolveAbsoluteUrl(appUrl, canonicalPath),
          productId: product.id,
          title: product.title,
          description: seoDescription,
          imageUrl: coverImageSeoUrl ?? undefined,
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
  }, [product, coverImageSeoUrl, displayPrice, isAiPreviewDialogOpen, isMaxRouteOpen, isPurchaseDialogOpen, t]);

  usePageSeoOverride(pageSeoOverride);

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

  const handleInPersonVisitRequest = useCallback((): void => {
    openAiPreviewToStep("contact");
  }, [openAiPreviewToStep]);

  useEffect(() => {
    if (!product) {
      setIsMobilePinnedAiBarEligible(false);
      return;
    }

    const purchaseCard = purchaseCardRef.current;
    if (!purchaseCard) {
      return;
    }

    const mobileMediaQuery = window.matchMedia("(max-width: 37.5rem)");
    const updatePinnedAiBarEligibility = (): void => {
      if (!mobileMediaQuery.matches) {
        setIsMobilePinnedAiBarEligible(false);
        return;
      }

      const rect = purchaseCard.getBoundingClientRect();
      setIsMobilePinnedAiBarEligible(rect.bottom <= 0);
    };

    updatePinnedAiBarEligibility();
    window.addEventListener("scroll", updatePinnedAiBarEligibility, { passive: true });
    window.addEventListener("resize", updatePinnedAiBarEligibility);
    mobileMediaQuery.addEventListener("change", updatePinnedAiBarEligibility);

    return () => {
      window.removeEventListener("scroll", updatePinnedAiBarEligibility);
      window.removeEventListener("resize", updatePinnedAiBarEligibility);
      mobileMediaQuery.removeEventListener("change", updatePinnedAiBarEligibility);
    };
  }, [product]);

  const handleFabricAiPreviewActionRef = useCallback((node: HTMLDivElement | null): void => {
    fabricAiPreviewObserverRef.current?.disconnect();
    fabricAiPreviewObserverRef.current = null;

    if (!node) {
      setIsFabricAiPreviewButtonInView(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFabricAiPreviewButtonInView(entry?.isIntersecting ?? false);
      },
      { threshold: 0.08 }
    );

    observer.observe(node);
    fabricAiPreviewObserverRef.current = observer;
  }, []);

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

    const syncActiveTabFromScroll = (): void => {
      if (pendingSectionTabRef.current) {
        return;
      }

      setActiveSectionTab(resolveProductDetailSectionFromScroll(visibleSectionTabs));
    };

    syncActiveTabFromScroll();
    window.addEventListener("scroll", syncActiveTabFromScroll, { passive: true });
    window.addEventListener("resize", syncActiveTabFromScroll);

    return () => {
      window.removeEventListener("scroll", syncActiveTabFromScroll);
      window.removeEventListener("resize", syncActiveTabFromScroll);
    };
  }, [product, visibleSectionTabs]);

  useEffect(() => {
    if (!visibleSectionTabs.includes(activeSectionTab)) {
      setActiveSectionTab(visibleSectionTabs[0] ?? "intro");
    }
  }, [activeSectionTab, visibleSectionTabs]);

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

  return (
    <section className={`${styles.page} ${styles.pageWithSectionTabs}`}>
      <ProductDetailSectionTabs
        activeTab={activeSectionTab}
        onChange={handleSectionTabChange}
        tabs={sectionTabItems}
      />

      <section
        id={PRODUCT_DETAIL_SECTION_TARGETS.intro}
        className={`${styles.detailSection} ${styles.sectionScrollTarget}`}
        aria-labelledby={`${PRODUCT_DETAIL_SECTION_TARGETS.intro}-heading`}
      >
        <ProductDetailSectionHeader section="intro" loading={loading} />
        <Paper className={styles.hero} elevation={0}>
        <div className={styles.heroBackNav}>
          <PageBackNavigation
            label="بازگشت به محصولات"
            fallbackTo={PRODUCTS_ROUTE_PATH}
            mobileOverlay
          />
        </div>

        <div className={styles.heroMediaWrap}>
          <ProductDetailCoverGallery
            title={product.title}
            coverImageAccessUrls={product.coverImageAccessUrls}
          />
        </div>

        <div className={styles.heroBody}>
          <h1>{product.title}</h1>
          {product.fullDescription?.trim() ? (
            <div className={styles.heroDescription}>
              <RichTextBox
                mode="render"
                label=""
                value={product.fullDescription.trim()}
                hideLabel
                showMaximize={false}
              />
            </div>
          ) : null}

          {product.tags.length > 0 ? (
            <div className={styles.tags}>
              {product.tags.map((tag) => (
                <Chip key={tag} size="small" label={tag} variant="outlined" />
              ))}
            </div>
          ) : null}
        </div>

        <aside ref={purchaseCardRef} className={styles.purchaseCard}>
          {hasDisplayPrice ? (
            <>
              <span className={styles.purchaseEyebrow}>{PRODUCT_PRICE_FROM_LABEL}</span>
              {discountedPrice != null ? (
                <div className={priceDisplayStyles.discountLine}>
                  <span className={priceDisplayStyles.originalPrice}>
                    {formatProductPrice(productListPriceIrt)}
                  </span>
                  {discountLabel ? (
                    <span className={priceDisplayStyles.discountBadge}>{discountLabel}</span>
                  ) : null}
                </div>
              ) : null}
              <strong
                className={`${priceDisplayStyles.value} ${priceDisplayStyles.valueLarge} ${priceDisplayStyles.valueCentered}`}
              >
                {formatProductPrice(displayPrice)}
              </strong>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary" fontWeight={700}>
              قیمت محصول ثبت نشده است.
            </Typography>
          )}
          <div className={styles.purchaseActions}>
            <ProductAiPreviewButton fullWidth onClick={openAiPreviewDialog} />
            <ProductInPersonVisitButton fullWidth onClick={handleInPersonVisitRequest} />
          </div>
        </aside>
        </Paper>
      </section>

      <div
        className={`${styles.mobilePinnedPriceBar}${
          isMobilePinnedAiBarVisible ? ` ${styles.mobilePinnedPriceBarVisible}` : ""
        }`}
        data-opaque-shell
        aria-hidden={!isMobilePinnedAiBarVisible}
      >
        {isFabricAiPreviewButtonInView ? (
          <ProductInPersonVisitButton
            fullWidth
            size="small"
            tabIndex={isMobilePinnedAiBarVisible ? undefined : -1}
            onClick={handleInPersonVisitRequest}
          />
        ) : (
          <>
            <ProductAiPreviewButton
              fullWidth
              size="small"
              tabIndex={isMobilePinnedAiBarVisible ? undefined : -1}
              onClick={openAiPreviewDialog}
            />
            <ProductInPersonVisitButton
              fullWidth
              size="small"
              tabIndex={isMobilePinnedAiBarVisible ? undefined : -1}
              onClick={handleInPersonVisitRequest}
            />
          </>
        )}
      </div>

      {sortedSetPieces.length > 0 ? (
        <>
          <div className={styles.sectionContentSeparator} role="separator" aria-hidden="true" />
          <section
            id={PRODUCT_DETAIL_SECTION_TARGETS.setPieces}
            className={`${styles.detailSection} ${styles.sectionScrollTarget}`}
            aria-labelledby={`${PRODUCT_DETAIL_SECTION_TARGETS.setPieces}-heading`}
          >
            <ProductDetailSectionHeader section="setPieces" />
            <ProductSetPiecesGallery title={product.title} setPieces={sortedSetPieces} />
          </section>
        </>
      ) : null}

      {product.materialProfile ? (
        <>
          <div className={styles.sectionContentSeparator} role="separator" aria-hidden="true" />
          <section
            id={PRODUCT_DETAIL_SECTION_TARGETS.material}
            className={`${styles.detailSection} ${styles.sectionScrollTarget}`}
            aria-labelledby={`${PRODUCT_DETAIL_SECTION_TARGETS.material}-heading`}
          >
            <ProductDetailSectionHeader section="material" />
            <MaterialProfileCard materialProfile={product.materialProfile} />
          </section>
        </>
      ) : null}

      {product.fabrics.length > 0 ? (
        <>
          <div className={styles.sectionContentSeparator} role="separator" aria-hidden="true" />
          <section
            id={PRODUCT_DETAIL_SECTION_TARGETS.fabrics}
            className={`${styles.detailSection} ${styles.sectionScrollTarget}`}
            aria-labelledby={`${PRODUCT_DETAIL_SECTION_TARGETS.fabrics}-heading`}
          >
            <ProductDetailSectionHeader section="fabrics" />
            <FabricSelector
              fabricSelection={fabricSelection}
              aiPreviewActionRef={handleFabricAiPreviewActionRef}
              onAiPreviewClick={openAiPreviewDialog}
            />
          </section>
        </>
      ) : null}

      {!isReviewsSectionHiddenForEndUser ? (
        <>
          <div className={styles.sectionContentSeparator} role="separator" aria-hidden="true" />
          <section
            id={PRODUCT_DETAIL_SECTION_TARGETS.reviews}
            className={`${styles.detailSection} ${styles.reviewsSection} ${styles.sectionScrollTarget}${
              isReviewsSectionHiddenForEndUser ? ` ${styles.reviewsSectionDisabled}` : ""
            }`}
            aria-labelledby={`${PRODUCT_DETAIL_SECTION_TARGETS.reviews}-heading`}
          >
            <ProductDetailSectionHeader section="reviews" />
            {productId ? (
              <ProductReviewsSection
                productId={productId}
                reviewList={reviewList}
                isReviewsSectionVisible={product.isReviewsSectionVisible !== false}
                isReviewSubmissionEnabled={product.isReviewSubmissionEnabled !== false}
                canSubmitReview={resolveCanSubmitProductReview({
                  isAuthenticated: isRegisteredUser,
                  roles: user?.roles,
                  isReviewsSectionVisible: product?.isReviewsSectionVisible,
                  isReviewSubmissionEnabled: product?.isReviewSubmissionEnabled,
                })}
              />
            ) : null}
          </section>
        </>
      ) : null}

      {PAYMENTS_ENABLED ? (
        <ProductPurchaseDialog
          open={isPurchaseDialogOpen}
          onClose={closePurchaseDialog}
          onPurchaseSuccess={handlePurchaseSuccess}
          product={product}
          displayPrice={displayPrice}
          originalPrice={productListPriceIrt}
          discountLabel={discountLabel}
          coverImageUrl={coverImageUrl}
        />
      ) : null}

      <ProductAiPreviewDialog
        open={isAiPreviewDialogOpen}
        onClose={closeAiPreviewDialog}
        initialStepId={aiPreviewInitialStepId}
        productId={product.id}
        productTitle={product.title}
        coverImageAccessUrls={product.coverImageAccessUrls}
        fabricSelection={fabricSelection}
      />
    </section>
  );
};

export default ProductDetail;
