import { formatSetPieceDimensionText } from "./product-detail.api";
import type { ProductSetPieceRow } from "./product-list.api";
import type { FileAccessUrl } from "../../utils/fileAccessUrl.util";

export type SetPieceSlideEntry = {
  readonly setPiece: ProductSetPieceRow;
  readonly accessUrl: FileAccessUrl | null;
};

export function buildSetPieceSlideEntries(
  setPieces: readonly ProductSetPieceRow[]
): SetPieceSlideEntry[] {
  const slides: SetPieceSlideEntry[] = [];

  for (const setPiece of setPieces) {
    const images = setPiece.imageAccessUrls ?? [];
    if (images.length === 0) {
      slides.push({ setPiece, accessUrl: null });
      continue;
    }

    for (const accessUrl of images) {
      slides.push({ setPiece, accessUrl });
    }
  }

  return slides;
}

export function buildSetPieceSpecLine(setPiece: ProductSetPieceRow): string {
  const dimensions = [...setPiece.dimensions].sort(
    (left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0)
  );
  const dimensionItems = dimensions
    .map((dimension) => formatSetPieceDimensionText(dimension))
    .filter((text): text is string => Boolean(text));

  const parts = [
    ...dimensionItems,
    typeof setPiece.weightKg === "number"
      ? `وزن: ${setPiece.weightKg.toLocaleString("fa-IR")} کیلوگرم`
      : null,
  ].filter((part): part is string => Boolean(part));

  return parts.join(" | ");
}

export function getSetPieceCoverUrls(
  slideEntries: readonly SetPieceSlideEntry[]
): (FileAccessUrl | null)[] {
  return slideEntries.map((entry) => entry.accessUrl);
}
