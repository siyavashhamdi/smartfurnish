import type { ReactElement } from "react";
import {
  FormControlLabel,
  Grid,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  MULTILINE_TEXTAREA_MIN_ROWS,
  MULTILINE_TEXTAREA_MAX_ROWS,
} from "../../../constants/multilineTextarea.constants";
import ProductTagInput from "../ProductTagInput";
import type { DraftCoverImage } from "./types";
import ProductFormCoverGallery from "./ProductFormCoverGallery";
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
  readonly coverGalleryResetKey: string;
  readonly tags: string[];
  readonly onTagsChange: (value: string[]) => void;
  readonly isActive: boolean;
  readonly onIsActiveChange: (value: boolean) => void;
  readonly isReviewSubmissionEnabled: boolean;
  readonly onIsReviewSubmissionEnabledChange: (value: boolean) => void;
  readonly isReviewsSectionVisible: boolean;
  readonly onIsReviewsSectionVisibleChange: (value: boolean) => void;
  readonly guaranteePeriodInMonths: string;
  readonly onGuaranteePeriodInMonthsChange: (value: string) => void;
  readonly formatIntegerWithThousands: (value: string) => string;
  readonly getCoverUploadFieldId: (coverId: string) => string;
  readonly uploadingFieldIds: ReadonlySet<string>;
  readonly getFieldUploadPercent: (fieldId: string) => number | null;
  readonly hideSectionTitle?: boolean;
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
  coverGalleryResetKey,
  tags,
  onTagsChange,
  isActive,
  onIsActiveChange,
  isReviewSubmissionEnabled,
  onIsReviewSubmissionEnabledChange,
  isReviewsSectionVisible,
  onIsReviewsSectionVisibleChange,
  guaranteePeriodInMonths,
  onGuaranteePeriodInMonthsChange,
  formatIntegerWithThousands,
  getCoverUploadFieldId,
  uploadingFieldIds,
  getFieldUploadPercent,
  hideSectionTitle = false,
}: MainInfoSectionProps): ReactElement => (
  <section className={styles.section}>
    {hideSectionTitle ? null : (
      <Typography className={styles.sectionTitle}>اطلاعات اصلی</Typography>
    )}
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
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="مدت گارانتی (ماه)"
          value={guaranteePeriodInMonths}
          onChange={(event) =>
            onGuaranteePeriodInMonthsChange(
              formatIntegerWithThousands(event.target.value)
            )
          }
          inputProps={{ inputMode: "numeric" }}
          helperText="در صورت صفر بودن، گارانتی روی کارت محصول نمایش داده نمی‌شود."
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
      <Grid item xs={12}>
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
        <ProductFormCoverGallery
          key={coverGalleryResetKey}
          title={title}
          coverImages={coverImages}
          onCoverImagesChange={onCoverImagesChange}
          getCoverUploadFieldId={getCoverUploadFieldId}
          uploadingFieldIds={uploadingFieldIds}
          getFieldUploadPercent={getFieldUploadPercent}
        />
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
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  </section>
);

export default MainInfoSection;
