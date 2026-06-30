import sharp from "../../../utils/sharp.util";
import { BadRequestException } from "@nestjs/common";

import type { InputImage } from "../types/input-image.types";

const COMBINED_REFERENCE_MIME_TYPE = "image/jpeg";
const DIVIDER_COLOR = "#1f2937";
const DIVIDER_WIDTH = 8;
const PANEL_GAP_WIDTH = 100;
const MAX_REFERENCE_PANEL_HEIGHT = 1280;

export interface ReferenceImageLayout {
  readonly environmentLeft: number;
  readonly environmentPanelWidth: number;
  readonly panelHeight: number;
  readonly totalWidth: number;
}

export interface CombinedReferenceImage {
  readonly image: InputImage;
  readonly layout: ReferenceImageLayout;
  readonly environmentAspectRatio: string;
}

async function readImageHeight(image: InputImage): Promise<number> {
  const metadata = await sharp(image.buffer).metadata();

  if (!metadata.height) {
    throw new BadRequestException("Unable to read image dimensions.");
  }

  return metadata.height;
}

async function renderReferencePanel(
  image: InputImage,
  height: number,
): Promise<{ buffer: Buffer; height: number; width: number }> {
  const { data, info } = await sharp(image.buffer)
    .rotate()
    .resize({ height })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 90 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    height: info.height,
    width: info.width,
  };
}

async function createDivider(height: number): Promise<Buffer> {
  return sharp({
    create: {
      background: DIVIDER_COLOR,
      channels: 3,
      height,
      width: DIVIDER_WIDTH,
    },
  })
    .jpeg({ quality: 90 })
    .toBuffer();
}

function greatestCommonDivisor(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y !== 0) {
    const remainder = x % y;
    x = y;
    y = remainder;
  }

  return x || 1;
}

function formatAspectRatio(width: number, height: number): string {
  const divisor = greatestCommonDivisor(width, height);
  return `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;
}

export async function combineReferenceImages(
  productImage: InputImage,
  environmentImage: InputImage,
): Promise<CombinedReferenceImage> {
  const [productHeight, environmentHeight] = await Promise.all([
    readImageHeight(productImage),
    readImageHeight(environmentImage),
  ]);

  const panelHeight = Math.min(
    Math.max(productHeight, environmentHeight),
    MAX_REFERENCE_PANEL_HEIGHT,
  );
  const [productPanel, environmentPanel, divider] = await Promise.all([
    renderReferencePanel(productImage, panelHeight),
    renderReferencePanel(environmentImage, panelHeight),
    createDivider(panelHeight),
  ]);
  const dividerLeft =
    productPanel.width + Math.floor((PANEL_GAP_WIDTH - DIVIDER_WIDTH) / 2);
  const environmentLeft = productPanel.width + PANEL_GAP_WIDTH;
  const width = environmentLeft + environmentPanel.width;

  const buffer = await sharp({
    create: {
      background: "#ffffff",
      channels: 3,
      height: panelHeight,
      width,
    },
  })
    .composite([
      { input: productPanel.buffer, left: 0, top: 0 },
      { input: divider, left: dividerLeft, top: 0 },
      {
        input: environmentPanel.buffer,
        left: environmentLeft,
        top: 0,
      },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();

  return {
    image: {
      buffer,
      mimeType: COMBINED_REFERENCE_MIME_TYPE,
    },
    layout: {
      environmentLeft,
      environmentPanelWidth: environmentPanel.width,
      panelHeight,
      totalWidth: width,
    },
    environmentAspectRatio: formatAspectRatio(
      environmentPanel.width,
      panelHeight,
    ),
  };
}
