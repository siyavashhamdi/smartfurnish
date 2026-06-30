import type { ReactElement } from "react";
import {
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
  Button,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import FileUploadField from "../../../shared/forms/FileUploadField";
import {
  MULTILINE_TEXTAREA_MIN_ROWS,
  MULTILINE_TEXTAREA_MAX_ROWS,
} from "../../../constants/multilineTextarea.constants";
import { FILE_UPLOAD_POLICY_MAX_SIZE_BYTES } from "../../../constants/fileUploadPolicies";
import { buildExistingFilePreview } from "../../../utils/fileAccessUrl.util";
import ProductTagInput from "../ProductTagInput";
import type { DiscountKind, DraftCoverImage } from "./types";
import { createDraftCoverImage } from "./product-form.state.util";
import styles from "./styles/MainInfoSection.module.scss";

type MainInfoSectionProps = {
  readonly title: string;
  readonly onTitleChange: (value: string) => void;
  readonly summary: string;
  readonly onSummaryChange: (value: string) => void;
  readonly fullDescription: string;
  readonly onFullDescriptionChange: (value: string) => void;
  readonly notes: string;
  readonly onNotesChange: (value: string) => void;
  readonly showAdminNotes: boolean;
  readonly coverImages: DraftCoverImage[];
  readonly onCoverImagesChange: (images: DraftCoverImage[]) => void;
  readonly priceIrt: string;
  readonly onPriceIrtChange: (value: string) => void;
  readonly tags: string[];
  readonly onTagsChange: (value: string[]) => void;
  readonly isActive: boolean;
  readonly onIsActiveChange: (value: boolean) => void;
  readonly isReviewSubmissionEnabled: boolean;
  readonly onIsReviewSubmissionEnabledChange: (value: boolean) => void;
  readonly isReviewsSectionVisible: boolean;
  readonly onIsReviewsSectionVisibleChange: (value: boolean) => void;
  readonly hasPositivePrice: boolean;
  readonly discountEnabled: boolean;
  readonly onDiscountEnabledChange: (value: boolean) => void;
  readonly discountKind: DiscountKind;
  readonly onDiscountKindChange: (value: DiscountKind) => void;
  readonly discountValue: string;
  readonly onDiscountValueChange: (value: string) => void;
  readonly formatIntegerWithThousands: (value: string) => string;
  readonly sanitizePercentageValue: (value: string) => string;
  readonly getCoverUploadFieldId: (coverId: string) => string;
  readonly uploadingFieldIds: ReadonlySet<string>;
  readonly getFieldUploadPercent: (fieldId: string) => number | null;
};

const MainInfoSection = ({
  title,
  onTitleChange,
  summary,
  onSummaryChange,
  fullDescription,
  onFullDescriptionChange,
  notes,
  onNotesChange,
  showAdminNotes,
  coverImages,
  onCoverImagesChange,
  priceIrt,
  onPriceIrtChange,
  tags,
  onTagsChange,
  isActive,
  onIsActiveChange,
  isReviewSubmissionEnabled,
  onIsReviewSubmissionEnabledChange,
  isReviewsSectionVisible,
  onIsReviewsSectionVisibleChange,
  hasPositivePrice,
  discountEnabled,
  onDiscountEnabledChange,
  discountKind,
  onDiscountKindChange,
  discountValue,
  onDiscountValueChange,
  formatIntegerWithThousands,
  sanitizePercentageValue,
  getCoverUploadFieldId,
  uploadingFieldIds,
  getFieldUploadPercent,
}: MainInfoSectionProps): ReactElement => (
  <section className={styles.section}>
    <Typography className={styles.sectionTitle}>اطلاعات اصلی</Typography>
    <Grid container spacing={1.25}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          label="عنوان محصول"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={4}
          label="خلاصه (برای کارت‌ها)"
          value={summary}
          onChange={(event) => onSummaryChange(event.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          minRows={MULTILINE_TEXTAREA_MIN_ROWS}
          maxRows={MULTILINE_TEXTAREA_MAX_ROWS}
          label="توضیحات کامل"
          value={fullDescription}
          onChange={(event) => onFullDescriptionChange(event.target.value)}
        />
      </Grid>
      {showAdminNotes ? (
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="یادداشت داخلی (فقط مدیر)"
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
          />
        </Grid>
      ) : null}
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          label="قیمت (تومان)"
          value={priceIrt}
          onChange={(event) => onPriceIrtChange(formatIntegerWithThousands(event.target.value))}
          inputProps={{ inputMode: "numeric" }}
        />
      </Grid>
      <Grid item xs={12} md={9}>
        <ProductTagInput
          label="برچسب‌ها"
          value={tags}
          onChange={onTagsChange}
          placeholder="برچسب را بنویسید و Enter بزنید"
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          تصاویر کاور (ترتیب نمایش مهم است)
        </Typography>
        <div className={styles.coverGrid}>
          {coverImages.map((cover, index) => {
            const fieldId = getCoverUploadFieldId(cover.id);
            const existingFile = buildExistingFilePreview(
              cover.accessUrl,
              title.trim() || `کاور ${index + 1}`
            );

            return (
              <div key={cover.id} className={styles.coverItem}>
                <FileUploadField
                  previewId={fieldId}
                  label={`کاور ${index + 1}`}
                  file={cover.file}
                  onChange={(file) =>
                    onCoverImagesChange(
                      coverImages.map((entry) =>
                        entry.id === cover.id
                          ? { ...entry, file, accessUrl: file ? null : entry.accessUrl }
                          : entry
                      )
                    )
                  }
                  existingFile={existingFile}
                  onExistingFileClear={() =>
                    onCoverImagesChange(
                      coverImages.map((entry) =>
                        entry.id === cover.id ? { ...entry, accessUrl: null } : entry
                      )
                    )
                  }
                  accept="image/*"
                  allowedFormatsLabel="فرمت مجاز: تصویر"
                  maxSizeLabel="حداکثر: ۲۰ مگابایت"
                  maxSizeBytes={FILE_UPLOAD_POLICY_MAX_SIZE_BYTES.PRODUCT_COVER}
                  dropTitle="انتخاب یا رها کردن کاور"
                  mobileDropTitle="انتخاب کاور"
                  dropHint="هنگام ذخیره آپلود می‌شود"
                  mobileDropHint="هنگام ذخیره آپلود می‌شود"
                  removeLabel="حذف فایل"
                  invalidLabel="فایل انتخاب شده معتبر نیست"
                  uploading={uploadingFieldIds.has(fieldId)}
                  uploadProgress={getFieldUploadPercent(fieldId)}
                />
                <IconButton
                  size="small"
                  color="error"
                  disabled={coverImages.length <= 1}
                  onClick={() =>
                    onCoverImagesChange(coverImages.filter((entry) => entry.id !== cover.id))
                  }
                >
                  <DeleteRoundedIcon fontSize="small" />
                </IconButton>
              </div>
            );
          })}
          <Button
            size="small"
            startIcon={<AddRoundedIcon />}
            onClick={() => onCoverImagesChange([...coverImages, createDraftCoverImage()])}
          >
            افزودن کاور
          </Button>
        </div>
      </Grid>
      <Grid item xs={12}>
        <Paper variant="outlined" className={styles.settingsBox}>
          <div className={styles.settingsHeader}>
            <Typography className={styles.settingsTitle}>تنظیمات</Typography>
          </div>
          <Grid container spacing={1.25}>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(event) => onIsActiveChange(event.target.checked)}
                  />
                }
                label="محصول فعال باشد."
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isReviewsSectionVisible}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      onIsReviewsSectionVisibleChange(checked);
                      if (!checked) {
                        onIsReviewSubmissionEnabledChange(false);
                      }
                    }}
                  />
                }
                label="بخش نظرات قابل مشاهده باشد."
              />
            </Grid>
            {isReviewsSectionVisible ? (
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isReviewSubmissionEnabled}
                      onChange={(event) => onIsReviewSubmissionEnabledChange(event.target.checked)}
                    />
                  }
                  label="ثبت نظر فعال باشد."
                />
              </Grid>
            ) : null}
            {hasPositivePrice ? (
              <Grid item xs={12} md={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={discountEnabled}
                      onChange={(event) => onDiscountEnabledChange(event.target.checked)}
                    />
                  }
                  label="تخفیف"
                />
              </Grid>
            ) : null}
            {hasPositivePrice && discountEnabled ? (
              <Grid item xs={12}>
                <Grid container spacing={1.25}>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth required>
                      <InputLabel required>نوع تخفیف</InputLabel>
                      <Select
                        value={discountKind}
                        label="نوع تخفیف"
                        onChange={(event) =>
                          onDiscountKindChange(event.target.value as DiscountKind)
                        }
                      >
                        <MenuItem value="PERCENTAGE">درصدی</MenuItem>
                        <MenuItem value="FIXED_AMOUNT_IRT">مبلغ ثابت (تومان)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      required
                      label={discountKind === "PERCENTAGE" ? "مقدار درصد" : "مقدار (تومان)"}
                      value={discountValue}
                      onChange={(event) =>
                        onDiscountValueChange(
                          discountKind === "PERCENTAGE"
                            ? sanitizePercentageValue(event.target.value)
                            : formatIntegerWithThousands(event.target.value)
                        )
                      }
                      inputProps={{ inputMode: "decimal" }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            ) : null}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  </section>
);

export default MainInfoSection;
