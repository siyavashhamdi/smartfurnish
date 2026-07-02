import type { CSSProperties } from "react";

export const CAROUSEL_SWIPE_COMMIT_PX = 52;

export function clampCarouselIndex(index: number, slideCount: number): number {
  return Math.min(index, Math.max(slideCount - 1, 0));
}

export function getCarouselTrackOffsetPx(
  activeIndex: number,
  slideCount: number,
  slideWidthPx: number
): number {
  if (slideCount <= 1 || slideWidthPx <= 0) {
    return 0;
  }

  return -(slideCount - 1 - activeIndex) * slideWidthPx;
}

export function getCarouselSlideStyle(slideWidthPx: number): CSSProperties | undefined {
  if (slideWidthPx <= 0) {
    return undefined;
  }

  const width = `${slideWidthPx}px`;
  return {
    flex: `0 0 ${width}`,
    inlineSize: width,
    minInlineSize: width,
    maxInlineSize: width,
  };
}

export function getCarouselTrackStyle(
  slideWidthPx: number,
  slideCount: number,
  transform: string
): CSSProperties {
  const style: CSSProperties = { transform };

  if (slideWidthPx > 0 && slideCount > 1) {
    style.inlineSize = `${slideWidthPx * slideCount}px`;
  }

  return style;
}

export function joinClassNames(
  ...parts: ReadonlyArray<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}
