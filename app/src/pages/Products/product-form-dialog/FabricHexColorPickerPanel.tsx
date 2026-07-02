import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import { Stack, TextField, Typography } from "@mui/material";
import { memo, useMemo, type ChangeEvent, type ReactElement } from "react";

import {
  expandFabricHexToSixDigits,
  formatFabricHexForColorInput,
  normalizeFabricHexColor,
} from "../fabric-selection.util";
import { joinClassNames } from "../carousel-track.util";
import {
  FABRIC_HEX_COLOR_PICKER_FALLBACK,
  FABRIC_HEX_COLOR_PRESETS,
} from "./fabric-hex-color.constants";
import styles from "./styles/FabricHexColorField.module.scss";

type FabricHexColorPickerPanelProps = {
  readonly localHex: string;
  readonly onLocalHexChange: (hexCode: string) => void;
  readonly onLocalHexInput: (hexCode: string) => void;
  readonly onCommitHex: (hexCode: string) => void;
  readonly onTextBlur: () => void;
};

type PresetButtonProps = {
  readonly preset: string;
  readonly isActive: boolean;
  readonly onSelect: (preset: string) => void;
};

const PresetButton = memo(function PresetButton({
  preset,
  isActive,
  onSelect,
}: PresetButtonProps): ReactElement {
  return (
    <button
      type="button"
      role="listitem"
      className={joinClassNames(styles.presetButton, isActive && styles.presetButtonActive)}
      style={PRESET_BUTTON_STYLES[preset]}
      aria-label={preset}
      aria-pressed={isActive}
      onClick={() => onSelect(preset)}
    />
  );
});

const PRESET_BUTTON_STYLES = Object.fromEntries(
  FABRIC_HEX_COLOR_PRESETS.map((preset) => [preset, { backgroundColor: preset }]),
) as Record<string, { readonly backgroundColor: string }>;

function FabricHexColorPickerPanel({
  localHex,
  onLocalHexChange,
  onLocalHexInput,
  onCommitHex,
  onTextBlur,
}: FabricHexColorPickerPanelProps): ReactElement {
  const normalizedHex = useMemo(() => normalizeFabricHexColor(localHex), [localHex]);
  const colorInputValue = useMemo(
    () => formatFabricHexForColorInput(localHex, FABRIC_HEX_COLOR_PICKER_FALLBACK),
    [localHex],
  );
  const previewStyle = useMemo(
    () => (normalizedHex ? { backgroundColor: normalizedHex } : undefined),
    [normalizedHex],
  );
  const activePreset = normalizedHex?.toUpperCase() ?? null;

  const handleTextChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    onLocalHexChange(event.target.value);
  };

  const handleNativeColorInput = (event: ChangeEvent<HTMLInputElement>): void => {
    onLocalHexInput(event.currentTarget.value.toUpperCase());
  };

  return (
    <div className={styles.popoverContent}>
      <div className={styles.popoverHeader}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <PaletteRoundedIcon fontSize="small" color="primary" />
          <Typography component="p" className={styles.popoverTitle}>
            انتخاب کد رنگ
          </Typography>
        </Stack>
        <span
          className={joinClassNames(styles.previewSwatch, !normalizedHex && styles.previewSwatchEmpty)}
          style={previewStyle}
          aria-hidden="true"
        />
      </div>

      <div className={styles.nativePickerRow}>
        <span className={styles.nativePickerLabel}>طیف رنگ</span>
        <div className={styles.nativeColorSpectrum}>
          <input
            type="color"
            className={styles.nativeColorInput}
            value={colorInputValue}
            onInput={handleNativeColorInput}
            onChange={handleNativeColorInput}
            aria-label="طیف رنگ سیستم"
          />
        </div>
      </div>

      <div className={styles.presetsSection}>
        <span className={styles.presetsLabel}>رنگ‌های پیشنهادی</span>
        <div className={styles.presetsGrid} role="list">
          {FABRIC_HEX_COLOR_PRESETS.map((preset) => (
            <PresetButton
              key={preset}
              preset={preset}
              isActive={activePreset === preset}
              onSelect={onCommitHex}
            />
          ))}
        </div>
      </div>

      <TextField
        fullWidth
        size="small"
        label="کد HEX"
        value={localHex}
        onChange={handleTextChange}
        onBlur={onTextBlur}
        placeholder="#8B4513"
        className={styles.popoverHexField}
        inputProps={{
          dir: "ltr",
          lang: "en",
          spellCheck: false,
          autoCapitalize: "off",
          autoCorrect: "off",
        }}
      />
    </div>
  );
}

export default memo(FabricHexColorPickerPanel);
