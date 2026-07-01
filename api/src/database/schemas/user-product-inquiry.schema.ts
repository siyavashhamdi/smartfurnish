import { Document, Schema as MongooseSchema, Types } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { UserProductInquiryStatus } from "../../enums";
import { BaseIdTimestampableBlameableSchema } from "./base.schema";
import { timestampablePlugin } from "../plugins/timestampable.plugin";
import { blameablePlugin } from "../plugins/blameable.plugin";
import { softDeletePlugin } from "../plugins/soft-delete.plugin";

export type UserProductInquiryUserSnapshot = {
  fullName: string;
  username: string;
  phoneNumber?: string;
};

export type UserProductInquiryProductSnapshot = {
  title: string;
};

export type UserProductInquiryFabricSnapshot = {
  fabricKey: string;
  colorKey: string;
  patternName: string;
  colorName: string;
  colorHex?: string;
  label: string;
};

export type UserProductInquiryStatusHistoryPayload = {
  contactedAt?: Date;
  contactedBy?: Types.ObjectId;
  completedAt?: Date;
  completedBy?: Types.ObjectId;
};

export type UserProductInquiryStatusHistoryEntry = {
  status: UserProductInquiryStatus;
  reason: string;
  description?: string;
  changedAt: Date;
  changedBy?: Types.ObjectId;
  payload?: UserProductInquiryStatusHistoryPayload;
};

export type UserProductInquiryPreviewModel = {
  provider: string;
  model: string;
  placementPrompt?: string;
  aspectRatio?: string;
  imageSize?: string;
  reasoningEffort?: string;
};

export type UserProductInquiryPreview = {
  environmentFileId: Types.ObjectId;
  resultFileId: Types.ObjectId;
  sourceProductImageFileId?: Types.ObjectId;
  generatedAt: Date;
  durationSeconds?: number;
  model: UserProductInquiryPreviewModel;
  fabricSnapshot: UserProductInquiryFabricSnapshot;
};

export type UserProductInquiryContact = {
  firstName: string;
  lastName: string;
  phone: string;
  requestedAt: Date;
  customerNote?: string;
};

export type UserProductInquiryDocument = UserProductInquiry & Document;

export const UserProductInquiryUserSnapshotSchema = new MongooseSchema(
  {
    fullName: { required: true, trim: true, type: String },
    username: {
      lowercase: true,
      required: true,
      trim: true,
      type: String,
    },
    phoneNumber: { trim: true, type: String },
  },
  { _id: false },
);

export const UserProductInquiryProductSnapshotSchema = new MongooseSchema(
  {
    title: { required: true, trim: true, type: String },
  },
  { _id: false },
);

export const UserProductInquiryFabricSnapshotSchema = new MongooseSchema(
  {
    fabricKey: { required: true, trim: true, type: String },
    colorKey: { required: true, trim: true, type: String },
    patternName: { required: true, trim: true, type: String },
    colorName: { required: true, trim: true, type: String },
    colorHex: { trim: true, type: String },
    label: { required: true, trim: true, type: String },
  },
  { _id: false },
);

export const UserProductInquiryStatusHistoryPayloadSchema = new MongooseSchema(
  {
    contactedAt: { type: Date },
    contactedBy: { ref: "User", type: Types.ObjectId },
    completedAt: { type: Date },
    completedBy: { ref: "User", type: Types.ObjectId },
  },
  { _id: false },
);

export const UserProductInquiryStatusHistoryEntrySchema = new MongooseSchema(
  {
    status: {
      enum: Object.values(UserProductInquiryStatus),
      required: true,
      type: String,
    },
    reason: { required: true, trim: true, type: String },
    description: { trim: true, type: String },
    changedAt: { required: true, type: Date },
    changedBy: { ref: "User", type: Types.ObjectId },
    payload: { type: UserProductInquiryStatusHistoryPayloadSchema },
  },
  { _id: false },
);

export const UserProductInquiryPreviewModelSchema = new MongooseSchema(
  {
    provider: { required: true, trim: true, type: String },
    model: { required: true, trim: true, type: String },
    placementPrompt: { trim: true, type: String },
    aspectRatio: { trim: true, type: String },
    imageSize: { trim: true, type: String },
    reasoningEffort: { trim: true, type: String },
  },
  { _id: false },
);

export const UserProductInquiryPreviewSchema = new MongooseSchema(
  {
    environmentFileId: {
      ref: "StoredFile",
      required: true,
      type: Types.ObjectId,
    },
    resultFileId: { ref: "StoredFile", required: true, type: Types.ObjectId },
    sourceProductImageFileId: { ref: "StoredFile", type: Types.ObjectId },
    generatedAt: { required: true, type: Date },
    durationSeconds: { min: 0, type: Number },
    model: {
      required: true,
      type: UserProductInquiryPreviewModelSchema,
    },
    fabricSnapshot: {
      required: true,
      type: UserProductInquiryFabricSnapshotSchema,
    },
  },
  { _id: false },
);

export const UserProductInquiryContactSchema = new MongooseSchema(
  {
    firstName: { required: true, trim: true, type: String },
    lastName: { required: true, trim: true, type: String },
    phone: { required: true, trim: true, type: String },
    requestedAt: { required: true, type: Date },
    customerNote: { maxlength: 2000, trim: true, type: String },
  },
  { _id: false },
);

@Schema({ collection: "user_product_inquiries" })
export class UserProductInquiry extends BaseIdTimestampableBlameableSchema {
  @Prop({ default: false, required: true, type: Boolean })
  isArchived: boolean;

  @Prop({ ref: "User", required: true, type: Types.ObjectId })
  userId: Types.ObjectId;

  @Prop({ ref: "Product", required: true, type: Types.ObjectId })
  productId: Types.ObjectId;

  @Prop({ required: true, type: UserProductInquiryUserSnapshotSchema })
  userSnapshot: UserProductInquiryUserSnapshot;

  @Prop({ required: true, type: UserProductInquiryProductSnapshotSchema })
  productSnapshot: UserProductInquiryProductSnapshot;

  @Prop({
    enum: Object.values(UserProductInquiryStatus),
    required: true,
    type: String,
  })
  status: UserProductInquiryStatus;

  @Prop({
    required: true,
    type: [UserProductInquiryStatusHistoryEntrySchema],
    validate: {
      message: "statusHistory must contain at least one entry",
      validator(value: UserProductInquiryStatusHistoryEntry[]): boolean {
        return Array.isArray(value) && value.length > 0;
      },
    },
  })
  statusHistory: UserProductInquiryStatusHistoryEntry[];

  @Prop({ type: [UserProductInquiryPreviewSchema] })
  preview?: UserProductInquiryPreview[];

  @Prop({ type: UserProductInquiryContactSchema })
  contact?: UserProductInquiryContact;
}

export const UserProductInquirySchema =
  SchemaFactory.createForClass(UserProductInquiry);

UserProductInquirySchema.plugin(timestampablePlugin);
UserProductInquirySchema.plugin(blameablePlugin);
UserProductInquirySchema.plugin(softDeletePlugin);

UserProductInquirySchema.pre(
  "validate",
  function validateUserProductInquiry(next) {
    const inquiry = this as UserProductInquiryDocument;

    if (!inquiry.statusHistory?.length) {
      this.invalidate(
        "statusHistory",
        "statusHistory must contain at least one entry",
      );
      next();
      return;
    }

    const lastHistoryEntry =
      inquiry.statusHistory[inquiry.statusHistory.length - 1];

    if (inquiry.status !== lastHistoryEntry.status) {
      this.invalidate(
        "status",
        "status must match the last statusHistory entry",
      );
    }

    inquiry.statusHistory.forEach((entry, index) => {
      if (!entry.reason?.trim()) {
        this.invalidate(
          `statusHistory.${index}.reason`,
          "reason is required for each statusHistory entry",
        );
      }

      if (!entry.changedAt) {
        this.invalidate(
          `statusHistory.${index}.changedAt`,
          "changedAt is required for each statusHistory entry",
        );
      }

      if (entry.status === UserProductInquiryStatus.CONTACTED) {
        if (!entry.payload?.contactedAt) {
          this.invalidate(
            `statusHistory.${index}.payload.contactedAt`,
            "contactedAt is required when status is CONTACTED",
          );
        }

        if (!entry.payload?.contactedBy) {
          this.invalidate(
            `statusHistory.${index}.payload.contactedBy`,
            "contactedBy is required when status is CONTACTED",
          );
        }
      }

      if (entry.status === UserProductInquiryStatus.SALE_COMPLETED) {
        if (!entry.payload?.completedAt) {
          this.invalidate(
            `statusHistory.${index}.payload.completedAt`,
            "completedAt is required when status is SALE_COMPLETED",
          );
        }

        if (!entry.payload?.completedBy) {
          this.invalidate(
            `statusHistory.${index}.payload.completedBy`,
            "completedBy is required when status is SALE_COMPLETED",
          );
        }
      }
    });

    if (inquiry.preview != null && !Array.isArray(inquiry.preview)) {
      inquiry.preview = [inquiry.preview as UserProductInquiryPreview];
    }

    const previews = inquiry.preview ?? [];
    const hasPreview = previews.length > 0;
    const requiresContact =
      inquiry.status !== UserProductInquiryStatus.PREVIEW_GENERATED;
    const requiresSale =
      inquiry.status === UserProductInquiryStatus.SALE_COMPLETED;

    previews.forEach((previewEntry, index) => {
      if (!previewEntry?.environmentFileId) {
        this.invalidate(
          `preview.${index}.environmentFileId`,
          "environmentFileId is required for each preview entry",
        );
      }

      if (!previewEntry?.resultFileId) {
        this.invalidate(
          `preview.${index}.resultFileId`,
          "resultFileId is required for each preview entry",
        );
      }

      if (!previewEntry?.generatedAt) {
        this.invalidate(
          `preview.${index}.generatedAt`,
          "generatedAt is required for each preview entry",
        );
      }

      if (!previewEntry?.model?.provider?.trim()) {
        this.invalidate(
          `preview.${index}.model.provider`,
          "provider is required for each preview entry",
        );
      }

      if (!previewEntry?.model?.model?.trim()) {
        this.invalidate(
          `preview.${index}.model.model`,
          "model is required for each preview entry",
        );
      }

      if (!previewEntry?.fabricSnapshot?.fabricKey?.trim()) {
        this.invalidate(
          `preview.${index}.fabricSnapshot.fabricKey`,
          "fabricKey is required for each preview entry",
        );
      }

      if (!previewEntry?.fabricSnapshot?.colorKey?.trim()) {
        this.invalidate(
          `preview.${index}.fabricSnapshot.colorKey`,
          "colorKey is required for each preview entry",
        );
      }

      if (!previewEntry?.fabricSnapshot?.patternName?.trim()) {
        this.invalidate(
          `preview.${index}.fabricSnapshot.patternName`,
          "patternName is required for each preview entry",
        );
      }

      if (!previewEntry?.fabricSnapshot?.colorName?.trim()) {
        this.invalidate(
          `preview.${index}.fabricSnapshot.colorName`,
          "colorName is required for each preview entry",
        );
      }

      if (!previewEntry?.fabricSnapshot?.label?.trim()) {
        this.invalidate(
          `preview.${index}.fabricSnapshot.label`,
          "label is required for each preview entry",
        );
      }
    });

    if (
      inquiry.status === UserProductInquiryStatus.PREVIEW_GENERATED &&
      !hasPreview
    ) {
      this.invalidate(
        "preview",
        "preview is required when status is PREVIEW_GENERATED",
      );
    }

    if (requiresContact) {
      if (!inquiry.contact) {
        this.invalidate(
          "contact",
          "contact is required for call-related inquiry statuses",
        );
      } else {
        if (!inquiry.contact.firstName?.trim()) {
          this.invalidate("contact.firstName", "firstName is required");
        }
        if (!inquiry.contact.lastName?.trim()) {
          this.invalidate("contact.lastName", "lastName is required");
        }
        if (!inquiry.contact.phone?.trim()) {
          this.invalidate("contact.phone", "phone is required");
        }
        if (!inquiry.contact.requestedAt) {
          this.invalidate("contact.requestedAt", "requestedAt is required");
        }
      }
    }

    if (requiresSale) {
      if (
        lastHistoryEntry.status !== UserProductInquiryStatus.SALE_COMPLETED ||
        !lastHistoryEntry.payload?.completedAt ||
        !lastHistoryEntry.payload?.completedBy
      ) {
        this.invalidate(
          "statusHistory",
          "SALE_COMPLETED status requires completedAt and completedBy in the last statusHistory entry payload",
        );
      }
    }

    if (
      inquiry.contact &&
      inquiry.status === UserProductInquiryStatus.PREVIEW_GENERATED
    ) {
      this.invalidate(
        "contact",
        "contact is not allowed when status is PREVIEW_GENERATED",
      );
    }

    next();
  },
);

UserProductInquirySchema.index({ userId: 1, "audit.createdAt": -1 });
UserProductInquirySchema.index({ productId: 1, "audit.createdAt": -1 });
UserProductInquirySchema.index({ status: 1, "audit.createdAt": -1 });
UserProductInquirySchema.index({
  isArchived: 1,
  status: 1,
  "audit.createdAt": -1,
});
UserProductInquirySchema.index({ "contact.phone": 1 }, { sparse: true });
UserProductInquirySchema.index(
  { "preview.environmentFileId": 1 },
  { sparse: true },
);
UserProductInquirySchema.index({ "preview.resultFileId": 1 }, { sparse: true });
UserProductInquirySchema.index(
  { "preview.fabricSnapshot.label": 1 },
  { sparse: true },
);
UserProductInquirySchema.index({
  "productSnapshot.title": "text",
  "userSnapshot.fullName": "text",
  "contact.firstName": "text",
  "contact.lastName": "text",
  "contact.phone": "text",
});
UserProductInquirySchema.index({ "audit.createdAt": -1 });
UserProductInquirySchema.index({ "audit.updatedAt": -1 });
