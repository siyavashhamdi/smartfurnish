import sharp from "../../../utils/sharp.util";
import { BadRequestException } from "@nestjs/common";

import type { InputImage } from "../types/input-image.types";

/** Max bounding box for room photos (3:4 portrait — common room-photo ratio). */
export const ENVIRONMENT_MAX_WIDTH = 768;
export const ENVIRONMENT_MAX_HEIGHT = 1024;
const OUTPUT_MIME_TYPE = "image/jpeg";
const JPEG_QUALITY = 85;

export async function prepareEnvironmentImage(
  image: InputImage,
): Promise<InputImage> {
  const metadata = await sharp(image.buffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new BadRequestException(
      "Unable to read uploaded room photo dimensions.",
    );
  }

  const buffer = await sharp(image.buffer)
    .rotate()
    .resize({
      width: ENVIRONMENT_MAX_WIDTH,
      height: ENVIRONMENT_MAX_HEIGHT,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  return {
    buffer,
    mimeType: OUTPUT_MIME_TYPE,
  };
}
