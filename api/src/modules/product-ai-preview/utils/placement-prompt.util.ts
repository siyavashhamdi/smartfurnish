import { DEFAULT_AI_PREVIEW_PLACEMENT_PROMPT } from "../../../constants/product-ai-preview.constants";

export interface ProductAiPreviewContext {
  readonly productTitle: string;
  readonly patternName: string;
  readonly colorName: string;
  readonly colorHex?: string;
  readonly materialTexture?: string;
  readonly primaryMaterial?: string;
}

function buildUpholsteryDescription(context: ProductAiPreviewContext): string {
  const parts = [
    context.patternName,
    `${context.colorName}${context.colorHex ? ` (${context.colorHex})` : ""}`,
    context.materialTexture,
    context.primaryMaterial,
  ].filter((part) => Boolean(part?.trim()));

  return parts.join(" — ");
}

export function buildPlacementPrompt(
  template: string | undefined,
  context: ProductAiPreviewContext,
): string {
  const base = template?.trim() || DEFAULT_AI_PREVIEW_PLACEMENT_PROMPT;
  const upholstery = buildUpholsteryDescription(context);

  return base
    .replace(/\{\{productTitle\}\}/g, context.productTitle)
    .replace(/\{\{patternName\}\}/g, context.patternName)
    .replace(/\{\{colorName\}\}/g, context.colorName)
    .replace(/\{\{colorHex\}\}/g, context.colorHex ?? "")
    .replace(/\{\{materialTexture\}\}/g, context.materialTexture ?? "")
    .replace(/\{\{primaryMaterial\}\}/g, context.primaryMaterial ?? "")
    .replace(/\{\{upholstery\}\}/g, upholstery);
}
