import { useCallback, useRef, useState, type DragEvent } from "react";

import { hasArrayOrderChanged } from "./cover-gallery.util";
import {
  reorderByIdWithInsertion,
  setDragTransferData,
  shouldInsertAfterHorizontal,
} from "./reorder-drag.util";
import type { DraftGalleryImage } from "./types";

type InsertHint = {
  readonly targetId: string;
  readonly insertAfter: boolean;
};

type UseCoverThumbnailReorderArgs<T extends DraftGalleryImage> = {
  readonly images: readonly T[];
  readonly onReorder: (images: T[]) => void;
};

export function useCoverThumbnailReorder<T extends DraftGalleryImage>({
  images,
  onReorder,
}: UseCoverThumbnailReorderArgs<T>) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [insertHint, setInsertHint] = useState<InsertHint | null>(null);

  const clearDragState = useCallback((): void => {
    setDraggedId(null);
    setInsertHint(null);
  }, []);

  const handleDragStart = useCallback((event: DragEvent<HTMLButtonElement>, imageId: string): void => {
    setDraggedId(imageId);
    setDragTransferData(event, imageId);
    event.dataTransfer.setDragImage(event.currentTarget, 16, 16);
  }, []);

  const applyReorder = useCallback(
    (event: DragEvent<HTMLElement>, targetId: string, finalize: boolean): void => {
      if (!draggedId || draggedId === targetId) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = "move";

      const insertAfter = shouldInsertAfterHorizontal(event, event.currentTarget);
      setInsertHint({ targetId, insertAfter });

      const nextImages = reorderByIdWithInsertion(images, draggedId, targetId, insertAfter);
      if (hasArrayOrderChanged(images, nextImages)) {
        onReorder(nextImages);
      }

      if (finalize) {
        clearDragState();
      }
    },
    [clearDragState, draggedId, images, onReorder]
  );

  return {
    draggedId,
    insertHint,
    clearDragState,
    handleDragStart,
    applyReorder,
  };
}

export function useSuppressClickAfterDrag(onDragEnd: () => void) {
  const suppressClickRef = useRef(false);

  const handleClick = useCallback((onSelect: () => void): void => {
    if (suppressClickRef.current) {
      return;
    }
    onSelect();
  }, []);

  const handleDragEnd = useCallback((): void => {
    suppressClickRef.current = true;
    onDragEnd();
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  }, [onDragEnd]);

  return { handleClick, handleDragEnd };
}

export type { InsertHint };
