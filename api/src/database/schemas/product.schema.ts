import { Document, Schema as MongooseSchema, Types } from "mongoose";
import { randomUUID } from "crypto";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ProductDiscountType } from "../../enums";
import { BaseIdTimestampableBlameableSchema } from "./base.schema";
import { timestampablePlugin } from "../plugins/timestampable.plugin";
import { blameablePlugin } from "../plugins/blameable.plugin";
import { softDeletePlugin } from "../plugins/soft-delete.plugin";

export type ProductDiscount = {
  type: ProductDiscountType;
  value: number;
};

export type ProductVendor = {
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
};

export type ProductMaterialProfile = {
  texture?: string;
  primaryMaterial?: string;
  careInstructions?: string;
};

export type ProductSetPieceDimension = {
  label?: string;
  displayText?: string;
  widthCm?: number;
  heightCm?: number;
  depthCm?: number;
  sortOrder?: number;
};

export type ProductSetPiece = {
  key: string;
  name: string;
  description?: string;
  sortOrder?: number;
  imageFileIds?: Types.ObjectId[];
  dimensions?: ProductSetPieceDimension[];
  weightKg?: number;
  materialProfile?: ProductMaterialProfile;
};

export type ProductFabricColor = {
  key: string;
  name: string;
  hexCode?: string;
  aiProductImageFileId?: Types.ObjectId;
  priceIrt?: number;
  discount?: ProductDiscount;
  sortOrder?: number;
  isActive: boolean;
};

export type ProductFabric = {
  key: string;
  patternName: string;
  sortOrder?: number;
  isActive: boolean;
  colors: ProductFabricColor[];
};

export type ProductDocument = Product & Document;

export const ProductDiscountSchema = new MongooseSchema(
  {
    type: {
      enum: Object.values(ProductDiscountType),
      required: true,
      type: String,
    },
    value: {
      min: 0,
      required: true,
      type: Number,
      validate: {
        message: "Percentage discount value cannot be greater than 100",
        validator(this: ProductDiscount, value: number): boolean {
          return this.type !== ProductDiscountType.PERCENTAGE || value <= 100;
        },
      },
    },
  },
  { _id: false },
);

export const ProductVendorSchema = new MongooseSchema(
  {
    name: { required: true, trim: true, type: String },
    phone: { trim: true, type: String },
    address: { trim: true, type: String },
    notes: { trim: true, type: String },
  },
  { _id: false },
);

export const ProductMaterialProfileSchema = new MongooseSchema(
  {
    texture: { trim: true, type: String },
    primaryMaterial: { trim: true, type: String },
    careInstructions: { trim: true, type: String },
  },
  { _id: false },
);

export const ProductSetPieceDimensionSchema = new MongooseSchema(
  {
    label: { trim: true, type: String },
    displayText: { trim: true, type: String },
    widthCm: { min: 0, type: Number },
    heightCm: { min: 0, type: Number },
    depthCm: { min: 0, type: Number },
    sortOrder: { type: Number },
  },
  { _id: false },
);

export const ProductFabricColorSchema = new MongooseSchema(
  {
    key: {
      default: randomUUID,
      immutable: true,
      required: true,
      type: String,
    },
    name: { required: true, trim: true, type: String },
    hexCode: { trim: true, type: String },
    aiProductImageFileId: { ref: "StoredFile", type: Types.ObjectId },
    priceIrt: { min: 0, type: Number },
    discount: { type: ProductDiscountSchema },
    sortOrder: { type: Number },
    isActive: { default: true, required: true, type: Boolean },
  },
  { _id: false },
);

export const ProductFabricSchema = new MongooseSchema(
  {
    key: {
      default: randomUUID,
      immutable: true,
      required: true,
      type: String,
    },
    patternName: { required: true, trim: true, type: String },
    sortOrder: { type: Number },
    isActive: { default: true, required: true, type: Boolean },
    colors: { default: [], type: [ProductFabricColorSchema] },
  },
  { _id: false },
);

export const ProductSetPieceSchema = new MongooseSchema(
  {
    key: {
      default: randomUUID,
      immutable: true,
      required: true,
      type: String,
    },
    name: { required: true, trim: true, type: String },
    description: { trim: true, type: String },
    sortOrder: { type: Number },
    imageFileIds: { default: [], ref: "StoredFile", type: [Types.ObjectId] },
    dimensions: { default: [], type: [ProductSetPieceDimensionSchema] },
    weightKg: { min: 0, type: Number },
    materialProfile: { type: ProductMaterialProfileSchema },
  },
  { _id: false },
);

@Schema({ collection: "products" })
export class Product extends BaseIdTimestampableBlameableSchema {
  @Prop({ required: true, trim: true, type: String })
  title: string;

  @Prop({ trim: true, type: String })
  summary?: string;

  @Prop({ trim: true, type: String })
  fullDescription?: string;

  @Prop({ default: [], ref: "StoredFile", type: [Types.ObjectId] })
  coverImageFileIds?: Types.ObjectId[];

  @Prop({ default: true, required: true, type: Boolean })
  isActive: boolean;

  @Prop({ default: true, required: true, type: Boolean })
  isReviewSubmissionEnabled: boolean;

  @Prop({ default: true, required: true, type: Boolean })
  isReviewsSectionVisible: boolean;

  @Prop({ default: 0, type: Number })
  sortOrder?: number;

  @Prop({ default: [], trim: true, type: [String] })
  tags?: string[];

  @Prop({ default: 0, min: 0, type: Number })
  guaranteePeriodInMonths?: number;

  @Prop({ trim: true, type: String })
  notes?: string;

  @Prop({ type: ProductVendorSchema })
  vendor?: ProductVendor;

  @Prop({ type: ProductMaterialProfileSchema })
  materialProfile?: ProductMaterialProfile;

  @Prop({ default: [], type: [ProductSetPieceSchema] })
  setPieces?: ProductSetPiece[];

  @Prop({ default: [], type: [ProductFabricSchema] })
  fabrics?: ProductFabric[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.plugin(timestampablePlugin);
ProductSchema.plugin(blameablePlugin);
ProductSchema.plugin(softDeletePlugin);

ProductSchema.index({ isActive: 1 });
ProductSchema.index({ sortOrder: 1 });
ProductSchema.index({ title: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ coverImageFileIds: 1 });
ProductSchema.index({ "setPieces.key": 1 }, { unique: true, sparse: true });
ProductSchema.index({ "setPieces.imageFileIds": 1 });
ProductSchema.index({ "fabrics.key": 1 }, { unique: true, sparse: true });
ProductSchema.index(
  { "fabrics.colors.key": 1 },
  { unique: true, sparse: true },
);
ProductSchema.index({ "fabrics.colors.aiProductImageFileId": 1 });
ProductSchema.index({ "fabrics.colors.priceIrt": 1 });
ProductSchema.index({ "audit.createdAt": -1 });
ProductSchema.index({ "audit.updatedAt": -1 });
