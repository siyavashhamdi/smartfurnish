import type { UserProductInquiryDetailStatusHistoryEntry } from "./inquiry-detail.api";

export type InquirySaleCompletedDetails = {
  readonly completedAt: string;
  readonly completedBy: string;
  readonly finalPriceIrt: number;
};

export type InquiryContactedDetails = {
  readonly contactedAt: string;
  readonly contactedBy: string;
};

export function findLatestContactedDetails(
  statusHistory: readonly UserProductInquiryDetailStatusHistoryEntry[],
): InquiryContactedDetails | null {
  for (let index = statusHistory.length - 1; index >= 0; index -= 1) {
    const entry = statusHistory[index];
    const contactedAt = entry.contacted?.contactedAt?.trim();
    const contactedBy = entry.contacted?.contactedBy?.trim();

    if (entry.status === "CONTACTED" && contactedAt && contactedBy) {
      return { contactedAt, contactedBy };
    }
  }

  return null;
}

export function findLatestSaleCompletedDetails(
  statusHistory: readonly UserProductInquiryDetailStatusHistoryEntry[],
): InquirySaleCompletedDetails | null {
  for (let index = statusHistory.length - 1; index >= 0; index -= 1) {
    const entry = statusHistory[index];
    const completedAt = entry.saleCompleted?.completedAt?.trim();
    const completedBy = entry.saleCompleted?.completedBy?.trim();
    const finalPriceIrt = entry.saleCompleted?.finalPriceIrt;

    if (
      entry.status === "SALE_COMPLETED" &&
      completedAt &&
      completedBy &&
      finalPriceIrt != null &&
      !Number.isNaN(finalPriceIrt)
    ) {
      return { completedAt, completedBy, finalPriceIrt };
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
