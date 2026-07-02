import { memo, useCallback, type ReactElement } from "react";

import FabricHexColorField from "./FabricHexColorField";

type FabricColorHexFieldCellProps = {
  readonly fabricId: string;
  readonly colorId: string;
  readonly hexCode: string;
  readonly onColorHexChange: (fabricId: string, colorId: string, hexCode: string) => void;
};

function FabricColorHexFieldCell({
  fabricId,
  colorId,
  hexCode,
  onColorHexChange,
}: FabricColorHexFieldCellProps): ReactElement {
  const handleChange = useCallback(
    (nextHexCode: string): void => {
      onColorHexChange(fabricId, colorId, nextHexCode);
    },
    [colorId, fabricId, onColorHexChange],
  );

  return <FabricHexColorField value={hexCode} onChange={handleChange} />;
}

export default memo(FabricColorHexFieldCell);
