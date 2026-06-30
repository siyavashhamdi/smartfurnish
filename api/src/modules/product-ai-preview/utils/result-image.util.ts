import sharp from "../../../utils/sharp.util";
import { BadGatewayException } from "@nestjs/common";

import type { ReferenceImageLayout } from "./reference-image.util";

async function readImageBuffer(
  imageUrl: string,
): Promise<{ buffer: Buffer; mimeType: string }> {
  if (imageUrl.startsWith("data:")) {
    return parseDataUrl(imageUrl);
  }

  if (imageUrl.startsWith("http")) {
    return downloadRemoteImage(imageUrl);
  }

  throw new BadGatewayException(
    "Image generation returned an unsupported image URL.",
  );
}

function toDataUrl(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

function parseDataUrl(dataUrl: string): { buffer: Buffer; mimeType: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

  if (!match?.[1] || !match[2]) {
    throw new BadGatewayException(
      "Image generation returned an invalid image data URL.",
    );
  }

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

async function downloadRemoteImage(
  imageUrl: string,
): Promise<{ buffer: Buffer; mimeType: string }> {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new BadGatewayException(
      `Failed to download generated image (${response.status}).`,
    );
  }

  const mimeType =
    response.headers.get("content-type")?.split(";")[0] ?? "image/png";
  const buffer = Buffer.from(await response.arrayBuffer());

  return { buffer, mimeType };
}

export async function cropGeneratedImageToEnvironmentPanel(
  imageUrl: string,
  layout: ReferenceImageLayout,
): Promise<string> {
  const { buffer, mimeType } = await readImageBuffer(imageUrl);
  const metadata = await sharp(buffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new BadGatewayException("Generated image is missing dimensions.");
  }

  const resultAspect = metadata.width / metadata.height;
  const combinedAspect = layout.totalWidth / layout.panelHeight;
  const environmentAspect = layout.environmentPanelWidth / layout.panelHeight;
  const isLikelySplitImage =
    Math.abs(resultAspect - combinedAspect) <
    Math.abs(resultAspect - environmentAspect);

  if (!isLikelySplitImage) {
    return imageUrl;
  }

  const left = Math.round(
    metadata.width * (layout.environmentLeft / layout.totalWidth),
  );
  const width = Math.round(
    metadata.width * (layout.environmentPanelWidth / layout.totalWidth),
  );
  const safeWidth = Math.min(width, metadata.width - left);

  if (safeWidth <= 0) {
    return imageUrl;
  }

  const croppedBuffer = await sharp(buffer)
    .extract({ left, top: 0, width: safeWidth, height: metadata.height })
    .jpeg({ quality: 90 })
    .toBuffer();

  return toDataUrl(
    croppedBuffer,
    mimeType.startsWith("image/") ? mimeType : "image/jpeg",
  );
}
