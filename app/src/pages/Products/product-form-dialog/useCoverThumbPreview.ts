import { useEffect, useMemo } from "react";

export function useCoverThumbPreview(file: File | null): string | null {
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(
    () => () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl]
  );

  return previewUrl;
}
