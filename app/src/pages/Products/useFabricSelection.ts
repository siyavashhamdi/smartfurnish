import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getActiveColorsForFabric,
  getActiveFabrics,
  getFirstActiveColorKey,
} from "./fabric-selection.util";
import type { ProductFabricColorRow, ProductFabricRow } from "./product-list.api";

export type FabricSelectionController = {
  readonly activeFabrics: ProductFabricRow[];
  readonly selectedFabric: ProductFabricRow | null;
  readonly selectedColor: ProductFabricColorRow | null;
  readonly activeColors: ProductFabricColorRow[];
  readonly selectedFabricKey: string | null;
  readonly selectedColorKey: string | null;
  readonly selectFabric: (fabricKey: string) => void;
  readonly selectColor: (colorKey: string) => void;
};

export function useFabricSelection(fabrics: readonly ProductFabricRow[]): FabricSelectionController {
  const activeFabrics = useMemo(() => getActiveFabrics(fabrics), [fabrics]);
  const [selectedFabricKey, setSelectedFabricKey] = useState<string | null>(null);
  const [selectedColorKey, setSelectedColorKey] = useState<string | null>(null);

  useEffect(() => {
    if (activeFabrics.length === 0) {
      setSelectedFabricKey(null);
      setSelectedColorKey(null);
      return;
    }

    setSelectedFabricKey((current) =>
      current && activeFabrics.some((fabric) => fabric.key === current)
        ? current
        : activeFabrics[0]?.key ?? null
    );
  }, [activeFabrics]);

  const selectedFabric = useMemo(() => {
    if (activeFabrics.length === 0) {
      return null;
    }

    return activeFabrics.find((fabric) => fabric.key === selectedFabricKey) ?? activeFabrics[0] ?? null;
  }, [activeFabrics, selectedFabricKey]);

  const activeColors = useMemo(() => {
    if (!selectedFabric) {
      return [];
    }

    return getActiveColorsForFabric(selectedFabric);
  }, [selectedFabric]);

  useEffect(() => {
    if (!selectedFabric) {
      setSelectedColorKey(null);
      return;
    }

    setSelectedColorKey((current) =>
      current && activeColors.some((color) => color.key === current)
        ? current
        : (activeColors[0]?.key ?? null)
    );
  }, [activeColors, selectedFabric]);

  const selectedColor = useMemo(() => {
    if (activeColors.length === 0) {
      return null;
    }

    return activeColors.find((color) => color.key === selectedColorKey) ?? activeColors[0] ?? null;
  }, [activeColors, selectedColorKey]);

  const selectFabric = useCallback(
    (fabricKey: string): void => {
      const fabric = activeFabrics.find((entry) => entry.key === fabricKey);
      if (!fabric) {
        return;
      }

      setSelectedFabricKey(fabricKey);
      setSelectedColorKey(getFirstActiveColorKey(fabric));
    },
    [activeFabrics]
  );

  const selectColor = useCallback((colorKey: string): void => {
    setSelectedColorKey(colorKey);
  }, []);

  return {
    activeFabrics,
    selectedFabric,
    selectedColor,
    activeColors,
    selectedFabricKey,
    selectedColorKey,
    selectFabric,
    selectColor,
  };
}
