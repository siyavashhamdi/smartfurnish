import type { Collection } from "mongodb";

import { addNotDeletedCondition } from "../../database/utils/not-deleted-query.util";

/**
 * Every MongoDB field path that stores a StoredFile ObjectId reference.
 * Keep this list in sync when adding new file-backed fields to any collection.
 */
export type StoredFileReferenceDefinition = {
  readonly label: string;
  readonly collectionName: string;
  readonly field: string;
  readonly match: Record<string, unknown>;
};

export const STORED_FILE_REFERENCE_DEFINITIONS: readonly StoredFileReferenceDefinition[] =
  [
    {
      label: "products.coverImageFileIds",
      collectionName: "products",
      field: "coverImageFileIds",
      match: { "coverImageFileIds.0": { $exists: true } },
    },
    {
      label: "products.setPieces.imageFileIds",
      collectionName: "products",
      field: "setPieces.imageFileIds",
      match: { "setPieces.imageFileIds.0": { $exists: true } },
    },
    {
      label: "products.fabrics.colors.aiProductImageFileId",
      collectionName: "products",
      field: "fabrics.colors.aiProductImageFileId",
      match: {
        "fabrics.colors.aiProductImageFileId": { $exists: true, $ne: null },
      },
    },
    {
      label: "users.profile.avatarFileId",
      collectionName: "users",
      field: "profile.avatarFileId",
      match: { "profile.avatarFileId": { $exists: true, $ne: null } },
    },
    {
      label: "tickets.messages.attachmentFileIds",
      collectionName: "tickets",
      field: "messages.attachmentFileIds",
      match: { "messages.attachmentFileIds.0": { $exists: true } },
    },
    {
      label: "user_products.purchase.uploadedReceiptFileId",
      collectionName: "user_products",
      field: "purchase.uploadedReceiptFileId",
      match: {
        "purchase.uploadedReceiptFileId": { $exists: true, $ne: null },
      },
    },
    {
      label: "user_product_inquiries.preview.environmentFileId",
      collectionName: "user_product_inquiries",
      field: "preview.environmentFileId",
      match: {
        "preview.environmentFileId": { $exists: true, $ne: null },
      },
    },
    {
      label: "user_product_inquiries.preview.resultFileId",
      collectionName: "user_product_inquiries",
      field: "preview.resultFileId",
      match: { "preview.resultFileId": { $exists: true, $ne: null } },
    },
    {
      label: "user_product_inquiries.preview.sourceProductImageFileId",
      collectionName: "user_product_inquiries",
      field: "preview.sourceProductImageFileId",
      match: {
        "preview.sourceProductImageFileId": { $exists: true, $ne: null },
      },
    },
    {
      label: "product_reviews.userSnapshot.avatarFileId",
      collectionName: "product_reviews",
      field: "userSnapshot.avatarFileId",
      match: {
        "userSnapshot.avatarFileId": { $exists: true, $ne: null },
      },
    },
    {
      label: "product_reviews.messages.senderSnapshot.avatarFileId",
      collectionName: "product_reviews",
      field: "messages.senderSnapshot.avatarFileId",
      match: {
        "messages.senderSnapshot.avatarFileId": { $exists: true, $ne: null },
      },
    },
    {
      label: "files.thumbnailFileId",
      collectionName: "files",
      field: "thumbnailFileId",
      match: { thumbnailFileId: { $exists: true, $ne: null } },
    },
  ] as const;

export function collectDistinctStoredFileIds(
  collection: Collection,
  definition: StoredFileReferenceDefinition,
): Promise<unknown[]> {
  return collection.distinct(
    definition.field,
    addNotDeletedCondition(definition.match),
  );
}
