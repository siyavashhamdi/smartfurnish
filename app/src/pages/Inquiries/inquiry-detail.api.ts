import type { FileAccessUrl } from "../../utils/fileAccessUrl.util";
import type { UserProductInquiryStatus } from "./inquiries-list.api";

export type UserProductInquiryDetailUser = {
  readonly fullName: string;
  readonly username: string;
  readonly phoneNumber?: string | null;
  readonly roles: readonly string[];
};

export type UserProductInquiryDetailProduct = {
  readonly title: string;
  readonly coverImageAccessUrls: readonly FileAccessUrl[];
};

export type UserProductInquiryDetailStatusHistoryContacted = {
  readonly contactedAt: string;
  readonly contactedBy: string;
};

export type UserProductInquiryDetailStatusHistorySaleCompleted = {
  readonly completedAt: string;
  readonly completedBy: string;
  readonly finalPriceIrt: number;
};

export type UserProductInquiryDetailStatusHistoryEntry = {
  readonly status: UserProductInquiryStatus;
  readonly reason: string;
  readonly description?: string | null;
  readonly changedAt: string;
  readonly changedBy?: string | null;
  readonly contacted?: UserProductInquiryDetailStatusHistoryContacted | null;
  readonly saleCompleted?: UserProductInquiryDetailStatusHistorySaleCompleted | null;
};

export type UserProductInquiryDetailPreviewModel = {
  readonly provider: string;
  readonly model: string;
  readonly aspectRatio?: string | null;
  readonly imageSize?: string | null;
  readonly reasoningEffort?: string | null;
};

export type UserProductInquiryDetailPreview = {
  readonly environmentFileId: string;
  readonly resultFileId: string;
  readonly sourceProductImageFileId?: string | null;
  readonly generatedAt: string;
  readonly durationSeconds?: number | null;
  readonly model: UserProductInquiryDetailPreviewModel;
  readonly fabric: {
    readonly fabricKey: string;
    readonly colorKey: string;
    readonly patternName: string;
    readonly colorName: string;
    readonly colorHex?: string | null;
    readonly label: string;
  };
  readonly environmentFileAccessUrl?: FileAccessUrl | null;
  readonly resultFileAccessUrl?: FileAccessUrl | null;
  readonly sourceProductImageFileAccessUrl?: FileAccessUrl | null;
};

export type UserProductInquiryDetailContact = {
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly requestedAt: string;
  readonly customerNote?: string | null;
};

export type UserProductInquiryDetailRelatedActiveInquiry = {
  readonly id: string;
  readonly status: UserProductInquiryStatus;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly requestedAt: string;
};

export type UserProductInquiryDetailRow = {
  readonly id: string;
  readonly isArchived: boolean;
  readonly userId: string;
  readonly productId: string;
  readonly status: UserProductInquiryStatus;
  readonly user: UserProductInquiryDetailUser;
  readonly product: UserProductInquiryDetailProduct;
  readonly statusHistory: readonly UserProductInquiryDetailStatusHistoryEntry[];
  readonly preview?: readonly UserProductInquiryDetailPreview[] | null;
  readonly contact?: UserProductInquiryDetailContact | null;
  readonly relatedActiveInquiries: readonly UserProductInquiryDetailRelatedActiveInquiry[];
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly createdBy?: string | null;
  readonly updatedBy?: string | null;
};

export type UserProductInquiryDetailQuery = {
  readonly userProductInquiryDetail: UserProductInquiryDetailRow;
};

export type UserProductInquiryDetailQueryVariables = {
  readonly input: {
    readonly id: string;
  };
};

export type UserProductInquiryDetailRecord = UserProductInquiryDetailRow;

export function mapUserProductInquiryDetailRowToRecord(
  row: UserProductInquiryDetailRow,
): UserProductInquiryDetailRecord {
  return row;
}
