import type { UserProductInquiryDetailRow } from "./inquiry-detail.api";
import type { UserProductInquiryStatus } from "./inquiries-list.api";

export type UserProductInquiryStatusUpdateMutation = {
  readonly userProductInquiryStatusUpdate: UserProductInquiryDetailRow;
};

export type UserProductInquiryStatusUpdateMutationVariables = {
  readonly input: {
    readonly id: string;
    readonly status: UserProductInquiryStatus;
    readonly description?: string | null;
    readonly contacted?: {
      readonly contactedAt: string;
      readonly contactedBy: string;
    } | null;
    readonly saleCompleted?: {
      readonly completedAt: string;
      readonly completedBy: string;
      readonly finalPriceIrt: number;
    } | null;
  };
};
