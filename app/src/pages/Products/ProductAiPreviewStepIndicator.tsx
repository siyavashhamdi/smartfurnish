import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { memo, type ReactElement } from "react";

import {
  getProductAiPreviewStepIndex,
  PRODUCT_AI_PREVIEW_STEPS,
  type ProductAiPreviewStepId,
} from "./product-ai-preview.steps";
import stepStyles from "./styles/ProductAiPreviewSteps.module.scss";

type ProductAiPreviewStepIndicatorProps = {
  readonly activeStepId: ProductAiPreviewStepId;
  readonly maxReachedStepIndex: number;
  readonly isStepCompleted?: (stepId: ProductAiPreviewStepId) => boolean;
  readonly stepLabelOverrides?: Partial<
    Record<ProductAiPreviewStepId, { readonly label: string; readonly shortLabel: string }>
  >;
  readonly onStepSelect?: (stepId: ProductAiPreviewStepId) => void;
};

function isStepNavigable(
  stepId: ProductAiPreviewStepId,
  stepIsCompleted: boolean,
): boolean {
  if (stepId === "coming-soon") {
    return stepIsCompleted;
  }

  return true;
}

function joinStepClasses(...classes: Array<string | undefined>): string {
  let result = "";

  for (const className of classes) {
    if (className) {
      result += result ? ` ${className}` : className;
    }
  }

  return result;
}

function resolveStepState(
  stepIndex: number,
  activeStepIndex: number,
  maxReachedStepIndex: number,
  stepId: ProductAiPreviewStepId,
  isStepCompleted?: (stepId: ProductAiPreviewStepId) => boolean,
): "upcoming" | "reached" | "active" | "completed" {
  if (stepIndex === activeStepIndex) {
    return "active";
  }

  if (isStepCompleted?.(stepId)) {
    return "completed";
  }

  if (stepIndex > maxReachedStepIndex) {
    return "upcoming";
  }

  return "reached";
}

function ProductAiPreviewStepIndicatorInner({
  activeStepId,
  maxReachedStepIndex,
  isStepCompleted,
  stepLabelOverrides,
  onStepSelect,
}: ProductAiPreviewStepIndicatorProps): ReactElement {
  const activeStepIndex = getProductAiPreviewStepIndex(activeStepId);

  return (
    <div className={stepStyles.track} aria-label="مراحل پیش‌نمایش هوشمند">
      {PRODUCT_AI_PREVIEW_STEPS.map((step, index) => {
        const stepIsCompleted = Boolean(isStepCompleted?.(step.id));
        const state = resolveStepState(
          index,
          activeStepIndex,
          maxReachedStepIndex,
          step.id,
          isStepCompleted,
        );
        const isClickable =
          Boolean(onStepSelect) &&
          isStepNavigable(step.id, stepIsCompleted) &&
          index <= maxReachedStepIndex;
        const connectorReached = index > 0 && index <= maxReachedStepIndex;
        const connectorActive = index > 0 && index === activeStepIndex;
        const stepLabels = stepLabelOverrides?.[step.id] ?? step;

        return (
          <div
            key={step.id}
            className={joinStepClasses(
              stepStyles.stepColumn,
              state === "active" ? stepStyles.stepColumnActive : undefined,
              connectorReached ? stepStyles.stepColumnConnectorReached : undefined,
              connectorActive ? stepStyles.stepColumnConnectorActive : undefined,
            )}
          >
            <button
              type="button"
              className={joinStepClasses(
                stepStyles.stepButton,
                state === "reached" ? stepStyles.stepButtonReached : undefined,
                state === "active" ? stepStyles.stepButtonActive : undefined,
                state === "completed" ? stepStyles.stepButtonCompleted : undefined,
              )}
              disabled={!isClickable}
              aria-current={state === "active" ? "step" : undefined}
              aria-label={stepLabels.label}
              onClick={(event) => {
                if (isClickable) {
                  onStepSelect?.(step.id);
                  event.currentTarget.blur();
                }
              }}
            >
              <span className={stepStyles.stepNumber}>{index + 1}</span>
              {stepIsCompleted ? (
                <span className={stepStyles.stepTick} aria-hidden="true">
                  <CheckRoundedIcon fontSize="inherit" />
                </span>
              ) : null}
            </button>
            <span
              className={joinStepClasses(
                stepStyles.stepLabel,
                state === "active" ? stepStyles.stepLabelActive : undefined,
                state === "completed" ? stepStyles.stepLabelCompleted : undefined,
              )}
            >
              {stepLabels.shortLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export const ProductAiPreviewStepIndicator = memo(ProductAiPreviewStepIndicatorInner);
