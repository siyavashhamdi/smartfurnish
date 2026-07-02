import { useCallback, useRef, useState, type ReactElement } from "react";
import {
  Button,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FileUploadField from "../../../shared/forms/FileUploadField";
import {
  MULTILINE_TEXTAREA_MAX_ROWS,
  MULTILINE_TEXTAREA_MIN_ROWS,
} from "../../../constants/multilineTextarea.constants";
import { FILE_UPLOAD_POLICY_MAX_SIZE_BYTES } from "../../../constants/fileUploadPolicies";
import { buildExistingFilePreview } from "../../../utils/fileAccessUrl.util";
import type { UploadProgressEntry } from "../../../utils/uploadProgress.util";
import { getFieldUploadPercent } from "../../../utils/uploadProgress.util";
import ProductFormCoverGallery from "./ProductFormCoverGallery";
import { CatalogCollapsibleCard } from "./CatalogCollapsibleCard";
import { CatalogColorTitleSwatch } from "./CatalogColorTitleSwatch";
import FabricColorHexFieldCell from "./FabricColorHexFieldCell";
import FabricColorPricingFields from "./FabricColorPricingFields";
import type {
  DraftFabric,
  DraftFabricColor,
  DraftMaterialProfile,
  DraftSetPiece,
  DraftVendor,
} from "./types";
import {
  applyFabricColorDefaults,
  createDraftFabric,
  createDraftFabricColorFromFabricDefaults,
  createDraftSetPiece,
  createDraftSetPieceImage,
} from "./product-form.state.util";
import styles from "./styles/CatalogSection.module.scss";

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
  readonly getSetPieceImageUploadFieldId: (imageId: string) => string;
  readonly uploadingFieldIds: ReadonlySet<string>;
  readonly hideSectionTitle?: boolean;
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
  getSetPieceImageUploadFieldId,
  uploadingFieldIds,
  hideSectionTitle = false,
}: CatalogSectionProps): ReactElement => {
  const [expandedCatalogCardIds, setExpandedCatalogCardIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const markCatalogCardExpanded = useCallback((id: string): void => {
    setExpandedCatalogCardIds((previous) => new Set(previous).add(id));
  }, []);

  const fabricsRef = useRef(fabrics);
  fabricsRef.current = fabrics;

  const updateSetPiece = (pieceId: string, patch: Partial<DraftSetPiece>): void => {
    onSetPiecesChange(updateArrayItem(setPieces, pieceId, patch));
  };

  const updateFabric = (fabricId: string, patch: Partial<DraftFabric>): void => {
    onFabricsChange(updateArrayItem(fabrics, fabricId, patch));
  };

  const applyFabricDefaultsToAllColors = (fabric: DraftFabric): void => {
    updateFabric(fabric.id, {
      colors: fabric.colors.map((color) => applyFabricColorDefaults(color, fabric)),
    });
  };

  const updateFabricColor = useCallback(
    (fabricId: string, colorId: string, patch: Partial<DraftFabricColor>): void => {
      const currentFabrics = fabricsRef.current;
      onFabricsChange(
        currentFabrics.map((fabric) =>
          fabric.id !== fabricId
            ? fabric
            : {
                ...fabric,
                colors: updateArrayItem(fabric.colors, colorId, patch),
              }
        )
      );
    },
    [onFabricsChange]
  );

  const handleFabricColorHexChange = useCallback(
    (fabricId: string, colorId: string, hexCode: string): void => {
      updateFabricColor(fabricId, colorId, { hexCode });
    },
    [updateFabricColor]
  );

  return (
    <section className={styles.section}>
      {hideSectionTitle ? null : (
        <Typography className={styles.sectionTitle}>کاتالوگ محصول</Typography>
      )}

      <div className={styles.subsection}>
        <Typography className={styles.subsectionTitle}>فروشنده</Typography>
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
      </div>

      <div className={styles.subsection}>
        <Typography className={styles.subsectionTitle}>مشخصات مواد و بافت</Typography>
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
      </div>

      <div className={styles.subsection}>
        <Typography className={styles.subsectionTitle}>
          قطعات ست ({setPieces.length.toLocaleString("fa-IR")})
        </Typography>
        <div className={styles.stack}>
          {setPieces.map((piece, pieceIndex) => (
            <CatalogCollapsibleCard
              key={piece.id}
              defaultExpanded={expandedCatalogCardIds.has(piece.id)}
              title={
                piece.name.trim() ||
                `قطعه ${(pieceIndex + 1).toLocaleString("fa-IR")}`
              }
              onDelete={() =>
                onSetPiecesChange(setPieces.filter((entry) => entry.id !== piece.id))
              }
            >
              <Grid container spacing={1.25} className={styles.cardFormGrid}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    required
                    label="نام قطعه"
                    value={piece.name}
                    onChange={(event) => updateSetPiece(piece.id, { name: event.target.value })}
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
                  <ProductFormCoverGallery
                    key={`set-piece-images-${piece.id}`}
                    embedded
                    title={piece.name}
                    coverImages={piece.images}
                    onCoverImagesChange={(images) => updateSetPiece(piece.id, { images })}
                    getCoverUploadFieldId={getSetPieceImageUploadFieldId}
                    uploadingFieldIds={uploadingFieldIds}
                    getFieldUploadPercent={(fieldId) =>
                      getFieldUploadPercent(uploadProgressByFieldId[fieldId])
                    }
                    imageGalleryVariant="setPiece"
                    createEmptyImage={createDraftSetPieceImage}
                  />
                </Grid>
              </Grid>
            </CatalogCollapsibleCard>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              const piece = createDraftSetPiece();
              markCatalogCardExpanded(piece.id);
              onSetPiecesChange([...setPieces, piece]);
            }}
          >
            افزودن قطعه
          </Button>
        </div>
      </div>

      <div className={styles.subsection}>
        <Typography className={styles.subsectionTitle}>
          پارچه‌ها و رنگ‌ها ({fabrics.length.toLocaleString("fa-IR")})
        </Typography>
        <div className={styles.stack}>
          {fabrics.map((fabric, fabricIndex) => (
            <CatalogCollapsibleCard
              key={fabric.id}
              defaultExpanded={expandedCatalogCardIds.has(fabric.id)}
              title={
                fabric.patternName.trim() ||
                `طرح پارچه ${(fabricIndex + 1).toLocaleString("fa-IR")}`
              }
              onDelete={() =>
                onFabricsChange(fabrics.filter((entry) => entry.id !== fabric.id))
              }
            >
              <Grid container spacing={1.25} className={styles.cardFormGrid}>
                <Grid item xs={12} md={4}>
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
                <FabricColorPricingFields
                  priceLabel="قیمت پیش‌فرض (تومان)"
                  applyDefaultsToColors={{
                    label: "اعمال قیمت و تخفیف پیش‌فرض روی همه رنگ‌ها",
                    hint: "این مقادیر برای رنگ‌های جدید پیش‌فرض هستند. برای به‌روزرسانی همه رنگ‌های این طرح، دکمه کنار فیلد را بزنید.",
                    disabled: fabric.colors.length === 0,
                    onClick: () => applyFabricDefaultsToAllColors(fabric),
                  }}
                  values={{
                    priceIrt: fabric.defaultPriceIrt,
                    discountEnabled: fabric.defaultDiscountEnabled,
                    discountKind: fabric.defaultDiscountKind,
                    discountValue: fabric.defaultDiscountValue,
                  }}
                  onChange={(patch) =>
                    updateFabric(fabric.id, {
                      ...(patch.priceIrt !== undefined
                        ? { defaultPriceIrt: patch.priceIrt }
                        : {}),
                      ...(patch.discountEnabled !== undefined
                        ? { defaultDiscountEnabled: patch.discountEnabled }
                        : {}),
                      ...(patch.discountKind !== undefined
                        ? { defaultDiscountKind: patch.discountKind }
                        : {}),
                      ...(patch.discountValue !== undefined
                        ? { defaultDiscountValue: patch.discountValue }
                        : {}),
                    })
                  }
                />
                <Grid item xs={12} md={2}>
                  <FormControlLabel
                    className={styles.catalogSwitchField}
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
                    {fabric.colors.map((color, colorIndex) => (
                      <CatalogCollapsibleCard
                        key={color.id}
                        compact
                        defaultExpanded={expandedCatalogCardIds.has(color.id)}
                        titleTrailing={<CatalogColorTitleSwatch hexCode={color.hexCode} />}
                        title={
                          color.name.trim() ||
                          `رنگ ${(colorIndex + 1).toLocaleString("fa-IR")}`
                        }
                        onDelete={() =>
                          updateFabric(fabric.id, {
                            colors: fabric.colors.filter((entry) => entry.id !== color.id),
                          })
                        }
                      >
                        <Grid container spacing={1.25} className={styles.cardFormGrid}>
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
                            <FabricColorHexFieldCell
                              fabricId={fabric.id}
                              colorId={color.id}
                              hexCode={color.hexCode}
                              onColorHexChange={handleFabricColorHexChange}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <FileUploadField
                              previewId={`fabric-color-${color.aiImage.id}`}
                              label="تصویر محصول برای ارایه به AI"
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
                                color.name || "تصویر"
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
                              dropHint="هنگام ذخیره آپلود می‌شود"
                              mobileDropHint="هنگام ذخیره آپلود می‌شود"
                              removeLabel="حذف"
                              invalidLabel="فایل نامعتبر"
                            />
                          </Grid>
                          <FabricColorPricingFields
                            showDiscount={false}
                            values={{
                              priceIrt: color.priceIrt,
                              discountEnabled: color.discountEnabled,
                              discountKind: color.discountKind,
                              discountValue: color.discountValue,
                            }}
                            onChange={(patch) => updateFabricColor(fabric.id, color.id, patch)}
                          />
                          <FabricColorPricingFields
                            showPrice={false}
                            values={{
                              priceIrt: color.priceIrt,
                              discountEnabled: color.discountEnabled,
                              discountKind: color.discountKind,
                              discountValue: color.discountValue,
                            }}
                            onChange={(patch) => updateFabricColor(fabric.id, color.id, patch)}
                          />
                          <Grid item xs={12} md={2}>
                            <FormControlLabel
                              className={styles.catalogSwitchField}
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
                      </CatalogCollapsibleCard>
                    ))}
                    <Button
                      size="small"
                      startIcon={<AddRoundedIcon />}
                      onClick={() => {
                        const color = createDraftFabricColorFromFabricDefaults(fabric);
                        markCatalogCardExpanded(color.id);
                        updateFabric(fabric.id, {
                          colors: [...fabric.colors, color],
                        });
                      }}
                    >
                      افزودن رنگ
                    </Button>
                  </div>
                </Grid>
              </Grid>
            </CatalogCollapsibleCard>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              const fabric = createDraftFabric();
              markCatalogCardExpanded(fabric.id);
              fabric.colors.forEach((color) => markCatalogCardExpanded(color.id));
              onFabricsChange([...fabrics, fabric]);
            }}
          >
            افزودن طرح پارچه
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CatalogSection;
