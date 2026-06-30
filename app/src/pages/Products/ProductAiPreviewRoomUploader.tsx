import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { Button, IconButton, Paper, Typography } from "@mui/material";
import { useRef, useState, type ChangeEvent, type DragEvent, type ReactElement } from "react";

import styles from "./styles/ProductAiPreviewRoomUploader.module.scss";

type ProductAiPreviewRoomUploaderProps = {
  readonly disabled?: boolean;
  readonly file: File | null;
  readonly previewUrl: string | null;
  readonly onChange: (file: File | null) => void;
};

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function isAcceptedFile(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type);
}

export function ProductAiPreviewRoomUploader({
  disabled = false,
  file,
  previewUrl,
  onChange,
}: ProductAiPreviewRoomUploaderProps): ReactElement {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files: FileList | null): void => {
    const nextFile = files?.[0];

    if (!nextFile || !isAcceptedFile(nextFile)) {
      return;
    }

    onChange(nextFile);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    handleFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setDragActive(false);

    if (disabled) {
      return;
    }

    handleFiles(event.dataTransfer.files);
  };

  return (
    <Paper
      className={`${styles.root}${dragActive ? ` ${styles.rootDragActive}` : ""}`}
      elevation={0}
      onDragEnter={() => setDragActive(true)}
      onDragLeave={() => setDragActive(false)}
      onDragOver={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDrop={handleDrop}
    >
      <input
        accept={ACCEPTED_TYPES.join(",")}
        hidden
        onChange={handleInputChange}
        ref={inputRef}
        type="file"
      />

      {file && previewUrl ? (
        <div className={styles.previewLayout}>
          <div className={styles.previewFrame}>
            <img alt="پیش‌نمایش عکس فضای خانه" className={styles.previewImage} src={previewUrl} />
            <IconButton
              aria-label="حذف عکس فضای خانه"
              className={styles.removeButton}
              disabled={disabled}
              onClick={() => onChange(null)}
              size="small"
            >
              <DeleteOutlineRoundedIcon />
            </IconButton>
          </div>

          <div className={styles.previewMeta}>
            <div className={styles.previewMetaText}>
              <Typography component="p" variant="subtitle2">
                {file.name}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {(file.size / (1024 * 1024)).toFixed(2)} مگابایت
              </Typography>
            </div>
            <Button
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              size="small"
              variant="outlined"
            >
              تعویض عکس
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.uploadIconWrap} aria-hidden="true">
            <CloudUploadRoundedIcon className={styles.uploadIcon} />
          </div>
          <div className={styles.emptyCopy}>
            <Typography component="h3" variant="subtitle1">
              عکس فضای خانه خود را بارگذاری کنید
            </Typography>
            <Typography color="text.secondary" variant="body2">
              یک عکس واضح از فضای نشیمن یا فضای خانه خود انتخاب کنید تا مبل انتخابی را در همان محیط
              ببینید.
            </Typography>
          </div>
          <Button
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            startIcon={<ImageOutlinedIcon />}
            variant="contained"
          >
            انتخاب عکس
          </Button>
        </div>
      )}
    </Paper>
  );
}
