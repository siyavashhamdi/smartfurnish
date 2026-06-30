import { Paper } from "@mui/material";
import type { ReactElement } from "react";

import { FabricPicker } from "./FabricPicker";
import { ProductAiPreviewButton } from "./ProductAiPreviewButtons";
import { resolveProductDetailSectionTabDefinition } from "./product-section-tabs.shared";
import type { FabricSelectionController } from "./useFabricSelection";
import styles from "./styles/FabricSelector.module.scss";

type FabricSelectorProps = {
  readonly fabricSelection: FabricSelectionController;
  readonly showSectionTitle?: boolean;
  readonly onAiPreviewClick?: () => void;
  readonly aiPreviewActionRef?: (node: HTMLDivElement | null) => void;
};

export function FabricSelector({
  fabricSelection,
  showSectionTitle = false,
  onAiPreviewClick,
  aiPreviewActionRef,
}: FabricSelectorProps): ReactElement | null {
  if (fabricSelection.activeFabrics.length === 0) {
    return null;
  }

  const sectionLabel =
    resolveProductDetailSectionTabDefinition("fabrics")?.label ?? "پارچه‌ها";

  const selectorShell = (
    <Paper className={styles.shell} elevation={0}>
      <FabricPicker
        activeFabrics={fabricSelection.activeFabrics}
        activeColors={fabricSelection.activeColors}
        selectedFabricKey={fabricSelection.selectedFabricKey}
        selectedColorKey={fabricSelection.selectedColorKey}
        onFabricSelect={fabricSelection.selectFabric}
        onColorSelect={fabricSelection.selectColor}
      />

      {onAiPreviewClick ? (
        <div ref={aiPreviewActionRef} className={styles.aiPreviewAction}>
          <ProductAiPreviewButton fullWidth onClick={onAiPreviewClick} />
        </div>
      ) : null}
    </Paper>
  );

  if (showSectionTitle) {
    return (
      <section className={styles.section} aria-label={sectionLabel}>
        <h2 className={styles.sectionTitle}>{sectionLabel}</h2>
        {selectorShell}
      </section>
    );
  }

  return selectorShell;
}
