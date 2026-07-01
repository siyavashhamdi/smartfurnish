import {
  FILE_UPLOAD_POLICY,
  FILE_UPLOAD_POLICY_MAX_SIZE_BYTES,
} from "../../constants/fileUploadPolicies";
import { USER_PRODUCT_INQUIRY_PREVIEW_SUBMIT_MUTATION } from "../../graphql/mutations/userProductInquiryPreviewSubmit.mutation";
import { USER_PRODUCT_INQUIRY_CONTACT_SUBMIT_MUTATION } from "../../graphql/mutations/userProductInquiryContactSubmit.mutation";
import { apolloClient } from "../../lib/apollo-client";
import { getFileIdFromAccessUrl } from "../../utils/fileAccessUrl.util";
import { uploadFile } from "../../utils/fileUpload.util";
import { resolveErrorMessageFromCode } from "../../utilities/graphql-error.util";

export type ProductAiPreviewProgress = {
  readonly step: string;
  readonly label: string;
  readonly percent: number;
};

export type ProductAiPreviewStageResult = {
  readonly image: string;
  readonly durationSeconds: number;
  readonly description: string | null;
  readonly environmentFileId: string;
  readonly resultFileId: string;
  readonly sourceProductImageFileId: string;
  readonly generatedAt: string;
  readonly stagingDurationSeconds: number;
  readonly aspectRatio?: string;
  readonly imageSize?: string;
  readonly product: {
    readonly id: string;
    readonly title: string;
  };
  readonly fabric: {
    readonly patternName: string;
    readonly colorName: string;
    readonly colorHex?: string;
    readonly label: string;
  };
};

export type UserProductInquiryContactSubmitResult = {
  readonly id: string;
  readonly status: string;
  readonly contact: {
    readonly firstName: string;
    readonly lastName: string;
    readonly phone: string;
    readonly requestedAt: string;
  };
};

type UserProductInquiryContactSubmitMutationResult = {
  readonly userProductInquiryContactSubmit?: UserProductInquiryContactSubmitResult;
};

export type UserProductInquiryPreviewSubmitResult = ProductAiPreviewStageResult & {
  readonly id: string;
  readonly productId: string;
  readonly status: string;
};

type UserProductInquiryPreviewSubmitMutationResult = {
  readonly userProductInquiryPreviewSubmit?: UserProductInquiryPreviewSubmitResult;
};

const ROOM_PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

const AI_PREVIEW_FALLBACK_MESSAGE =
  "امکان تولید پیش‌نمایش هوشمند وجود ندارد. لطفاً بعداً دوباره تلاش کنید.";

function resolveAiPreviewErrorMessage(
  code: string | undefined,
  fallback = AI_PREVIEW_FALLBACK_MESSAGE,
): string {
  const normalizedCode = code?.trim();
  if (!normalizedCode) {
    return fallback;
  }

  if (/^[A-Z][A-Z0-9_]+$/.test(normalizedCode)) {
    return resolveErrorMessageFromCode(normalizedCode);
  }

  return fallback;
}

export function getProductAiPreviewErrorMessage(
  error: unknown,
  fallback: string = AI_PREVIEW_FALLBACK_MESSAGE,
): string {
  if (error instanceof Error && error.message.trim()) {
    return resolveAiPreviewErrorMessage(error.message, fallback);
  }

  if (typeof error === "string" && error.trim()) {
    return resolveAiPreviewErrorMessage(error, fallback);
  }

  return fallback;
}

export async function uploadProductAiPreviewRoomPhoto(
  file: File,
  accessToken?: string | null,
): Promise<string> {
  const uploadedEnvironment = await uploadFile(file, {
    accessToken,
    policy: FILE_UPLOAD_POLICY.AI_PREVIEW_ROOM,
    accept: ROOM_PHOTO_ACCEPT,
    maxSizeBytes: FILE_UPLOAD_POLICY_MAX_SIZE_BYTES.AI_PREVIEW_ROOM,
  });
  const environmentFileId = getFileIdFromAccessUrl(uploadedEnvironment.accessUrl);

  if (!environmentFileId) {
    throw new Error("Room photo upload did not return a file id.");
  }

  return environmentFileId;
}

export async function submitUserProductInquiryPreview(params: {
  readonly productId: string;
  readonly fabricKey: string;
  readonly colorKey: string;
  readonly environmentFileId: string;
  readonly inquiryId?: string | null;
}): Promise<UserProductInquiryPreviewSubmitResult> {
  const result = await apolloClient.mutate<UserProductInquiryPreviewSubmitMutationResult>({
    mutation: USER_PRODUCT_INQUIRY_PREVIEW_SUBMIT_MUTATION,
    variables: {
      input: {
        colorKey: params.colorKey,
        environmentFileId: params.environmentFileId,
        fabricKey: params.fabricKey,
        inquiryId: params.inquiryId?.trim() || undefined,
        productId: params.productId,
      },
    },
  });

  const inquiry = result.data?.userProductInquiryPreviewSubmit;

  if (!inquiry?.id) {
    throw new Error("Preview inquiry could not be saved.");
  }

  return inquiry;
}

export async function submitUserProductInquiryContact(params: {
  readonly productId: string;
  readonly inquiryId?: string | null;
  readonly fabricKey?: string | null;
  readonly colorKey?: string | null;
  readonly fullName: string;
  readonly phone: string;
}): Promise<UserProductInquiryContactSubmitResult> {
  const result = await apolloClient.mutate<UserProductInquiryContactSubmitMutationResult>({
    mutation: USER_PRODUCT_INQUIRY_CONTACT_SUBMIT_MUTATION,
    variables: {
      input: {
        colorKey: params.colorKey?.trim() || undefined,
        fabricKey: params.fabricKey?.trim() || undefined,
        fullName: params.fullName,
        inquiryId: params.inquiryId?.trim() || undefined,
        phone: params.phone,
        productId: params.productId,
      },
    },
  });

  const inquiry = result.data?.userProductInquiryContactSubmit;

  if (!inquiry?.id) {
    throw new Error("Contact inquiry could not be saved.");
  }

  return inquiry;
}
