import { memo, type ReactElement } from "react";

import FileUploadField from "../../../shared/forms/FileUploadField";
import { FILE_UPLOAD_POLICY_MAX_SIZE_BYTES } from "../../../constants/fileUploadPolicies";
import { buildExistingFilePreview } from "../../../utils/fileAccessUrl.util";
import { isPersistedGalleryImage, updateGalleryImage } from "./cover-gallery.util";
import type { ProductFormImageGalleryLabels } from "./useProductFormImageGalleryLabels";
import type { DraftGalleryImage } from "./types";
import styles from "./styles/ProductFormCoverGallery.module.scss";

type ProductFormCoverSlideProps = {
  readonly image: DraftGalleryImage;
  readonly slideIndex: number;
  readonly displayTitle: string;
  readonly imageCount: number;
  readonly images: DraftGalleryImage[];
  readonly onImagesChange: (images: DraftGalleryImage[]) => void;
  readonly onRemoveImage: (imageId: string, slideIndex: number) => void;
  readonly getUploadFieldId: (imageId: string) => string;
  readonly uploadingFieldIds: ReadonlySet<string>;
  readonly getFieldUploadPercent: (fieldId: string) => number | null;
  readonly labels: ProductFormImageGalleryLabels;
};

function ProductFormCoverSlide({
  image,
  slideIndex,
  displayTitle,
  imageCount,
  images,
  onImagesChange,
  onRemoveImage,
  getUploadFieldId,
  uploadingFieldIds,
  getFieldUploadPercent,
  labels,
}: ProductFormCoverSlideProps): ReactElement {
  const fieldId = getUploadFieldId(image.id);
  const slideLabel = labels.slideLabel(slideIndex);
  const existingFile = buildExistingFilePreview(image.accessUrl, displayTitle || slideLabel);
  const canRemoveSlot = !isPersistedGalleryImage(image) && imageCount > 1;

  return (
    <div className={styles.slideUploader}>
      <FileUploadField
        previewId={fieldId}
        label={slideLabel}
        hideLabel
        fullWidth
        file={image.file}
        onChange={(file) =>
          onImagesChange(
            updateGalleryImage(images, image.id, {
              file,
              accessUrl: file ? null : image.accessUrl,
            }),
          )
        }
        existingFile={existingFile}
        onExistingFileClear={() =>
          onImagesChange(updateGalleryImage(images, image.id, { accessUrl: null }))
        }
        onRemove={canRemoveSlot ? () => onRemoveImage(image.id, slideIndex) : undefined}
        accept="image/*"
        allowedFormatsLabel="فرمت مجاز: تصویر"
        maxSizeLabel="حداکثر: ۲۰ مگابایت"
        maxSizeBytes={FILE_UPLOAD_POLICY_MAX_SIZE_BYTES.PRODUCT_COVER}
        dropTitle={labels.dropTitle}
        mobileDropTitle={labels.mobileDropTitle}
        dropHint={labels.dropHint}
        mobileDropHint={labels.mobileDropHint}
        removeLabel={labels.removeLabel}
        invalidLabel="فایل انتخاب شده معتبر نیست"
        uploading={uploadingFieldIds.has(fieldId)}
        uploadProgress={getFieldUploadPercent(fieldId)}
      />
    </div>
  );
}

export default memo(ProductFormCoverSlide);
