import type { CSSProperties, ReactElement } from "react";

import { normalizeFabricHexColor } from "./fabric-selection.util";
import type { ProductFabricColorRow, ProductFabricRow } from "./product-list.api";
import styles from "./styles/FabricPicker.module.scss";

type FabricPickerProps = {
  readonly activeFabrics: readonly ProductFabricRow[];
  readonly activeColors: readonly ProductFabricColorRow[];
  readonly selectedFabricKey: string | null;
  readonly selectedColorKey: string | null;
  readonly onFabricSelect: (fabricKey: string) => void;
  readonly onColorSelect: (colorKey: string) => void;
  readonly className?: string;
};

function FabricColorSwatch({
  color,
  isSelected,
  onSelect,
}: {
  readonly color: ProductFabricColorRow;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}): ReactElement {
  const swatchColor = normalizeFabricHexColor(color.hexCode);
  const swatchStyle = swatchColor
    ? ({ "--fabric-swatch-color": swatchColor } as CSSProperties)
    : undefined;

  return (
    <button
      type="button"
      role="listitem"
      aria-label={color.name}
      aria-pressed={isSelected}
      className={`${styles.colorSwatch}${isSelected ? ` ${styles.colorSwatchActive}` : ""}`}
      onClick={onSelect}
    >
      <span
        className={`${styles.colorSwatchInner}${
          swatchColor ? ` ${styles.colorSwatchInnerFilled}` : ""
        }`}
        style={swatchStyle}
      />
      <span className={styles.colorSwatchLabel}>{color.name}</span>
    </button>
  );
}

export function FabricPicker({
  activeFabrics,
  activeColors,
  selectedFabricKey,
  selectedColorKey,
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
    </div>
  );
}
