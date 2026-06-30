export interface StagingStepDefinition {
  readonly id: string;
  readonly label: string;
  readonly percent: number;
}

export const STAGING_STEPS: readonly StagingStepDefinition[] = [
  {
    id: "validate-upload",
    label: "در حال بررسی عکس فضای خانه و اطلاعات درخواست.",
    percent: 10,
  },
  {
    id: "load-product-image",
    label: "در حال بارگذاری تصویر محصول با الگو و رنگ انتخاب‌شده.",
    percent: 25,
  },
  {
    id: "prepare-instructions",
    label: "در حال آماده‌سازی دستورالعمل قرارگیری مبل در فضا.",
    percent: 35,
  },
  {
    id: "generate-image",
    label: "در حال پردازش برای جایگذاری مبل در فضای خانه.",
    percent: 45,
  },
  {
    id: "process-result",
    label: "در حال دریافت و پردازش تصویر نهایی.",
    percent: 88,
  },
  {
    id: "complete",
    label: "پیش‌نمایش هوشمند آماده است.",
    percent: 100,
  },
] as const;

export type StagingStepId = (typeof STAGING_STEPS)[number]["id"];

export interface StagingProgressEvent {
  readonly step: StagingStepId;
  readonly label: string;
  readonly percent: number;
}

export function getStagingStep(stepId: StagingStepId): StagingStepDefinition {
  const step = STAGING_STEPS.find((item) => item.id === stepId);

  if (!step) {
    throw new Error(`Unknown staging step: ${stepId}`);
  }

  return step;
}
