import type { ReactElement } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FileUploadField from "../../../shared/forms/FileUploadField";
import {
  MULTILINE_TEXTAREA_MAX_ROWS,
  MULTILINE_TEXTAREA_MIN_ROWS,
} from "../../../constants/multilineTextarea.constants";
import { FILE_UPLOAD_POLICY_MAX_SIZE_BYTES } from "../../../constants/fileUploadPolicies";
import { buildExistingFilePreview } from "../../../utils/fileAccessUrl.util";
import type { UploadProgressEntry } from "../../../utils/uploadProgress.util";
import type {
  DiscountKind,
  DraftFabric,
  DraftFabricColor,
  DraftMaterialProfile,
  DraftSetPiece,
  DraftSetPieceDimension,
  DraftSetPieceImage,
  DraftVendor,
} from "./types";
import {
  createDraftFabric,
  createDraftFabricColor,
  createDraftSetPiece,
  createDraftSetPieceDimension,
  createDraftSetPieceImage,
} from "./product-form.state.util";
import styles from "./styles/CatalogSection.module.scss";
import { formatIntegerWithThousands, parseOptionalNumber } from "./product-form.state.util";

function sanitizePercentageValue(value: string): string {
  const normalized = value.replace(/[^\d.]/g, "");
  const [whole, ...fractionParts] = normalized.split(".");
  const fraction = fractionParts.join("");
  return fraction ? `${whole}.${fraction}` : whole;
}

type CatalogSectionProps = {
  readonly vendor: DraftVendor;
  readonly onVendorChange: (vendor: DraftVendor) => void;
  readonly materialProfile: DraftMaterialProfile;
  readonly onMaterialProfileChange: (profile: DraftMaterialProfile) => void;
  readonly setPieces: DraftSetPiece[];
  readonly onSetPiecesChange: (pieces: DraftSetPiece[]) => void;
  readonly fabrics: DraftFabric[];
  readonly onFabricsChange: (fabrics: DraftFabric[]) => void;
  readonly uploadProgressByFieldId: Record<string, UploadProgressEntry>;
};

function updateArrayItem<T extends { id: string }>(
  items: T[],
  id: string,
  patch: Partial<T>
): T[] {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

const CatalogSection = ({
  vendor,
  onVendorChange,
  materialProfile,
  onMaterialProfileChange,
  setPieces,
  onSetPiecesChange,
  fabrics,
  onFabricsChange,
  uploadProgressByFieldId,
}: CatalogSectionProps): ReactElement => {
  const updateSetPiece = (pieceId: string, patch: Partial<DraftSetPiece>): void => {
    onSetPiecesChange(updateArrayItem(setPieces, pieceId, patch));
  };

  const updateFabric = (fabricId: string, patch: Partial<DraftFabric>): void => {
    onFabricsChange(updateArrayItem(fabrics, fabricId, patch));
  };

  const updateFabricColor = (
    fabricId: string,
    colorId: string,
    patch: Partial<DraftFabricColor>
  ): void => {
    onFabricsChange(
      fabrics.map((fabric) =>
        fabric.id !== fabricId
          ? fabric
          : {
              ...fabric,
              colors: updateArrayItem(fabric.colors, colorId, patch),
            }
      )
    );
  };

  return (
    <section className={styles.section}>
      <Typography className={styles.sectionTitle}>کاتالوگ محصول</Typography>

      <Accordion defaultExpanded disableGutters elevation={0} className={styles.accordion}>
        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
          <Typography fontWeight={700}>فروشنده</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1.25}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="نام فروشنده"
                value={vendor.name}
                onChange={(event) => onVendorChange({ ...vendor, name: event.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="تلفن"
                value={vendor.phone}
                onChange={(event) => onVendorChange({ ...vendor, phone: event.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="آدرس"
                value={vendor.address}
                onChange={(event) => onVendorChange({ ...vendor, address: event.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="یادداشت داخلی فروشنده"
                value={vendor.notes}
                onChange={(event) => onVendorChange({ ...vendor, notes: event.target.value })}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion disableGutters elevation={0} className={styles.accordion}>
        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
          <Typography fontWeight={700}>مشخصات مواد و بافت</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1.25}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="بافت"
                value={materialProfile.texture}
                onChange={(event) =>
                  onMaterialProfileChange({ ...materialProfile, texture: event.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="جنس اصلی"
                value={materialProfile.primaryMaterial}
                onChange={(event) =>
                  onMaterialProfileChange({
                    ...materialProfile,
                    primaryMaterial: event.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={MULTILINE_TEXTAREA_MIN_ROWS}
                maxRows={MULTILINE_TEXTAREA_MAX_ROWS}
                label="دستور نگهداری"
                value={materialProfile.careInstructions}
                onChange={(event) =>
                  onMaterialProfileChange({
                    ...materialProfile,
                    careInstructions: event.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion disableGutters elevation={0} className={styles.accordion}>
        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
          <Typography fontWeight={700}>قطعات ست ({setPieces.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className={styles.stack}>
            {setPieces.map((piece) => (
              <Paper key={piece.id} variant="outlined" className={styles.card}>
                <Grid container spacing={1.25}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      required
                      label="نام قطعه"
                      value={piece.name}
                      onChange={(event) =>
                        updateSetPiece(piece.id, { name: event.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label="توضیحات"
                      value={piece.description}
                      onChange={(event) =>
                        updateSetPiece(piece.id, { description: event.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <div className={styles.imageRow}>
                      {piece.images.map((image) => (
                        <div key={image.id} className={styles.imageField}>
                          <FileUploadField
                            previewId={`set-piece-${piece.id}-${image.id}`}
                            label="تصویر قطعه"
                            file={image.file}
                            onChange={(file) =>
                              updateSetPiece(piece.id, {
                                images: updateArrayItem(piece.images, image.id, {
                                  file,
                                  accessUrl: file ? null : image.accessUrl,
                                }),
                              })
                            }
                            existingFile={buildExistingFilePreview(
                              image.accessUrl,
                              piece.name || "تصویر",
                            )}
                            onExistingFileClear={() =>
                              updateSetPiece(piece.id, {
                                images: updateArrayItem(piece.images, image.id, {
                                  accessUrl: null,
                                }),
                              })
                            }
                            accept="image/*"
                            allowedFormatsLabel="تصویر"
                            maxSizeLabel="حداکثر ۲۰ مگابایت"
                            maxSizeBytes={FILE_UPLOAD_POLICY_MAX_SIZE_BYTES.PRODUCT_COVER}
                            dropTitle="انتخاب تصویر"
                            removeLabel="حذف"
                            invalidLabel="فایل نامعتبر"
                            uploading={Boolean(
                              uploadProgressByFieldId[`set-piece-${piece.id}-${image.id}`]
                            )}
                          />
                        </div>
                      ))}
                      <Button
                        size="small"
                        startIcon={<AddRoundedIcon />}
                        onClick={() =>
                          updateSetPiece(piece.id, {
                            images: [...piece.images, createDraftSetPieceImage()],
                          })
                        }
                      >
                        افزودن تصویر
                      </Button>
                    </div>
                  </Grid>
                </Grid>
                <div className={styles.cardActions}>
                  <IconButton
                    color="error"
                    onClick={() =>
                      onSetPiecesChange(setPieces.filter((entry) => entry.id !== piece.id))
                    }
                  >
                    <DeleteRoundedIcon />
                  </IconButton>
                </div>
              </Paper>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={() => onSetPiecesChange([...setPieces, createDraftSetPiece()])}
            >
              افزودن قطعه
            </Button>
          </div>
        </AccordionDetails>
      </Accordion>

      <Accordion disableGutters elevation={0} className={styles.accordion}>
        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
          <Typography fontWeight={700}>پارچه‌ها و رنگ‌ها ({fabrics.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className={styles.stack}>
            {fabrics.map((fabric) => (
              <Paper key={fabric.id} variant="outlined" className={styles.card}>
                <Grid container spacing={1.25}>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      required
                      label="نام طرح پارچه"
                      value={fabric.patternName}
                      onChange={(event) =>
                        updateFabric(fabric.id, { patternName: event.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={fabric.isActive}
                          onChange={(event) =>
                            updateFabric(fabric.id, { isActive: event.target.checked })
                          }
                        />
                      }
                      label="فعال برای کاربر"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      رنگ‌ها
                    </Typography>
                    <div className={styles.colorStack}>
                      {fabric.colors.map((color) => (
                        <Paper key={color.id} variant="outlined" className={styles.colorCard}>
                          <Grid container spacing={1}>
                            <Grid item xs={12} md={3}>
                              <TextField
                                fullWidth
                                label="نام رنگ"
                                value={color.name}
                                onChange={(event) =>
                                  updateFabricColor(fabric.id, color.id, {
                                    name: event.target.value,
                                  })
                                }
                              />
                            </Grid>
                            <Grid item xs={12} md={2}>
                              <TextField
                                fullWidth
                                label="کد رنگ"
                                value={color.hexCode}
                                onChange={(event) =>
                                  updateFabricColor(fabric.id, color.id, {
                                    hexCode: event.target.value,
                                  })
                                }
                                placeholder="#8B4513"
                              />
                            </Grid>
                            <Grid item xs={12} md={2}>
                              <TextField
                                fullWidth
                                label="قیمت (تومان)"
                                value={color.priceIrt}
                                onChange={(event) =>
                                  updateFabricColor(fabric.id, color.id, {
                                    priceIrt: formatIntegerWithThousands(event.target.value),
                                  })
                                }
                                inputProps={{ inputMode: "numeric" }}
                              />
                            </Grid>
                            {(parseOptionalNumber(color.priceIrt) ?? 0) > 0 ? (
                              <Grid item xs={12} md={2}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={color.discountEnabled}
                                      onChange={(event) =>
                                        updateFabricColor(fabric.id, color.id, {
                                          discountEnabled: event.target.checked,
                                        })
                                      }
                                    />
                                  }
                                  label="تخفیف"
                                />
                              </Grid>
                            ) : null}
                            {color.discountEnabled &&
                            (parseOptionalNumber(color.priceIrt) ?? 0) > 0 ? (
                              <>
                                <Grid item xs={12} md={2}>
                                  <FormControl fullWidth required>
                                    <InputLabel required>نوع تخفیف</InputLabel>
                                    <Select
                                      value={color.discountKind}
                                      label="نوع تخفیف"
                                      onChange={(event) =>
                                        updateFabricColor(fabric.id, color.id, {
                                          discountKind: event.target.value as DiscountKind,
                                        })
                                      }
                                    >
                                      <MenuItem value="PERCENTAGE">درصدی</MenuItem>
                                      <MenuItem value="FIXED_AMOUNT_IRT">
                                        مبلغ ثابت (تومان)
                                      </MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                  <TextField
                                    fullWidth
                                    required
                                    label={
                                      color.discountKind === "PERCENTAGE"
                                        ? "مقدار درصد"
                                        : "مقدار (تومان)"
                                    }
                                    value={color.discountValue}
                                    onChange={(event) =>
                                      updateFabricColor(fabric.id, color.id, {
                                        discountValue:
                                          color.discountKind === "PERCENTAGE"
                                            ? sanitizePercentageValue(event.target.value)
                                            : formatIntegerWithThousands(event.target.value),
                                      })
                                    }
                                    inputProps={{ inputMode: "decimal" }}
                                  />
                                </Grid>
                              </>
                            ) : null}
                            <Grid item xs={12} md={4}>
                              <FileUploadField
                                previewId={`fabric-color-${color.aiImage.id}`}
                                label="تصویر AI محصول"
                                file={color.aiImage.file}
                                onChange={(file) =>
                                  updateFabricColor(fabric.id, color.id, {
                                    aiImage: {
                                      ...color.aiImage,
                                      file,
                                      accessUrl: file ? null : color.aiImage.accessUrl,
                                    },
                                  })
                                }
                                existingFile={buildExistingFilePreview(
                                  color.aiImage.accessUrl,
                                  color.name || "تصویر",
                                )}
                                onExistingFileClear={() =>
                                  updateFabricColor(fabric.id, color.id, {
                                    aiImage: { ...color.aiImage, accessUrl: null },
                                  })
                                }
                                accept="image/*"
                                allowedFormatsLabel="تصویر"
                                maxSizeLabel="حداکثر ۲۰ مگابایت"
                                maxSizeBytes={FILE_UPLOAD_POLICY_MAX_SIZE_BYTES.PRODUCT_COVER}
                                dropTitle="تصویر برای پیش‌نمایش"
                                removeLabel="حذف"
                                invalidLabel="فایل نامعتبر"
                              />
                            </Grid>
                            <Grid item xs={12} md={2}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={color.isActive}
                                    onChange={(event) =>
                                      updateFabricColor(fabric.id, color.id, {
                                        isActive: event.target.checked,
                                      })
                                    }
                                  />
                                }
                                label="فعال"
                              />
                            </Grid>
                          </Grid>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              updateFabric(fabric.id, {
                                colors: fabric.colors.filter((entry) => entry.id !== color.id),
                              })
                            }
                          >
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </Paper>
                      ))}
                      <Button
                        size="small"
                        startIcon={<AddRoundedIcon />}
                        onClick={() =>
                          updateFabric(fabric.id, {
                            colors: [...fabric.colors, createDraftFabricColor()],
                          })
                        }
                      >
                        افزودن رنگ
                      </Button>
                    </div>
                  </Grid>
                </Grid>
                <div className={styles.cardActions}>
                  <IconButton
                    color="error"
                    onClick={() =>
                      onFabricsChange(fabrics.filter((entry) => entry.id !== fabric.id))
                    }
                  >
                    <DeleteRoundedIcon />
                  </IconButton>
                </div>
              </Paper>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={() => onFabricsChange([...fabrics, createDraftFabric()])}
            >
              افزودن طرح پارچه
            </Button>
          </div>
        </AccordionDetails>
      </Accordion>
    </section>
  );
};

export default CatalogSection;
