import { GENERAL_SUBSCRIPTION_UPDATE_TYPES } from "../constants";
import type { GeneralUpdateEvent } from "../hooks/useGeneralUpdatesSubscription";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseProductUpdatedLiveUpdateProductId(
  event: GeneralUpdateEvent
): string | null {
  if (event.updateType !== GENERAL_SUBSCRIPTION_UPDATE_TYPES.PRODUCT_UPDATED) {
    return null;
  }

  const targetId = typeof event.targetId === "string" ? event.targetId.trim() : "";
  if (targetId) {
    return targetId;
  }

  if (!isRecord(event.payload)) {
    return null;
  }

  const productId =
    typeof event.payload.productId === "string" ? event.payload.productId.trim() : "";

  return productId || null;
}
