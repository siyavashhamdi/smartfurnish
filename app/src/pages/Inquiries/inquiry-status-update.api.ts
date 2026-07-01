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
    readonly payload?: {
      readonly contactedAt?: string;
      readonly contactedBy?: string;
      readonly completedAt?: string;
      readonly completedBy?: string;
    } | null;
  };
};
