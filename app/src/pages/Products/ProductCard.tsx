import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactElement } from "react";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DoNotDisturbOnRoundedIcon from "@mui/icons-material/DoNotDisturbOnRounded";
import { Chip } from "@mui/material";
import { OverflowTooltip } from "../../shared/OverflowTooltip";
import { CachedFileImage } from "../../shared/display/CachedFileImage";
import { resolveFileAccessUrl } from "../../utils/fileAccessUrl.util";
import type { FileAccessUrl } from "../../utils/fileAccessUrl.util";
import { formatProductPrice, getDiscountedPrice } from "./product-detail.api";
import { getPrimaryCoverImageAccessUrl, type ProductListRecord } from "./product-list.api";
import { ProductCardCoverCarousel } from "./ProductCardCoverCarousel";
import ProductCardWarrantyRibbon from "./ProductCardWarrantyRibbon";
import { getProductTagChipSx } from "./product-tag-colors.util";
import styles from "./styles/ProductCard.module.scss";
import AppTooltip from "../../shared/AppTooltip";

interface ProductCardProps {
  readonly item: ProductListRecord;
  readonly variant?: "management" | "public";
  readonly onOpen: () => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  readonly onEdit?: (item: ProductListRecord) => void;
}

const ProductCard = ({
  item,
  variant = "management",
  onOpen,
  onKeyDown,
  onEdit,
}: ProductCardProps): ReactElement => {
  const isManagement = variant === "management";
  const statusChipClass = item.isActive ? styles.statusActive : styles.statusInactive;
  const coverImageAccessUrls = item.coverImageAccessUrls;
  const fallbackCover = getPrimaryCoverImageAccessUrl(coverImageAccessUrls);
  const [activeCover, setActiveCover] = useState<FileAccessUrl | null>(fallbackCover);
  const suppressCardClickRef = useRef(false);
  const [carouselDotsMount, setCarouselDotsMount] = useState<HTMLDivElement | null>(null);
  const tagRowRef = useRef<HTMLDivElement>(null);
  const tagDragStateRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    isHorizontalDrag: false,
    decided: false,
  });
  const discountedPrice = getDiscountedPrice(item.priceIrt, item.discount);
  const discountLabel =
    item.discount && discountedPrice != null
      ? item.discount.type === "PERCENTAGE"
        ? `${Math.min(item.discount.value, 100).toLocaleString("fa-IR")}٪ تخفیف`
        : `${formatProductPrice(item.discount.value)} تخفیف`
      : null;
  const activeCoverNetworkUrl = resolveFileAccessUrl(activeCover);

  useEffect(() => {
    setActiveCover(fallbackCover);
  }, [fallbackCover, item.id]);

  const handleActiveAccessUrlChange = useCallback((accessUrl: FileAccessUrl | null): void => {
    setActiveCover(accessUrl);
  }, []);

  const handleCarouselInteraction = useCallback((): void => {
    suppressCardClickRef.current = true;
  }, []);

  const handleTagPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    const tagRow = tagRowRef.current;
    if (!tagRow) {
      return;
    }
    event.stopPropagation();
    tagRow.setPointerCapture(event.pointerId);
    tagDragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: tagRow.scrollLeft,
      isHorizontalDrag: false,
      decided: false,
    };
  };

  const resetTagDragState = (): void => {
    tagDragStateRef.current = {
      pointerId: -1,
      startX: 0,
      startY: 0,
      startScrollLeft: 0,
      isHorizontalDrag: false,
      decided: false,
    };
  };

  const handleTagPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    const tagRow = tagRowRef.current;
    const dragState = tagDragStateRef.current;
    if (!tagRow || dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = Math.abs(event.clientX - dragState.startX);
    const deltaY = Math.abs(event.clientY - dragState.startY);

    if (!dragState.decided) {
      if (deltaX < 6 && deltaY < 6) {
        return;
      }
      dragState.decided = true;
      dragState.isHorizontalDrag = deltaX > deltaY;
      if (!dragState.isHorizontalDrag) {
        tagRow.releasePointerCapture(event.pointerId);
        resetTagDragState();
        return;
      }
    }

    if (!dragState.isHorizontalDrag) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    tagRow.scrollLeft = dragState.startScrollLeft + dragState.startX - event.clientX;
  };

  const handleTagPointerEnd = (event: PointerEvent<HTMLDivElement>): void => {
    const tagRow = tagRowRef.current;
    if (tagDragStateRef.current.pointerId !== event.pointerId) {
      return;
    }
    event.stopPropagation();
    tagRow?.releasePointerCapture(event.pointerId);
    resetTagDragState();
  };

  const handleCardClick = (): void => {
    if (suppressCardClickRef.current) {
      suppressCardClickRef.current = false;
      return;
    }

    if (isManagement) {
      onEdit?.(item);
      return;
    }
    onOpen();
  };

  return (
    <article
      data-card-id={item.id}
      className={styles.productCard}
      role="button"
      tabIndex={0}
      onMouseDown={(event) => {
        if (event.button === 0) {
          event.preventDefault();
        }
      }}
      onClick={handleCardClick}
      onKeyDown={onKeyDown}
      aria-label={item.title}
    >
      {!isManagement ? <ProductCardWarrantyRibbon /> : null}

      <div className={styles.coverWrap}>
        <ProductCardCoverCarousel
          title={item.title}
          coverImageAccessUrls={coverImageAccessUrls}
          onActiveAccessUrlChange={handleActiveAccessUrlChange}
          onCarouselInteraction={handleCarouselInteraction}
          dotsContainer={carouselDotsMount}
        />

        {isManagement ? (
          <div className={styles.topChipsRow} onClick={(event) => event.stopPropagation()}>
            <AppTooltip
              title={item.isActive ? "وضعیت فعال" : "وضعیت غیرفعال"}
              arrow
              leaveTouchDelay={2200}
            >
              <span className={styles.statusChipWrap}>
                <Chip
                  size="small"
                  icon={
                    item.isActive ? (
                      <CheckCircleRoundedIcon fontSize="small" />
                    ) : (
                      <DoNotDisturbOnRoundedIcon fontSize="small" />
                    )
                  }
                  aria-label={item.isActive ? "وضعیت فعال" : "وضعیت غیرفعال"}
                  className={`${styles.iconOnlyChip} ${styles.statusChip} ${statusChipClass}`}
                />
              </span>
            </AppTooltip>
          </div>
        ) : null}

        <div className={styles.coverContent}>
          <h3>
            <OverflowTooltip className={styles.titleText} title={item.title}>
              {item.title}
            </OverflowTooltip>
          </h3>
          {item.summary?.trim() ? (
            <p>
              <OverflowTooltip className={styles.descriptionText} title={item.summary.trim()}>
                {item.summary.trim()}
              </OverflowTooltip>
            </p>
          ) : null}
          {item.tags.length > 0 ? (
            <div
              ref={tagRowRef}
              className={styles.tagRow}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={handleTagPointerDown}
              onPointerMove={handleTagPointerMove}
              onPointerUp={handleTagPointerEnd}
              onPointerCancel={handleTagPointerEnd}
            >
              {item.tags.map((tag) => (
                <Chip
                  key={`${item.id}-tag-${tag}`}
                  size="small"
                  label={
                    <OverflowTooltip className={styles.tagText} title={tag}>
                      {tag}
                    </OverflowTooltip>
                  }
                  variant="outlined"
                  className={`${styles.tagChip} ${styles.overlayTagChip}`}
                  sx={getProductTagChipSx(tag)}
                />
              ))}
            </div>
          ) : null}
          {coverImageAccessUrls.length > 1 ? (
            <div ref={setCarouselDotsMount} className={styles.coverCarouselDotsRow} />
          ) : null}
        </div>

        <div className={styles.priceFooter}>
          <div className={styles.priceBarBackdrop} aria-hidden="true">
            {activeCover ? (
              <CachedFileImage
                accessUrl={activeCover}
                networkUrl={activeCoverNetworkUrl}
                fileId={activeCover?.fileId}
                alt=""
                className={styles.priceBarCoverImage}
                loading="eager"
              />
            ) : (
              <span className={styles.priceBarCoverFallback} />
            )}
            <span className={styles.priceBarBackdropScrim} />
          </div>
          <div
            className={`${styles.priceBar}${
              item.isPurchased
                ? ` ${styles.priceBarPurchased}`
                : discountedPrice == null
                  ? ""
                  : ` ${styles.priceBarDiscounted}`
            }`}
          >
            {item.isPurchased ? (
              <>
                <span className={styles.priceBarLabel}>وضعیت محصول</span>
                <span className={styles.purchasedContent}>
                  <CheckCircleRoundedIcon fontSize="small" />
                  <span>خریداری شده</span>
                </span>
              </>
            ) : (
              <>
                <span className={styles.priceBarLabel}>قیمت محصول</span>
                <span className={styles.priceContent}>
                  {discountedPrice == null ? null : (
                    <span className={styles.originalPriceRow}>
                      {discountLabel ? (
                        <span className={styles.discountBadge}>{discountLabel}</span>
                      ) : null}
                      <span className={styles.originalPriceText}>
                        {formatProductPrice(item.priceIrt)}
                      </span>
                    </span>
                  )}
                  <span className={styles.priceText}>
                    {formatProductPrice(discountedPrice ?? item.priceIrt)}
                  </span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
