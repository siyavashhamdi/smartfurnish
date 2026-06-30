export interface InputImage {
  readonly buffer: Buffer;
  readonly mimeType: string;
}

export interface GenerateImageResult {
  readonly description?: string;
  readonly imageUrl: string;
}

export interface GenerateImageOptions {
  readonly prompt: string;
  readonly images: readonly InputImage[];
  readonly aspectRatio?: string;
  readonly imageSize?: string;
  readonly model?: string;
}
