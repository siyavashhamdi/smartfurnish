import CopyAllRoundedIcon from "@mui/icons-material/CopyAllRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type { ReactElement } from "react";

import {
  formatIntegerWithThousands,
  parseOptionalNumber,
} from "./product-form.state.util";
import type { DiscountKind } from "./types";
import styles from "./styles/CatalogSection.module.scss";

function sanitizePercentageValue(value: string): string {
  const normalized = value.replace(/[^\d.]/g, "");
  const [whole, ...fractionParts] = normalized.split(".");
  const fraction = fractionParts.join("");
  return fraction ? `${whole ?? ""}.${fraction}` : (whole ?? "");
}

export type FabricColorPricingValues = {
  readonly priceIrt: string;
  readonly discountEnabled: boolean;
  readonly discountKind: DiscountKind;
  readonly discountValue: string;
};

type FabricColorPricingFieldsProps = {
  readonly values: FabricColorPricingValues;
  readonly onChange: (patch: Partial<FabricColorPricingValues>) => void;
  readonly priceLabel?: string;
  readonly showPrice?: boolean;
  readonly showDiscount?: boolean;
  readonly applyDefaultsToColors?: {
    readonly onClick: () => void;
    readonly label: string;
    readonly hint: string;
    readonly disabled?: boolean;
  };
};

function FabricColorPricingFields({
  values,
  onChange,
  priceLabel = "قیمت (تومان)",
  showPrice = true,
  showDiscount = true,
  applyDefaultsToColors,
}: FabricColorPricingFieldsProps): ReactElement {
  const hasPrice = (parseOptionalNumber(values.priceIrt) ?? 0) > 0;

  return (
    <>
      {showPrice ? (
        <Grid item xs={12} md={applyDefaultsToColors ? 3 : 2}>
          <div
            className={
              applyDefaultsToColors
                ? styles.defaultPriceApplyField
                : styles.defaultPriceField
            }
          >
            <TextField
              fullWidth
              className={applyDefaultsToColors ? styles.defaultPriceApplyInput : undefined}
              label={priceLabel}
              value={values.priceIrt}
              onChange={(event) =>
                onChange({ priceIrt: formatIntegerWithThousands(event.target.value) })
              }
              inputProps={{ inputMode: "numeric" }}
              InputProps={
                applyDefaultsToColors
                  ? {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title={applyDefaultsToColors.label}>
                            <span>
                              <IconButton
                                size="small"
                                edge="end"
                                aria-label={applyDefaultsToColors.label}
                                disabled={applyDefaultsToColors.disabled}
                                onClick={applyDefaultsToColors.onClick}
                              >
                                <CopyAllRoundedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }
                  : undefined
              }
            />
            {applyDefaultsToColors ? (
              <div className={styles.defaultPriceApplyHint}>
                <InfoOutlinedIcon
                  className={styles.defaultPriceApplyHintIcon}
                  fontSize="inherit"
                  aria-hidden="true"
                />
                <Typography
                  component="p"
                  variant="caption"
                  color="text.secondary"
                  className={styles.defaultPriceApplyHintText}
                >
                  {applyDefaultsToColors.hint}
                </Typography>
              </div>
            ) : null}
          </div>
        </Grid>
      ) : null}
      {showDiscount && hasPrice ? (
        <Grid item xs={12} md={2}>
          <FormControlLabel
            className={styles.catalogSwitchField}
            control={
              <Switch
                checked={values.discountEnabled}
                onChange={(event) =>
                  onChange({ discountEnabled: event.target.checked })
                }
              />
            }
            label="تخفیف"
          />
        </Grid>
      ) : null}
      {showDiscount && values.discountEnabled && hasPrice ? (
        <>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth required>
              <InputLabel required>نوع تخفیف</InputLabel>
              <Select
                value={values.discountKind}
                label="نوع تخفیف"
                onChange={(event) =>
                  onChange({ discountKind: event.target.value as DiscountKind })
                }
              >
                <MenuItem value="PERCENTAGE">درصدی</MenuItem>
                <MenuItem value="FIXED_AMOUNT_IRT">مبلغ ثابت (تومان)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              required
              label={
                values.discountKind === "PERCENTAGE" ? "مقدار درصد" : "مقدار (تومان)"
              }
              value={values.discountValue}
              onChange={(event) =>
                onChange({
                  discountValue:
                    values.discountKind === "PERCENTAGE"
                      ? sanitizePercentageValue(event.target.value)
                      : formatIntegerWithThousands(event.target.value),
                })
              }
              inputProps={{ inputMode: "decimal" }}
            />
          </Grid>
        </>
      ) : null}
    </>
  );
}

export default FabricColorPricingFields;
