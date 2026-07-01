export type ProductAiPreviewStepId = "setup" | "result" | "contact" | "coming-soon";

export type ProductAiPreviewStepDefinition = {
  readonly id: ProductAiPreviewStepId;
  readonly label: string;
  readonly shortLabel: string;
};

export const PRODUCT_AI_PREVIEW_STEPS: readonly ProductAiPreviewStepDefinition[] = [
  {
    id: "setup",
    label: "پیش‌نمایش هوشمند",
    shortLabel: "پیش‌نمایش",
  },
  {
    id: "result",
    label: "مشاهده نتیجه",
    shortLabel: "نتیجه",
  },
  {
    id: "contact",
    label: "ثبت بازدید حضوری",
    shortLabel: "بازدید",
  },
  {
    id: "coming-soon",
    label: "تجربه بهتر",
    shortLabel: "تجربه بهتر",
  },
] as const;

export function getProductAiPreviewStepIndex(stepId: ProductAiPreviewStepId): number {
  return PRODUCT_AI_PREVIEW_STEPS.findIndex((step) => step.id === stepId);
}

export const PRODUCT_AI_PREVIEW_STEP_SEARCH_PARAM = "step";

export function isProductAiPreviewStepId(value: unknown): value is ProductAiPreviewStepId {
  return (
    value === "setup" ||
    value === "result" ||
    value === "contact" ||
    value === "coming-soon"
  );
}

export function readProductAiPreviewStepFromSearch(
  search: string,
): ProductAiPreviewStepId | undefined {
  const step = new URLSearchParams(search).get(PRODUCT_AI_PREVIEW_STEP_SEARCH_PARAM);
  return isProductAiPreviewStepId(step) ? step : undefined;
}

export function buildProductAiPreviewSearch(
  currentSearch: string,
  stepId: ProductAiPreviewStepId | null,
): string {
  const params = new URLSearchParams(currentSearch);

  if (stepId) {
    params.set(PRODUCT_AI_PREVIEW_STEP_SEARCH_PARAM, stepId);
  } else {
    params.delete(PRODUCT_AI_PREVIEW_STEP_SEARCH_PARAM);
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}
