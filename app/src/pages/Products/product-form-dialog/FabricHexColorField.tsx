import { InputAdornment, Popover, TextField } from "@mui/material";
import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
} from "react";

import {
  expandFabricHexToSixDigits,
  normalizeFabricHexColor,
  sanitizeFabricHexDraft,
} from "../fabric-selection.util";
import { joinClassNames } from "../carousel-track.util";
import FabricHexColorPickerPanel from "./FabricHexColorPickerPanel";
import styles from "./styles/FabricHexColorField.module.scss";

type FabricHexColorFieldProps = {
  readonly value: string;
  readonly onChange: (hexCode: string) => void;
  readonly label?: string;
  readonly fullWidth?: boolean;
};

function commitPickedHex(hex: string): string {
  const expanded = expandFabricHexToSixDigits(hex);
  return expanded ?? hex.toUpperCase();
}

function FabricHexColorField({
  value,
  onChange,
  label = "کد رنگ",
  fullWidth = true,
}: FabricHexColorFieldProps): ReactElement {
  const popoverId = useId();
  const fieldContainerRef = useRef<HTMLDivElement>(null);
  const [pickerAnchor, setPickerAnchor] = useState<HTMLElement | null>(null);
  const [localHex, setLocalHex] = useState(value);
  const isPickerOpen = pickerAnchor != null;

  useEffect(() => {
    if (!isPickerOpen) {
      setLocalHex(value);
    }
  }, [isPickerOpen, value]);

  const normalizedHex = useMemo(() => normalizeFabricHexColor(value), [value]);
  const swatchStyle = useMemo(
    () => (normalizedHex ? { backgroundColor: normalizedHex } : undefined),
    [normalizedHex],
  );

  const commitHex = useCallback(
    (rawHex: string): void => {
      const nextHex = commitPickedHex(sanitizeFabricHexDraft(rawHex));
      setLocalHex(nextHex);
      if (nextHex !== value) {
        onChange(nextHex);
      }
    },
    [onChange, value],
  );

  const handleLocalHexChange = useCallback((rawHex: string): void => {
    setLocalHex(sanitizeFabricHexDraft(rawHex));
  }, []);

  const handleLocalHexInput = useCallback((rawHex: string): void => {
    setLocalHex(rawHex.toUpperCase());
  }, []);

  const handleTextBlur = useCallback((): void => {
    const expanded = expandFabricHexToSixDigits(localHex);
    const nextHex = expanded ?? sanitizeFabricHexDraft(localHex);
    commitHex(nextHex);
  }, [commitHex, localHex]);

  const openPicker = useCallback((): void => {
    if (isPickerOpen) {
      return;
    }
    setLocalHex(value);
    setPickerAnchor(fieldContainerRef.current);
  }, [isPickerOpen, value]);

  const closePicker = useCallback((): void => {
    const expanded = expandFabricHexToSixDigits(localHex);
    const nextHex = expanded ?? sanitizeFabricHexDraft(localHex);
    commitHex(nextHex);
    setPickerAnchor(null);
  }, [commitHex, localHex]);

  const handleSwatchClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>): void => {
      event.preventDefault();
      event.stopPropagation();
      openPicker();
    },
    [openPicker],
  );

  const handleFieldClick = useCallback((): void => {
    openPicker();
  }, [openPicker]);

  const startAdornment = useMemo(
    () => (
      <InputAdornment position="start">
        <button
          type="button"
          className={styles.swatchTrigger}
          aria-label="انتخاب رنگ"
          aria-haspopup="dialog"
          aria-expanded={isPickerOpen}
          aria-controls={isPickerOpen ? popoverId : undefined}
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleSwatchClick}
        >
          <span
            className={joinClassNames(
              styles.swatchTriggerInner,
              normalizedHex && styles.swatchTriggerInnerFilled,
            )}
            style={swatchStyle}
          />
        </button>
      </InputAdornment>
    ),
    [handleSwatchClick, isPickerOpen, normalizedHex, popoverId, swatchStyle],
  );

  const inputProps = useMemo(
    () => ({
      className: styles.fieldInput,
      dir: "ltr" as const,
      lang: "en",
      readOnly: true,
      spellCheck: false,
      autoCapitalize: "off",
      autoCorrect: "off",
    }),
    [],
  );

  const inputRootProps = useMemo(
    () => ({
      readOnly: true,
      startAdornment,
      className: styles.fieldInputRoot,
      onClick: handleFieldClick,
    }),
    [handleFieldClick, startAdornment],
  );

  return (
    <>
      <div ref={fieldContainerRef}>
        <TextField
          fullWidth={fullWidth}
          label={label}
          value={value}
          placeholder="#8B4513"
          InputProps={inputRootProps}
          inputProps={inputProps}
          onClick={handleFieldClick}
        />
      </div>

      <Popover
        id={popoverId}
        open={isPickerOpen}
        anchorEl={pickerAnchor}
        onClose={closePicker}
        keepMounted={false}
        transitionDuration={0}
        disableScrollLock
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            className: styles.popoverPaper,
            elevation: 0,
          },
        }}
      >
        {isPickerOpen ? (
          <FabricHexColorPickerPanel
            localHex={localHex}
            onLocalHexChange={handleLocalHexChange}
            onLocalHexInput={handleLocalHexInput}
            onCommitHex={commitHex}
            onTextBlur={handleTextBlur}
          />
        ) : null}
      </Popover>
    </>
  );
}

export default memo(FabricHexColorField);
