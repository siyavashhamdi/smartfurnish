import { memo, useMemo, type ReactElement } from "react";

import { normalizeFabricHexColor } from "../fabric-selection.util";
import { joinClassNames } from "../carousel-track.util";
import styles from "./styles/CatalogSection.module.scss";

type CatalogColorTitleSwatchProps = {
  readonly hexCode: string;
};

export const CatalogColorTitleSwatch = memo(function CatalogColorTitleSwatch({
  hexCode,
}: CatalogColorTitleSwatchProps): ReactElement {
  const swatchColor = useMemo(() => normalizeFabricHexColor(hexCode), [hexCode]);
  const swatchStyle = useMemo(
    () => (swatchColor ? { backgroundColor: swatchColor } : undefined),
    [swatchColor],
  );

  return (
    <span className={styles.colorTitleSwatch} aria-hidden="true">
      <span
        className={joinClassNames(
          styles.colorTitleSwatchInner,
          swatchColor && styles.colorTitleSwatchInnerFilled,
        )}
        style={swatchStyle}
      />
    </span>
  );
});
