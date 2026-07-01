import type { UserProductInquiryDetailStatusHistoryEntry } from "./inquiry-detail.api";

export type InquirySalePayload = {
  readonly completedAt: string;
  readonly completedBy: string;
};

export type InquiryContactPayload = {
  readonly contactedAt: string;
  readonly contactedBy: string;
};

export function findLatestContactPayload(
  statusHistory: readonly UserProductInquiryDetailStatusHistoryEntry[],
): InquiryContactPayload | null {
  for (let index = statusHistory.length - 1; index >= 0; index -= 1) {
    const entry = statusHistory[index];
    const contactedAt = entry.payload?.contactedAt?.trim();
    const contactedBy = entry.payload?.contactedBy?.trim();

    if (entry.status === "CONTACTED" && contactedAt && contactedBy) {
      return { contactedAt, contactedBy };
    }
  }

  return null;
}

export function findLatestSaleCompletedPayload(
  statusHistory: readonly UserProductInquiryDetailStatusHistoryEntry[],
): InquirySalePayload | null {
  for (let index = statusHistory.length - 1; index >= 0; index -= 1) {
    const entry = statusHistory[index];
    const completedAt = entry.payload?.completedAt?.trim();
    const completedBy = entry.payload?.completedBy?.trim();

    if (entry.status === "SALE_COMPLETED" && completedAt && completedBy) {
      return { completedAt, completedBy };
    }
  }

  return null;
}

export function toLocalDateTimeInputValueFromIso(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}
