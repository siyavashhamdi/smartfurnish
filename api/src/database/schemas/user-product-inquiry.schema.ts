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
  contactedAt: Date;
  contactedBy: Types.ObjectId;
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
};

export type UserProductInquiryContact = {
  firstName: string;
  lastName: string;
  phone: string;
  requestedAt: Date;
  customerNote?: string;
};

export type UserProductInquirySale = {
  completedAt: Date;
  completedBy?: Types.ObjectId;
  note?: string;
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
    contactedAt: { required: true, type: Date },
    contactedBy: { ref: "User", required: true, type: Types.ObjectId },
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

export const UserProductInquirySaleSchema = new MongooseSchema(
  {
    completedAt: { required: true, type: Date },
    completedBy: { ref: "User", type: Types.ObjectId },
    note: { maxlength: 2000, trim: true, type: String },
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

  @Prop({ type: UserProductInquiryFabricSnapshotSchema })
  fabricSnapshot?: UserProductInquiryFabricSnapshot;

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

  @Prop({ type: UserProductInquiryPreviewSchema })
  preview?: UserProductInquiryPreview;

  @Prop({ type: UserProductInquiryContactSchema })
  contact?: UserProductInquiryContact;

  @Prop({ type: UserProductInquirySaleSchema })
  sale?: UserProductInquirySale;
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
    });

    const hasPreview = inquiry.preview != null;
    const requiresContact =
      inquiry.status !== UserProductInquiryStatus.PREVIEW_GENERATED;
    const requiresSale =
      inquiry.status === UserProductInquiryStatus.SALE_COMPLETED;

    if (hasPreview) {
      if (!inquiry.preview?.environmentFileId) {
        this.invalidate(
          "preview.environmentFileId",
          "environmentFileId is required when preview is present",
        );
      }

      if (!inquiry.preview?.resultFileId) {
        this.invalidate(
          "preview.resultFileId",
          "resultFileId is required when preview is present",
        );
      }

      if (!inquiry.preview?.generatedAt) {
        this.invalidate(
          "preview.generatedAt",
          "generatedAt is required when preview is present",
        );
      }

      if (!inquiry.preview?.model?.provider?.trim()) {
        this.invalidate(
          "preview.model.provider",
          "provider is required when preview is present",
        );
      }

      if (!inquiry.preview?.model?.model?.trim()) {
        this.invalidate(
          "preview.model.model",
          "model is required when preview is present",
        );
      }
    }

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
      if (!inquiry.sale) {
        this.invalidate(
          "sale",
          "sale is required when status is SALE_COMPLETED",
        );
      } else if (!inquiry.sale.completedAt) {
        this.invalidate("sale.completedAt", "completedAt is required");
      }
    }

    if (
      inquiry.sale &&
      inquiry.status !== UserProductInquiryStatus.SALE_COMPLETED
    ) {
      this.invalidate(
        "sale",
        "sale is only allowed when status is SALE_COMPLETED",
      );
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
UserProductInquirySchema.index({ "sale.completedAt": -1 }, { sparse: true });
UserProductInquirySchema.index({
  "productSnapshot.title": "text",
  "userSnapshot.fullName": "text",
  "contact.firstName": "text",
  "contact.lastName": "text",
  "contact.phone": "text",
});
UserProductInquirySchema.index({ "audit.createdAt": -1 });
UserProductInquirySchema.index({ "audit.updatedAt": -1 });
