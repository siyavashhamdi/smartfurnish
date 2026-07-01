import { useEffect, useState, type ReactElement } from "react";

import { useMobileAppLayout } from "../../hooks/useMobileAppLayout";
import AppTooltip from "../../shared/AppTooltip";
import { normalizeFabricHexColor } from "./fabric-selection.util";
import {
  formatProductPrice,
  getDiscountedPrice,
} from "./product-detail.api";
import type { ProductFabricColorRow, ProductFabricRow } from "./product-list.api";
import { getDiscountedColorPriceIrt, resolveColorPricing } from "./product-pricing.util";
import styles from "./styles/FabricPicker.module.scss";
import priceDisplayStyles from "./styles/product-price-display.module.scss";

type FabricPickerProps = {
  readonly activeFabrics: readonly ProductFabricRow[];
  readonly activeColors: readonly ProductFabricColorRow[];
  readonly selectedFabricKey: string | null;
  readonly selectedColorKey: string | null;
  readonly selectedColor: ProductFabricColorRow | null;
  readonly onFabricSelect: (fabricKey: string) => void;
  readonly onColorSelect: (colorKey: string) => void;
  readonly className?: string;
};

const FABRIC_COLOR_SWATCH_TOOLTIP_POPPER_PROPS = {
  popperOptions: {
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, -17],
        },
      },
    ],
  },
} as const;

function FabricColorSwatch({
  color,
  isSelected,
  onSelect,
}: {
  readonly color: ProductFabricColorRow;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}): ReactElement {
  const isMobileLayout = useMobileAppLayout();
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const swatchColor = normalizeFabricHexColor(color.hexCode);
  const swatchStyle = swatchColor ? { backgroundColor: swatchColor } : undefined;

  useEffect(() => {
    if (!isMobileLayout || !isTooltipOpen) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsTooltipOpen(false);
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isMobileLayout, isTooltipOpen]);

  const handleSelect = (): void => {
    onSelect();
    if (isMobileLayout) {
      setIsTooltipOpen(true);
    }
  };

  return (
    <AppTooltip
      title={color.name}
      arrow
      placement="top"
      PopperProps={FABRIC_COLOR_SWATCH_TOOLTIP_POPPER_PROPS}
      open={isMobileLayout ? isTooltipOpen : undefined}
      onClose={() => setIsTooltipOpen(false)}
      disableTouchListener={isMobileLayout}
    >
      <button
        type="button"
        role="listitem"
        aria-label={color.name}
        aria-pressed={isSelected}
        className={`${styles.colorSwatch}${isSelected ? ` ${styles.colorSwatchActive}` : ""}`}
        onClick={handleSelect}
      >
        <span
          className={`${styles.colorSwatchInner}${
            swatchColor ? ` ${styles.colorSwatchInnerFilled}` : ""
          }`}
          style={swatchStyle}
        />
      </button>
    </AppTooltip>
  );
}

function FabricSelectedPrice({
  color,
}: {
  readonly color: ProductFabricColorRow | null;
}): ReactElement | null {
  if (!color) {
    return null;
  }

  const pricing = resolveColorPricing(color);
  const finalPrice = getDiscountedColorPriceIrt(color);
  if (finalPrice == null || finalPrice <= 0) {
    return null;
  }

  const discountedPrice = getDiscountedPrice(pricing.priceIrt, pricing.discount);
  const hasDiscount = discountedPrice != null;
  const discountLabel =
    hasDiscount && pricing.discount
      ? pricing.discount.type === "PERCENTAGE"
        ? `${Math.min(pricing.discount.value, 100).toLocaleString("fa-IR")}٪ تخفیف`
        : `${formatProductPrice(pricing.discount.value)} تخفیف`
      : null;

  return (
    <div className={styles.selectedPrice}>
      {hasDiscount ? (
        <div className={priceDisplayStyles.discountLine}>
          <span className={priceDisplayStyles.originalPrice}>
            {formatProductPrice(pricing.priceIrt)}
          </span>
          {discountLabel ? (
            <span className={priceDisplayStyles.discountBadge}>{discountLabel}</span>
          ) : null}
        </div>
      ) : null}
      <div className={styles.selectedPriceLine}>
        <span className={styles.selectedPriceLabel}>قیمت نهایی</span>
        <strong
          className={`${priceDisplayStyles.value} ${priceDisplayStyles.valueMedium}`}
        >
          {formatProductPrice(finalPrice)}
        </strong>
      </div>
    </div>
  );
}

export function FabricPicker({
  activeFabrics,
  activeColors,
  selectedFabricKey,
  selectedColorKey,
  selectedColor,
  onFabricSelect,
  onColorSelect,
  className,
}: FabricPickerProps): ReactElement | null {
  if (activeFabrics.length === 0) {
    return null;
  }

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <div className={styles.patterns} role="tablist" aria-label="الگوهای پارچه">
        {activeFabrics.map((fabric) => (
          <button
            key={fabric.key}
            type="button"
            role="tab"
            aria-selected={selectedFabricKey === fabric.key}
            className={`${styles.patternChip}${
              selectedFabricKey === fabric.key ? ` ${styles.patternChipActive}` : ""
            }`}
            onClick={() => onFabricSelect(fabric.key)}
          >
            {fabric.patternName}
          </button>
        ))}
      </div>

      {activeColors.length > 0 ? (
        <div className={styles.colors} role="list" aria-label="رنگ‌های پارچه">
          {activeColors.map((color) => (
            <FabricColorSwatch
              key={color.key}
              color={color}
              isSelected={selectedColorKey === color.key}
              onSelect={() => onColorSelect(color.key)}
            />
          ))}
        </div>
      ) : null}

      <FabricSelectedPrice color={selectedColor} />
    </div>
  );
}
