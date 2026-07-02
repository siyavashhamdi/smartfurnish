/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any };
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any };
};

export type AppAboutPageConfigGqlResponse = {
  __typename?: "AppAboutPageConfigGqlResponse";
  /** Trusted HTML content for the about page */
  html: Scalars["String"]["output"];
};

export type AppPrivacyPolicyPageConfigGqlResponse = {
  __typename?: "AppPrivacyPolicyPageConfigGqlResponse";
  /** Trusted HTML content for the privacy policy page */
  html: Scalars["String"]["output"];
};

export type AppSettingDetailGqlInput = {
  /** App setting ID */
  id: Scalars["ID"]["input"];
};

export type AppSettingKeyListFilterInput = {
  /** Filter settings created from this ISO date */
  createdAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter settings created until this ISO date */
  createdAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter settings by ID */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** Filter settings by active status */
  isActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Filter settings by key */
  key?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter settings by admin-facing label */
  label?: InputMaybe<Scalars["String"]["input"]>;
  /** Search query that matches setting key, label, or description */
  query?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter settings updated from this ISO date */
  updatedAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter settings updated until this ISO date */
  updatedAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter settings by stored value type */
  valueType?: InputMaybe<AppSettingValueType>;
};

export type AppSettingKeyListGqlInput = {
  /** Filter options for narrowing down app setting keys */
  filters?: InputMaybe<AppSettingKeyListFilterInput>;
  /** Offset pagination and sorting options */
  options?: InputMaybe<AppSettingKeyListOffsetPageOptionsParamsInput>;
};

export type AppSettingKeyListOffsetPageOptionsParamsInput = {
  /** Maximum number of records to return */
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  /** Number of records to skip (offset) */
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  /** Sort options as a map of field names to sort order */
  sort?: InputMaybe<AppSettingKeyListSortOptionInput>;
};

export type AppSettingKeyListPaginatedOffsetGqlResponse = {
  __typename?: "AppSettingKeyListPaginatedOffsetGqlResponse";
  /** List of app setting keys */
  items: Array<AppSettingKeyListSummaryGqlResponse>;
  /** Pagination metadata */
  pagination: PaginationOffsetResponse;
};

export type AppSettingKeyListSortOptionInput = {
  /** Sort by creation date */
  createdAt?: InputMaybe<SortingOrder>;
  /** Sort by active status */
  isActive?: InputMaybe<SortingOrder>;
  /** Sort by setting key */
  key?: InputMaybe<SortingOrder>;
  /** Sort by admin-facing setting label */
  label?: InputMaybe<SortingOrder>;
  /** Sort by last update date */
  updatedAt?: InputMaybe<SortingOrder>;
  /** Sort by value type */
  valueType?: InputMaybe<SortingOrder>;
};

export type AppSettingKeyListSummaryGqlResponse = {
  __typename?: "AppSettingKeyListSummaryGqlResponse";
  /** Date when the app setting was created */
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Admin-facing app setting description */
  description?: Maybe<Scalars["String"]["output"]>;
  /** App setting ID */
  id: Scalars["ID"]["output"];
  /** Whether this app setting is currently active */
  isActive: Scalars["Boolean"]["output"];
  /** Unique app setting key */
  key: Scalars["String"]["output"];
  /** Admin-facing app setting label */
  label: Scalars["String"]["output"];
  /** Date when the app setting was last updated */
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Stored value type for this app setting */
  valueType: AppSettingValueType;
};

export type AppSettingMutationGqlResponse = {
  __typename?: "AppSettingMutationGqlResponse";
  /** Date when the app setting was created */
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Admin-facing app setting description */
  description?: Maybe<Scalars["String"]["output"]>;
  /** App setting ID */
  id: Scalars["ID"]["output"];
  /** Whether this app setting is currently active */
  isActive: Scalars["Boolean"]["output"];
  /** Unique app setting key */
  key: Scalars["String"]["output"];
  /** Admin-facing app setting label */
  label: Scalars["String"]["output"];
  /** Date when the app setting was last updated */
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Stored app setting value */
  value: Scalars["JSON"]["output"];
  /** Stored value type for this app setting */
  valueType: AppSettingValueType;
};

export type AppSettingUpdateGqlInput = {
  /** Admin-facing app setting description. Pass null to remove the description. */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** App setting ID */
  id: Scalars["ID"]["input"];
  /** Whether this app setting is currently active */
  isActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Admin-facing app setting label */
  label?: InputMaybe<Scalars["String"]["input"]>;
  /** Stored app setting value. Must match the effective value type of the setting. */
  value?: InputMaybe<Scalars["JSON"]["input"]>;
  /** Stored value type. When changed, a compatible value must also be provided. */
  valueType?: InputMaybe<AppSettingValueType>;
};

/** Stored app setting value type */
export const AppSettingValueType = {
  BOOLEAN: "BOOLEAN",
  JSON: "JSON",
  NUMBER: "NUMBER",
  STRING: "STRING",
} as const;

export type AppSettingValueType = (typeof AppSettingValueType)[keyof typeof AppSettingValueType];
export type AppTermsOfUsePageConfigGqlResponse = {
  __typename?: "AppTermsOfUsePageConfigGqlResponse";
  /** Trusted HTML content for the terms of use page */
  html: Scalars["String"]["output"];
};

/** Supported audio output container formats */
export const AudioOutputExtension = {
  AAC: "AAC",
  FLAC: "FLAC",
  M4A: "M4A",
  MP3: "MP3",
  OGG: "OGG",
  OPUS: "OPUS",
  WAV: "WAV",
  WEBM_AUDIO: "WEBM_AUDIO",
  WMA: "WMA",
} as const;

export type AudioOutputExtension = (typeof AudioOutputExtension)[keyof typeof AudioOutputExtension];
export type BackupRunGqlInput = {
  /** Backup sources to archive as password-protected RAR and deliver to Telegram */
  targets: Array<BackupTarget>;
};

export type BackupRunGqlResponse = {
  __typename?: "BackupRunGqlResponse";
  /** One item per requested backup target, each sent to Telegram separately */
  items: Array<BackupRunItemGqlResponse>;
};

export type BackupRunItemGqlResponse = {
  __typename?: "BackupRunItemGqlResponse";
  /** Compressed archive file name (rar) */
  archiveFileName: Scalars["String"]["output"];
  /** Archive compression format (password-protected RAR) */
  archiveFormat: Scalars["String"]["output"];
  /** Number of RAR volumes created for this backup */
  archivePartCount: Scalars["Int"]["output"];
  /** Absolute archive path on the server */
  archivePath: Scalars["String"]["output"];
  /** Archive size in bytes */
  archiveSizeBytes: Scalars["Float"]["output"];
  /** MongoDB collection count */
  collectionCount?: Maybe<Scalars["Int"]["output"]>;
  /** Backup creation timestamp */
  createdAt: Scalars["DateTime"]["output"];
  /** MongoDB document count */
  documentCount?: Maybe<Scalars["Int"]["output"]>;
  /** Backup duration in milliseconds */
  durationMs: Scalars["Int"]["output"];
  /** Stored file record count included in MinIO backup */
  fileRecordCount?: Maybe<Scalars["Int"]["output"]>;
  /** Human-readable archive size */
  formattedArchiveSize: Scalars["String"]["output"];
  /** MinIO object count */
  objectCount?: Maybe<Scalars["Int"]["output"]>;
  /** Backup source that was executed */
  target: BackupTarget;
  /** Whether the archive file was uploaded to Telegram */
  telegramDelivered: Scalars["Boolean"]["output"];
  /** Extra note when Telegram file delivery was skipped */
  telegramDeliveryNote?: Maybe<Scalars["String"]["output"]>;
  /** Telegram message id when delivery succeeded or fell back */
  telegramMessageId?: Maybe<Scalars["Int"]["output"]>;
};

/** Backup source to archive and deliver */
export const BackupTarget = {
  MINIO: "MINIO",
  MONGODB: "MONGODB",
} as const;

export type BackupTarget = (typeof BackupTarget)[keyof typeof BackupTarget];
export type BadgeCountGqlResponse = {
  __typename?: "BadgeCountGqlResponse";
  /** Actionable inquiry badge count for staff users. Null for end users. */
  inquiries?: Maybe<Scalars["Int"]["output"]>;
  /** Unread direct notification count for the current user. */
  notifications?: Maybe<Scalars["Int"]["output"]>;
  /** Pending payment badge count for staff users. Null for end users. */
  payments?: Maybe<Scalars["Int"]["output"]>;
  /** Product badge count. Staff users receive all products; end users receive active products. */
  products: Scalars["Int"]["output"];
  /** Support ticket badge count. Staff users receive open tickets; end users receive answered own tickets. */
  tickets?: Maybe<Scalars["Int"]["output"]>;
};

export type CouponCreateGqlInput = {
  /** Product IDs this coupon applies to. Empty means all products */
  applicableProductIds?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  /** Unique coupon code */
  code: Scalars["String"]["input"];
  /** Coupon description */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** Coupon discount type */
  discountType: CouponDiscountType;
  /** Coupon discount value. Percentage or fixed amount based on discountType */
  discountValue: Scalars["Float"]["input"];
  /** Date when this coupon expires */
  expiresAt?: InputMaybe<Scalars["String"]["input"]>;
  /** Whether this coupon is currently active */
  isActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Whether the coupon is restricted to first purchases only */
  isFirstPurchaseOnly?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Maximum number of uses per user */
  perUserUsageLimit?: InputMaybe<Scalars["Int"]["input"]>;
  /** Date when this coupon becomes valid */
  startsAt?: InputMaybe<Scalars["String"]["input"]>;
  /** Coupon display title */
  title: Scalars["String"]["input"];
  /** Maximum total number of uses across all users */
  totalUsageLimit?: InputMaybe<Scalars["Int"]["input"]>;
};

export type CouponDeleteGqlInput = {
  /** Coupon ID */
  id: Scalars["ID"]["input"];
};

export type CouponDetailGqlInput = {
  /** Coupon ID */
  id: Scalars["ID"]["input"];
};

/** Coupon discount calculation kind */
export const CouponDiscountType = {
  FIXED_AMOUNT: "FIXED_AMOUNT",
  PERCENTAGE: "PERCENTAGE",
} as const;

export type CouponDiscountType = (typeof CouponDiscountType)[keyof typeof CouponDiscountType];
export type CouponListFilterInput = {
  /** Filter coupons by applicable product ID */
  applicableProductId?: InputMaybe<Scalars["ID"]["input"]>;
  /** Filter coupons by code */
  code?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter coupons created from this ISO date */
  createdAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter coupons created until this ISO date */
  createdAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter coupons by creator user ID */
  createdBy?: InputMaybe<Scalars["ID"]["input"]>;
  /** Filter coupons by discount type */
  discountType?: InputMaybe<CouponDiscountType>;
  /** Maximum discount value */
  discountValueMax?: InputMaybe<Scalars["Float"]["input"]>;
  /** Minimum discount value */
  discountValueMin?: InputMaybe<Scalars["Float"]["input"]>;
  /** Filter coupons expiring from this ISO date */
  expiresAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter coupons expiring until this ISO date */
  expiresAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter coupons by ID */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** Filter coupons by active status */
  isActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Filter coupons by first-purchase-only flag */
  isFirstPurchaseOnly?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Maximum per-user usage limit */
  perUserUsageLimitMax?: InputMaybe<Scalars["Float"]["input"]>;
  /** Minimum per-user usage limit */
  perUserUsageLimitMin?: InputMaybe<Scalars["Float"]["input"]>;
  /** Search query that matches coupon code, title, or description */
  query?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter coupons starting from this ISO date */
  startsAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter coupons starting until this ISO date */
  startsAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter coupons by title */
  title?: InputMaybe<Scalars["String"]["input"]>;
  /** Maximum total usage limit */
  totalUsageLimitMax?: InputMaybe<Scalars["Float"]["input"]>;
  /** Minimum total usage limit */
  totalUsageLimitMin?: InputMaybe<Scalars["Float"]["input"]>;
  /** Filter coupons updated from this ISO date */
  updatedAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter coupons updated until this ISO date */
  updatedAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter coupons by last updater user ID */
  updatedBy?: InputMaybe<Scalars["ID"]["input"]>;
};

export type CouponListGqlInput = {
  /** Filter options for narrowing down the coupon list */
  filters?: InputMaybe<CouponListFilterInput>;
  /** Offset pagination and sorting options */
  options?: InputMaybe<CouponListOffsetPageOptionsParamsInput>;
};

export type CouponListGqlResponse = {
  __typename?: "CouponListGqlResponse";
  /** Product IDs this coupon applies to. Empty means all products */
  applicableProductIds: Array<Scalars["ID"]["output"]>;
  /** Coupon code */
  code: Scalars["String"]["output"];
  /** Date when the coupon was created */
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** User ID that created this coupon */
  createdBy?: Maybe<Scalars["ID"]["output"]>;
  /** Coupon description */
  description?: Maybe<Scalars["String"]["output"]>;
  /** Coupon discount type */
  discountType: CouponDiscountType;
  /** Coupon discount value. Percentage or fixed amount based on discountType */
  discountValue: Scalars["Float"]["output"];
  /** Date when this coupon expires */
  expiresAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Coupon ID */
  id: Scalars["ID"]["output"];
  /** Whether this coupon is currently active */
  isActive: Scalars["Boolean"]["output"];
  /** Whether the coupon is restricted to first purchases only */
  isFirstPurchaseOnly: Scalars["Boolean"]["output"];
  /** Maximum number of uses per user */
  perUserUsageLimit?: Maybe<Scalars["Int"]["output"]>;
  /** Remaining total uses before the total usage limit is reached, if limited */
  remainingTotalUsageCount?: Maybe<Scalars["Int"]["output"]>;
  /** Date when this coupon becomes valid */
  startsAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Coupon display title */
  title: Scalars["String"]["output"];
  /** Total committed purchases that used this coupon */
  totalUsageCount: Scalars["Int"]["output"];
  /** Maximum total number of uses across all users */
  totalUsageLimit?: Maybe<Scalars["Int"]["output"]>;
  /** Date when the coupon was last updated */
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** User ID that last updated this coupon */
  updatedBy?: Maybe<Scalars["ID"]["output"]>;
};

export type CouponListOffsetPageOptionsParamsInput = {
  /** Maximum number of records to return */
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  /** Number of records to skip (offset) */
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  /** Sort options as a map of field names to sort order */
  sort?: InputMaybe<CouponListSortOptionInput>;
};

export type CouponListPaginatedOffsetGqlResponse = {
  __typename?: "CouponListPaginatedOffsetGqlResponse";
  /** List of coupons */
  items: Array<CouponListSummaryGqlResponse>;
  /** Pagination metadata */
  pagination: PaginationOffsetResponse;
};

export type CouponListSortOptionInput = {
  /** Sort by coupon code */
  code?: InputMaybe<SortingOrder>;
  /** Sort by creation date */
  createdAt?: InputMaybe<SortingOrder>;
  /** Sort by discount type */
  discountType?: InputMaybe<SortingOrder>;
  /** Sort by discount value */
  discountValue?: InputMaybe<SortingOrder>;
  /** Sort by coupon expiration date */
  expiresAt?: InputMaybe<SortingOrder>;
  /** Sort by active state */
  isActive?: InputMaybe<SortingOrder>;
  /** Sort by first-purchase-only flag */
  isFirstPurchaseOnly?: InputMaybe<SortingOrder>;
  /** Sort by per-user usage limit */
  perUserUsageLimit?: InputMaybe<SortingOrder>;
  /** Sort by coupon start date */
  startsAt?: InputMaybe<SortingOrder>;
  /** Sort by coupon title */
  title?: InputMaybe<SortingOrder>;
  /** Sort by total usage limit */
  totalUsageLimit?: InputMaybe<SortingOrder>;
  /** Sort by last update date */
  updatedAt?: InputMaybe<SortingOrder>;
};

export type CouponListSummaryGqlResponse = {
  __typename?: "CouponListSummaryGqlResponse";
  /** Coupon code */
  code: Scalars["String"]["output"];
  /** Date when the coupon was created */
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Coupon discount type */
  discountType: CouponDiscountType;
  /** Coupon discount value. Percentage or fixed amount based on discountType */
  discountValue: Scalars["Float"]["output"];
  /** Date when this coupon expires */
  expiresAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Coupon ID */
  id: Scalars["ID"]["output"];
  /** Whether this coupon is currently active */
  isActive: Scalars["Boolean"]["output"];
  /** Whether the coupon is restricted to first purchases only */
  isFirstPurchaseOnly: Scalars["Boolean"]["output"];
  /** Remaining total uses before the total usage limit is reached, if limited */
  remainingTotalUsageCount?: Maybe<Scalars["Int"]["output"]>;
  /** Date when this coupon becomes valid */
  startsAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Coupon display title */
  title: Scalars["String"]["output"];
  /** Total committed purchases that used this coupon */
  totalUsageCount: Scalars["Int"]["output"];
  /** Date when the coupon was last updated */
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
};

export type CouponUpdateGqlInput = {
  /** Product IDs this coupon applies to. Empty array or null means all products */
  applicableProductIds?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  /** Unique coupon code */
  code?: InputMaybe<Scalars["String"]["input"]>;
  /** Coupon description */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** Coupon discount type */
  discountType?: InputMaybe<CouponDiscountType>;
  /** Coupon discount value. Percentage or fixed amount based on discountType */
  discountValue?: InputMaybe<Scalars["Float"]["input"]>;
  /** Date when this coupon expires. Use null to clear it */
  expiresAt?: InputMaybe<Scalars["String"]["input"]>;
  /** Coupon ID */
  id: Scalars["ID"]["input"];
  /** Whether this coupon is currently active */
  isActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Whether the coupon is restricted to first purchases only */
  isFirstPurchaseOnly?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Maximum number of uses per user. Use null to clear it */
  perUserUsageLimit?: InputMaybe<Scalars["Int"]["input"]>;
  /** Date when this coupon becomes valid. Use null to clear it */
  startsAt?: InputMaybe<Scalars["String"]["input"]>;
  /** Coupon display title */
  title?: InputMaybe<Scalars["String"]["input"]>;
  /** Maximum total number of uses across all users. Use null to clear it */
  totalUsageLimit?: InputMaybe<Scalars["Int"]["input"]>;
};

export type CouponValidateGqlInput = {
  /** Coupon code */
  code: Scalars["String"]["input"];
  /** Product ID */
  productId: Scalars["ID"]["input"];
};

export type CouponValidateGqlResponse = {
  __typename?: "CouponValidateGqlResponse";
  /** Product amount before any discount */
  amountIrt?: Maybe<Scalars["Float"]["output"]>;
  /** Normalized coupon code */
  code?: Maybe<Scalars["String"]["output"]>;
  /** Coupon discount amount */
  couponDiscountAmountIrt?: Maybe<Scalars["Float"]["output"]>;
  /** Coupon ID when validation succeeds */
  couponId?: Maybe<Scalars["ID"]["output"]>;
  /** Coupon discount type */
  discountType?: Maybe<CouponDiscountType>;
  /** Coupon discount value */
  discountValue?: Maybe<Scalars["Float"]["output"]>;
  /** Final payable amount after coupon */
  finalAmountIrt?: Maybe<Scalars["Float"]["output"]>;
  /** Whether the coupon can be used for this purchase */
  isValid: Scalars["Boolean"]["output"];
  /** Human-readable reason when the coupon is invalid */
  message?: Maybe<Scalars["String"]["output"]>;
  /** Amount after built-in product discount and before coupon */
  payableAmountBeforeCouponIrt?: Maybe<Scalars["Float"]["output"]>;
  /** Built-in product discount amount */
  productDiscountAmountIrt?: Maybe<Scalars["Float"]["output"]>;
  /** Coupon title */
  title?: Maybe<Scalars["String"]["output"]>;
};

export type FileAccessUrlGqlResponse = {
  __typename?: "FileAccessUrlGqlResponse";
  /** API path prefix for file content requests, e.g. /api/v1/files */
  apiPath: Scalars["String"]["output"];
  /** Public app origin for file requests. Falls back to the browser origin on the client when omitted. */
  baseUrl?: Maybe<Scalars["String"]["output"]>;
  /** Stored file ID */
  fileId: Scalars["ID"]["output"];
  /** Stored file MIME type */
  mimeType?: Maybe<Scalars["String"]["output"]>;
  /** Original stored file name including extension */
  name?: Maybe<Scalars["String"]["output"]>;
  /** Stored file size in bytes */
  sizeBytes?: Maybe<Scalars["Float"]["output"]>;
  /** Signed access descriptor for the thumbnail variant of this file, when available */
  thumbnailAccessUrl?: Maybe<FileAccessUrlGqlResponse>;
  /** Signed access token for the file content endpoint */
  token: Scalars["String"]["output"];
};

export type FileCompressMediaGqlInput = {
  /** Audio container for audio output or audio extraction from video. */
  audioOutputExtension?: InputMaybe<AudioOutputExtension>;
  /** Stored file ID to compress */
  fileId: Scalars["ID"]["input"];
  /** Target compression quality tier */
  targetQuality: MediaCompressionQuality;
  /** Optional trim range in seconds */
  trim?: InputMaybe<MediaCompressionTrimGqlInput>;
  /** Video container for video output. Required when compressing a video file to video. */
  videoOutputExtension?: InputMaybe<VideoOutputExtension>;
};

export type FileCompressMediaGqlResponse = {
  __typename?: "FileCompressMediaGqlResponse";
  /** Ratio of current size to previous size */
  compressionRatio: Scalars["Float"]["output"];
  /** Current media bitrate in kilobits per second */
  currentBitrateKbps?: Maybe<Scalars["Float"]["output"]>;
  /** Current media codec name */
  currentCodec: Scalars["String"]["output"];
  /** Current codec family */
  currentCodecFamily: MediaCodecFamily;
  /** Current file extension without dot */
  currentExtension: Scalars["String"]["output"];
  /** Quality tier after compression or skip evaluation */
  currentQuality: MediaCompressionQuality;
  /** Current video resolution */
  currentResolution: MediaResolutionGqlResponse;
  /** Current file size in bytes */
  currentSizeBytes: Scalars["Float"]["output"];
  /** Processing duration in milliseconds */
  durationMs: Scalars["Int"]["output"];
  /** Current stored file metadata */
  file: FileUploadGqlResponse;
  /** Current stored file ID after compression or skip */
  fileId: Scalars["ID"]["output"];
  /** Resulting media duration in seconds after trim */
  mediaDurationSeconds: Scalars["Float"]["output"];
  /** Resulting media type */
  mediaType: MediaType;
  /** Previous media bitrate in kilobits per second */
  previousBitrateKbps?: Maybe<Scalars["Float"]["output"]>;
  /** Previous media codec name */
  previousCodec: Scalars["String"]["output"];
  /** Previous codec family */
  previousCodecFamily: MediaCodecFamily;
  /** Previous file extension without dot */
  previousExtension: Scalars["String"]["output"];
  /** Previous stored file ID */
  previousFileId: Scalars["ID"]["output"];
  /** Detected quality tier before compression */
  previousQuality: MediaCompressionQuality;
  /** Previous video resolution */
  previousResolution: MediaResolutionGqlResponse;
  /** Previous file size in bytes */
  previousSizeBytes: Scalars["Float"]["output"];
  /** Reason compression was skipped, if applicable */
  skipReason: MediaCompressionSkipReason;
  /** Requested and applied trim details */
  trim: MediaCompressionTrimGqlResponse;
  /** Whether a new compressed file was created and stored */
  wasCompressed: Scalars["Boolean"]["output"];
};

export type FileUploadGqlResponse = {
  __typename?: "FileUploadGqlResponse";
  /** Signed file access descriptor for reading the stored file */
  accessUrl?: Maybe<FileAccessUrlGqlResponse>;
  /** File MIME type */
  mimeType: Scalars["String"]["output"];
  /** Original file name */
  name: Scalars["String"]["output"];
  /** MinIO object path stored for this file */
  path: Scalars["String"]["output"];
  /** File size in bytes */
  sizeBytes: Scalars["Float"]["output"];
  /** Upload completion date */
  uploadedAt: Scalars["DateTime"]["output"];
};

export type GeneralSubscriptionGqlResponse = {
  __typename?: "GeneralSubscriptionGqlResponse";
  /** UTC timestamp when this update was generated */
  createdAt: Scalars["DateTime"]["output"];
  /** Type-specific payload object */
  payload?: Maybe<Scalars["JSON"]["output"]>;
  /** Optional scoped identifier for this update (for example, ticket or product id) */
  targetId?: Maybe<Scalars["String"]["output"]>;
  /** General update type emitted by backend */
  updateType: GeneralSubscriptionUpdateType;
};

/** Type of real-time update in general subscription channel */
export const GeneralSubscriptionUpdateType = {
  BADGE_COUNTS: "BADGE_COUNTS",
  NOTIFICATION: "NOTIFICATION",
  VERIFICATION_STATUS: "VERIFICATION_STATUS",
} as const;

export type GeneralSubscriptionUpdateType =
  (typeof GeneralSubscriptionUpdateType)[keyof typeof GeneralSubscriptionUpdateType];
/** Display type used for global anouncements */
export const GlobalAnouncementMessageType = {
  POPUP: "POPUP",
  SNACKBAR: "SNACKBAR",
} as const;

export type GlobalAnouncementMessageType =
  (typeof GlobalAnouncementMessageType)[keyof typeof GlobalAnouncementMessageType];
export type GlobalAnouncementSendGqlInput = {
  /** Anouncement message shown to subscribed users */
  description: Scalars["String"]["input"];
  /** Whether this notification should also be pushed through native push channel */
  isPushNotification?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Target message renderer on clients (popup or snackbar) */
  messageType?: InputMaybe<GlobalAnouncementMessageType>;
  /** Popup mode used by clients when displaying the anouncement */
  mode?: InputMaybe<NotificationMode>;
  /** Optional extra structured payload for future client actions */
  payload?: InputMaybe<Scalars["JSON"]["input"]>;
  /** Anouncement title shown to subscribed users */
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type GlobalAnouncementSendGqlResponse = {
  __typename?: "GlobalAnouncementSendGqlResponse";
  /** Number of active users subscribed to the general updates channel */
  activeSubscribedUsers: Scalars["Int"]["output"];
  /** Number of active subscribed users that received the update */
  deliveredUsers: Scalars["Int"]["output"];
};

/** Normalized codec family detected from media probes */
export const MediaCodecFamily = {
  AAC: "AAC",
  AV1: "AV1",
  H264: "H264",
  H265: "H265",
  MP3: "MP3",
  OPUS: "OPUS",
  PCM: "PCM",
  UNKNOWN: "UNKNOWN",
  VORBIS: "VORBIS",
  VP9: "VP9",
} as const;

export type MediaCodecFamily = (typeof MediaCodecFamily)[keyof typeof MediaCodecFamily];
/** Detected or requested media compression quality tier */
export const MediaCompressionQuality = {
  HIGH: "HIGH",
  LOW: "LOW",
  MAX: "MAX",
  MEDIUM: "MEDIUM",
  MEDIUM_HIGH: "MEDIUM_HIGH",
  MEDIUM_LOW: "MEDIUM_LOW",
  ORIGINAL: "ORIGINAL",
  TINY: "TINY",
  VERY_HIGH: "VERY_HIGH",
  VERY_LOW: "VERY_LOW",
} as const;

export type MediaCompressionQuality =
  (typeof MediaCompressionQuality)[keyof typeof MediaCompressionQuality];
/** Reason media compression was skipped */
export const MediaCompressionSkipReason = {
  ALREADY_AT_TARGET: "ALREADY_AT_TARGET",
  ALREADY_BELOW_TARGET: "ALREADY_BELOW_TARGET",
  FILE_TOO_SMALL: "FILE_TOO_SMALL",
  NONE: "NONE",
  OUTPUT_NOT_SMALLER: "OUTPUT_NOT_SMALLER",
} as const;

export type MediaCompressionSkipReason =
  (typeof MediaCompressionSkipReason)[keyof typeof MediaCompressionSkipReason];
export type MediaCompressionTrimAppliedGqlResponse = {
  __typename?: "MediaCompressionTrimAppliedGqlResponse";
  /** Resulting media duration in seconds */
  durationSeconds: Scalars["Float"]["output"];
  /** Applied trim end in seconds */
  endSeconds: Scalars["Float"]["output"];
  /** Applied trim start in seconds */
  startSeconds: Scalars["Float"]["output"];
};

export type MediaCompressionTrimGqlInput = {
  /** Trim end position in seconds. Omit or null to keep until the end. */
  endSeconds?: InputMaybe<Scalars["Float"]["input"]>;
  /** Trim start position in seconds. Omit or null to start from the beginning. */
  startSeconds?: InputMaybe<Scalars["Float"]["input"]>;
};

export type MediaCompressionTrimGqlResponse = {
  __typename?: "MediaCompressionTrimGqlResponse";
  /** Trim range applied during processing */
  applied: MediaCompressionTrimAppliedGqlResponse;
  /** Trim range requested by the caller */
  requested: MediaCompressionTrimRequestedGqlResponse;
};

export type MediaCompressionTrimRequestedGqlResponse = {
  __typename?: "MediaCompressionTrimRequestedGqlResponse";
  /** Requested trim end in seconds */
  endSeconds?: Maybe<Scalars["Float"]["output"]>;
  /** Requested trim start in seconds */
  startSeconds?: Maybe<Scalars["Float"]["output"]>;
};

export type MediaResolutionGqlResponse = {
  __typename?: "MediaResolutionGqlResponse";
  /** Media height in pixels */
  height: Scalars["Int"]["output"];
  /** Media width in pixels */
  width: Scalars["Int"]["output"];
};

/** Stored media type */
export const MediaType = {
  AUDIO: "AUDIO",
  VIDEO: "VIDEO",
} as const;

export type MediaType = (typeof MediaType)[keyof typeof MediaType];
export type Mutation = {
  __typename?: "Mutation";
  /** Update a single app setting record, including typed value, metadata, and active status */
  appSettingUpdate: AppSettingMutationGqlResponse;
  /** Create password-protected RAR backup archives and deliver each target to Telegram */
  backupRun: BackupRunGqlResponse;
  /** Create a coupon with discount rules, usage limits, product applicability, and active status */
  couponCreate: CouponListGqlResponse;
  /** Delete a coupon */
  couponDelete: Scalars["Boolean"]["output"];
  /** Update a coupon's discount rules, usage limits, product applicability, or active status */
  couponUpdate: CouponListGqlResponse;
  /** Compress or trim an existing stored video/audio file with ffmpeg, replacing it with a new stored file record */
  fileCompressMedia: FileCompressMediaGqlResponse;
  /** Broadcast a global anouncement to active users subscribed to general updates */
  globalAnouncementSend: GlobalAnouncementSendGqlResponse;
  /** Create a furniture product with catalog fields and media references */
  productCreate: ProductListGqlResponse;
  /** Delete a product and remove its detached file attachments */
  productDelete: Scalars["Boolean"]["output"];
  /** Create a manual product payment record for an active paid product as a super admin */
  productPaymentManualCreate: ProductPaymentListGqlResponse;
  /** Manually update a product payment status and optional review description */
  productPaymentStatusUpdate: ProductPaymentListGqlResponse;
  /** Submit a product purchase using gateway, card-to-card, cryptocurrency, or a free coupon */
  productPurchaseSubmit: ProductPurchaseSubmitGqlResponse;
  /** Update product review moderation visibility for the review thread, rating, or a single message */
  productReviewModerationUpdate: ProductReviewListGqlResponse;
  /** Create or update a product star rating and optionally append a follow-up comment */
  productReviewSubmit: ProductReviewSubmitGqlResponse;
  /** Update a product and clean up replaced or removed file attachments */
  productUpdate: ProductListGqlResponse;
  /** Register or refresh the current user's native mobile push token (FCM) */
  registerNativePushToken: PushSubscriptionMutationGqlResponse;
  /** Register or refresh the current user's Web Push subscription */
  registerPushSubscription: PushSubscriptionMutationGqlResponse;
  /** Request login code using username, email, or phone identity */
  requestLoginCode: UserRequestLoginCodeGqlResponse;
  /** Request SMS verification code for mobile signup */
  requestSignupCode: UserRequestLoginCodeGqlResponse;
  /** Resolve whether an identity belongs to an existing user account */
  resolveAuthIdentity: UserResolveAuthIdentityGqlResponse;
  /** Create a ticket or append a new super-admin update to an existing ticket, automatically reopening it if needed */
  superAdminTicketSend: TicketListGqlResponse;
  /** Close a support ticket as support staff */
  ticketClose: TicketListGqlResponse;
  /** Remove a native mobile push token for the current user */
  unregisterNativePushToken: PushSubscriptionMutationGqlResponse;
  /** Remove a Web Push subscription for the current user */
  unregisterPushSubscription: PushSubscriptionMutationGqlResponse;
  /** Activate a newly created account using the emailed activation link */
  userActivateAccount: UserPasswordResetGqlResponse;
  /** Create a user account with profile, avatar file, roles, status, and initial password */
  userCreate: UserMutationGqlResponse;
  /** Create an anonymous visitor account and start a JWT session without registration */
  userCreateAnonymous: UserLoginGqlResponse;
  /** Request a password reset code using username, email, or phone number */
  userForgotPassword: UserPasswordResetGqlResponse;
  /** Login and get JWT access token */
  userLogin: UserLoginGqlResponse;
  /** Logout and mark the current session as logged out */
  userLogout: Scalars["Boolean"]["output"];
  /** Bulk update current-user notifications by setting them read, unread, or archived */
  userNotificationUpdate: NotificationUpdateGqlResponse;
  /** Update the authenticated user's profile. Anonymous users may only update preferences. */
  userProfileUpdate: UserMutationGqlResponse;
  /** Send a verification email to the authenticated user's address */
  userRequestEmailVerification: UserPasswordResetGqlResponse;
  /** Reset account password using the emailed one-time code and account identity */
  userResetPassword: UserPasswordResetGqlResponse;
  /** Create an END_USER account using username/email/mobile and start a session */
  userSignup: UserLoginGqlResponse;
  /** Close one of the current end-user's support tickets */
  userTicketClose: UserTicketListGqlResponse;
  /** Create a ticket or append a new END_USER update to an owned ticket, automatically reopening it if needed */
  userTicketSend: UserTicketListGqlResponse;
  /** Update a user account, profile, preferences, avatar file, roles, status, or password */
  userUpdate: UserMutationGqlResponse;
  /** Verify SMS login code and create an authenticated session */
  verifyLoginCode: UserVerifyLoginCodeGqlResponse;
};

export type MutationAppSettingUpdateArgs = {
  input: AppSettingUpdateGqlInput;
};

export type MutationBackupRunArgs = {
  input: BackupRunGqlInput;
};

export type MutationCouponCreateArgs = {
  input: CouponCreateGqlInput;
};

export type MutationCouponDeleteArgs = {
  input: CouponDeleteGqlInput;
};

export type MutationCouponUpdateArgs = {
  input: CouponUpdateGqlInput;
};

export type MutationFileCompressMediaArgs = {
  input: FileCompressMediaGqlInput;
};

export type MutationGlobalAnouncementSendArgs = {
  input: GlobalAnouncementSendGqlInput;
};

export type MutationProductCreateArgs = {
  input: ProductCreateGqlInput;
};

export type MutationProductDeleteArgs = {
  input: ProductDeleteGqlInput;
};

export type MutationProductPaymentManualCreateArgs = {
  input: ProductPaymentManualCreateGqlInput;
};

export type MutationProductPaymentStatusUpdateArgs = {
  input: ProductPaymentStatusUpdateGqlInput;
};

export type MutationProductPurchaseSubmitArgs = {
  input: ProductPurchaseSubmitGqlInput;
};

export type MutationProductReviewModerationUpdateArgs = {
  input: ProductReviewModerationUpdateGqlInput;
};

export type MutationProductReviewSubmitArgs = {
  input: ProductReviewSubmitGqlInput;
};

export type MutationProductUpdateArgs = {
  input: ProductUpdateGqlInput;
};

export type MutationRegisterNativePushTokenArgs = {
  input: RegisterNativePushTokenGqlInput;
};

export type MutationRegisterPushSubscriptionArgs = {
  input: RegisterPushSubscriptionGqlInput;
};

export type MutationRequestLoginCodeArgs = {
  input: UserRequestLoginCodeGqlInput;
};

export type MutationRequestSignupCodeArgs = {
  input: UserRequestSignupCodeGqlInput;
};

export type MutationResolveAuthIdentityArgs = {
  input: UserRequestLoginCodeGqlInput;
};

export type MutationSuperAdminTicketSendArgs = {
  input: SuperAdminTicketSendGqlInput;
};

export type MutationTicketCloseArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationUnregisterNativePushTokenArgs = {
  input: UnregisterNativePushTokenGqlInput;
};

export type MutationUnregisterPushSubscriptionArgs = {
  input: UnregisterPushSubscriptionGqlInput;
};

export type MutationUserActivateAccountArgs = {
  token: Scalars["String"]["input"];
};

export type MutationUserCreateArgs = {
  input: UserCreateGqlInput;
};

export type MutationUserCreateAnonymousArgs = {
  input?: InputMaybe<UserCreateAnonymousGqlInput>;
};

export type MutationUserForgotPasswordArgs = {
  input: UserForgotPasswordGqlInput;
};

export type MutationUserLoginArgs = {
  input: UserLoginGqlInput;
};

export type MutationUserNotificationUpdateArgs = {
  input: NotificationUpdateGqlInput;
};

export type MutationUserProfileUpdateArgs = {
  input: UserProfileUpdateGqlInput;
};

export type MutationUserResetPasswordArgs = {
  input: UserResetPasswordGqlInput;
};

export type MutationUserSignupArgs = {
  input: UserSignupGqlInput;
};

export type MutationUserTicketCloseArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationUserTicketSendArgs = {
  input: UserTicketSendGqlInput;
};

export type MutationUserUpdateArgs = {
  input: UserUpdateGqlInput;
};

export type MutationVerifyLoginCodeArgs = {
  input: UserVerifyLoginCodeGqlInput;
};

/** Native mobile push platform */
export const NativePushPlatform = {
  ANDROID: "ANDROID",
} as const;

export type NativePushPlatform = (typeof NativePushPlatform)[keyof typeof NativePushPlatform];
export type NotificationListCursorPageOptionsParamsInput = {
  /** Maximum number of records to return */
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  /** Sort options as a map of field names to sort order */
  sort?: InputMaybe<NotificationListSortOptionInput>;
  /** Cursor to start after. Uses the beginning if omitted */
  startCursor?: InputMaybe<Scalars["ID"]["input"]>;
};

export type NotificationListFilterInput = {
  /** Filter notifications archived from this ISO date */
  archivedAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter notifications archived until this ISO date */
  archivedAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter notifications created from this ISO date */
  createdAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter notifications created until this ISO date */
  createdAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter notifications by ID */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** Filter by whether the notification is archived */
  isArchived?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Filter by read state */
  isRead?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Filter notifications that are currently visible or currently expired */
  isVisible?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Filter notifications by message */
  message?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter notifications by visual mode */
  mode?: InputMaybe<NotificationMode>;
  /** Search query that matches notification title or message */
  query?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter notifications read from this ISO date */
  readAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter notifications read until this ISO date */
  readAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter notifications by domain source */
  source?: InputMaybe<NotificationSource>;
  /** Filter notifications by title */
  title?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter notifications updated from this ISO date */
  updatedAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter notifications updated until this ISO date */
  updatedAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter notifications visible until from this ISO date */
  visibleUntilFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter notifications visible until this ISO date */
  visibleUntilTo?: InputMaybe<Scalars["String"]["input"]>;
};

export type NotificationListGqlInput = {
  /** Filter options for narrowing down the notification list */
  filters?: InputMaybe<NotificationListFilterInput>;
  /** Cursor pagination and sorting options */
  options?: InputMaybe<NotificationListCursorPageOptionsParamsInput>;
};

export type NotificationListGqlResponse = {
  __typename?: "NotificationListGqlResponse";
  /** Date when the notification was archived */
  archivedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Date when the notification was created */
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Notification ID */
  id: Scalars["ID"]["output"];
  /** Whether the notification has been read */
  isRead: Scalars["Boolean"]["output"];
  /** Notification message */
  message: Scalars["String"]["output"];
  /** Visual mode for this notification */
  mode: NotificationMode;
  /** Type-specific payload object */
  payload?: Maybe<Scalars["JSON"]["output"]>;
  /** Date when the notification was read */
  readAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Domain source that produced this notification */
  source: NotificationSource;
  /** Notification title */
  title?: Maybe<Scalars["String"]["output"]>;
  /** Date when the notification was last updated */
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Target user ID for direct notifications */
  userId?: Maybe<Scalars["ID"]["output"]>;
  /** Date until this notification should remain visible */
  visibleUntil?: Maybe<Scalars["DateTime"]["output"]>;
};

export type NotificationListPaginatedCursorGqlResponse = {
  __typename?: "NotificationListPaginatedCursorGqlResponse";
  /** List of notifications visible to the current user */
  items: Array<NotificationListGqlResponse>;
  /** Pagination metadata */
  pagination: PaginationCursorResponse;
};

export type NotificationListSortOptionInput = {
  /** Sort by archive date */
  archivedAt?: InputMaybe<SortingOrder>;
  /** Sort by creation date */
  createdAt?: InputMaybe<SortingOrder>;
  /** Sort by read state */
  isRead?: InputMaybe<SortingOrder>;
  /** Sort by message */
  message?: InputMaybe<SortingOrder>;
  /** Sort by notification mode */
  mode?: InputMaybe<SortingOrder>;
  /** Sort by read date */
  readAt?: InputMaybe<SortingOrder>;
  /** Sort by notification source */
  source?: InputMaybe<SortingOrder>;
  /** Sort by title */
  title?: InputMaybe<SortingOrder>;
  /** Sort by last update date */
  updatedAt?: InputMaybe<SortingOrder>;
  /** Sort by visibility expiration date */
  visibleUntil?: InputMaybe<SortingOrder>;
};

/** Visual mode for notifications */
export const NotificationMode = {
  ERROR: "ERROR",
  INFO: "INFO",
  SUCCESS: "SUCCESS",
  WARNING: "WARNING",
} as const;

export type NotificationMode = (typeof NotificationMode)[keyof typeof NotificationMode];
/** Domain source that produced a notification */
export const NotificationSource = {
  INQUIRY: "INQUIRY",
  OTHER: "OTHER",
  PAYMENT: "PAYMENT",
  PRODUCT: "PRODUCT",
  PRODUCT_CHAPTER: "PRODUCT_CHAPTER",
  TICKET: "TICKET",
  USER: "USER",
} as const;

export type NotificationSource = (typeof NotificationSource)[keyof typeof NotificationSource];
/** Bulk update action for user notifications */
export const NotificationUpdateAction = {
  ARCHIVE: "ARCHIVE",
  SET_AS_READ: "SET_AS_READ",
  SET_AS_UNREAD: "SET_AS_UNREAD",
  UNARCHIVE: "UNARCHIVE",
} as const;

export type NotificationUpdateAction =
  (typeof NotificationUpdateAction)[keyof typeof NotificationUpdateAction];
export type NotificationUpdateGqlInput = {
  /** Action to apply to the selected notifications */
  action: NotificationUpdateAction;
  /** Notification IDs to update. Every notification must belong to the current user. */
  notificationIds: Array<Scalars["ID"]["input"]>;
};

export type NotificationUpdateGqlResponse = {
  __typename?: "NotificationUpdateGqlResponse";
  /** Action applied to the selected notifications */
  action: NotificationUpdateAction;
  /** Updated notification records */
  items: Array<NotificationListGqlResponse>;
  /** Number of current-user notifications matched */
  matchedCount: Scalars["Int"]["output"];
  /** Number of notification documents modified by this operation */
  modifiedCount: Scalars["Int"]["output"];
  /** Notification IDs requested for update */
  notificationIds: Array<Scalars["ID"]["output"]>;
  /** Number of unique notification IDs requested */
  requestedCount: Scalars["Int"]["output"];
};

export type OffsetPageOptionsParamsInput = {
  /** Maximum number of records to return */
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  /** Number of records to skip (offset) */
  skip?: InputMaybe<Scalars["Int"]["input"]>;
};

export type PaginationCursorResponse = {
  __typename?: "PaginationCursorResponse";
  /** Number of items returned in this page */
  count: Scalars["Int"]["output"];
  /** Cursor for the last item in this page. Use this as startCursor for the next page */
  endCursor?: Maybe<Scalars["ID"]["output"]>;
  /** Whether there are more items available after this page */
  hasNextPage: Scalars["Boolean"]["output"];
  /** Whether there are items before this page */
  hasPreviousPage: Scalars["Boolean"]["output"];
  /** Number of items requested */
  limit: Scalars["Int"]["output"];
  /** Cursor for the first item in this page. Use this as endCursor for the previous page */
  startCursor?: Maybe<Scalars["ID"]["output"]>;
  /** Total number of items */
  total: Scalars["Int"]["output"];
};

export type PaginationOffsetResponse = {
  __typename?: "PaginationOffsetResponse";
  /** Number of items returned in this page */
  count: Scalars["Int"]["output"];
  /** Number of items requested */
  limit: Scalars["Int"]["output"];
  /** Number of items skipped (offset) */
  skip: Scalars["Int"]["output"];
  /** Total number of items */
  total: Scalars["Int"]["output"];
};

export type PaymentCheckoutCardGqlResponse = {
  __typename?: "PaymentCheckoutCardGqlResponse";
  /** Payment card bank name */
  bankName: Scalars["String"]["output"];
  /** Payment card number */
  cardNumber: Scalars["String"]["output"];
  /** Payment card holder name */
  holderName: Scalars["String"]["output"];
};

export type PaymentCheckoutConfigGqlResponse = {
  __typename?: "PaymentCheckoutConfigGqlResponse";
  /** Available cryptocurrency wallets */
  cryptoWallets: Array<PaymentCheckoutCryptoWalletGqlResponse>;
  /** Available payment cards */
  paymentCards: Array<PaymentCheckoutCardGqlResponse>;
  /** Payment method visibility and availability configuration */
  paymentMethods: Array<PaymentCheckoutMethodGqlResponse>;
  /** USDT to IRT conversion settings */
  usdtIrtRate: PaymentCheckoutUsdtIrtRateGqlResponse;
};

export type PaymentCheckoutCryptoWalletGqlResponse = {
  __typename?: "PaymentCheckoutCryptoWalletGqlResponse";
  /** Crypto wallet address */
  address: Scalars["String"]["output"];
  /** Crypto wallet network */
  network: Scalars["String"]["output"];
};

export type PaymentCheckoutMethodGqlResponse = {
  __typename?: "PaymentCheckoutMethodGqlResponse";
  /** Whether the method can currently be selected */
  isActive: Scalars["Boolean"]["output"];
  /** Whether the method should be marked as recommended */
  isRecommended: Scalars["Boolean"]["output"];
  /** Whether the method should be shown in checkout */
  isVisible: Scalars["Boolean"]["output"];
  /** Payment method identifier */
  method: UserProductPaymentMethod;
};

export type PaymentCheckoutUsdtIrtRateGqlResponse = {
  __typename?: "PaymentCheckoutUsdtIrtRateGqlResponse";
  /** Multiplier applied to converted USDT amount */
  coefficient: Scalars["Float"]["output"];
  /** Fixed USDT fee added after conversion */
  feeUsdt: Scalars["Float"]["output"];
  /** IRT value equivalent to one USDT before fee/coefficient */
  valueIrt: Scalars["Float"]["output"];
};

export type ProductAiPreviewStagingDurationGqlResponse = {
  __typename?: "ProductAiPreviewStagingDurationGqlResponse";
  /** Estimated AI preview generation duration in seconds, maintained by the system */
  durationSeconds: Scalars["Float"]["output"];
};

export type ProductCouponSnapshotGqlResponse = {
  __typename?: "ProductCouponSnapshotGqlResponse";
  /** Coupon code */
  code: Scalars["String"]["output"];
  /** Coupon ID */
  couponId: Scalars["ID"]["output"];
  /** Coupon discount type */
  discountType: CouponDiscountType;
  /** Coupon discount value. Percentage or fixed amount based on discountType */
  discountValue: Scalars["Float"]["output"];
  /** Coupon ID */
  id: Scalars["ID"]["output"];
  /** Coupon display title */
  title: Scalars["String"]["output"];
};

export type ProductCreateGqlInput = {
  /** Ordered stored file IDs used as product cover images */
  coverImageFileIds?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  /** Admin-defined fabric pattern and color options */
  fabrics?: InputMaybe<Array<ProductFabricGqlInput>>;
  /** Full product description */
  fullDescription?: InputMaybe<Scalars["String"]["input"]>;
  /** Whether the product is active */
  isActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Whether learners can submit reviews for this product */
  isReviewSubmissionEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Whether the reviews section is visible on the product detail page */
  isReviewsSectionVisible?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Material and texture profile */
  materialProfile?: InputMaybe<ProductMaterialProfileGqlInput>;
  /** Internal notes visible to SUPER_ADMIN */
  notes?: InputMaybe<Scalars["String"]["input"]>;
  /** Set pieces included in this product */
  setPieces?: InputMaybe<Array<ProductSetPieceGqlInput>>;
  /** Product display rank used for manual ordering */
  sortOrder?: InputMaybe<Scalars["Float"]["input"]>;
  /** Short product summary for list cards */
  summary?: InputMaybe<Scalars["String"]["input"]>;
  /** Product tags */
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  /** Product title */
  title: Scalars["String"]["input"];
  /** Vendor or seller information */
  vendor?: InputMaybe<ProductVendorGqlInput>;
};

export type ProductDeleteDependenciesGqlResponse = {
  __typename?: "ProductDeleteDependenciesGqlResponse";
  /** Detailed dependency groups grouped by impact */
  groups: Array<ProductDeleteDependencyGroupGqlResponse>;
  /** Product ID */
  productId: Scalars["ID"]["output"];
  /** Product title */
  productTitle: Scalars["String"]["output"];
  /** High-level delete impact summary */
  summary: ProductDeleteDependenciesSummaryGqlResponse;
};

export type ProductDeleteDependenciesSummaryGqlResponse = {
  __typename?: "ProductDeleteDependenciesSummaryGqlResponse";
  /** Whether any removed dependency groups exist */
  hasRemovedDependencies: Scalars["Boolean"]["output"];
  /** Whether any retained dependency groups exist */
  hasRetainedDependencies: Scalars["Boolean"]["output"];
  /** Total records that will be removed together with the product */
  removedCount: Scalars["Int"]["output"];
  /** Total records that will remain linked to the deleted product */
  retainedCount: Scalars["Int"]["output"];
};

export type ProductDeleteDependencyBreakdownGqlResponse = {
  __typename?: "ProductDeleteDependencyBreakdownGqlResponse";
  /** Count for this breakdown bucket */
  count: Scalars["Int"]["output"];
  /** Stable breakdown key for client-side labels */
  key: Scalars["String"]["output"];
};

export type ProductDeleteDependencyGroupGqlResponse = {
  __typename?: "ProductDeleteDependencyGroupGqlResponse";
  /** Optional per-bucket counts inside the group */
  breakdown: Array<ProductDeleteDependencyBreakdownGqlResponse>;
  /** Number of additional sample rows not included in samples */
  hiddenSampleCount: Scalars["Int"]["output"];
  /** Whether this group is removed or retained on delete */
  impact: ProductDeleteDependencyImpact;
  /** Stable group key for client-side labels */
  key: Scalars["String"]["output"];
  /** Representative sample rows for richer UI previews */
  samples: Array<ProductDeleteDependencySampleGqlResponse>;
  /** Total records in this dependency group */
  totalCount: Scalars["Int"]["output"];
};

/** Whether a dependency group is removed or retained when deleting a product */
export const ProductDeleteDependencyImpact = {
  REMOVED: "REMOVED",
  RETAINED: "RETAINED",
} as const;

export type ProductDeleteDependencyImpact =
  (typeof ProductDeleteDependencyImpact)[keyof typeof ProductDeleteDependencyImpact];
export type ProductDeleteDependencySampleGqlResponse = {
  __typename?: "ProductDeleteDependencySampleGqlResponse";
  /** Optional related entity ID */
  id?: Maybe<Scalars["ID"]["output"]>;
  /** Primary label for the sample row */
  label: Scalars["String"]["output"];
  /** Optional secondary label such as status or type */
  meta?: Maybe<Scalars["String"]["output"]>;
};

export type ProductDeleteGqlInput = {
  /** Product ID */
  id: Scalars["ID"]["input"];
};

export type ProductDetailGqlInput = {
  /** Product ID */
  id: Scalars["ID"]["input"];
};

export type ProductDiscountGqlInput = {
  /** Discount calculation type */
  type: ProductDiscountType;
  /** Discount value. Percentage for PERCENTAGE, IRT amount for FIXED_AMOUNT_IRT */
  value: Scalars["Float"]["input"];
};

export type ProductDiscountGqlResponse = {
  __typename?: "ProductDiscountGqlResponse";
  /** Discount calculation type */
  type: ProductDiscountType;
  /** Discount value. Percentage for PERCENTAGE, IRT amount for FIXED_AMOUNT_IRT */
  value: Scalars["Float"]["output"];
};

/** Product discount calculation type */
export const ProductDiscountType = {
  FIXED_AMOUNT_IRT: "FIXED_AMOUNT_IRT",
  PERCENTAGE: "PERCENTAGE",
} as const;

export type ProductDiscountType = (typeof ProductDiscountType)[keyof typeof ProductDiscountType];
export type ProductFabricColorGqlInput = {
  /** Stored file ID for the AI product preview image */
  aiProductImageFileId?: InputMaybe<Scalars["ID"]["input"]>;
  /** Optional color discount */
  discount?: InputMaybe<ProductDiscountGqlInput>;
  /** Hex color code */
  hexCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Whether end users can select this color */
  isActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Fabric color name */
  name: Scalars["String"]["input"];
  /** Color price in IRT */
  priceIrt?: InputMaybe<Scalars["Float"]["input"]>;
  /** Sort order */
  sortOrder?: InputMaybe<Scalars["Int"]["input"]>;
};

export type ProductFabricColorGqlResponse = {
  __typename?: "ProductFabricColorGqlResponse";
  /** Signed access descriptor for the AI product preview image */
  aiProductImageAccessUrl?: Maybe<FileAccessUrlGqlResponse>;
  /** Optional color discount */
  discount?: Maybe<ProductDiscountGqlResponse>;
  /** Hex color code */
  hexCode?: Maybe<Scalars["String"]["output"]>;
  /** Whether end users can select this color */
  isActive: Scalars["Boolean"]["output"];
  /** Stable fabric color key */
  key: Scalars["String"]["output"];
  /** Fabric color name */
  name: Scalars["String"]["output"];
  /** Color price in IRT */
  priceIrt?: Maybe<Scalars["Float"]["output"]>;
  /** Sort order */
  sortOrder?: Maybe<Scalars["Int"]["output"]>;
};

export type ProductFabricGqlInput = {
  /** Selectable colors for this pattern */
  colors: Array<ProductFabricColorGqlInput>;
  /** Whether end users can select this pattern */
  isActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Fabric pattern name */
  patternName: Scalars["String"]["input"];
  /** Sort order */
  sortOrder?: InputMaybe<Scalars["Int"]["input"]>;
};

export type ProductFabricGqlResponse = {
  __typename?: "ProductFabricGqlResponse";
  /** Selectable colors for this pattern */
  colors: Array<ProductFabricColorGqlResponse>;
  /** Whether end users can select this pattern */
  isActive: Scalars["Boolean"]["output"];
  /** Stable fabric key */
  key: Scalars["String"]["output"];
  /** Fabric pattern name */
  patternName: Scalars["String"]["output"];
  /** Sort order */
  sortOrder?: Maybe<Scalars["Int"]["output"]>;
};

export type ProductListCursorPageOptionsParamsInput = {
  /** Maximum number of records to return */
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  /** Sort options as a map of field names to sort order */
  sort?: InputMaybe<ProductListSortOptionInput>;
  /** Cursor to start after. Uses the beginning if omitted */
  startCursor?: InputMaybe<Scalars["ID"]["input"]>;
};

export type ProductListFilterInput = {
  /** Filter products by full description */
  fullDescription?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter products by whether any active color has a paid price. true = min price > 0, false = no active priced colors. */
  hasPrice?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Scope the product list for a specific user by excluding products they have already paid for. */
  includeUserId?: InputMaybe<Scalars["ID"]["input"]>;
  /** Filter by active state */
  isActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Filter by whether the current user has purchased the product. Used by userProductList. */
  isPurchased?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Maximum price in IRT */
  maxPriceIrt?: InputMaybe<Scalars["Float"]["input"]>;
  /** Minimum price in IRT */
  minPriceIrt?: InputMaybe<Scalars["Float"]["input"]>;
  /** Search query that matches title, summary, full description, tags, vendor, materials, and set piece names */
  query?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter products by summary */
  summary?: InputMaybe<Scalars["String"]["input"]>;
  /** Return products that contain every tag in this list */
  tagsAll?: InputMaybe<Array<Scalars["String"]["input"]>>;
  /** Return products that contain at least one of these tags */
  tagsAny?: InputMaybe<Array<Scalars["String"]["input"]>>;
  /** Filter products by title */
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type ProductListGqlInput = {
  /** Filter options for narrowing down the product list */
  filters?: InputMaybe<ProductListFilterInput>;
  /** Pagination and sorting options */
  options?: InputMaybe<ProductListCursorPageOptionsParamsInput>;
};

export type ProductListGqlResponse = {
  __typename?: "ProductListGqlResponse";
  /** Signed access descriptors for product cover images */
  coverImageAccessUrls: Array<FileAccessUrlGqlResponse>;
  /** Date when the product was created */
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Computed discount for the lowest color offer */
  discount?: Maybe<ProductDiscountGqlResponse>;
  /** Admin-defined fabric pattern and color options */
  fabrics: Array<ProductFabricGqlResponse>;
  /** Full product description */
  fullDescription?: Maybe<Scalars["String"]["output"]>;
  /** Product ID */
  id: Scalars["ID"]["output"];
  /** Whether the product is active */
  isActive: Scalars["Boolean"]["output"];
  /** Whether learners can submit reviews for this product */
  isReviewSubmissionEnabled: Scalars["Boolean"]["output"];
  /** Whether the reviews section is visible on the product detail page */
  isReviewsSectionVisible: Scalars["Boolean"]["output"];
  /** Material and texture profile */
  materialProfile?: Maybe<ProductMaterialProfileGqlResponse>;
  /** Internal notes visible to SUPER_ADMIN only */
  notes?: Maybe<Scalars["String"]["output"]>;
  /** Minimum active color price in IRT */
  priceIrt?: Maybe<Scalars["Float"]["output"]>;
  /** Set pieces included in this product */
  setPieces: Array<ProductSetPieceGqlResponse>;
  /** Product display rank used for manual ordering */
  sortOrder?: Maybe<Scalars["Float"]["output"]>;
  /** Short product summary */
  summary?: Maybe<Scalars["String"]["output"]>;
  /** Product tags */
  tags: Array<Scalars["String"]["output"]>;
  /** Product title */
  title: Scalars["String"]["output"];
  /** Date when the product was last updated */
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Vendor or seller information */
  vendor?: Maybe<ProductVendorGqlResponse>;
};

export type ProductListPaginatedCursorGqlResponse = {
  __typename?: "ProductListPaginatedCursorGqlResponse";
  /** List of products */
  items: Array<ProductListSummaryGqlResponse>;
  /** Pagination metadata */
  pagination: PaginationCursorResponse;
};

export type ProductListSortOptionInput = {
  /** Sort by creation date */
  createdAt?: InputMaybe<SortingOrder>;
  /** Sort by active state */
  isActive?: InputMaybe<SortingOrder>;
  /** Sort by minimum active color price in IRT */
  priceIrt?: InputMaybe<SortingOrder>;
  /** Sort by manual display rank */
  sortOrder?: InputMaybe<SortingOrder>;
  /** Sort by product title */
  title?: InputMaybe<SortingOrder>;
  /** Sort by last update date */
  updatedAt?: InputMaybe<SortingOrder>;
};

export type ProductListSummaryGqlResponse = {
  __typename?: "ProductListSummaryGqlResponse";
  /** Signed access descriptors for product cover images */
  coverImageAccessUrls: Array<FileAccessUrlGqlResponse>;
  /** Computed discount for the lowest color offer */
  discount?: Maybe<ProductDiscountGqlResponse>;
  /** Product ID */
  id: Scalars["ID"]["output"];
  /** Whether the product is active */
  isActive: Scalars["Boolean"]["output"];
  /** Minimum active color price in IRT */
  priceIrt?: Maybe<Scalars["Float"]["output"]>;
  /** Product display rank used for manual ordering */
  sortOrder?: Maybe<Scalars["Float"]["output"]>;
  /** Short product summary */
  summary?: Maybe<Scalars["String"]["output"]>;
  /** Product tags */
  tags: Array<Scalars["String"]["output"]>;
  /** Product title */
  title: Scalars["String"]["output"];
};

export type ProductMaterialProfileGqlInput = {
  /** Care instructions */
  careInstructions?: InputMaybe<Scalars["String"]["input"]>;
  /** Primary material */
  primaryMaterial?: InputMaybe<Scalars["String"]["input"]>;
  /** Primary texture */
  texture?: InputMaybe<Scalars["String"]["input"]>;
};

export type ProductMaterialProfileGqlResponse = {
  __typename?: "ProductMaterialProfileGqlResponse";
  /** Care instructions */
  careInstructions?: Maybe<Scalars["String"]["output"]>;
  /** Primary material */
  primaryMaterial?: Maybe<Scalars["String"]["output"]>;
  /** Primary texture */
  texture?: Maybe<Scalars["String"]["output"]>;
};

export type ProductPaymentDetailGqlInput = {
  /** User-product purchase record ID */
  id: Scalars["ID"]["input"];
};

export type ProductPaymentListCouponSummaryGqlResponse = {
  __typename?: "ProductPaymentListCouponSummaryGqlResponse";
  /** Coupon code */
  code: Scalars["String"]["output"];
  /** Coupon ID */
  couponId: Scalars["ID"]["output"];
  /** Coupon discount type */
  discountType: CouponDiscountType;
  /** Coupon discount value. Percentage or fixed amount based on discountType */
  discountValue: Scalars["Float"]["output"];
};

export type ProductPaymentListFilterInput = {
  /** Maximum original amount in IRT */
  amountIrtMax?: InputMaybe<Scalars["Float"]["input"]>;
  /** Minimum original amount in IRT */
  amountIrtMin?: InputMaybe<Scalars["Float"]["input"]>;
  /** Filter cancelled payments from this ISO date */
  cancelledAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter cancelled payments until this ISO date */
  cancelledAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter by coupon code */
  couponCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter by coupon discount type */
  couponDiscountType?: InputMaybe<CouponDiscountType>;
  /** Maximum coupon discount value */
  couponDiscountValueMax?: InputMaybe<Scalars["Float"]["input"]>;
  /** Minimum coupon discount value */
  couponDiscountValueMin?: InputMaybe<Scalars["Float"]["input"]>;
  /** Filter by coupon ID */
  couponId?: InputMaybe<Scalars["ID"]["input"]>;
  /** Filter records created from this ISO date */
  createdAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter records created until this ISO date */
  createdAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter payments by currency */
  currency?: InputMaybe<UserProductPurchaseCurrency>;
  /** Maximum discount amount in IRT */
  discountAmountIrtMax?: InputMaybe<Scalars["Float"]["input"]>;
  /** Minimum discount amount in IRT */
  discountAmountIrtMin?: InputMaybe<Scalars["Float"]["input"]>;
  /** Maximum discount percentage */
  discountPercentageMax?: InputMaybe<Scalars["Float"]["input"]>;
  /** Minimum discount percentage */
  discountPercentageMin?: InputMaybe<Scalars["Float"]["input"]>;
  /** Filter by buyer email snapshot */
  email?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter failed payments from this ISO date */
  failedAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter failed payments until this ISO date */
  failedAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Maximum final amount in IRT */
  finalAmountIrtMax?: InputMaybe<Scalars["Float"]["input"]>;
  /** Minimum final amount in IRT */
  finalAmountIrtMin?: InputMaybe<Scalars["Float"]["input"]>;
  /** Filter by buyer full name snapshot */
  fullName?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter by user-product purchase record ID */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** Filter by manual status-change flag */
  isManualStatusChange?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Filter by manual status changer user ID */
  manualStatusChangedBy?: InputMaybe<Scalars["ID"]["input"]>;
  /** Filter by manual status-change description */
  manualStatusChangedDescription?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter by buyer mobile phone snapshot */
  mobilePhone?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter paid payments from this ISO date */
  paidAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter paid payments until this ISO date */
  paidAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter payments by method */
  paymentMethod?: InputMaybe<UserProductPaymentMethod>;
  /** Filter by payment provider */
  paymentProvider?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter by payment reference */
  paymentReference?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter pending payments from this ISO date */
  pendingAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter pending payments until this ISO date */
  pendingAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter payments by product ID */
  productId?: InputMaybe<Scalars["ID"]["input"]>;
  /** Filter by product title snapshot */
  productTitle?: InputMaybe<Scalars["String"]["input"]>;
  /** Search query that matches buyer, product, payment reference, or transaction ID */
  query?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter by receipt uploader user ID */
  receiptUploadedBy?: InputMaybe<Scalars["ID"]["input"]>;
  /** Filter refunded payments from this ISO date */
  refundedAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter refunded payments until this ISO date */
  refundedAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter payments by purchase status */
  status?: InputMaybe<UserProductPurchaseStatus>;
  /** Filter by transaction ID */
  transactionId?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter records updated from this ISO date */
  updatedAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter records updated until this ISO date */
  updatedAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter by uploaded receipt file ID */
  uploadedReceiptFileId?: InputMaybe<Scalars["ID"]["input"]>;
  /** Filter by buyer email snapshot */
  userEmail?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter by buyer full name snapshot */
  userFullName?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter payments by buyer ID */
  userId?: InputMaybe<Scalars["ID"]["input"]>;
  /** Filter by buyer phone snapshot */
  userPhone?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter by buyer username snapshot */
  username?: InputMaybe<Scalars["String"]["input"]>;
};

export type ProductPaymentListGqlInput = {
  /** Filter options for narrowing down the product payment list */
  filters?: InputMaybe<ProductPaymentListFilterInput>;
  /** Pagination options */
  options?: InputMaybe<OffsetPageOptionsParamsInput>;
};

export type ProductPaymentListGqlResponse = {
  __typename?: "ProductPaymentListGqlResponse";
  /** Original amount in IRT */
  amountIrt: Scalars["Float"]["output"];
  /** Cancelled status date */
  cancelledAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Applied coupon snapshot, if any */
  coupon?: Maybe<ProductCouponSnapshotGqlResponse>;
  /** Payment submitted date */
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** User ID that initially created the payment record */
  createdBy?: Maybe<Scalars["ID"]["output"]>;
  /** User that initially created the payment record */
  createdByUser?: Maybe<ProductPaymentRelatedUserGqlResponse>;
  /** Payment currency */
  currency: UserProductPurchaseCurrency;
  /** Discount amount in IRT */
  discountAmountIrt?: Maybe<Scalars["Float"]["output"]>;
  /** Discount percentage applied by product discount */
  discountPercentage?: Maybe<Scalars["Float"]["output"]>;
  /** Failed status date */
  failedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Final payable amount in IRT */
  finalAmountIrt: Scalars["Float"]["output"];
  /** Gateway pending status date */
  gatewayPendingAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** User-product purchase record ID */
  id: Scalars["ID"]["output"];
  /** Whether the payment status was changed manually */
  isManualStatusChange: Scalars["Boolean"]["output"];
  /** User ID that manually changed the status */
  manualStatusChangedBy?: Maybe<Scalars["ID"]["output"]>;
  /** Manual status-change description */
  manualStatusChangedDescription?: Maybe<Scalars["String"]["output"]>;
  /** User that manually changed the status */
  manualStatusChanger?: Maybe<ProductPaymentRelatedUserGqlResponse>;
  /** Paid status date */
  paidAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Payment method */
  paymentMethod: UserProductPaymentMethod;
  /** Payment provider, if any */
  paymentProvider?: Maybe<Scalars["String"]["output"]>;
  /** Gateway authority or manual reference */
  paymentReference?: Maybe<Scalars["String"]["output"]>;
  /** Pending status date */
  pendingAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Product snapshot captured when the purchase was submitted */
  product: ProductPaymentProductSnapshotGqlResponse;
  /** Product ID */
  productId: Scalars["ID"]["output"];
  /** User ID that uploaded the receipt */
  receiptUploadedBy?: Maybe<Scalars["ID"]["output"]>;
  /** User that uploaded the receipt */
  receiptUploader?: Maybe<ProductPaymentRelatedUserGqlResponse>;
  /** Refunded status date */
  refundedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Payment status */
  status: UserProductPurchaseStatus;
  /** Actor that changed the payment status */
  statusChangedBy?: Maybe<PurchaseStatusChangedBy>;
  /** Whether this payment record was initially submitted by an admin */
  submittedInitiallyByAdmin: Scalars["Boolean"]["output"];
  /** Gateway ref ID or crypto transaction ID */
  transactionId?: Maybe<Scalars["String"]["output"]>;
  /** Last payment update date */
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Uploaded receipt file metadata */
  uploadedReceiptFile?: Maybe<ProductPaymentStoredFileGqlResponse>;
  /** Buyer snapshot captured when the purchase was submitted */
  user: ProductPaymentUserSnapshotGqlResponse;
  /** Buyer user ID */
  userId: Scalars["ID"]["output"];
};

export type ProductPaymentListPaginatedOffsetGqlResponse = {
  __typename?: "ProductPaymentListPaginatedOffsetGqlResponse";
  /** List of product payments */
  items: Array<ProductPaymentListSummaryGqlResponse>;
  /** Pagination metadata */
  pagination: PaginationOffsetResponse;
};

export type ProductPaymentListProductSummaryGqlResponse = {
  __typename?: "ProductPaymentListProductSummaryGqlResponse";
  /** Product title snapshot */
  title: Scalars["String"]["output"];
};

export type ProductPaymentListReceiptFileSummaryGqlResponse = {
  __typename?: "ProductPaymentListReceiptFileSummaryGqlResponse";
  /** Signed access descriptor for reading the stored receipt file */
  accessUrl?: Maybe<FileAccessUrlGqlResponse>;
};

export type ProductPaymentListSummaryGqlResponse = {
  __typename?: "ProductPaymentListSummaryGqlResponse";
  /** Original amount in IRT */
  amountIrt: Scalars["Float"]["output"];
  /** Cancelled status date */
  cancelledAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Applied coupon snapshot, if any */
  coupon?: Maybe<ProductPaymentListCouponSummaryGqlResponse>;
  /** Payment submitted date */
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Payment currency */
  currency: UserProductPurchaseCurrency;
  /** Discount amount in IRT */
  discountAmountIrt?: Maybe<Scalars["Float"]["output"]>;
  /** Discount percentage applied by product discount */
  discountPercentage?: Maybe<Scalars["Float"]["output"]>;
  /** Failed status date */
  failedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Final payable amount in IRT */
  finalAmountIrt: Scalars["Float"]["output"];
  /** Gateway pending status date */
  gatewayPendingAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** User-product purchase record ID */
  id: Scalars["ID"]["output"];
  /** Whether the payment status was changed manually */
  isManualStatusChange: Scalars["Boolean"]["output"];
  /** User ID that manually changed the status */
  manualStatusChangedBy?: Maybe<Scalars["ID"]["output"]>;
  /** Manual status-change description */
  manualStatusChangedDescription?: Maybe<Scalars["String"]["output"]>;
  /** Paid status date */
  paidAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Payment method */
  paymentMethod: UserProductPaymentMethod;
  /** Payment provider, if any */
  paymentProvider?: Maybe<Scalars["String"]["output"]>;
  /** Gateway authority or manual reference */
  paymentReference?: Maybe<Scalars["String"]["output"]>;
  /** Pending status date */
  pendingAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Product snapshot captured when the purchase was submitted */
  product: ProductPaymentListProductSummaryGqlResponse;
  /** Product ID */
  productId: Scalars["ID"]["output"];
  /** User ID that uploaded the receipt */
  receiptUploadedBy?: Maybe<Scalars["ID"]["output"]>;
  /** Refunded status date */
  refundedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Payment status */
  status: UserProductPurchaseStatus;
  /** Actor that changed the payment status */
  statusChangedBy?: Maybe<PurchaseStatusChangedBy>;
  /** Gateway ref ID or crypto transaction ID */
  transactionId?: Maybe<Scalars["String"]["output"]>;
  /** Last payment update date */
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Uploaded receipt file metadata */
  uploadedReceiptFile?: Maybe<ProductPaymentListReceiptFileSummaryGqlResponse>;
  /** Buyer snapshot captured when the purchase was submitted */
  user: ProductPaymentListUserSummaryGqlResponse;
  /** Buyer user ID */
  userId: Scalars["ID"]["output"];
};

export type ProductPaymentListUserSummaryGqlResponse = {
  __typename?: "ProductPaymentListUserSummaryGqlResponse";
  /** Buyer email snapshot */
  email: Scalars["String"]["output"];
  /** Buyer full name snapshot */
  fullName: Scalars["String"]["output"];
  /** Buyer mobile phone snapshot */
  mobilePhone?: Maybe<Scalars["String"]["output"]>;
  /** Buyer phone snapshot */
  phone?: Maybe<Scalars["String"]["output"]>;
  /** Buyer username snapshot */
  username: Scalars["String"]["output"];
};

export type ProductPaymentManualCreateGqlInput = {
  /** Optional coupon code to apply to this manual payment */
  couponCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Optional manual review description */
  manualStatusChangedDescription?: InputMaybe<Scalars["String"]["input"]>;
  /** Payment method selected by support for this manual record */
  paymentMethod: UserProductPaymentMethod;
  /** Active paid product ID to register payment for */
  productId: Scalars["ID"]["input"];
  /** Initial manual purchase status */
  status: UserProductPurchaseStatus;
  /** Optional uploaded payment evidence file ID */
  uploadedReceiptFileId?: InputMaybe<Scalars["ID"]["input"]>;
  /** User ID that will receive the payment record */
  userId: Scalars["ID"]["input"];
};

export type ProductPaymentProductSnapshotGqlResponse = {
  __typename?: "ProductPaymentProductSnapshotGqlResponse";
  /** Product ID */
  id: Scalars["ID"]["output"];
  /** Original product price in IRT */
  priceIrt: Scalars["Float"]["output"];
  /** Product summary snapshot */
  summary?: Maybe<Scalars["String"]["output"]>;
  /** Product title snapshot */
  title: Scalars["String"]["output"];
};

export type ProductPaymentRelatedUserGqlResponse = {
  __typename?: "ProductPaymentRelatedUserGqlResponse";
  /** Related user email */
  email?: Maybe<Scalars["String"]["output"]>;
  /** Related user display name */
  fullName?: Maybe<Scalars["String"]["output"]>;
  /** Related user ID */
  id: Scalars["ID"]["output"];
  /** Related user phone */
  phone?: Maybe<Scalars["String"]["output"]>;
  /** Related username */
  username?: Maybe<Scalars["String"]["output"]>;
};

export type ProductPaymentStatusUpdateGqlInput = {
  /** User-product purchase record ID */
  id: Scalars["ID"]["input"];
  /** Optional manual status-change description */
  manualStatusChangedDescription?: InputMaybe<Scalars["String"]["input"]>;
  /** New purchase status */
  status: UserProductPurchaseStatus;
};

export type ProductPaymentStoredFileGqlResponse = {
  __typename?: "ProductPaymentStoredFileGqlResponse";
  /** Signed access descriptor for reading the stored file */
  accessUrl?: Maybe<FileAccessUrlGqlResponse>;
  /** Stored file MIME type */
  mimeType?: Maybe<Scalars["String"]["output"]>;
  /** Stored file name */
  name?: Maybe<Scalars["String"]["output"]>;
  /** Stored file path */
  path?: Maybe<Scalars["String"]["output"]>;
  /** Stored file size in bytes */
  sizeBytes?: Maybe<Scalars["Float"]["output"]>;
  /** Stored file display title */
  title?: Maybe<Scalars["String"]["output"]>;
};

export type ProductPaymentUserSnapshotGqlResponse = {
  __typename?: "ProductPaymentUserSnapshotGqlResponse";
  /** Buyer email snapshot */
  email: Scalars["String"]["output"];
  /** Buyer full name snapshot */
  fullName: Scalars["String"]["output"];
  /** Buyer user ID */
  id: Scalars["ID"]["output"];
  /** Buyer mobile phone snapshot */
  mobilePhone?: Maybe<Scalars["String"]["output"]>;
  /** Buyer phone snapshot */
  phone?: Maybe<Scalars["String"]["output"]>;
  /** Buyer username snapshot */
  username: Scalars["String"]["output"];
};

export type ProductPurchaseSubmitGqlInput = {
  /** Optional coupon code to apply to this purchase */
  couponCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Payment method. Supports GATEWAY, CARD_TO_CARD, CRYPTOCURRENCY, and FREE. */
  paymentMethod: UserProductPaymentMethod;
  /** Receipt number or last card digits. Required for CARD_TO_CARD when uploadedReceiptFileId is omitted. */
  paymentReference?: InputMaybe<Scalars["String"]["input"]>;
  /** Product ID to purchase */
  productId: Scalars["ID"]["input"];
  /** Blockchain transaction ID. Required for CRYPTOCURRENCY. */
  transactionId?: InputMaybe<Scalars["String"]["input"]>;
  /** Uploaded receipt file ID. Required for CARD_TO_CARD when paymentReference is omitted. */
  uploadedReceiptFileId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type ProductPurchaseSubmitGqlResponse = {
  __typename?: "ProductPurchaseSubmitGqlResponse";
  /** Original product price in IRT */
  amountIrt: Scalars["Float"]["output"];
  /** Applied coupon code, if the purchase used a coupon */
  couponCode?: Maybe<Scalars["String"]["output"]>;
  /** Currency expected for the payment method */
  currency: UserProductPurchaseCurrency;
  /** Applied discount amount in IRT */
  discountAmountIrt?: Maybe<Scalars["Float"]["output"]>;
  /** Final payable amount in IRT */
  finalAmountIrt: Scalars["Float"]["output"];
  /** User product purchase record ID */
  id: Scalars["ID"]["output"];
  /** Whether this purchase grants product access now */
  isPurchased: Scalars["Boolean"]["output"];
  /** Gateway authority/reference for online payments */
  paymentAuthority?: Maybe<Scalars["String"]["output"]>;
  /** Payment method used for this purchase */
  paymentMethod: UserProductPaymentMethod;
  /** Receipt number or last source-card digits */
  paymentReference?: Maybe<Scalars["String"]["output"]>;
  /** Gateway redirect URL for online payments */
  paymentUrl?: Maybe<Scalars["String"]["output"]>;
  /** Purchased product ID */
  productId: Scalars["ID"]["output"];
  /** Purchase status after submission */
  status: UserProductPurchaseStatus;
  /** Blockchain transaction ID for crypto purchases */
  transactionId?: Maybe<Scalars["String"]["output"]>;
};

export type ProductReviewListCursorPageOptionsParamsInput = {
  /** Maximum number of records to return */
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  /** Sort options as a map of field names to sort order */
  sort?: InputMaybe<UserProductReviewListSortOptionInput>;
  /** Cursor to start after. Uses the beginning if omitted */
  startCursor?: InputMaybe<Scalars["ID"]["input"]>;
};

export type ProductReviewListFilterInput = {
  /** Filter reviews that include at least one message */
  hasMessages?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Filter reviews that include a rating */
  hasRating?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Filter reviews containing at least one message with this visibility */
  messageVisibility?: InputMaybe<ProductReviewVisibility>;
  /** Filter reviews by product ID */
  productId?: InputMaybe<Scalars["ID"]["input"]>;
  /** Search query that matches rating comment, message body, user snapshot, or product title */
  query?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter reviews by rating moderation visibility */
  ratingVisibility?: InputMaybe<ProductReviewVisibility>;
  /** Filter reviews by review thread moderation visibility */
  reviewVisibility?: InputMaybe<ProductReviewVisibility>;
  /** Filter reviews by exact star rating */
  stars?: InputMaybe<Scalars["Int"]["input"]>;
  /** Filter reviews by review owner user ID */
  userId?: InputMaybe<Scalars["ID"]["input"]>;
  /** Filter reviews by linked user product enrollment ID */
  userProductId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type ProductReviewListGqlInput = {
  /** Filter options for narrowing down the product review list */
  filters?: InputMaybe<ProductReviewListFilterInput>;
  /** Cursor pagination and sorting options */
  options?: InputMaybe<ProductReviewListCursorPageOptionsParamsInput>;
};

export type ProductReviewListGqlResponse = {
  __typename?: "ProductReviewListGqlResponse";
  /** Date when the review thread was created */
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Minimal user that created the review thread */
  createdByUser?: Maybe<UserMinimalGqlResponse>;
  /** User ID that created the review thread */
  createdByUserId?: Maybe<Scalars["ID"]["output"]>;
  /** Date when the review thread was soft deleted */
  deletedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Minimal user that soft deleted the review thread */
  deletedByUser?: Maybe<UserMinimalGqlResponse>;
  /** User ID that soft deleted the review thread */
  deletedByUserId?: Maybe<Scalars["ID"]["output"]>;
  /** Product review thread ID */
  id: Scalars["ID"]["output"];
  /** Full Q&A message thread */
  messages: Array<ProductReviewMessageGqlResponse>;
  /** Review thread moderation metadata */
  moderation: ProductReviewModerationGqlResponse;
  /** Product ID */
  productId: Scalars["ID"]["output"];
  /** Stored product snapshot */
  productSnapshot: ProductReviewProductSnapshotGqlResponse;
  /** Product rating, if submitted */
  rating?: Maybe<ProductReviewRatingGqlResponse>;
  /** Date when the review thread was last updated */
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Minimal user that last updated the review thread */
  updatedByUser?: Maybe<UserMinimalGqlResponse>;
  /** User ID that last updated the review thread */
  updatedByUserId?: Maybe<Scalars["ID"]["output"]>;
  /** Minimal review owner information */
  user?: Maybe<UserMinimalGqlResponse>;
  /** Review owner user ID */
  userId: Scalars["ID"]["output"];
  /** Linked user product enrollment ID, when the reviewer purchased the product */
  userProductId?: Maybe<Scalars["ID"]["output"]>;
  /** Stored review owner snapshot */
  userSnapshot: ProductReviewUserSnapshotGqlResponse;
};

export type ProductReviewListPaginatedCursorGqlResponse = {
  __typename?: "ProductReviewListPaginatedCursorGqlResponse";
  /** Full product review list for SUPER_ADMIN */
  items: Array<ProductReviewListGqlResponse>;
  /** Pagination metadata */
  pagination: PaginationCursorResponse;
  /** Aggregated rating summary excluding hidden reviews and hidden ratings */
  summary: ProductReviewRatingSummaryGqlResponse;
};

export type ProductReviewMessageGqlResponse = {
  __typename?: "ProductReviewMessageGqlResponse";
  /** Message body */
  body: Scalars["String"]["output"];
  /** Stable message key generated by the database */
  key: Scalars["String"]["output"];
  /** Message moderation metadata */
  moderation: ProductReviewModerationGqlResponse;
  /** Minimal sender user information */
  senderUser?: Maybe<UserMinimalGqlResponse>;
  /** Sender user ID */
  senderUserId: Scalars["ID"]["output"];
  /** Date when the message was sent */
  sentAt: Scalars["DateTime"]["output"];
};

export type ProductReviewModerationGqlResponse = {
  __typename?: "ProductReviewModerationGqlResponse";
  /** Date when the content was hidden */
  hiddenAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Minimal user that hid the content */
  hiddenByUser?: Maybe<UserMinimalGqlResponse>;
  /** User ID that hid the content */
  hiddenByUserId?: Maybe<Scalars["ID"]["output"]>;
  /** Internal moderation note */
  hiddenReason?: Maybe<Scalars["String"]["output"]>;
  /** Moderation visibility for this content */
  visibility: ProductReviewVisibility;
};

/** Moderation scope for a product review update */
export const ProductReviewModerationTarget = {
  MESSAGE: "MESSAGE",
  RATING: "RATING",
  REVIEW: "REVIEW",
} as const;

export type ProductReviewModerationTarget =
  (typeof ProductReviewModerationTarget)[keyof typeof ProductReviewModerationTarget];
export type ProductReviewModerationUpdateGqlInput = {
  /** Optional internal note when hiding content */
  hiddenReason?: InputMaybe<Scalars["String"]["input"]>;
  /** Stable message key; required when target is MESSAGE */
  messageKey?: InputMaybe<Scalars["String"]["input"]>;
  /** Product review ID */
  reviewId: Scalars["ID"]["input"];
  /** Which moderation scope to update: review thread, rating, or message */
  target: ProductReviewModerationTarget;
  /** New moderation visibility */
  visibility: ProductReviewVisibility;
};

export type ProductReviewProductSnapshotGqlResponse = {
  __typename?: "ProductReviewProductSnapshotGqlResponse";
  /** Stored product title snapshot */
  title: Scalars["String"]["output"];
};

export type ProductReviewRatingDistributionGqlResponse = {
  __typename?: "ProductReviewRatingDistributionGqlResponse";
  /** Number of ratings with this star value */
  count: Scalars["Int"]["output"];
  /** Share of eligible ratings, rounded to a percent */
  percentage: Scalars["Int"]["output"];
  /** Star value from 1 to 5 */
  stars: Scalars["Int"]["output"];
};

export type ProductReviewRatingGqlResponse = {
  __typename?: "ProductReviewRatingGqlResponse";
  /** Optional review comment */
  comment?: Maybe<Scalars["String"]["output"]>;
  /** Rating moderation metadata */
  moderation: ProductReviewModerationGqlResponse;
  /** Date when the rating was first submitted */
  ratedAt: Scalars["DateTime"]["output"];
  /** Star rating from 1 to 5 */
  stars: Scalars["Int"]["output"];
  /** Date when the rating was last updated */
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
};

export type ProductReviewRatingSummaryGqlResponse = {
  __typename?: "ProductReviewRatingSummaryGqlResponse";
  /** Average star rating across eligible reviews */
  averageRating?: Maybe<Scalars["Float"]["output"]>;
  /** Distribution of eligible ratings by star value */
  distribution: Array<ProductReviewRatingDistributionGqlResponse>;
  /** Number of eligible ratings included in the summary */
  ratedCount: Scalars["Int"]["output"];
};

export type ProductReviewSubmitGqlInput = {
  /** Captcha challenge identifier issued by the backend */
  captchaId?: InputMaybe<Scalars["String"]["input"]>;
  /** Captcha answer entered by the user */
  captchaValue?: InputMaybe<Scalars["String"]["input"]>;
  /** Optional review comment */
  comment?: InputMaybe<Scalars["String"]["input"]>;
  /** Staff only. Visibility for a support message; PUBLIC or PRIVATE */
  messageVisibility?: InputMaybe<ProductReviewVisibility>;
  /** Product ID to review */
  productId: Scalars["ID"]["input"];
  /** Optional star rating from 1 to 5 */
  stars?: InputMaybe<Scalars["Int"]["input"]>;
  /** Review owner user ID; staff only. END_USER accounts always review as themselves */
  userId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type ProductReviewSubmitGqlResponse = {
  __typename?: "ProductReviewSubmitGqlResponse";
  /** Product review thread ID */
  id: Scalars["ID"]["output"];
  /** Whether this call created the rating for the first time */
  isNewRating: Scalars["Boolean"]["output"];
  /** Reviewed product ID */
  productId: Scalars["ID"]["output"];
  /** Submitted rating, if any */
  rating?: Maybe<ProductReviewSubmitRatingGqlResponse>;
  /** Minimal review owner information; returned to staff only */
  user?: Maybe<UserMinimalGqlResponse>;
  /** Review owner user ID; returned to staff only */
  userId?: Maybe<Scalars["ID"]["output"]>;
};

export type ProductReviewSubmitRatingGqlResponse = {
  __typename?: "ProductReviewSubmitRatingGqlResponse";
  /** Optional review comment */
  comment?: Maybe<Scalars["String"]["output"]>;
  /** Date when the rating was first submitted */
  ratedAt: Scalars["DateTime"]["output"];
  /** Star rating from 1 to 5 */
  stars: Scalars["Int"]["output"];
  /** Date when the rating was last updated */
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
};

export type ProductReviewUserSnapshotGqlResponse = {
  __typename?: "ProductReviewUserSnapshotGqlResponse";
  /** Stored avatar file ID snapshot */
  avatarFileId?: Maybe<Scalars["ID"]["output"]>;
  /** Stored full name snapshot */
  fullName: Scalars["String"]["output"];
  /** Stored username snapshot */
  username: Scalars["String"]["output"];
};

/** Visibility state for product review content */
export const ProductReviewVisibility = {
  HIDDEN: "HIDDEN",
  PRIVATE: "PRIVATE",
  PUBLIC: "PUBLIC",
} as const;

export type ProductReviewVisibility =
  (typeof ProductReviewVisibility)[keyof typeof ProductReviewVisibility];
export type ProductSetPieceDimensionGqlInput = {
  /** Depth in centimeters */
  depthCm?: InputMaybe<Scalars["Float"]["input"]>;
  /** Display text for the dimension */
  displayText?: InputMaybe<Scalars["String"]["input"]>;
  /** Height in centimeters */
  heightCm?: InputMaybe<Scalars["Float"]["input"]>;
  /** Dimension label */
  label?: InputMaybe<Scalars["String"]["input"]>;
  /** Sort order */
  sortOrder?: InputMaybe<Scalars["Int"]["input"]>;
  /** Width in centimeters */
  widthCm?: InputMaybe<Scalars["Float"]["input"]>;
};

export type ProductSetPieceDimensionGqlResponse = {
  __typename?: "ProductSetPieceDimensionGqlResponse";
  /** Depth in centimeters */
  depthCm?: Maybe<Scalars["Float"]["output"]>;
  /** Display text for the dimension */
  displayText?: Maybe<Scalars["String"]["output"]>;
  /** Height in centimeters */
  heightCm?: Maybe<Scalars["Float"]["output"]>;
  /** Dimension label */
  label?: Maybe<Scalars["String"]["output"]>;
  /** Sort order */
  sortOrder?: Maybe<Scalars["Int"]["output"]>;
  /** Width in centimeters */
  widthCm?: Maybe<Scalars["Float"]["output"]>;
};

export type ProductSetPieceGqlInput = {
  /** Set piece description */
  description?: InputMaybe<Scalars["String"]["input"]>;
  /** Dimensions for this set piece */
  dimensions?: InputMaybe<Array<ProductSetPieceDimensionGqlInput>>;
  /** Stored file IDs attached to this set piece */
  imageFileIds?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  /** Optional material profile for this set piece */
  materialProfile?: InputMaybe<ProductMaterialProfileGqlInput>;
  /** Set piece name */
  name: Scalars["String"]["input"];
  /** Sort order */
  sortOrder?: InputMaybe<Scalars["Int"]["input"]>;
  /** Weight in kilograms */
  weightKg?: InputMaybe<Scalars["Float"]["input"]>;
};

export type ProductSetPieceGqlResponse = {
  __typename?: "ProductSetPieceGqlResponse";
  /** Set piece description */
  description?: Maybe<Scalars["String"]["output"]>;
  /** Dimensions for this set piece */
  dimensions: Array<ProductSetPieceDimensionGqlResponse>;
  /** Signed access descriptors for set piece images */
  imageAccessUrls: Array<FileAccessUrlGqlResponse>;
  /** Stable set piece key */
  key: Scalars["String"]["output"];
  /** Optional material profile for this set piece */
  materialProfile?: Maybe<ProductMaterialProfileGqlResponse>;
  /** Set piece name */
  name: Scalars["String"]["output"];
  /** Sort order */
  sortOrder?: Maybe<Scalars["Int"]["output"]>;
  /** Weight in kilograms */
  weightKg?: Maybe<Scalars["Float"]["output"]>;
};

export type ProductUpdateGqlInput = {
  /** Ordered stored file IDs used as product cover images */
  coverImageFileIds?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  /** Admin-defined fabric pattern and color options */
  fabrics?: InputMaybe<Array<ProductFabricGqlInput>>;
  /** Full product description */
  fullDescription?: InputMaybe<Scalars["String"]["input"]>;
  /** Product ID */
  id: Scalars["ID"]["input"];
  /** Whether the product is active */
  isActive?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Whether learners can submit reviews for this product */
  isReviewSubmissionEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Whether the reviews section is visible on the product detail page */
  isReviewsSectionVisible?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Material and texture profile */
  materialProfile?: InputMaybe<ProductMaterialProfileGqlInput>;
  /** Internal notes visible to SUPER_ADMIN */
  notes?: InputMaybe<Scalars["String"]["input"]>;
  /** Set pieces included in this product */
  setPieces?: InputMaybe<Array<ProductSetPieceGqlInput>>;
  /** Product display rank used for manual ordering */
  sortOrder?: InputMaybe<Scalars["Float"]["input"]>;
  /** Short product summary for list cards */
  summary?: InputMaybe<Scalars["String"]["input"]>;
  /** Product tags */
  tags?: InputMaybe<Array<Scalars["String"]["input"]>>;
  /** Product title */
  title: Scalars["String"]["input"];
  /** Vendor or seller information */
  vendor?: InputMaybe<ProductVendorGqlInput>;
};

export type ProductVendorGqlInput = {
  /** Vendor address */
  address?: InputMaybe<Scalars["String"]["input"]>;
  /** Vendor or seller name */
  name: Scalars["String"]["input"];
  /** Internal vendor notes */
  notes?: InputMaybe<Scalars["String"]["input"]>;
  /** Vendor phone number */
  phone?: InputMaybe<Scalars["String"]["input"]>;
};

export type ProductVendorGqlResponse = {
  __typename?: "ProductVendorGqlResponse";
  /** Vendor address */
  address?: Maybe<Scalars["String"]["output"]>;
  /** Vendor or seller name */
  name: Scalars["String"]["output"];
  /** Internal vendor notes */
  notes?: Maybe<Scalars["String"]["output"]>;
  /** Vendor phone number */
  phone?: Maybe<Scalars["String"]["output"]>;
};

/** Actor that changed a product purchase status */
export const PurchaseStatusChangedBy = {
  ADMIN: "ADMIN",
  SYSTEM: "SYSTEM",
} as const;

export type PurchaseStatusChangedBy =
  (typeof PurchaseStatusChangedBy)[keyof typeof PurchaseStatusChangedBy];
export type PushNotificationConfigGqlResponse = {
  __typename?: "PushNotificationConfigGqlResponse";
  /** Whether server-side Web Push delivery is configured */
  enabled: Scalars["Boolean"]["output"];
  /** Whether server-side native mobile push (FCM) delivery is configured */
  nativePushEnabled: Scalars["Boolean"]["output"];
  /** VAPID public key used by clients for PushManager.subscribe() */
  publicKey?: Maybe<Scalars["String"]["output"]>;
};

export type PushSubscriptionKeysGqlInput = {
  /** Push subscription auth key */
  auth: Scalars["String"]["input"];
  /** Push subscription p256dh key */
  p256dh: Scalars["String"]["input"];
};

export type PushSubscriptionMutationGqlResponse = {
  __typename?: "PushSubscriptionMutationGqlResponse";
  /** Whether the push subscription operation succeeded */
  success: Scalars["Boolean"]["output"];
};

export type Query = {
  __typename?: "Query";
  /** Get configured about page HTML content */
  appAboutPageConfig: AppAboutPageConfigGqlResponse;
  /** Get configured privacy policy HTML content */
  appPrivacyPolicyPageConfig: AppPrivacyPolicyPageConfigGqlResponse;
  /** Get full app setting data for SUPER_ADMIN, including the editable value */
  appSettingDetail: AppSettingMutationGqlResponse;
  /** Get a paginated, filterable, sortable SUPER_ADMIN list of app setting keys using offset-based pagination */
  appSettingKeyList: AppSettingKeyListPaginatedOffsetGqlResponse;
  /** Get configured terms of use HTML content */
  appTermsOfUsePageConfig: AppTermsOfUsePageConfigGqlResponse;
  /** Get role-aware sidebar badge counts. Anonymous users receive active product count only. */
  badgeCount: BadgeCountGqlResponse;
  /** Get full coupon data for SUPER_ADMIN, including applicable products for editing */
  couponDetail: CouponListGqlResponse;
  /** Get a paginated, filterable, sortable SUPER_ADMIN list of coupons using offset-based pagination */
  couponList: CouponListPaginatedOffsetGqlResponse;
  /** Validate a coupon for the current user's product purchase */
  couponValidate: CouponValidateGqlResponse;
  /** Get the currently authenticated user's information */
  me: UserMeGqlResponse;
  /** Get payment checkout settings for product purchases */
  paymentCheckoutConfig: PaymentCheckoutConfigGqlResponse;
  /** Estimated AI product preview generation duration in seconds. Value is read from app settings and updated by the system after each successful generation. */
  productAiPreviewStagingDuration: ProductAiPreviewStagingDurationGqlResponse;
  /** Inspect related records before deleting a product, including retained and removed dependencies */
  productDeleteDependencies: ProductDeleteDependenciesGqlResponse;
  /** Get full product data for SUPER_ADMIN, including furniture catalog fields for editing */
  productDetail: ProductListGqlResponse;
  /** Get a paginated, filterable, sortable admin list of products with calculated release and item types */
  productList: ProductListPaginatedCursorGqlResponse;
  /** Get full product payment data for SUPER_ADMIN, including receipt and audit fields for review */
  productPaymentDetail: ProductPaymentListGqlResponse;
  /** Get paginated list of all product payments from user-product purchase records */
  productPaymentList: ProductPaymentListPaginatedOffsetGqlResponse;
  /** Get a cursor-paginated, filterable, sortable staff list of product reviews with full data */
  productReviewList: ProductReviewListPaginatedCursorGqlResponse;
  /** Public Web Push configuration for browser subscription setup */
  pushNotificationConfig: PushNotificationConfigGqlResponse;
  /** Get configured support contact channels */
  supportContactConfig: SupportContactConfigGqlResponse;
  /** Get full support ticket data for SUPER_ADMIN, including messages and attachments for review */
  ticketDetail: TicketListGqlResponse;
  /** Get a paginated, filterable, sortable super-admin list of support tickets using offset-based pagination */
  ticketList: TicketListPaginatedOffsetGqlResponse;
  /** Get full user data for SUPER_ADMIN, including profile fields for editing */
  userDetail: UserListGqlResponse;
  /** Get a paginated, filterable, sortable super-admin list of users using offset-based pagination */
  userList: UserListPaginatedOffsetGqlResponse;
  /** Generate a captcha challenge for password login */
  userLoginCaptcha: UserLoginCaptchaGqlResponse;
  /** Get a cursor-paginated, filterable, sortable list of notifications visible to the current user */
  userNotificationList: NotificationListPaginatedCursorGqlResponse;
  /** Get active furniture product details for anonymous users and END_USER accounts */
  userProductDetail: UserProductDetailGqlResponse;
  /** Get active products for anonymous users and END_USER views with purchase state */
  userProductList: UserProductListPaginatedCursorGqlResponse;
  /** Get a cursor-paginated list of public product reviews for anonymous users and END_USER accounts */
  userProductReviewList: UserProductReviewListPaginatedCursorGqlResponse;
  /** Get full support ticket data for the current END_USER, including messages and attachments for viewing and replying */
  userTicketDetail: UserTicketListGqlResponse;
  /** Get a paginated, filterable, sortable list of support tickets owned by the current END_USER */
  userTicketList: UserTicketListPaginatedOffsetGqlResponse;
};

export type QueryAppSettingDetailArgs = {
  input: AppSettingDetailGqlInput;
};

export type QueryAppSettingKeyListArgs = {
  input: AppSettingKeyListGqlInput;
};

export type QueryCouponDetailArgs = {
  input: CouponDetailGqlInput;
};

export type QueryCouponListArgs = {
  input: CouponListGqlInput;
};

export type QueryCouponValidateArgs = {
  input: CouponValidateGqlInput;
};

export type QueryProductDeleteDependenciesArgs = {
  input: ProductDeleteGqlInput;
};

export type QueryProductDetailArgs = {
  input: ProductDetailGqlInput;
};

export type QueryProductListArgs = {
  input: ProductListGqlInput;
};

export type QueryProductPaymentDetailArgs = {
  input: ProductPaymentDetailGqlInput;
};

export type QueryProductPaymentListArgs = {
  input: ProductPaymentListGqlInput;
};

export type QueryProductReviewListArgs = {
  input: ProductReviewListGqlInput;
};

export type QueryTicketDetailArgs = {
  input: TicketDetailGqlInput;
};

export type QueryTicketListArgs = {
  input: TicketListGqlInput;
};

export type QueryUserDetailArgs = {
  input: UserDetailGqlInput;
};

export type QueryUserListArgs = {
  input: UserListGqlInput;
};

export type QueryUserNotificationListArgs = {
  input: NotificationListGqlInput;
};

export type QueryUserProductDetailArgs = {
  input: UserProductDetailGqlInput;
};

export type QueryUserProductListArgs = {
  input: ProductListGqlInput;
};

export type QueryUserProductReviewListArgs = {
  input: UserProductReviewListGqlInput;
};

export type QueryUserTicketDetailArgs = {
  input: UserTicketDetailGqlInput;
};

export type QueryUserTicketListArgs = {
  input: UserTicketListGqlInput;
};

export type RegisterNativePushTokenGqlInput = {
  /** Native platform that issued the push token */
  platform: NativePushPlatform;
  /** FCM device token */
  token: Scalars["String"]["input"];
};

export type RegisterPushSubscriptionGqlInput = {
  /** Push service endpoint URL */
  endpoint: Scalars["String"]["input"];
  /** Encryption keys returned by PushManager.subscribe() */
  keys: PushSubscriptionKeysGqlInput;
  /** Previous push endpoint for this browser, removed before registering the new one */
  replacesEndpoint?: InputMaybe<Scalars["String"]["input"]>;
};

export type SessionClientContextGqlInput = {
  appVersion?: InputMaybe<Scalars["String"]["input"]>;
  architecture?: InputMaybe<Scalars["String"]["input"]>;
  bitness?: InputMaybe<Scalars["String"]["input"]>;
  browserName?: InputMaybe<Scalars["String"]["input"]>;
  browserVersion?: InputMaybe<Scalars["String"]["input"]>;
  /** browser | ios_app | android_app | installed_pwa */
  clientType?: InputMaybe<Scalars["String"]["input"]>;
  /** dark | light | no-preference */
  colorScheme?: InputMaybe<Scalars["String"]["input"]>;
  connectionType?: InputMaybe<Scalars["String"]["input"]>;
  cookiesEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  cpuCores?: InputMaybe<Scalars["Int"]["input"]>;
  /** mobile | tablet | desktop | unknown */
  deviceCategory?: InputMaybe<Scalars["String"]["input"]>;
  deviceMemoryGb?: InputMaybe<Scalars["Float"]["input"]>;
  /** Device model when available */
  deviceModel?: InputMaybe<Scalars["String"]["input"]>;
  /** Human-readable device name */
  deviceName?: InputMaybe<Scalars["String"]["input"]>;
  devicePixelRatio?: InputMaybe<Scalars["Float"]["input"]>;
  downlinkMbps?: InputMaybe<Scalars["Float"]["input"]>;
  engineName?: InputMaybe<Scalars["String"]["input"]>;
  language?: InputMaybe<Scalars["String"]["input"]>;
  languages?: InputMaybe<Scalars["String"]["input"]>;
  maxTouchPoints?: InputMaybe<Scalars["Int"]["input"]>;
  osName?: InputMaybe<Scalars["String"]["input"]>;
  osVersion?: InputMaybe<Scalars["String"]["input"]>;
  pageUrl?: InputMaybe<Scalars["String"]["input"]>;
  pdfViewerEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  platform?: InputMaybe<Scalars["String"]["input"]>;
  referrer?: InputMaybe<Scalars["String"]["input"]>;
  rttMs?: InputMaybe<Scalars["Int"]["input"]>;
  saveData?: InputMaybe<Scalars["Boolean"]["input"]>;
  screenResolution?: InputMaybe<Scalars["String"]["input"]>;
  timezone?: InputMaybe<Scalars["String"]["input"]>;
  timezoneOffset?: InputMaybe<Scalars["String"]["input"]>;
  touchInput?: InputMaybe<Scalars["Boolean"]["input"]>;
  viewportSize?: InputMaybe<Scalars["String"]["input"]>;
};

/** Sorting order */
export const SortingOrder = {
  ASC: "ASC",
  DESC: "DESC",
} as const;

export type SortingOrder = (typeof SortingOrder)[keyof typeof SortingOrder];
export type Subscription = {
  __typename?: "Subscription";
  /** General typed app updates for connected clients */
  generalUpdates: GeneralSubscriptionGqlResponse;
};

export type SubscriptionGeneralUpdatesArgs = {
  updateTypes?: InputMaybe<Array<GeneralSubscriptionUpdateType>>;
};

export type SuperAdminTicketSendGqlInput = {
  /** Ticket category (required when creating a new ticket) */
  category?: InputMaybe<TicketCategory>;
  /** End-user ID to assign a newly created staff ticket to. Required when creating a new ticket */
  endUserId?: InputMaybe<Scalars["ID"]["input"]>;
  /** Ticket ID for updating an existing ticket. Omit to create a new ticket */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** Message payload to append to ticket conversation */
  message: TicketSendMessageGqlInput;
  /** Ticket priority (optional on create and update) */
  priority?: InputMaybe<TicketPriority>;
  /** Ticket title (required when creating a new ticket) */
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type SupportContactChannelGqlResponse = {
  __typename?: "SupportContactChannelGqlResponse";
  /** Short guidance for when to use this channel */
  description: Scalars["String"]["output"];
  /** Action URL for opening the channel */
  href: Scalars["String"]["output"];
  /** Whether the channel should be visible */
  isActive: Scalars["Boolean"]["output"];
  /** Whether the channel should be highlighted first */
  isPrimary: Scalars["Boolean"]["output"];
  /** Support channel display label */
  label: Scalars["String"]["output"];
  /** Support channel type */
  type: Scalars["String"]["output"];
  /** Human-readable support channel value */
  value: Scalars["String"]["output"];
};

export type SupportContactConfigGqlResponse = {
  __typename?: "SupportContactConfigGqlResponse";
  /** Support availability copy */
  availabilityLabel: Scalars["String"]["output"];
  /** Configured support contact channels */
  channels: Array<SupportContactChannelGqlResponse>;
  /** Contact channels section eyebrow */
  contactSectionEyebrow: Scalars["String"]["output"];
  /** Contact channels section heading */
  contactSectionHeading: Scalars["String"]["output"];
  /** Contact channels section subtitle */
  contactSectionSubtitle: Scalars["String"]["output"];
  /** Support page eyebrow */
  eyebrow: Scalars["String"]["output"];
  /** FAQ card description for the support page */
  faqDescription: Scalars["String"]["output"];
  /** Configurable FAQ page content */
  faqPage: SupportFaqPageGqlResponse;
  /** FAQ card title for the support page */
  faqTitle: Scalars["String"]["output"];
  /** Support page heading */
  heading: Scalars["String"]["output"];
  /** Helpful preparation tips before contacting support */
  quickTips: Array<Scalars["String"]["output"]>;
  /** Expected response time copy */
  responseTimeLabel: Scalars["String"]["output"];
  /** Support page subtitle */
  subtitle: Scalars["String"]["output"];
  /** Quick tips section eyebrow */
  tipsEyebrow: Scalars["String"]["output"];
  /** Quick tips section heading */
  tipsHeading: Scalars["String"]["output"];
};

export type SupportFaqItemGqlResponse = {
  __typename?: "SupportFaqItemGqlResponse";
  /** FAQ answer */
  answer: Scalars["String"]["output"];
  /** FAQ item id */
  id: Scalars["String"]["output"];
  /** FAQ question */
  question: Scalars["String"]["output"];
};

export type SupportFaqPageGqlResponse = {
  __typename?: "SupportFaqPageGqlResponse";
  /** FAQ empty state action label */
  emptyActionLabel: Scalars["String"]["output"];
  /** FAQ empty state description */
  emptyDescription: Scalars["String"]["output"];
  /** FAQ empty state title */
  emptyTitle: Scalars["String"]["output"];
  /** FAQ page eyebrow */
  eyebrow: Scalars["String"]["output"];
  /** FAQ page heading */
  heading: Scalars["String"]["output"];
  /** FAQ inline no-results label */
  noResultsLabel: Scalars["String"]["output"];
  /** FAQ search result count label */
  resultCountLabel: Scalars["String"]["output"];
  /** FAQ search label */
  searchLabel: Scalars["String"]["output"];
  /** FAQ search placeholder */
  searchPlaceholder: Scalars["String"]["output"];
  /** FAQ page sections */
  sections: Array<SupportFaqSectionGqlResponse>;
  /** FAQ page subtitle */
  subtitle: Scalars["String"]["output"];
};

export type SupportFaqSectionGqlResponse = {
  __typename?: "SupportFaqSectionGqlResponse";
  /** FAQ section description */
  description: Scalars["String"]["output"];
  /** FAQ section id */
  id: Scalars["String"]["output"];
  /** FAQ section items */
  items: Array<SupportFaqItemGqlResponse>;
  /** FAQ section title */
  title: Scalars["String"]["output"];
};

/** Support ticket category */
export const TicketCategory = {
  ACCOUNT: "ACCOUNT",
  BUG: "BUG",
  OTHER: "OTHER",
  PAYMENT: "PAYMENT",
  PRODUCT: "PRODUCT",
  TECHNICAL: "TECHNICAL",
} as const;

export type TicketCategory = (typeof TicketCategory)[keyof typeof TicketCategory];
/** Actor type that closed a support ticket */
export const TicketClosedBy = {
  END_USER: "END_USER",
  SUPPORT: "SUPPORT",
  SYSTEM: "SYSTEM",
} as const;

export type TicketClosedBy = (typeof TicketClosedBy)[keyof typeof TicketClosedBy];
export type TicketDetailGqlInput = {
  /** Ticket ID */
  id: Scalars["ID"]["input"];
};

export type TicketListFilterInput = {
  /** Filter tickets containing this attachment file ID */
  attachmentFileId?: InputMaybe<Scalars["ID"]["input"]>;
  /** Filter tickets by category */
  category?: InputMaybe<TicketCategory>;
  /** Filter tickets closed from this ISO date */
  closedAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter tickets closed until this ISO date */
  closedAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter tickets by close actor type */
  closedBy?: InputMaybe<TicketClosedBy>;
  /** Filter tickets by closer user ID */
  closedByUserId?: InputMaybe<Scalars["ID"]["input"]>;
  /** Filter tickets created from this ISO date */
  createdAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter tickets created until this ISO date */
  createdAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter tickets by creator user ID */
  createdByUserId?: InputMaybe<Scalars["ID"]["input"]>;
  /** Filter tickets by ID */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** Filter tickets by message body */
  messageBody?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter tickets by priority */
  priority?: InputMaybe<TicketPriority>;
  /** Search query that matches ticket title or message body */
  query?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter tickets by status */
  status?: InputMaybe<TicketStatus>;
  /** Filter tickets by title */
  title?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter tickets updated from this ISO date */
  updatedAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter tickets updated until this ISO date */
  updatedAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter tickets by last updater user ID */
  updatedByUserId?: InputMaybe<Scalars["ID"]["input"]>;
};

export type TicketListGqlInput = {
  /** Filter options for narrowing down the ticket list */
  filters?: InputMaybe<TicketListFilterInput>;
  /** Offset pagination and sorting options */
  options?: InputMaybe<TicketListOffsetPageOptionsParamsInput>;
};

export type TicketListGqlResponse = {
  __typename?: "TicketListGqlResponse";
  /** Ticket category */
  category: TicketCategory;
  /** Date when the ticket was closed */
  closedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Actor type that closed the ticket */
  closedBy?: Maybe<TicketClosedBy>;
  /** Minimal user that closed the ticket */
  closedByUser?: Maybe<TicketUserMinimalGqlResponse>;
  /** User ID that closed the ticket */
  closedByUserId?: Maybe<Scalars["ID"]["output"]>;
  /** Date when the ticket was created */
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Minimal user that created the ticket */
  createdByUser?: Maybe<TicketUserMinimalGqlResponse>;
  /** User ID that created the ticket */
  createdByUserId?: Maybe<Scalars["ID"]["output"]>;
  /** Ticket ID */
  id: Scalars["ID"]["output"];
  /** Ticket conversation messages */
  messages: Array<TicketMessageGqlResponse>;
  /** Ticket priority */
  priority: TicketPriority;
  /** Ticket lifecycle status */
  status: TicketStatus;
  /** Ticket title */
  title: Scalars["String"]["output"];
  /** Date when the ticket was last updated */
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Minimal user that last updated the ticket */
  updatedByUser?: Maybe<TicketUserMinimalGqlResponse>;
  /** User ID that last updated the ticket */
  updatedByUserId?: Maybe<Scalars["ID"]["output"]>;
};

export type TicketListOffsetPageOptionsParamsInput = {
  /** Maximum number of records to return */
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  /** Number of records to skip (offset) */
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  /** Sort options as a map of field names to sort order */
  sort?: InputMaybe<TicketListSortOptionInput>;
};

export type TicketListPaginatedOffsetGqlResponse = {
  __typename?: "TicketListPaginatedOffsetGqlResponse";
  /** List of support tickets */
  items: Array<TicketListSummaryGqlResponse>;
  /** Pagination metadata */
  pagination: PaginationOffsetResponse;
};

export type TicketListSortOptionInput = {
  /** Sort by ticket category */
  category?: InputMaybe<SortingOrder>;
  /** Sort by ticket close date */
  closedAt?: InputMaybe<SortingOrder>;
  /** Sort by ticket close actor */
  closedBy?: InputMaybe<SortingOrder>;
  /** Sort by creation date */
  createdAt?: InputMaybe<SortingOrder>;
  /** Sort by ticket priority */
  priority?: InputMaybe<SortingOrder>;
  /** Sort by ticket status */
  status?: InputMaybe<SortingOrder>;
  /** Sort by ticket title */
  title?: InputMaybe<SortingOrder>;
  /** Sort by last update date */
  updatedAt?: InputMaybe<SortingOrder>;
};

export type TicketListSummaryGqlResponse = {
  __typename?: "TicketListSummaryGqlResponse";
  /** Total number of attachments across messages */
  attachmentCount: Scalars["Int"]["output"];
  /** Ticket category */
  category: TicketCategory;
  /** Date when the ticket was closed */
  closedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Actor type that closed the ticket */
  closedBy?: Maybe<TicketClosedBy>;
  /** Minimal user that closed the ticket */
  closedByUser?: Maybe<TicketListUserSummaryGqlResponse>;
  /** User ID that closed the ticket */
  closedByUserId?: Maybe<Scalars["ID"]["output"]>;
  /** Date when the ticket was created */
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Minimal user that created the ticket */
  createdByUser?: Maybe<TicketListUserSummaryGqlResponse>;
  /** User ID that created the ticket */
  createdByUserId?: Maybe<Scalars["ID"]["output"]>;
  /** Ticket ID */
  id: Scalars["ID"]["output"];
  /** Body of the most recent message */
  lastMessageBody: Scalars["String"]["output"];
  /** Number of messages in the ticket */
  messageCount: Scalars["Int"]["output"];
  /** Ticket priority */
  priority: TicketPriority;
  /** Ticket lifecycle status */
  status: TicketStatus;
  /** Ticket title */
  title: Scalars["String"]["output"];
  /** Date when the ticket was last updated */
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Minimal user that last updated the ticket */
  updatedByUser?: Maybe<TicketListUserSummaryGqlResponse>;
  /** User ID that last updated the ticket */
  updatedByUserId?: Maybe<Scalars["ID"]["output"]>;
};

export type TicketListUserSummaryGqlResponse = {
  __typename?: "TicketListUserSummaryGqlResponse";
  /** User profile information for list display */
  profile?: Maybe<TicketListUserSummaryProfileGqlResponse>;
  /** Username */
  username?: Maybe<Scalars["String"]["output"]>;
};

export type TicketListUserSummaryProfileGqlResponse = {
  __typename?: "TicketListUserSummaryProfileGqlResponse";
  /** User's first name */
  firstName?: Maybe<Scalars["String"]["output"]>;
  /** User's last name */
  lastName?: Maybe<Scalars["String"]["output"]>;
};

export type TicketMessageGqlResponse = {
  __typename?: "TicketMessageGqlResponse";
  /** Minimal stored file metadata for message attachments */
  attachmentFiles: Array<TicketStoredFileMinimalGqlResponse>;
  /** Ticket message body */
  body: Scalars["String"]["output"];
  /** Minimal user that sent this message */
  senderUser?: Maybe<TicketUserMinimalGqlResponse>;
  /** Date and time when the message was sent */
  sentAt?: Maybe<Scalars["DateTime"]["output"]>;
};

/** Support ticket priority */
export const TicketPriority = {
  HIGH: "HIGH",
  LOW: "LOW",
  MEDIUM: "MEDIUM",
} as const;

export type TicketPriority = (typeof TicketPriority)[keyof typeof TicketPriority];
export type TicketSendMessageGqlInput = {
  /** Attachment stored file IDs for this message */
  attachmentFileIds?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  /** Message body to send with this ticket action */
  body: Scalars["String"]["input"];
};

/** Support ticket lifecycle status */
export const TicketStatus = {
  ANSWERED: "ANSWERED",
  CLOSED: "CLOSED",
  OPEN: "OPEN",
} as const;

export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];
export type TicketStoredFileMinimalGqlResponse = {
  __typename?: "TicketStoredFileMinimalGqlResponse";
  /** Signed access descriptor for reading the stored file */
  accessUrl?: Maybe<FileAccessUrlGqlResponse>;
  /** Stored file MIME type */
  mimeType?: Maybe<Scalars["String"]["output"]>;
  /** Stored file name */
  name?: Maybe<Scalars["String"]["output"]>;
  /** Stored file path */
  path?: Maybe<Scalars["String"]["output"]>;
  /** Stored file size in bytes */
  sizeBytes?: Maybe<Scalars["Float"]["output"]>;
};

export type TicketUserMinimalGqlResponse = {
  __typename?: "TicketUserMinimalGqlResponse";
  /** User ID */
  id: Scalars["ID"]["output"];
  /** User profile information */
  profile?: Maybe<TicketUserProfileMinimalGqlResponse>;
  /** Username */
  username?: Maybe<Scalars["String"]["output"]>;
};

export type TicketUserProfileMinimalGqlResponse = {
  __typename?: "TicketUserProfileMinimalGqlResponse";
  /** Signed access descriptor for the user's avatar */
  avatarAccessUrl?: Maybe<FileAccessUrlGqlResponse>;
  /** User's first name */
  firstName?: Maybe<Scalars["String"]["output"]>;
  /** User's last name */
  lastName?: Maybe<Scalars["String"]["output"]>;
};

export type UnregisterNativePushTokenGqlInput = {
  /** FCM device token to remove */
  token: Scalars["String"]["input"];
};

export type UnregisterPushSubscriptionGqlInput = {
  /** Push service endpoint URL to remove */
  endpoint: Scalars["String"]["input"];
};

export type UserCreateAnonymousGqlInput = {
  /** Client device and browser context captured at session creation time */
  clientContext?: InputMaybe<SessionClientContextGqlInput>;
};

export type UserCreateGqlInput = {
  /** Initial account password */
  password: Scalars["String"]["input"];
  /** Optional profile fields for the new user */
  profile?: InputMaybe<UserUpdateProfileGqlInput>;
  /** Roles assigned to the user */
  roles: Array<UserRole>;
  /** Initial user account status */
  status?: InputMaybe<UserStatus>;
  /** Unique username */
  username: Scalars["String"]["input"];
};

export type UserDetailGqlInput = {
  /** User ID */
  id: Scalars["ID"]["input"];
};

export type UserForgotPasswordGqlInput = {
  /** Captcha challenge identifier issued by the backend */
  captchaId?: InputMaybe<Scalars["String"]["input"]>;
  /** Captcha answer entered by the user */
  captchaValue?: InputMaybe<Scalars["String"]["input"]>;
  /** User identity: registered username, email, or phone number */
  identity: Scalars["String"]["input"];
};

export type UserListFilterInput = {
  /** Filter users created from this ISO date */
  createdAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter users created until this ISO date */
  createdAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter users by email */
  email?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter users by first name */
  firstName?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter users by first name or last name */
  fullName?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter users by ID */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** Filter users by last name */
  lastName?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter users by mobile phone number */
  mobilePhone?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter users by phone number */
  phoneNumber?: InputMaybe<Scalars["String"]["input"]>;
  /** Search query that matches username, first name, last name, email, or phone number */
  query?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter users by role */
  role?: InputMaybe<UserRole>;
  /** Filter users by account status */
  status?: InputMaybe<UserStatus>;
  /** Filter users updated from this ISO date */
  updatedAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter users updated until this ISO date */
  updatedAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter users by username */
  username?: InputMaybe<Scalars["String"]["input"]>;
};

export type UserListGqlInput = {
  /** Filter options for narrowing down the user list */
  filters?: InputMaybe<UserListFilterInput>;
  /** Pagination and sorting options */
  options?: InputMaybe<UserListOffsetPageOptionsParamsInput>;
};

export type UserListGqlResponse = {
  __typename?: "UserListGqlResponse";
  /** Date when the user was created */
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** User ID */
  id: Scalars["ID"]["output"];
  /** User profile details */
  profile?: Maybe<UserListProfileGqlResponse>;
  /** User roles */
  roles: Array<UserRole>;
  /** User account status */
  status: UserStatus;
  /** Date when the user was last updated */
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Username */
  username: Scalars["String"]["output"];
};

export type UserListOffsetPageOptionsParamsInput = {
  /** Maximum number of records to return */
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  /** Number of records to skip (offset) */
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  /** Sort options as a map of field names to sort order */
  sort?: InputMaybe<UserListSortOptionInput>;
};

export type UserListPaginatedOffsetGqlResponse = {
  __typename?: "UserListPaginatedOffsetGqlResponse";
  /** List of users */
  items: Array<UserListSummaryGqlResponse>;
  /** Pagination metadata */
  pagination: PaginationOffsetResponse;
};

export type UserListProfileGqlResponse = {
  __typename?: "UserListProfileGqlResponse";
  /** Signed access descriptor for the user's avatar */
  avatarAccessUrl?: Maybe<FileAccessUrlGqlResponse>;
  /** User biography */
  bio?: Maybe<Scalars["String"]["output"]>;
  /** User's email address */
  email?: Maybe<Scalars["String"]["output"]>;
  /** User's first name */
  firstName?: Maybe<Scalars["String"]["output"]>;
  /** User's last name */
  lastName?: Maybe<Scalars["String"]["output"]>;
  /** User's phone number */
  phoneNumber?: Maybe<Scalars["String"]["output"]>;
};

export type UserListSortOptionInput = {
  /** Sort by creation date */
  createdAt?: InputMaybe<SortingOrder>;
  /** Sort by email address */
  email?: InputMaybe<SortingOrder>;
  /** Sort by first name */
  firstName?: InputMaybe<SortingOrder>;
  /** Sort by last name */
  lastName?: InputMaybe<SortingOrder>;
  /** Sort by phone number */
  phoneNumber?: InputMaybe<SortingOrder>;
  /** Sort by account status */
  status?: InputMaybe<SortingOrder>;
  /** Sort by last update date */
  updatedAt?: InputMaybe<SortingOrder>;
  /** Sort by username */
  username?: InputMaybe<SortingOrder>;
};

export type UserListSummaryGqlResponse = {
  __typename?: "UserListSummaryGqlResponse";
  /** Date when the user was created */
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** User ID */
  id: Scalars["ID"]["output"];
  /** User profile details for list display */
  profile?: Maybe<UserListSummaryProfileGqlResponse>;
  /** User roles */
  roles: Array<UserRole>;
  /** User account status */
  status: UserStatus;
  /** Date when the user was last updated */
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Username */
  username: Scalars["String"]["output"];
};

export type UserListSummaryProfileGqlResponse = {
  __typename?: "UserListSummaryProfileGqlResponse";
  /** Signed access descriptor for the user's avatar */
  avatarAccessUrl?: Maybe<FileAccessUrlGqlResponse>;
  /** User biography */
  bio?: Maybe<Scalars["String"]["output"]>;
  /** User's email address */
  email?: Maybe<Scalars["String"]["output"]>;
  /** User's first name */
  firstName?: Maybe<Scalars["String"]["output"]>;
  /** User's last name */
  lastName?: Maybe<Scalars["String"]["output"]>;
  /** User's phone number */
  phoneNumber?: Maybe<Scalars["String"]["output"]>;
};

export type UserLoginCaptchaGqlResponse = {
  __typename?: "UserLoginCaptchaGqlResponse";
  /** Unique captcha identifier used for verification */
  captchaId: Scalars["String"]["output"];
  /** Captcha expiration time as ISO timestamp */
  expiresAtIso: Scalars["String"]["output"];
  /** Captcha image bytes encoded as Base64 string */
  imageBase64: Scalars["String"]["output"];
  /** Captcha image MIME type */
  imageMimeType: Scalars["String"]["output"];
};

export type UserLoginGqlInput = {
  /** Captcha challenge identifier issued by the backend */
  captchaId?: InputMaybe<Scalars["String"]["input"]>;
  /** Captcha answer entered by the user */
  captchaValue?: InputMaybe<Scalars["String"]["input"]>;
  /** Client device and browser context captured at login time */
  clientContext?: InputMaybe<SessionClientContextGqlInput>;
  /** User identity: registered username, email, or phone number */
  identity: Scalars["String"]["input"];
  /** User password */
  password: Scalars["String"]["input"];
  /** If true, the session will be remembered for a longer period (e.g., 30 days instead of 24 hours) */
  rememberMe?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UserLoginGqlResponse = {
  __typename?: "UserLoginGqlResponse";
  /** JWT access token */
  accessToken: Scalars["String"]["output"];
  /** User information */
  user: UserLoginUserGqlResponse;
};

export type UserLoginUserGqlResponse = {
  __typename?: "UserLoginUserGqlResponse";
  /** User ID */
  id: Scalars["ID"]["output"];
  /** User roles */
  roles: Array<UserRole>;
  /** User username */
  username: Scalars["String"]["output"];
};

export type UserMeGqlResponse = {
  __typename?: "UserMeGqlResponse";
  /** User ID */
  id: Scalars["ID"]["output"];
  /** User preferences */
  preferences?: Maybe<UserPreferencesGqlResponse>;
  /** User profile information */
  profile?: Maybe<UserProfileMinimalGqlResponse>;
  /** User roles */
  roles: Array<UserRole>;
  /** User status */
  status: UserStatus;
  /** User username */
  username: Scalars["String"]["output"];
  /** Email and mobile verification timestamps */
  verification: UserVerificationGqlResponse;
};

export type UserMinimalGqlResponse = {
  __typename?: "UserMinimalGqlResponse";
  /** User ID */
  id: Scalars["ID"]["output"];
  /** User profile information */
  profile?: Maybe<UserProfileMinimalGqlResponse>;
  /** User roles when explicitly loaded */
  roles?: Maybe<Array<UserRole>>;
};

export type UserMutationGqlResponse = {
  __typename?: "UserMutationGqlResponse";
  /** User ID */
  id: Scalars["ID"]["output"];
  /** User preferences */
  preferences?: Maybe<UserPreferencesGqlResponse>;
  /** User profile details */
  profile?: Maybe<UserListProfileGqlResponse>;
  /** User roles */
  roles: Array<UserRole>;
  /** User account status */
  status: UserStatus;
  /** Username */
  username: Scalars["String"]["output"];
};

export type UserPasswordResetGqlResponse = {
  __typename?: "UserPasswordResetGqlResponse";
  /** Operation message */
  message: Scalars["String"]["output"];
  /** Whether the operation was accepted */
  success: Scalars["Boolean"]["output"];
};

export type UserPreferencesGqlResponse = {
  __typename?: "UserPreferencesGqlResponse";
  /** User's preferred language */
  language?: Maybe<Scalars["String"]["output"]>;
  /** Whether notifications are enabled */
  notificationsEnabled: Scalars["Boolean"]["output"];
  /** User's theme preference */
  theme?: Maybe<Scalars["String"]["output"]>;
  /** User's timezone */
  timezone?: Maybe<Scalars["String"]["output"]>;
};

export type UserProductDetailGqlInput = {
  /** Product ID */
  id: Scalars["ID"]["input"];
};

export type UserProductDetailGqlResponse = {
  __typename?: "UserProductDetailGqlResponse";
  /** Signed access descriptors for product cover images */
  coverImageAccessUrls: Array<FileAccessUrlGqlResponse>;
  /** Computed discount for the lowest active color offer */
  discount?: Maybe<UserProductListDiscountGqlResponse>;
  /** Active fabric pattern and color options selectable by users */
  fabrics: Array<ProductFabricGqlResponse>;
  /** Full product description */
  fullDescription?: Maybe<Scalars["String"]["output"]>;
  /** Product ID */
  id: Scalars["ID"]["output"];
  /** Whether the display price resolves to zero. Does not gate catalog access. */
  isFree: Scalars["Boolean"]["output"];
  /** Whether the current END_USER has a paid purchase for this product */
  isPurchased: Scalars["Boolean"]["output"];
  /** Whether learners can submit reviews for this product */
  isReviewSubmissionEnabled: Scalars["Boolean"]["output"];
  /** Whether the reviews section is visible on the product detail page */
  isReviewsSectionVisible: Scalars["Boolean"]["output"];
  /** Material and texture profile */
  materialProfile?: Maybe<ProductMaterialProfileGqlResponse>;
  /** Minimum active color price in IRT */
  priceIrt?: Maybe<Scalars["Float"]["output"]>;
  /** Current END_USER purchase status for this product, if any */
  purchaseStatus?: Maybe<UserProductPurchaseStatus>;
  /** Set pieces included in this product */
  setPieces: Array<ProductSetPieceGqlResponse>;
  /** Short product summary */
  summary?: Maybe<Scalars["String"]["output"]>;
  /** Product tags */
  tags: Array<Scalars["String"]["output"]>;
  /** Product title */
  title: Scalars["String"]["output"];
};

export type UserProductListDiscountGqlResponse = {
  __typename?: "UserProductListDiscountGqlResponse";
  /** Discount calculation type */
  type: ProductDiscountType;
  /** Discount value. Percentage for PERCENTAGE, IRT amount for FIXED_AMOUNT_IRT */
  value: Scalars["Float"]["output"];
};

export type UserProductListGqlResponse = {
  __typename?: "UserProductListGqlResponse";
  /** Signed access descriptors for product cover images */
  coverImageAccessUrls: Array<FileAccessUrlGqlResponse>;
  /** Computed discount for the lowest active color offer */
  discount?: Maybe<UserProductListDiscountGqlResponse>;
  /** Product ID */
  id: Scalars["ID"]["output"];
  /** Whether the current END_USER has a paid purchase for this product */
  isPurchased: Scalars["Boolean"]["output"];
  /** Minimum active color price in IRT */
  priceIrt?: Maybe<Scalars["Float"]["output"]>;
  /** Short product summary */
  summary?: Maybe<Scalars["String"]["output"]>;
  /** Product tags */
  tags: Array<Scalars["String"]["output"]>;
  /** Product title */
  title: Scalars["String"]["output"];
};

export type UserProductListPaginatedCursorGqlResponse = {
  __typename?: "UserProductListPaginatedCursorGqlResponse";
  /** List of products for anonymous and end-user views */
  items: Array<UserProductListGqlResponse>;
  /** Pagination metadata */
  pagination: PaginationCursorResponse;
};

/** Supported product payment methods */
export const UserProductPaymentMethod = {
  CARD_TO_CARD: "CARD_TO_CARD",
  CRYPTOCURRENCY: "CRYPTOCURRENCY",
  FREE: "FREE",
  GATEWAY: "GATEWAY",
} as const;

export type UserProductPaymentMethod =
  (typeof UserProductPaymentMethod)[keyof typeof UserProductPaymentMethod];
/** Currency used for product purchases */
export const UserProductPurchaseCurrency = {
  IRT: "IRT",
  USDT: "USDT",
} as const;

export type UserProductPurchaseCurrency =
  (typeof UserProductPurchaseCurrency)[keyof typeof UserProductPurchaseCurrency];
/** Product purchase lifecycle status */
export const UserProductPurchaseStatus = {
  CANCELLED: "CANCELLED",
  FAILED: "FAILED",
  PAID: "PAID",
  PENDING: "PENDING",
  PENDING_GATEWAY: "PENDING_GATEWAY",
  REFUNDED: "REFUNDED",
} as const;

export type UserProductPurchaseStatus =
  (typeof UserProductPurchaseStatus)[keyof typeof UserProductPurchaseStatus];
export type UserProductReviewAuthorGqlResponse = {
  __typename?: "UserProductReviewAuthorGqlResponse";
  /** Review author's first name from the user profile */
  firstName: Scalars["String"]["output"];
};

export type UserProductReviewListCursorPageOptionsParamsInput = {
  /** Maximum number of records to return */
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  /** Sort options as a map of field names to sort order */
  sort?: InputMaybe<UserProductReviewListSortOptionInput>;
  /** Cursor to start after. Uses the beginning if omitted */
  startCursor?: InputMaybe<Scalars["ID"]["input"]>;
};

export type UserProductReviewListFilterInput = {
  /** Product ID to list reviews for */
  productId: Scalars["ID"]["input"];
  /** Filter reviews by exact star rating */
  stars?: InputMaybe<Scalars["Int"]["input"]>;
};

export type UserProductReviewListGqlInput = {
  /** Filter options for narrowing down the product review list */
  filters: UserProductReviewListFilterInput;
  /** Cursor pagination and sorting options */
  options?: InputMaybe<UserProductReviewListCursorPageOptionsParamsInput>;
};

export type UserProductReviewListGqlResponse = {
  __typename?: "UserProductReviewListGqlResponse";
  /** Sanitized review author information */
  author: UserProductReviewAuthorGqlResponse;
  /** Product review thread ID */
  id: Scalars["ID"]["output"];
  /** Whether this review thread belongs to the current user */
  isMine: Scalars["Boolean"]["output"];
  /** Whether the current user's rating exists but is hidden from their view */
  isRatingHidden: Scalars["Boolean"]["output"];
  /** Whether the current user is blocked from submitting updates because the review thread is hidden */
  isSubmissionBlocked: Scalars["Boolean"]["output"];
  /** Public follow-up comments and support messages with PUBLIC moderation */
  messages: Array<UserProductReviewMessageGqlResponse>;
  /** Rating visible when its moderation visibility is PUBLIC */
  rating?: Maybe<UserProductReviewRatingGqlResponse>;
};

export type UserProductReviewListPaginatedCursorGqlResponse = {
  __typename?: "UserProductReviewListPaginatedCursorGqlResponse";
  /** Product reviews visible to the current END_USER */
  items: Array<UserProductReviewListGqlResponse>;
  /** Pagination metadata */
  pagination: PaginationCursorResponse;
  /** Aggregated public rating summary excluding hidden reviews and hidden ratings */
  summary: ProductReviewRatingSummaryGqlResponse;
};

export type UserProductReviewListSortOptionInput = {
  /** Sort by thread creation date */
  createdAt?: InputMaybe<SortingOrder>;
  /** Sort by rating submission date */
  ratedAt?: InputMaybe<SortingOrder>;
  /** Sort by star rating */
  stars?: InputMaybe<SortingOrder>;
  /** Sort by thread last update date */
  updatedAt?: InputMaybe<SortingOrder>;
};

export type UserProductReviewMessageGqlResponse = {
  __typename?: "UserProductReviewMessageGqlResponse";
  /** Message body */
  body: Scalars["String"]["output"];
  /** Stable message key generated by the database */
  key: Scalars["String"]["output"];
  /** Sanitized sender information */
  sender: UserProductReviewMessageSenderGqlResponse;
  /** Date when the message was sent */
  sentAt: Scalars["DateTime"]["output"];
};

export type UserProductReviewMessageSenderGqlResponse = {
  __typename?: "UserProductReviewMessageSenderGqlResponse";
  /** Message sender first name from the user profile */
  firstName: Scalars["String"]["output"];
  /** Whether the message was sent by support staff rather than the review author */
  isSupport: Scalars["Boolean"]["output"];
};

export type UserProductReviewRatingGqlResponse = {
  __typename?: "UserProductReviewRatingGqlResponse";
  /** Optional review comment */
  comment?: Maybe<Scalars["String"]["output"]>;
  /** Date when the rating was first submitted */
  ratedAt: Scalars["DateTime"]["output"];
  /** Star rating from 1 to 5 */
  stars: Scalars["Int"]["output"];
  /** Date when the rating was last updated */
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
};

export type UserProfileMinimalGqlResponse = {
  __typename?: "UserProfileMinimalGqlResponse";
  /** Signed access descriptor for the user's avatar */
  avatarAccessUrl?: Maybe<FileAccessUrlGqlResponse>;
  /** User biography */
  bio?: Maybe<Scalars["String"]["output"]>;
  /** User's email address */
  email?: Maybe<Scalars["String"]["output"]>;
  /** User's first name */
  firstName?: Maybe<Scalars["String"]["output"]>;
  /** User's last name */
  lastName?: Maybe<Scalars["String"]["output"]>;
  /** User's phone number */
  phoneNumber?: Maybe<Scalars["String"]["output"]>;
};

export type UserProfileUpdateGqlInput = {
  /** Current account password. Required when changing password. */
  currentPassword?: InputMaybe<Scalars["String"]["input"]>;
  /** New password. When provided, active sessions are revoked. */
  password?: InputMaybe<Scalars["String"]["input"]>;
  /** Preference fields to update */
  preferences?: InputMaybe<UserUpdatePreferencesGqlInput>;
  /** Profile fields to update */
  profile?: InputMaybe<UserUpdateProfileGqlInput>;
  /** Unique username */
  username?: InputMaybe<Scalars["String"]["input"]>;
};

export type UserRequestLoginCodeGqlInput = {
  /** User identity: registered username, email, or phone number */
  identity: Scalars["String"]["input"];
};

export type UserRequestLoginCodeGqlResponse = {
  __typename?: "UserRequestLoginCodeGqlResponse";
  /** Operation message */
  message: Scalars["String"]["output"];
  /** Whether a login code was created and queued */
  success: Scalars["Boolean"]["output"];
};

export type UserRequestSignupCodeGqlInput = {
  /** Mobile phone number for signup verification code */
  mobile: Scalars["String"]["input"];
};

export type UserResetPasswordGqlInput = {
  /** Username, email, or phone number used when requesting the password reset code */
  identity: Scalars["String"]["input"];
  /** New account password */
  newPassword: Scalars["String"]["input"];
  /** One-time password reset code sent by email */
  otp: Scalars["String"]["input"];
};

export type UserResolveAuthIdentityGqlResponse = {
  __typename?: "UserResolveAuthIdentityGqlResponse";
  /** Whether the identity already belongs to an account */
  exists: Scalars["Boolean"]["output"];
};

/** Role of the user in the system */
export const UserRole = {
  ANONYMOUS: "ANONYMOUS",
  END_USER: "END_USER",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export type UserSignupGqlInput = {
  /** Captcha challenge identifier issued by the backend */
  captchaId?: InputMaybe<Scalars["String"]["input"]>;
  /** Captcha answer entered by the user */
  captchaValue?: InputMaybe<Scalars["String"]["input"]>;
  /** Client device and browser context captured at signup time */
  clientContext?: InputMaybe<SessionClientContextGqlInput>;
  /** Email address */
  email?: InputMaybe<Scalars["String"]["input"]>;
  /** Mobile phone number */
  mobile?: InputMaybe<Scalars["String"]["input"]>;
  /** Account password for signup */
  password?: InputMaybe<Scalars["String"]["input"]>;
  /** Profile data for signup (first name required; last name optional) */
  profile: UserSignupProfileGqlInput;
  /** If true, the newly-created session will be remembered longer (e.g. 30 days) */
  rememberMe?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** SMS verification code for mobile signup without password */
  signupCode?: InputMaybe<Scalars["String"]["input"]>;
  /** Preferred unique username */
  username?: InputMaybe<Scalars["String"]["input"]>;
};

export type UserSignupProfileGqlInput = {
  /** User first name */
  firstName: Scalars["String"]["input"];
  /** User last name */
  lastName?: InputMaybe<Scalars["String"]["input"]>;
};

/** Status of the user account */
export const UserStatus = {
  ACTIVE: "ACTIVE",
  BANNED: "BANNED",
  DEACTIVE: "DEACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
export type UserTicketDetailGqlInput = {
  /** Ticket ID */
  id: Scalars["ID"]["input"];
};

export type UserTicketListFilterInput = {
  /** Filter tickets containing this attachment file ID */
  attachmentFileId?: InputMaybe<Scalars["ID"]["input"]>;
  /** Filter tickets by category */
  category?: InputMaybe<TicketCategory>;
  /** Filter tickets closed from this ISO date */
  closedAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter tickets closed until this ISO date */
  closedAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter tickets by close actor type */
  closedBy?: InputMaybe<TicketClosedBy>;
  /** Filter tickets created from this ISO date */
  createdAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter tickets created until this ISO date */
  createdAtTo?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter tickets by ID */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** Filter tickets by message body */
  messageBody?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter tickets by priority */
  priority?: InputMaybe<TicketPriority>;
  /** Search query that matches ticket title or message body */
  query?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter tickets by status */
  status?: InputMaybe<TicketStatus>;
  /** Filter tickets by title */
  title?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter tickets updated from this ISO date */
  updatedAtFrom?: InputMaybe<Scalars["String"]["input"]>;
  /** Filter tickets updated until this ISO date */
  updatedAtTo?: InputMaybe<Scalars["String"]["input"]>;
};

export type UserTicketListGqlInput = {
  /** Filter options for narrowing down the current user's tickets */
  filters?: InputMaybe<UserTicketListFilterInput>;
  /** Offset pagination and sorting options */
  options?: InputMaybe<TicketListOffsetPageOptionsParamsInput>;
};

export type UserTicketListGqlResponse = {
  __typename?: "UserTicketListGqlResponse";
  /** Ticket category */
  category: TicketCategory;
  /** Date when the ticket was closed */
  closedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Actor type that closed the ticket */
  closedBy?: Maybe<TicketClosedBy>;
  /** Date when the ticket was created */
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Minimal user that created the ticket */
  createdByUser?: Maybe<TicketUserMinimalGqlResponse>;
  /** User ID that created the ticket */
  createdByUserId?: Maybe<Scalars["ID"]["output"]>;
  /** Ticket ID */
  id: Scalars["ID"]["output"];
  /** Ticket conversation messages */
  messages: Array<UserTicketMessageGqlResponse>;
  /** Ticket priority */
  priority: TicketPriority;
  /** Ticket lifecycle status */
  status: TicketStatus;
  /** Ticket title */
  title: Scalars["String"]["output"];
  /** Date when the ticket was last updated */
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Minimal user that last updated the ticket */
  updatedByUser?: Maybe<TicketUserMinimalGqlResponse>;
  /** User ID that last updated the ticket */
  updatedByUserId?: Maybe<Scalars["ID"]["output"]>;
};

export type UserTicketListPaginatedOffsetGqlResponse = {
  __typename?: "UserTicketListPaginatedOffsetGqlResponse";
  /** List of current user's support tickets */
  items: Array<UserTicketListSummaryGqlResponse>;
  /** Pagination metadata */
  pagination: PaginationOffsetResponse;
};

export type UserTicketListSummaryGqlResponse = {
  __typename?: "UserTicketListSummaryGqlResponse";
  /** Total number of attachments across messages */
  attachmentCount: Scalars["Int"]["output"];
  /** Ticket category */
  category: TicketCategory;
  /** Date when the ticket was closed */
  closedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Actor type that closed the ticket */
  closedBy?: Maybe<TicketClosedBy>;
  /** Date when the ticket was created */
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** Ticket ID */
  id: Scalars["ID"]["output"];
  /** Body of the most recent message */
  lastMessageBody: Scalars["String"]["output"];
  /** Number of messages in the ticket */
  messageCount: Scalars["Int"]["output"];
  /** Ticket priority */
  priority: TicketPriority;
  /** Ticket lifecycle status */
  status: TicketStatus;
  /** Ticket title */
  title: Scalars["String"]["output"];
  /** Date when the ticket was last updated */
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
};

export type UserTicketMessageGqlResponse = {
  __typename?: "UserTicketMessageGqlResponse";
  /** Minimal stored file metadata for message attachments */
  attachmentFiles: Array<TicketStoredFileMinimalGqlResponse>;
  /** Ticket message body */
  body: Scalars["String"]["output"];
  /** Sanitized sender information for the current user */
  senderUser?: Maybe<UserTicketSenderGqlResponse>;
  /** Date and time when the message was sent */
  sentAt?: Maybe<Scalars["DateTime"]["output"]>;
};

export type UserTicketSendGqlInput = {
  /** Ticket category (required when creating a new ticket) */
  category?: InputMaybe<TicketCategory>;
  /** Ticket ID for updating an existing ticket. Omit to create a new ticket */
  id?: InputMaybe<Scalars["ID"]["input"]>;
  /** Message payload to append to ticket conversation */
  message: TicketSendMessageGqlInput;
  /** Ticket priority (optional on create and update) */
  priority?: InputMaybe<TicketPriority>;
  /** Ticket title (required when creating a new ticket) */
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UserTicketSenderGqlResponse = {
  __typename?: "UserTicketSenderGqlResponse";
  /** Sanitized sender profile information */
  profile?: Maybe<UserTicketSenderProfileGqlResponse>;
};

export type UserTicketSenderProfileGqlResponse = {
  __typename?: "UserTicketSenderProfileGqlResponse";
  /** Sender display first name */
  firstName?: Maybe<Scalars["String"]["output"]>;
};

export type UserUpdateGqlInput = {
  /** User ID */
  id: Scalars["ID"]["input"];
  /** New password. When provided, active sessions are revoked. */
  password?: InputMaybe<Scalars["String"]["input"]>;
  /** Preference fields to update */
  preferences?: InputMaybe<UserUpdatePreferencesGqlInput>;
  /** Profile fields to update */
  profile?: InputMaybe<UserUpdateProfileGqlInput>;
  /** Roles assigned to the user */
  roles?: InputMaybe<Array<UserRole>>;
  /** User account status */
  status?: InputMaybe<UserStatus>;
  /** Unique username */
  username?: InputMaybe<Scalars["String"]["input"]>;
};

export type UserUpdatePreferencesGqlInput = {
  /** User's preferred language */
  language?: InputMaybe<Scalars["String"]["input"]>;
  /** Whether notifications are enabled */
  notificationsEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** User's theme preference */
  theme?: InputMaybe<Scalars["String"]["input"]>;
  /** User's timezone */
  timezone?: InputMaybe<Scalars["String"]["input"]>;
};

export type UserUpdateProfileGqlInput = {
  /** Stored file ID used as the user's avatar */
  avatarFileId?: InputMaybe<Scalars["ID"]["input"]>;
  /** User biography */
  bio?: InputMaybe<Scalars["String"]["input"]>;
  /** User email address */
  email?: InputMaybe<Scalars["String"]["input"]>;
  /** User first name */
  firstName?: InputMaybe<Scalars["String"]["input"]>;
  /** User last name */
  lastName?: InputMaybe<Scalars["String"]["input"]>;
  /** User mobile phone number */
  phoneNumber?: InputMaybe<Scalars["String"]["input"]>;
};

export type UserVerificationGqlResponse = {
  __typename?: "UserVerificationGqlResponse";
  /** UTC timestamp when the user's email was verified */
  emailVerifiedAt?: Maybe<Scalars["DateTime"]["output"]>;
  /** UTC timestamp when the user's mobile number was verified */
  mobileVerifiedAt?: Maybe<Scalars["DateTime"]["output"]>;
};

export type UserVerifyLoginCodeGqlInput = {
  /** Client device and browser context captured at login time */
  clientContext?: InputMaybe<SessionClientContextGqlInput>;
  /** SMS one-time password */
  code: Scalars["String"]["input"];
  /** User identity used when requesting the login code */
  identity: Scalars["String"]["input"];
  /** If true, the session will be remembered for a longer period (e.g., 30 days instead of 24 hours) */
  rememberMe?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UserVerifyLoginCodeGqlResponse = {
  __typename?: "UserVerifyLoginCodeGqlResponse";
  /** JWT access token when verification succeeded */
  accessToken?: Maybe<Scalars["String"]["output"]>;
  /** Operation message */
  message: Scalars["String"]["output"];
  /** Whether the login code was accepted */
  success: Scalars["Boolean"]["output"];
  /** User ID when verification succeeded */
  userId?: Maybe<Scalars["ID"]["output"]>;
};

/** Supported video output container formats */
export const VideoOutputExtension = {
  AVI: "AVI",
  FLV: "FLV",
  M4V: "M4V",
  MKV: "MKV",
  MOV: "MOV",
  MP4: "MP4",
  TS: "TS",
  WEBM: "WEBM",
} as const;

export type VideoOutputExtension = (typeof VideoOutputExtension)[keyof typeof VideoOutputExtension];
export type AppSettingUpdateMutationVariables = Exact<{
  input: AppSettingUpdateGqlInput;
}>;

export type AppSettingUpdateMutation = {
  __typename?: "Mutation";
  appSettingUpdate: {
    __typename?: "AppSettingMutationGqlResponse";
    id: string;
    key: string;
    label: string;
    valueType: AppSettingValueType;
    value: any;
    description?: string | null;
    isActive: boolean;
    createdAt?: any | null;
    updatedAt?: any | null;
  };
};

export type BackupRunMutationVariables = Exact<{
  input: BackupRunGqlInput;
}>;

export type BackupRunMutation = {
  __typename?: "Mutation";
  backupRun: {
    __typename?: "BackupRunGqlResponse";
    items: Array<{
      __typename?: "BackupRunItemGqlResponse";
      target: BackupTarget;
      archiveFileName: string;
      archiveFormat: string;
      archivePartCount: number;
      formattedArchiveSize: string;
      durationMs: number;
      createdAt: any;
      telegramDelivered: boolean;
      telegramMessageId?: number | null;
      telegramDeliveryNote?: string | null;
      collectionCount?: number | null;
      documentCount?: number | null;
      objectCount?: number | null;
      fileRecordCount?: number | null;
    }>;
  };
};

export type CouponCreateMutationVariables = Exact<{
  input: CouponCreateGqlInput;
}>;

export type CouponCreateMutation = {
  __typename?: "Mutation";
  couponCreate: { __typename?: "CouponListGqlResponse"; id: string };
};

export type CouponDeleteMutationVariables = Exact<{
  input: CouponDeleteGqlInput;
}>;

export type CouponDeleteMutation = { __typename?: "Mutation"; couponDelete: boolean };

export type CouponUpdateMutationVariables = Exact<{
  input: CouponUpdateGqlInput;
}>;

export type CouponUpdateMutation = {
  __typename?: "Mutation";
  couponUpdate: { __typename?: "CouponListGqlResponse"; id: string };
};

export type GlobalAnouncementSendMutationVariables = Exact<{
  input: GlobalAnouncementSendGqlInput;
}>;

export type GlobalAnouncementSendMutation = {
  __typename?: "Mutation";
  globalAnouncementSend: {
    __typename?: "GlobalAnouncementSendGqlResponse";
    deliveredUsers: number;
    activeSubscribedUsers: number;
  };
};

export type RegisterNativePushTokenMutationVariables = Exact<{
  input: RegisterNativePushTokenGqlInput;
}>;

export type RegisterNativePushTokenMutation = {
  __typename?: "Mutation";
  registerNativePushToken: { __typename?: "PushSubscriptionMutationGqlResponse"; success: boolean };
};

export type UnregisterNativePushTokenMutationVariables = Exact<{
  input: UnregisterNativePushTokenGqlInput;
}>;

export type UnregisterNativePushTokenMutation = {
  __typename?: "Mutation";
  unregisterNativePushToken: {
    __typename?: "PushSubscriptionMutationGqlResponse";
    success: boolean;
  };
};

export type ProductCreateMutationVariables = Exact<{
  input: ProductCreateGqlInput;
}>;

export type ProductCreateMutation = {
  __typename?: "Mutation";
  productCreate: { __typename?: "ProductListGqlResponse"; id: string };
};

export type ProductDeleteMutationVariables = Exact<{
  input: ProductDeleteGqlInput;
}>;

export type ProductDeleteMutation = { __typename?: "Mutation"; productDelete: boolean };

export type ProductPurchaseSubmitMutationVariables = Exact<{
  input: ProductPurchaseSubmitGqlInput;
}>;

export type ProductPurchaseSubmitMutation = {
  __typename?: "Mutation";
  productPurchaseSubmit: {
    __typename?: "ProductPurchaseSubmitGqlResponse";
    id: string;
    productId: string;
    status: UserProductPurchaseStatus;
    paymentMethod: UserProductPaymentMethod;
    currency: UserProductPurchaseCurrency;
    amountIrt: number;
    discountAmountIrt?: number | null;
    finalAmountIrt: number;
    couponCode?: string | null;
    paymentReference?: string | null;
    transactionId?: string | null;
    paymentUrl?: string | null;
    paymentAuthority?: string | null;
    isPurchased: boolean;
  };
};

export type ProductReviewModerationUpdateMutationVariables = Exact<{
  input: ProductReviewModerationUpdateGqlInput;
}>;

export type ProductReviewModerationUpdateMutation = {
  __typename?: "Mutation";
  productReviewModerationUpdate: {
    __typename?: "ProductReviewListGqlResponse";
    id: string;
    moderation: {
      __typename?: "ProductReviewModerationGqlResponse";
      visibility: ProductReviewVisibility;
      hiddenAt?: any | null;
      hiddenReason?: string | null;
    };
    rating?: {
      __typename?: "ProductReviewRatingGqlResponse";
      stars: number;
      moderation: {
        __typename?: "ProductReviewModerationGqlResponse";
        visibility: ProductReviewVisibility;
        hiddenAt?: any | null;
        hiddenReason?: string | null;
      };
    } | null;
    messages: Array<{
      __typename?: "ProductReviewMessageGqlResponse";
      key: string;
      moderation: {
        __typename?: "ProductReviewModerationGqlResponse";
        visibility: ProductReviewVisibility;
        hiddenAt?: any | null;
        hiddenReason?: string | null;
      };
    }>;
  };
};

export type ProductReviewSubmitMutationVariables = Exact<{
  input: ProductReviewSubmitGqlInput;
}>;

export type ProductReviewSubmitMutation = {
  __typename?: "Mutation";
  productReviewSubmit: {
    __typename?: "ProductReviewSubmitGqlResponse";
    id: string;
    productId: string;
    isNewRating: boolean;
    rating?: {
      __typename?: "ProductReviewSubmitRatingGqlResponse";
      stars: number;
      comment?: string | null;
      ratedAt: any;
      updatedAt?: any | null;
    } | null;
  };
};

export type ProductUpdateMutationVariables = Exact<{
  input: ProductUpdateGqlInput;
}>;

export type ProductUpdateMutation = {
  __typename?: "Mutation";
  productUpdate: { __typename?: "ProductListGqlResponse"; id: string };
};

export type RegisterPushSubscriptionMutationVariables = Exact<{
  input: RegisterPushSubscriptionGqlInput;
}>;

export type RegisterPushSubscriptionMutation = {
  __typename?: "Mutation";
  registerPushSubscription: {
    __typename?: "PushSubscriptionMutationGqlResponse";
    success: boolean;
  };
};

export type UnregisterPushSubscriptionMutationVariables = Exact<{
  input: UnregisterPushSubscriptionGqlInput;
}>;

export type UnregisterPushSubscriptionMutation = {
  __typename?: "Mutation";
  unregisterPushSubscription: {
    __typename?: "PushSubscriptionMutationGqlResponse";
    success: boolean;
  };
};

export type ResolveAuthIdentityMutationVariables = Exact<{
  input: UserRequestLoginCodeGqlInput;
}>;

export type ResolveAuthIdentityMutation = {
  __typename?: "Mutation";
  resolveAuthIdentity: { __typename?: "UserResolveAuthIdentityGqlResponse"; exists: boolean };
};

export type TicketCloseMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type TicketCloseMutation = {
  __typename?: "Mutation";
  ticketClose: {
    __typename?: "TicketListGqlResponse";
    id: string;
    status: TicketStatus;
    closedBy?: TicketClosedBy | null;
    closedAt?: any | null;
  };
};

export type UserActivateAccountMutationVariables = Exact<{
  token: Scalars["String"]["input"];
}>;

export type UserActivateAccountMutation = {
  __typename?: "Mutation";
  userActivateAccount: {
    __typename?: "UserPasswordResetGqlResponse";
    success: boolean;
    message: string;
  };
};

export type UserCreateAnonymousMutationVariables = Exact<{
  input?: InputMaybe<UserCreateAnonymousGqlInput>;
}>;

export type UserCreateAnonymousMutation = {
  __typename?: "Mutation";
  userCreateAnonymous: {
    __typename?: "UserLoginGqlResponse";
    accessToken: string;
    user: {
      __typename?: "UserLoginUserGqlResponse";
      id: string;
      username: string;
      roles: Array<UserRole>;
    };
  };
};

export type UserForgotPasswordMutationVariables = Exact<{
  input: UserForgotPasswordGqlInput;
}>;

export type UserForgotPasswordMutation = {
  __typename?: "Mutation";
  userForgotPassword: {
    __typename?: "UserPasswordResetGqlResponse";
    success: boolean;
    message: string;
  };
};

export type UserLoginMutationVariables = Exact<{
  input: UserLoginGqlInput;
}>;

export type UserLoginMutation = {
  __typename?: "Mutation";
  userLogin: {
    __typename?: "UserLoginGqlResponse";
    accessToken: string;
    user: {
      __typename?: "UserLoginUserGqlResponse";
      id: string;
      username: string;
      roles: Array<UserRole>;
    };
  };
};

export type UserLogoutMutationVariables = Exact<{ [key: string]: never }>;

export type UserLogoutMutation = { __typename?: "Mutation"; userLogout: boolean };

export type UserNotificationUpdateMutationVariables = Exact<{
  input: NotificationUpdateGqlInput;
}>;

export type UserNotificationUpdateMutation = {
  __typename?: "Mutation";
  userNotificationUpdate: {
    __typename?: "NotificationUpdateGqlResponse";
    action: NotificationUpdateAction;
    notificationIds: Array<string>;
    requestedCount: number;
    matchedCount: number;
    modifiedCount: number;
    items: Array<{
      __typename?: "NotificationListGqlResponse";
      id: string;
      userId?: string | null;
      source: NotificationSource;
      mode: NotificationMode;
      title?: string | null;
      message: string;
      payload?: any | null;
      isRead: boolean;
      readAt?: any | null;
      archivedAt?: any | null;
      visibleUntil?: any | null;
      createdAt?: any | null;
      updatedAt?: any | null;
    }>;
  };
};

export type UserRequestEmailVerificationMutationVariables = Exact<{ [key: string]: never }>;

export type UserRequestEmailVerificationMutation = {
  __typename?: "Mutation";
  userRequestEmailVerification: {
    __typename?: "UserPasswordResetGqlResponse";
    success: boolean;
    message: string;
  };
};

export type UserRequestLoginCodeMutationVariables = Exact<{
  input: UserRequestLoginCodeGqlInput;
}>;

export type UserRequestLoginCodeMutation = {
  __typename?: "Mutation";
  requestLoginCode: {
    __typename?: "UserRequestLoginCodeGqlResponse";
    success: boolean;
    message: string;
  };
};

export type UserRequestSignupCodeMutationVariables = Exact<{
  input: UserRequestSignupCodeGqlInput;
}>;

export type UserRequestSignupCodeMutation = {
  __typename?: "Mutation";
  requestSignupCode: {
    __typename?: "UserRequestLoginCodeGqlResponse";
    success: boolean;
    message: string;
  };
};

export type UserResetPasswordMutationVariables = Exact<{
  input: UserResetPasswordGqlInput;
}>;

export type UserResetPasswordMutation = {
  __typename?: "Mutation";
  userResetPassword: {
    __typename?: "UserPasswordResetGqlResponse";
    success: boolean;
    message: string;
  };
};

export type UserSignupMutationVariables = Exact<{
  input: UserSignupGqlInput;
}>;

export type UserSignupMutation = {
  __typename?: "Mutation";
  userSignup: {
    __typename?: "UserLoginGqlResponse";
    accessToken: string;
    user: {
      __typename?: "UserLoginUserGqlResponse";
      id: string;
      username: string;
      roles: Array<UserRole>;
    };
  };
};

export type UserTicketCloseMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type UserTicketCloseMutation = {
  __typename?: "Mutation";
  userTicketClose: {
    __typename?: "UserTicketListGqlResponse";
    id: string;
    status: TicketStatus;
    closedBy?: TicketClosedBy | null;
    closedAt?: any | null;
  };
};

export type UserVerifyLoginCodeMutationVariables = Exact<{
  input: UserVerifyLoginCodeGqlInput;
}>;

export type UserVerifyLoginCodeMutation = {
  __typename?: "Mutation";
  verifyLoginCode: {
    __typename?: "UserVerifyLoginCodeGqlResponse";
    success: boolean;
    message: string;
    userId?: string | null;
    accessToken?: string | null;
  };
};

export type AppAboutPageConfigQueryVariables = Exact<{ [key: string]: never }>;

export type AppAboutPageConfigQuery = {
  __typename?: "Query";
  appAboutPageConfig: { __typename?: "AppAboutPageConfigGqlResponse"; html: string };
};

export type AppPrivacyPolicyPageConfigQueryVariables = Exact<{ [key: string]: never }>;

export type AppPrivacyPolicyPageConfigQuery = {
  __typename?: "Query";
  appPrivacyPolicyPageConfig: {
    __typename?: "AppPrivacyPolicyPageConfigGqlResponse";
    html: string;
  };
};

export type AppSettingDetailQueryVariables = Exact<{
  input: AppSettingDetailGqlInput;
}>;

export type AppSettingDetailQuery = {
  __typename?: "Query";
  appSettingDetail: {
    __typename?: "AppSettingMutationGqlResponse";
    id: string;
    key: string;
    label: string;
    valueType: AppSettingValueType;
    value: any;
    description?: string | null;
    isActive: boolean;
    createdAt?: any | null;
    updatedAt?: any | null;
  };
};

export type AppSettingKeyListQueryVariables = Exact<{
  input: AppSettingKeyListGqlInput;
}>;

export type AppSettingKeyListQuery = {
  __typename?: "Query";
  appSettingKeyList: {
    __typename?: "AppSettingKeyListPaginatedOffsetGqlResponse";
    items: Array<{
      __typename?: "AppSettingKeyListSummaryGqlResponse";
      id: string;
      key: string;
      label: string;
      valueType: AppSettingValueType;
      description?: string | null;
      isActive: boolean;
      createdAt?: any | null;
      updatedAt?: any | null;
    }>;
    pagination: {
      __typename?: "PaginationOffsetResponse";
      limit: number;
      skip: number;
      total: number;
      count: number;
    };
  };
};

export type AppTermsOfUsePageConfigQueryVariables = Exact<{ [key: string]: never }>;

export type AppTermsOfUsePageConfigQuery = {
  __typename?: "Query";
  appTermsOfUsePageConfig: { __typename?: "AppTermsOfUsePageConfigGqlResponse"; html: string };
};

export type BadgeCountQueryVariables = Exact<{ [key: string]: never }>;

export type BadgeCountQuery = {
  __typename?: "Query";
  badgeCount: {
    __typename?: "BadgeCountGqlResponse";
    products: number;
    payments?: number | null;
    notifications?: number | null;
    tickets?: number | null;
    inquiries?: number | null;
  };
};

export type CouponDetailQueryVariables = Exact<{
  input: CouponDetailGqlInput;
}>;

export type CouponDetailQuery = {
  __typename?: "Query";
  couponDetail: {
    __typename?: "CouponListGqlResponse";
    id: string;
    code: string;
    title: string;
    description?: string | null;
    discountType: CouponDiscountType;
    discountValue: number;
    startsAt?: any | null;
    expiresAt?: any | null;
    totalUsageLimit?: number | null;
    perUserUsageLimit?: number | null;
    applicableProductIds: Array<string>;
    isFirstPurchaseOnly: boolean;
    isActive: boolean;
    totalUsageCount: number;
    remainingTotalUsageCount?: number | null;
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt?: any | null;
    updatedAt?: any | null;
  };
};

export type CouponListQueryVariables = Exact<{
  input: CouponListGqlInput;
}>;

export type CouponListQuery = {
  __typename?: "Query";
  couponList: {
    __typename?: "CouponListPaginatedOffsetGqlResponse";
    items: Array<{
      __typename?: "CouponListSummaryGqlResponse";
      id: string;
      code: string;
      title: string;
      discountType: CouponDiscountType;
      discountValue: number;
      startsAt?: any | null;
      expiresAt?: any | null;
      isFirstPurchaseOnly: boolean;
      isActive: boolean;
      totalUsageCount: number;
      remainingTotalUsageCount?: number | null;
      createdAt?: any | null;
      updatedAt?: any | null;
    }>;
    pagination: {
      __typename?: "PaginationOffsetResponse";
      limit: number;
      skip: number;
      total: number;
      count: number;
    };
  };
};

export type CouponValidateQueryVariables = Exact<{
  input: CouponValidateGqlInput;
}>;

export type CouponValidateQuery = {
  __typename?: "Query";
  couponValidate: {
    __typename?: "CouponValidateGqlResponse";
    isValid: boolean;
    message?: string | null;
    couponId?: string | null;
    code?: string | null;
    title?: string | null;
    discountType?: CouponDiscountType | null;
    discountValue?: number | null;
    amountIrt?: number | null;
    productDiscountAmountIrt?: number | null;
    payableAmountBeforeCouponIrt?: number | null;
    couponDiscountAmountIrt?: number | null;
    finalAmountIrt?: number | null;
  };
};

export type PaymentCheckoutConfigQueryVariables = Exact<{ [key: string]: never }>;

export type PaymentCheckoutConfigQuery = {
  __typename?: "Query";
  paymentCheckoutConfig: {
    __typename?: "PaymentCheckoutConfigGqlResponse";
    paymentCards: Array<{
      __typename?: "PaymentCheckoutCardGqlResponse";
      cardNumber: string;
      holderName: string;
      bankName: string;
    }>;
    cryptoWallets: Array<{
      __typename?: "PaymentCheckoutCryptoWalletGqlResponse";
      address: string;
      network: string;
    }>;
    paymentMethods: Array<{
      __typename?: "PaymentCheckoutMethodGqlResponse";
      method: UserProductPaymentMethod;
      isVisible: boolean;
      isActive: boolean;
      isRecommended: boolean;
    }>;
    usdtIrtRate: {
      __typename?: "PaymentCheckoutUsdtIrtRateGqlResponse";
      valueIrt: number;
      feeUsdt: number;
      coefficient: number;
    };
  };
};

export type ProductAiPreviewStagingDurationQueryVariables = Exact<{ [key: string]: never }>;

export type ProductAiPreviewStagingDurationQuery = {
  __typename?: "Query";
  productAiPreviewStagingDuration: {
    __typename?: "ProductAiPreviewStagingDurationGqlResponse";
    durationSeconds: number;
  };
};

export type ProductDeleteDependenciesQueryVariables = Exact<{
  input: ProductDeleteGqlInput;
}>;

export type ProductDeleteDependenciesQuery = {
  __typename?: "Query";
  productDeleteDependencies: {
    __typename?: "ProductDeleteDependenciesGqlResponse";
    productId: string;
    productTitle: string;
    summary: {
      __typename?: "ProductDeleteDependenciesSummaryGqlResponse";
      retainedCount: number;
      removedCount: number;
      hasRetainedDependencies: boolean;
      hasRemovedDependencies: boolean;
    };
    groups: Array<{
      __typename?: "ProductDeleteDependencyGroupGqlResponse";
      key: string;
      impact: ProductDeleteDependencyImpact;
      totalCount: number;
      hiddenSampleCount: number;
      breakdown: Array<{
        __typename?: "ProductDeleteDependencyBreakdownGqlResponse";
        key: string;
        count: number;
      }>;
      samples: Array<{
        __typename?: "ProductDeleteDependencySampleGqlResponse";
        id?: string | null;
        label: string;
        meta?: string | null;
      }>;
    }>;
  };
};

export type ProductPaymentListQueryVariables = Exact<{
  input: ProductPaymentListGqlInput;
}>;

export type ProductPaymentListQuery = {
  __typename?: "Query";
  productPaymentList: {
    __typename?: "ProductPaymentListPaginatedOffsetGqlResponse";
    items: Array<{
      __typename?: "ProductPaymentListSummaryGqlResponse";
      id: string;
      userId: string;
      productId: string;
      status: UserProductPurchaseStatus;
      paymentMethod: UserProductPaymentMethod;
      currency: UserProductPurchaseCurrency;
      paymentProvider?: string | null;
      paymentReference?: string | null;
      transactionId?: string | null;
      amountIrt: number;
      discountPercentage?: number | null;
      discountAmountIrt?: number | null;
      finalAmountIrt: number;
      receiptUploadedBy?: string | null;
      isManualStatusChange: boolean;
      manualStatusChangedBy?: string | null;
      manualStatusChangedDescription?: string | null;
      createdAt?: any | null;
      updatedAt?: any | null;
      pendingAt?: any | null;
      gatewayPendingAt?: any | null;
      paidAt?: any | null;
      failedAt?: any | null;
      refundedAt?: any | null;
      cancelledAt?: any | null;
      user: {
        __typename?: "ProductPaymentListUserSummaryGqlResponse";
        fullName: string;
        username: string;
        email: string;
        phone?: string | null;
        mobilePhone?: string | null;
      };
      product: { __typename?: "ProductPaymentListProductSummaryGqlResponse"; title: string };
      coupon?: {
        __typename?: "ProductPaymentListCouponSummaryGqlResponse";
        couponId: string;
        code: string;
        discountType: CouponDiscountType;
        discountValue: number;
      } | null;
      uploadedReceiptFile?: {
        __typename?: "ProductPaymentListReceiptFileSummaryGqlResponse";
        accessUrl?: { __typename?: "FileAccessUrlGqlResponse"; fileId: string } | null;
      } | null;
    }>;
    pagination: {
      __typename?: "PaginationOffsetResponse";
      limit: number;
      skip: number;
      total: number;
      count: number;
    };
  };
};

export type PushNotificationConfigQueryVariables = Exact<{ [key: string]: never }>;

export type PushNotificationConfigQuery = {
  __typename?: "Query";
  pushNotificationConfig: {
    __typename?: "PushNotificationConfigGqlResponse";
    enabled: boolean;
    publicKey?: string | null;
    nativePushEnabled: boolean;
  };
};

export type SupportContactConfigQueryVariables = Exact<{ [key: string]: never }>;

export type SupportContactConfigQuery = {
  __typename?: "Query";
  supportContactConfig: {
    __typename?: "SupportContactConfigGqlResponse";
    eyebrow: string;
    heading: string;
    subtitle: string;
    availabilityLabel: string;
    responseTimeLabel: string;
    faqTitle: string;
    faqDescription: string;
    contactSectionEyebrow: string;
    contactSectionHeading: string;
    contactSectionSubtitle: string;
    tipsEyebrow: string;
    tipsHeading: string;
    quickTips: Array<string>;
    channels: Array<{
      __typename?: "SupportContactChannelGqlResponse";
      type: string;
      label: string;
      value: string;
      href: string;
      description: string;
      isActive: boolean;
      isPrimary: boolean;
    }>;
    faqPage: {
      __typename?: "SupportFaqPageGqlResponse";
      eyebrow: string;
      heading: string;
      subtitle: string;
      searchLabel: string;
      searchPlaceholder: string;
      resultCountLabel: string;
      noResultsLabel: string;
      emptyTitle: string;
      emptyDescription: string;
      emptyActionLabel: string;
      sections: Array<{
        __typename?: "SupportFaqSectionGqlResponse";
        id: string;
        title: string;
        description: string;
        items: Array<{
          __typename?: "SupportFaqItemGqlResponse";
          id: string;
          question: string;
          answer: string;
        }>;
      }>;
    };
  };
};

export type TicketListQueryVariables = Exact<{
  input: TicketListGqlInput;
}>;

export type TicketListQuery = {
  __typename?: "Query";
  ticketList: {
    __typename?: "TicketListPaginatedOffsetGqlResponse";
    items: Array<{
      __typename?: "TicketListSummaryGqlResponse";
      id: string;
      title: string;
      category: TicketCategory;
      priority: TicketPriority;
      status: TicketStatus;
      closedBy?: TicketClosedBy | null;
      closedByUserId?: string | null;
      closedAt?: any | null;
      createdByUserId?: string | null;
      updatedByUserId?: string | null;
      messageCount: number;
      lastMessageBody: string;
      attachmentCount: number;
      createdAt?: any | null;
      updatedAt?: any | null;
      closedByUser?: {
        __typename?: "TicketListUserSummaryGqlResponse";
        username?: string | null;
        profile?: {
          __typename?: "TicketListUserSummaryProfileGqlResponse";
          firstName?: string | null;
          lastName?: string | null;
        } | null;
      } | null;
      createdByUser?: {
        __typename?: "TicketListUserSummaryGqlResponse";
        username?: string | null;
        profile?: {
          __typename?: "TicketListUserSummaryProfileGqlResponse";
          firstName?: string | null;
          lastName?: string | null;
        } | null;
      } | null;
      updatedByUser?: {
        __typename?: "TicketListUserSummaryGqlResponse";
        username?: string | null;
        profile?: {
          __typename?: "TicketListUserSummaryProfileGqlResponse";
          firstName?: string | null;
          lastName?: string | null;
        } | null;
      } | null;
    }>;
    pagination: {
      __typename?: "PaginationOffsetResponse";
      limit: number;
      skip: number;
      total: number;
      count: number;
    };
  };
};

export type UserLoginCaptchaQueryVariables = Exact<{ [key: string]: never }>;

export type UserLoginCaptchaQuery = {
  __typename?: "Query";
  userLoginCaptcha: {
    __typename?: "UserLoginCaptchaGqlResponse";
    captchaId: string;
    imageBase64: string;
    imageMimeType: string;
    expiresAtIso: string;
  };
};

export type UserNotificationListQueryVariables = Exact<{
  input: NotificationListGqlInput;
}>;

export type UserNotificationListQuery = {
  __typename?: "Query";
  userNotificationList: {
    __typename?: "NotificationListPaginatedCursorGqlResponse";
    items: Array<{
      __typename?: "NotificationListGqlResponse";
      id: string;
      userId?: string | null;
      source: NotificationSource;
      mode: NotificationMode;
      title?: string | null;
      message: string;
      payload?: any | null;
      isRead: boolean;
      readAt?: any | null;
      archivedAt?: any | null;
      visibleUntil?: any | null;
      createdAt?: any | null;
      updatedAt?: any | null;
    }>;
    pagination: {
      __typename?: "PaginationCursorResponse";
      limit: number;
      total: number;
      count: number;
      startCursor?: string | null;
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
};

export type UserProductListQueryVariables = Exact<{
  input: ProductListGqlInput;
}>;

export type UserProductListQuery = {
  __typename?: "Query";
  productList: {
    __typename?: "UserProductListPaginatedCursorGqlResponse";
    items: Array<{ __typename?: "UserProductListGqlResponse"; isPurchased: boolean }>;
    pagination: {
      __typename?: "PaginationCursorResponse";
      limit: number;
      total: number;
      count: number;
      startCursor?: string | null;
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
};

export type UserProductReviewListQueryVariables = Exact<{
  input: UserProductReviewListGqlInput;
}>;

export type UserProductReviewListQuery = {
  __typename?: "Query";
  userProductReviewList: {
    __typename?: "UserProductReviewListPaginatedCursorGqlResponse";
    items: Array<{
      __typename?: "UserProductReviewListGqlResponse";
      id: string;
      isMine: boolean;
      isSubmissionBlocked: boolean;
      isRatingHidden: boolean;
      author: { __typename?: "UserProductReviewAuthorGqlResponse"; firstName: string };
      rating?: {
        __typename?: "UserProductReviewRatingGqlResponse";
        stars: number;
        comment?: string | null;
        ratedAt: any;
        updatedAt?: any | null;
      } | null;
      messages: Array<{
        __typename?: "UserProductReviewMessageGqlResponse";
        key: string;
        body: string;
        sentAt: any;
        sender: {
          __typename?: "UserProductReviewMessageSenderGqlResponse";
          firstName: string;
          isSupport: boolean;
        };
      }>;
    }>;
    pagination: {
      __typename?: "PaginationCursorResponse";
      limit: number;
      total: number;
      count: number;
      startCursor?: string | null;
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    summary: {
      __typename?: "ProductReviewRatingSummaryGqlResponse";
      averageRating?: number | null;
      ratedCount: number;
      distribution: Array<{
        __typename?: "ProductReviewRatingDistributionGqlResponse";
        stars: number;
        count: number;
        percentage: number;
      }>;
    };
  };
};

export type UserTicketListQueryVariables = Exact<{
  input: UserTicketListGqlInput;
}>;

export type UserTicketListQuery = {
  __typename?: "Query";
  userTicketList: {
    __typename?: "UserTicketListPaginatedOffsetGqlResponse";
    items: Array<{
      __typename?: "UserTicketListSummaryGqlResponse";
      id: string;
      title: string;
      category: TicketCategory;
      priority: TicketPriority;
      status: TicketStatus;
      closedBy?: TicketClosedBy | null;
      closedAt?: any | null;
      messageCount: number;
      lastMessageBody: string;
      attachmentCount: number;
      createdAt?: any | null;
      updatedAt?: any | null;
    }>;
    pagination: {
      __typename?: "PaginationOffsetResponse";
      limit: number;
      skip: number;
      total: number;
      count: number;
    };
  };
};

export type GeneralUpdatesSubscriptionVariables = Exact<{
  updateTypes?: InputMaybe<Array<GeneralSubscriptionUpdateType> | GeneralSubscriptionUpdateType>;
}>;

export type GeneralUpdatesSubscription = {
  __typename?: "Subscription";
  generalUpdates: {
    __typename?: "GeneralSubscriptionGqlResponse";
    updateType: GeneralSubscriptionUpdateType;
    targetId?: string | null;
    createdAt: any;
    payload?: any | null;
  };
};

export const AppSettingUpdateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AppSettingUpdate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "AppSettingUpdateGqlInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "appSettingUpdate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "key" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "valueType" } },
                { kind: "Field", name: { kind: "Name", value: "value" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "isActive" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AppSettingUpdateMutation, AppSettingUpdateMutationVariables>;
export const BackupRunDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "BackupRun" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "BackupRunGqlInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "backupRun" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "target" } },
                      { kind: "Field", name: { kind: "Name", value: "archiveFileName" } },
                      { kind: "Field", name: { kind: "Name", value: "archiveFormat" } },
                      { kind: "Field", name: { kind: "Name", value: "archivePartCount" } },
                      { kind: "Field", name: { kind: "Name", value: "formattedArchiveSize" } },
                      { kind: "Field", name: { kind: "Name", value: "durationMs" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                      { kind: "Field", name: { kind: "Name", value: "telegramDelivered" } },
                      { kind: "Field", name: { kind: "Name", value: "telegramMessageId" } },
                      { kind: "Field", name: { kind: "Name", value: "telegramDeliveryNote" } },
                      { kind: "Field", name: { kind: "Name", value: "collectionCount" } },
                      { kind: "Field", name: { kind: "Name", value: "documentCount" } },
                      { kind: "Field", name: { kind: "Name", value: "objectCount" } },
                      { kind: "Field", name: { kind: "Name", value: "fileRecordCount" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<BackupRunMutation, BackupRunMutationVariables>;
export const CouponCreateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CouponCreate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "CouponCreateGqlInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "couponCreate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CouponCreateMutation, CouponCreateMutationVariables>;
export const CouponDeleteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CouponDelete" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "CouponDeleteGqlInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "couponDelete" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CouponDeleteMutation, CouponDeleteMutationVariables>;
export const CouponUpdateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CouponUpdate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "CouponUpdateGqlInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "couponUpdate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CouponUpdateMutation, CouponUpdateMutationVariables>;
export const GlobalAnouncementSendDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "GlobalAnouncementSend" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "GlobalAnouncementSendGqlInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "globalAnouncementSend" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "deliveredUsers" } },
                { kind: "Field", name: { kind: "Name", value: "activeSubscribedUsers" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GlobalAnouncementSendMutation, GlobalAnouncementSendMutationVariables>;
export const RegisterNativePushTokenDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RegisterNativePushToken" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "RegisterNativePushTokenGqlInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "registerNativePushToken" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "success" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RegisterNativePushTokenMutation,
  RegisterNativePushTokenMutationVariables
>;
export const UnregisterNativePushTokenDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UnregisterNativePushToken" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UnregisterNativePushTokenGqlInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "unregisterNativePushToken" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "success" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UnregisterNativePushTokenMutation,
  UnregisterNativePushTokenMutationVariables
>;
export const ProductCreateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ProductCreate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ProductCreateGqlInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "productCreate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ProductCreateMutation, ProductCreateMutationVariables>;
export const ProductDeleteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ProductDelete" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ProductDeleteGqlInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "productDelete" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ProductDeleteMutation, ProductDeleteMutationVariables>;
export const ProductPurchaseSubmitDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ProductPurchaseSubmit" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ProductPurchaseSubmitGqlInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "productPurchaseSubmit" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "productId" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "paymentMethod" } },
                { kind: "Field", name: { kind: "Name", value: "currency" } },
                { kind: "Field", name: { kind: "Name", value: "amountIrt" } },
                { kind: "Field", name: { kind: "Name", value: "discountAmountIrt" } },
                { kind: "Field", name: { kind: "Name", value: "finalAmountIrt" } },
                { kind: "Field", name: { kind: "Name", value: "couponCode" } },
                { kind: "Field", name: { kind: "Name", value: "paymentReference" } },
                { kind: "Field", name: { kind: "Name", value: "transactionId" } },
                { kind: "Field", name: { kind: "Name", value: "paymentUrl" } },
                { kind: "Field", name: { kind: "Name", value: "paymentAuthority" } },
                { kind: "Field", name: { kind: "Name", value: "isPurchased" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ProductPurchaseSubmitMutation, ProductPurchaseSubmitMutationVariables>;
export const ProductReviewModerationUpdateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ProductReviewModerationUpdate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ProductReviewModerationUpdateGqlInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "productReviewModerationUpdate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "moderation" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "visibility" } },
                      { kind: "Field", name: { kind: "Name", value: "hiddenAt" } },
                      { kind: "Field", name: { kind: "Name", value: "hiddenReason" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "rating" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "stars" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "moderation" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "visibility" } },
                            { kind: "Field", name: { kind: "Name", value: "hiddenAt" } },
                            { kind: "Field", name: { kind: "Name", value: "hiddenReason" } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "messages" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "key" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "moderation" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "visibility" } },
                            { kind: "Field", name: { kind: "Name", value: "hiddenAt" } },
                            { kind: "Field", name: { kind: "Name", value: "hiddenReason" } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ProductReviewModerationUpdateMutation,
  ProductReviewModerationUpdateMutationVariables
>;
export const ProductReviewSubmitDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ProductReviewSubmit" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ProductReviewSubmitGqlInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "productReviewSubmit" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "productId" } },
                { kind: "Field", name: { kind: "Name", value: "isNewRating" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "rating" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "stars" } },
                      { kind: "Field", name: { kind: "Name", value: "comment" } },
                      { kind: "Field", name: { kind: "Name", value: "ratedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ProductReviewSubmitMutation, ProductReviewSubmitMutationVariables>;
export const ProductUpdateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ProductUpdate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ProductUpdateGqlInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "productUpdate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ProductUpdateMutation, ProductUpdateMutationVariables>;
export const RegisterPushSubscriptionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RegisterPushSubscription" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "RegisterPushSubscriptionGqlInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "registerPushSubscription" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "success" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RegisterPushSubscriptionMutation,
  RegisterPushSubscriptionMutationVariables
>;
export const UnregisterPushSubscriptionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UnregisterPushSubscription" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UnregisterPushSubscriptionGqlInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "unregisterPushSubscription" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "success" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UnregisterPushSubscriptionMutation,
  UnregisterPushSubscriptionMutationVariables
>;
export const ResolveAuthIdentityDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ResolveAuthIdentity" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UserRequestLoginCodeGqlInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "resolveAuthIdentity" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "exists" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ResolveAuthIdentityMutation, ResolveAuthIdentityMutationVariables>;
export const TicketCloseDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "TicketClose" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "ticketClose" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "closedBy" } },
                { kind: "Field", name: { kind: "Name", value: "closedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TicketCloseMutation, TicketCloseMutationVariables>;
export const UserActivateAccountDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UserActivateAccount" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "token" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "userActivateAccount" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "token" },
                value: { kind: "Variable", name: { kind: "Name", value: "token" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserActivateAccountMutation, UserActivateAccountMutationVariables>;
export const UserCreateAnonymousDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UserCreateAnonymous" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "UserCreateAnonymousGqlInput" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "userCreateAnonymous" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "accessToken" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "user" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "username" } },
                      { kind: "Field", name: { kind: "Name", value: "roles" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserCreateAnonymousMutation, UserCreateAnonymousMutationVariables>;
export const UserForgotPasswordDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UserForgotPassword" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UserForgotPasswordGqlInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "userForgotPassword" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserForgotPasswordMutation, UserForgotPasswordMutationVariables>;
export const UserLoginDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UserLogin" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "UserLoginGqlInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "userLogin" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "accessToken" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "user" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "username" } },
                      { kind: "Field", name: { kind: "Name", value: "roles" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserLoginMutation, UserLoginMutationVariables>;
export const UserLogoutDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UserLogout" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [{ kind: "Field", name: { kind: "Name", value: "userLogout" } }],
      },
    },
  ],
} as unknown as DocumentNode<UserLogoutMutation, UserLogoutMutationVariables>;
export const UserNotificationUpdateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UserNotificationUpdate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "NotificationUpdateGqlInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "userNotificationUpdate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "action" } },
                { kind: "Field", name: { kind: "Name", value: "notificationIds" } },
                { kind: "Field", name: { kind: "Name", value: "requestedCount" } },
                { kind: "Field", name: { kind: "Name", value: "matchedCount" } },
                { kind: "Field", name: { kind: "Name", value: "modifiedCount" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "source" } },
                      { kind: "Field", name: { kind: "Name", value: "mode" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      { kind: "Field", name: { kind: "Name", value: "message" } },
                      { kind: "Field", name: { kind: "Name", value: "payload" } },
                      { kind: "Field", name: { kind: "Name", value: "isRead" } },
                      { kind: "Field", name: { kind: "Name", value: "readAt" } },
                      { kind: "Field", name: { kind: "Name", value: "archivedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "visibleUntil" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                      { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UserNotificationUpdateMutation,
  UserNotificationUpdateMutationVariables
>;
export const UserRequestEmailVerificationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UserRequestEmailVerification" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "userRequestEmailVerification" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UserRequestEmailVerificationMutation,
  UserRequestEmailVerificationMutationVariables
>;
export const UserRequestLoginCodeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UserRequestLoginCode" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UserRequestLoginCodeGqlInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "requestLoginCode" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserRequestLoginCodeMutation, UserRequestLoginCodeMutationVariables>;
export const UserRequestSignupCodeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UserRequestSignupCode" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UserRequestSignupCodeGqlInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "requestSignupCode" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserRequestSignupCodeMutation, UserRequestSignupCodeMutationVariables>;
export const UserResetPasswordDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UserResetPassword" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "UserResetPasswordGqlInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "userResetPassword" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserResetPasswordMutation, UserResetPasswordMutationVariables>;
export const UserSignupDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UserSignup" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "UserSignupGqlInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "userSignup" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "accessToken" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "user" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "username" } },
                      { kind: "Field", name: { kind: "Name", value: "roles" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserSignupMutation, UserSignupMutationVariables>;
export const UserTicketCloseDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UserTicketClose" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "userTicketClose" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "closedBy" } },
                { kind: "Field", name: { kind: "Name", value: "closedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserTicketCloseMutation, UserTicketCloseMutationVariables>;
export const UserVerifyLoginCodeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UserVerifyLoginCode" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UserVerifyLoginCodeGqlInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "verifyLoginCode" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
                { kind: "Field", name: { kind: "Name", value: "userId" } },
                { kind: "Field", name: { kind: "Name", value: "accessToken" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserVerifyLoginCodeMutation, UserVerifyLoginCodeMutationVariables>;
export const AppAboutPageConfigDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AppAboutPageConfig" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "appAboutPageConfig" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "html" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AppAboutPageConfigQuery, AppAboutPageConfigQueryVariables>;
export const AppPrivacyPolicyPageConfigDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AppPrivacyPolicyPageConfig" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "appPrivacyPolicyPageConfig" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "html" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AppPrivacyPolicyPageConfigQuery,
  AppPrivacyPolicyPageConfigQueryVariables
>;
export const AppSettingDetailDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AppSettingDetail" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "AppSettingDetailGqlInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "appSettingDetail" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "key" } },
                { kind: "Field", name: { kind: "Name", value: "label" } },
                { kind: "Field", name: { kind: "Name", value: "valueType" } },
                { kind: "Field", name: { kind: "Name", value: "value" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "isActive" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AppSettingDetailQuery, AppSettingDetailQueryVariables>;
export const AppSettingKeyListDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AppSettingKeyList" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "AppSettingKeyListGqlInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "appSettingKeyList" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "key" } },
                      { kind: "Field", name: { kind: "Name", value: "label" } },
                      { kind: "Field", name: { kind: "Name", value: "valueType" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      { kind: "Field", name: { kind: "Name", value: "isActive" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                      { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pagination" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "limit" } },
                      { kind: "Field", name: { kind: "Name", value: "skip" } },
                      { kind: "Field", name: { kind: "Name", value: "total" } },
                      { kind: "Field", name: { kind: "Name", value: "count" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AppSettingKeyListQuery, AppSettingKeyListQueryVariables>;
export const AppTermsOfUsePageConfigDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AppTermsOfUsePageConfig" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "appTermsOfUsePageConfig" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "html" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AppTermsOfUsePageConfigQuery, AppTermsOfUsePageConfigQueryVariables>;
export const BadgeCountDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "BadgeCount" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "badgeCount" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "products" } },
                { kind: "Field", name: { kind: "Name", value: "payments" } },
                { kind: "Field", name: { kind: "Name", value: "notifications" } },
                { kind: "Field", name: { kind: "Name", value: "tickets" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<BadgeCountQuery, BadgeCountQueryVariables>;
export const CouponDetailDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CouponDetail" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "CouponDetailGqlInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "couponDetail" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "code" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "discountType" } },
                { kind: "Field", name: { kind: "Name", value: "discountValue" } },
                { kind: "Field", name: { kind: "Name", value: "startsAt" } },
                { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
                { kind: "Field", name: { kind: "Name", value: "totalUsageLimit" } },
                { kind: "Field", name: { kind: "Name", value: "perUserUsageLimit" } },
                { kind: "Field", name: { kind: "Name", value: "applicableProductIds" } },
                { kind: "Field", name: { kind: "Name", value: "isFirstPurchaseOnly" } },
                { kind: "Field", name: { kind: "Name", value: "isActive" } },
                { kind: "Field", name: { kind: "Name", value: "totalUsageCount" } },
                { kind: "Field", name: { kind: "Name", value: "remainingTotalUsageCount" } },
                { kind: "Field", name: { kind: "Name", value: "createdBy" } },
                { kind: "Field", name: { kind: "Name", value: "updatedBy" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CouponDetailQuery, CouponDetailQueryVariables>;
export const CouponListDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CouponList" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "CouponListGqlInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "couponList" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "code" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      { kind: "Field", name: { kind: "Name", value: "discountType" } },
                      { kind: "Field", name: { kind: "Name", value: "discountValue" } },
                      { kind: "Field", name: { kind: "Name", value: "startsAt" } },
                      { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
                      { kind: "Field", name: { kind: "Name", value: "isFirstPurchaseOnly" } },
                      { kind: "Field", name: { kind: "Name", value: "isActive" } },
                      { kind: "Field", name: { kind: "Name", value: "totalUsageCount" } },
                      { kind: "Field", name: { kind: "Name", value: "remainingTotalUsageCount" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                      { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pagination" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "limit" } },
                      { kind: "Field", name: { kind: "Name", value: "skip" } },
                      { kind: "Field", name: { kind: "Name", value: "total" } },
                      { kind: "Field", name: { kind: "Name", value: "count" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CouponListQuery, CouponListQueryVariables>;
export const CouponValidateDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CouponValidate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "CouponValidateGqlInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "couponValidate" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "isValid" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
                { kind: "Field", name: { kind: "Name", value: "couponId" } },
                { kind: "Field", name: { kind: "Name", value: "code" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "discountType" } },
                { kind: "Field", name: { kind: "Name", value: "discountValue" } },
                { kind: "Field", name: { kind: "Name", value: "amountIrt" } },
                { kind: "Field", name: { kind: "Name", value: "productDiscountAmountIrt" } },
                { kind: "Field", name: { kind: "Name", value: "payableAmountBeforeCouponIrt" } },
                { kind: "Field", name: { kind: "Name", value: "couponDiscountAmountIrt" } },
                { kind: "Field", name: { kind: "Name", value: "finalAmountIrt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CouponValidateQuery, CouponValidateQueryVariables>;
export const PaymentCheckoutConfigDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PaymentCheckoutConfig" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "paymentCheckoutConfig" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "paymentCards" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "cardNumber" } },
                      { kind: "Field", name: { kind: "Name", value: "holderName" } },
                      { kind: "Field", name: { kind: "Name", value: "bankName" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "cryptoWallets" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "address" } },
                      { kind: "Field", name: { kind: "Name", value: "network" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "paymentMethods" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "method" } },
                      { kind: "Field", name: { kind: "Name", value: "isVisible" } },
                      { kind: "Field", name: { kind: "Name", value: "isActive" } },
                      { kind: "Field", name: { kind: "Name", value: "isRecommended" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "usdtIrtRate" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "valueIrt" } },
                      { kind: "Field", name: { kind: "Name", value: "feeUsdt" } },
                      { kind: "Field", name: { kind: "Name", value: "coefficient" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PaymentCheckoutConfigQuery, PaymentCheckoutConfigQueryVariables>;
export const ProductAiPreviewStagingDurationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ProductAiPreviewStagingDuration" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "productAiPreviewStagingDuration" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "durationSeconds" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ProductAiPreviewStagingDurationQuery,
  ProductAiPreviewStagingDurationQueryVariables
>;
export const ProductDeleteDependenciesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ProductDeleteDependencies" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ProductDeleteGqlInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "productDeleteDependencies" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "productId" } },
                { kind: "Field", name: { kind: "Name", value: "productTitle" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "summary" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "retainedCount" } },
                      { kind: "Field", name: { kind: "Name", value: "removedCount" } },
                      { kind: "Field", name: { kind: "Name", value: "hasRetainedDependencies" } },
                      { kind: "Field", name: { kind: "Name", value: "hasRemovedDependencies" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "groups" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "key" } },
                      { kind: "Field", name: { kind: "Name", value: "impact" } },
                      { kind: "Field", name: { kind: "Name", value: "totalCount" } },
                      { kind: "Field", name: { kind: "Name", value: "hiddenSampleCount" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "breakdown" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "key" } },
                            { kind: "Field", name: { kind: "Name", value: "count" } },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "samples" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "label" } },
                            { kind: "Field", name: { kind: "Name", value: "meta" } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ProductDeleteDependenciesQuery,
  ProductDeleteDependenciesQueryVariables
>;
export const ProductPaymentListDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ProductPaymentList" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ProductPaymentListGqlInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "productPaymentList" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "productId" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "user" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "fullName" } },
                            { kind: "Field", name: { kind: "Name", value: "username" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                            { kind: "Field", name: { kind: "Name", value: "phone" } },
                            { kind: "Field", name: { kind: "Name", value: "mobilePhone" } },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "product" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [{ kind: "Field", name: { kind: "Name", value: "title" } }],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "status" } },
                      { kind: "Field", name: { kind: "Name", value: "paymentMethod" } },
                      { kind: "Field", name: { kind: "Name", value: "currency" } },
                      { kind: "Field", name: { kind: "Name", value: "paymentProvider" } },
                      { kind: "Field", name: { kind: "Name", value: "paymentReference" } },
                      { kind: "Field", name: { kind: "Name", value: "transactionId" } },
                      { kind: "Field", name: { kind: "Name", value: "amountIrt" } },
                      { kind: "Field", name: { kind: "Name", value: "discountPercentage" } },
                      { kind: "Field", name: { kind: "Name", value: "discountAmountIrt" } },
                      { kind: "Field", name: { kind: "Name", value: "finalAmountIrt" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "coupon" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "couponId" } },
                            { kind: "Field", name: { kind: "Name", value: "code" } },
                            { kind: "Field", name: { kind: "Name", value: "discountType" } },
                            { kind: "Field", name: { kind: "Name", value: "discountValue" } },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "uploadedReceiptFile" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "accessUrl" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "fileId" } },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "receiptUploadedBy" } },
                      { kind: "Field", name: { kind: "Name", value: "isManualStatusChange" } },
                      { kind: "Field", name: { kind: "Name", value: "manualStatusChangedBy" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "manualStatusChangedDescription" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                      { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "pendingAt" } },
                      { kind: "Field", name: { kind: "Name", value: "gatewayPendingAt" } },
                      { kind: "Field", name: { kind: "Name", value: "paidAt" } },
                      { kind: "Field", name: { kind: "Name", value: "failedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "refundedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "cancelledAt" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pagination" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "limit" } },
                      { kind: "Field", name: { kind: "Name", value: "skip" } },
                      { kind: "Field", name: { kind: "Name", value: "total" } },
                      { kind: "Field", name: { kind: "Name", value: "count" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ProductPaymentListQuery, ProductPaymentListQueryVariables>;
export const PushNotificationConfigDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PushNotificationConfig" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "pushNotificationConfig" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "enabled" } },
                { kind: "Field", name: { kind: "Name", value: "publicKey" } },
                { kind: "Field", name: { kind: "Name", value: "nativePushEnabled" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PushNotificationConfigQuery, PushNotificationConfigQueryVariables>;
export const SupportContactConfigDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SupportContactConfig" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "supportContactConfig" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "eyebrow" } },
                { kind: "Field", name: { kind: "Name", value: "heading" } },
                { kind: "Field", name: { kind: "Name", value: "subtitle" } },
                { kind: "Field", name: { kind: "Name", value: "availabilityLabel" } },
                { kind: "Field", name: { kind: "Name", value: "responseTimeLabel" } },
                { kind: "Field", name: { kind: "Name", value: "faqTitle" } },
                { kind: "Field", name: { kind: "Name", value: "faqDescription" } },
                { kind: "Field", name: { kind: "Name", value: "contactSectionEyebrow" } },
                { kind: "Field", name: { kind: "Name", value: "contactSectionHeading" } },
                { kind: "Field", name: { kind: "Name", value: "contactSectionSubtitle" } },
                { kind: "Field", name: { kind: "Name", value: "tipsEyebrow" } },
                { kind: "Field", name: { kind: "Name", value: "tipsHeading" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "channels" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      { kind: "Field", name: { kind: "Name", value: "label" } },
                      { kind: "Field", name: { kind: "Name", value: "value" } },
                      { kind: "Field", name: { kind: "Name", value: "href" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      { kind: "Field", name: { kind: "Name", value: "isActive" } },
                      { kind: "Field", name: { kind: "Name", value: "isPrimary" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "quickTips" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "faqPage" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "eyebrow" } },
                      { kind: "Field", name: { kind: "Name", value: "heading" } },
                      { kind: "Field", name: { kind: "Name", value: "subtitle" } },
                      { kind: "Field", name: { kind: "Name", value: "searchLabel" } },
                      { kind: "Field", name: { kind: "Name", value: "searchPlaceholder" } },
                      { kind: "Field", name: { kind: "Name", value: "resultCountLabel" } },
                      { kind: "Field", name: { kind: "Name", value: "noResultsLabel" } },
                      { kind: "Field", name: { kind: "Name", value: "emptyTitle" } },
                      { kind: "Field", name: { kind: "Name", value: "emptyDescription" } },
                      { kind: "Field", name: { kind: "Name", value: "emptyActionLabel" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sections" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "title" } },
                            { kind: "Field", name: { kind: "Name", value: "description" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "items" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                  { kind: "Field", name: { kind: "Name", value: "question" } },
                                  { kind: "Field", name: { kind: "Name", value: "answer" } },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SupportContactConfigQuery, SupportContactConfigQueryVariables>;
export const TicketListDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "TicketList" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "TicketListGqlInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "ticketList" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      { kind: "Field", name: { kind: "Name", value: "category" } },
                      { kind: "Field", name: { kind: "Name", value: "priority" } },
                      { kind: "Field", name: { kind: "Name", value: "status" } },
                      { kind: "Field", name: { kind: "Name", value: "closedBy" } },
                      { kind: "Field", name: { kind: "Name", value: "closedByUserId" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "closedByUser" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "username" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "profile" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "firstName" } },
                                  { kind: "Field", name: { kind: "Name", value: "lastName" } },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "closedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createdByUser" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "username" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "profile" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "firstName" } },
                                  { kind: "Field", name: { kind: "Name", value: "lastName" } },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "updatedByUserId" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updatedByUser" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "username" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "profile" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "firstName" } },
                                  { kind: "Field", name: { kind: "Name", value: "lastName" } },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "messageCount" } },
                      { kind: "Field", name: { kind: "Name", value: "lastMessageBody" } },
                      { kind: "Field", name: { kind: "Name", value: "attachmentCount" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                      { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pagination" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "limit" } },
                      { kind: "Field", name: { kind: "Name", value: "skip" } },
                      { kind: "Field", name: { kind: "Name", value: "total" } },
                      { kind: "Field", name: { kind: "Name", value: "count" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TicketListQuery, TicketListQueryVariables>;
export const UserLoginCaptchaDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "UserLoginCaptcha" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "userLoginCaptcha" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "captchaId" } },
                { kind: "Field", name: { kind: "Name", value: "imageBase64" } },
                { kind: "Field", name: { kind: "Name", value: "imageMimeType" } },
                { kind: "Field", name: { kind: "Name", value: "expiresAtIso" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserLoginCaptchaQuery, UserLoginCaptchaQueryVariables>;
export const UserNotificationListDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "UserNotificationList" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "NotificationListGqlInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "userNotificationList" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "userId" } },
                      { kind: "Field", name: { kind: "Name", value: "source" } },
                      { kind: "Field", name: { kind: "Name", value: "mode" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      { kind: "Field", name: { kind: "Name", value: "message" } },
                      { kind: "Field", name: { kind: "Name", value: "payload" } },
                      { kind: "Field", name: { kind: "Name", value: "isRead" } },
                      { kind: "Field", name: { kind: "Name", value: "readAt" } },
                      { kind: "Field", name: { kind: "Name", value: "archivedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "visibleUntil" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                      { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pagination" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "limit" } },
                      { kind: "Field", name: { kind: "Name", value: "total" } },
                      { kind: "Field", name: { kind: "Name", value: "count" } },
                      { kind: "Field", name: { kind: "Name", value: "startCursor" } },
                      { kind: "Field", name: { kind: "Name", value: "endCursor" } },
                      { kind: "Field", name: { kind: "Name", value: "hasNextPage" } },
                      { kind: "Field", name: { kind: "Name", value: "hasPreviousPage" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserNotificationListQuery, UserNotificationListQueryVariables>;
export const UserProductListDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "UserProductList" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ProductListGqlInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            alias: { kind: "Name", value: "productList" },
            name: { kind: "Name", value: "userProductList" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "isPurchased" } }],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pagination" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "limit" } },
                      { kind: "Field", name: { kind: "Name", value: "total" } },
                      { kind: "Field", name: { kind: "Name", value: "count" } },
                      { kind: "Field", name: { kind: "Name", value: "startCursor" } },
                      { kind: "Field", name: { kind: "Name", value: "endCursor" } },
                      { kind: "Field", name: { kind: "Name", value: "hasNextPage" } },
                      { kind: "Field", name: { kind: "Name", value: "hasPreviousPage" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserProductListQuery, UserProductListQueryVariables>;
export const UserProductReviewListDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "UserProductReviewList" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UserProductReviewListGqlInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "userProductReviewList" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "isMine" } },
                      { kind: "Field", name: { kind: "Name", value: "isSubmissionBlocked" } },
                      { kind: "Field", name: { kind: "Name", value: "isRatingHidden" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "author" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "firstName" } },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "rating" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "stars" } },
                            { kind: "Field", name: { kind: "Name", value: "comment" } },
                            { kind: "Field", name: { kind: "Name", value: "ratedAt" } },
                            { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "messages" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "key" } },
                            { kind: "Field", name: { kind: "Name", value: "body" } },
                            { kind: "Field", name: { kind: "Name", value: "sentAt" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "sender" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "firstName" } },
                                  { kind: "Field", name: { kind: "Name", value: "isSupport" } },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pagination" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "limit" } },
                      { kind: "Field", name: { kind: "Name", value: "total" } },
                      { kind: "Field", name: { kind: "Name", value: "count" } },
                      { kind: "Field", name: { kind: "Name", value: "startCursor" } },
                      { kind: "Field", name: { kind: "Name", value: "endCursor" } },
                      { kind: "Field", name: { kind: "Name", value: "hasNextPage" } },
                      { kind: "Field", name: { kind: "Name", value: "hasPreviousPage" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "summary" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "averageRating" } },
                      { kind: "Field", name: { kind: "Name", value: "ratedCount" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "distribution" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "stars" } },
                            { kind: "Field", name: { kind: "Name", value: "count" } },
                            { kind: "Field", name: { kind: "Name", value: "percentage" } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserProductReviewListQuery, UserProductReviewListQueryVariables>;
export const UserTicketListDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "UserTicketList" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "UserTicketListGqlInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "userTicketList" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      { kind: "Field", name: { kind: "Name", value: "category" } },
                      { kind: "Field", name: { kind: "Name", value: "priority" } },
                      { kind: "Field", name: { kind: "Name", value: "status" } },
                      { kind: "Field", name: { kind: "Name", value: "closedBy" } },
                      { kind: "Field", name: { kind: "Name", value: "closedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "messageCount" } },
                      { kind: "Field", name: { kind: "Name", value: "lastMessageBody" } },
                      { kind: "Field", name: { kind: "Name", value: "attachmentCount" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                      { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pagination" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "limit" } },
                      { kind: "Field", name: { kind: "Name", value: "skip" } },
                      { kind: "Field", name: { kind: "Name", value: "total" } },
                      { kind: "Field", name: { kind: "Name", value: "count" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserTicketListQuery, UserTicketListQueryVariables>;
export const GeneralUpdatesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "subscription",
      name: { kind: "Name", value: "GeneralUpdates" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "updateTypes" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: {
                kind: "NamedType",
                name: { kind: "Name", value: "GeneralSubscriptionUpdateType" },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "generalUpdates" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "updateTypes" },
                value: { kind: "Variable", name: { kind: "Name", value: "updateTypes" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "updateType" } },
                { kind: "Field", name: { kind: "Name", value: "targetId" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "payload" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GeneralUpdatesSubscription, GeneralUpdatesSubscriptionVariables>;
