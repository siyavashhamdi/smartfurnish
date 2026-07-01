import type { ReactElement } from "react";

import type { FileAccessUrl } from "../../utils/fileAccessUrl.util";
import { ProductDetailImageViewerDialog } from "../../pages/Products/ProductDetailImageViewerDialog";

type FileImageFullscreenDialogProps = {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly accessUrl: FileAccessUrl | null | undefined;
  readonly title: string;
};

export function FileImageFullscreenDialog({
  open,
  onClose,
  accessUrl,
  title,
}: FileImageFullscreenDialogProps): ReactElement {
  return (
    <ProductDetailImageViewerDialog
      open={open}
      onClose={onClose}
      title={title}
      coverImageAccessUrls={accessUrl ? [accessUrl] : []}
      activeIndex={0}
      onActiveIndexChange={() => undefined}
    />
  );
}
