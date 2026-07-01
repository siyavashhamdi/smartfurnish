import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";

import { PAGINATION_CONSTANT } from "../../constants/pagination.constant";
import { EXCEPTION_CONSTANT } from "../../constants/exception.constant";
import { DEFAULT_OPENROUTER_MODEL } from "../app-settings/app-settings.types";
import {
  User,
  Product,
  ProductDocument,
  UserProductInquiry,
  UserProductInquiryDocument,
  UserProductInquiryFabricSnapshot,
  UserProductInquiryUserSnapshot,
  UserProductInquiryStatusHistoryEntry,
  UserProductInquiryStatusHistoryPayload,
  UserProductInquiryPreview,
  UserProductInquiryContact,
} from "../../database/schemas";
import { UserProductInquiryStatus, UserRole } from "../../enums";
import { SortingOrder } from "../../common/pagination/input/sorting-order.enum";
import { buildSortOptions } from "../../common/pagination/utils";
import {
  isValidMobilePhone,
  normalizeAuthIdentityMobileForSubmit,
} from "../../utils/contact-validation.util";
import { AppSettingsService } from "../app-settings";
import { FileService } from "../file";
import { ProductService } from "../product/product.service";
import { ProductAiPreviewService } from "../product-ai-preview/services/product-ai-preview.service";
import type { ProductAiPreviewResult } from "../product-ai-preview/services/product-ai-preview.service";
import { UserService } from "../user/user.service";
import {
  UserProductInquiryListGqlInput,
  UserProductInquiryListSortOptionInput,
  UserProductInquiryDetailGqlInput,
  UserProductInquiryStatusUpdateGqlInput,
  UserProductInquiryUpdateGqlInput,
  UserProductInquiryUpdateContactGqlInput,
  UserProductInquiryUpdateFabricSnapshotGqlInput,
  UserProductInquiryUpdatePreviewGqlInput,
  UserProductInquiryUpdateProductSnapshotGqlInput,
  UserProductInquiryUpdateStatusHistoryEntryGqlInput,
  UserProductInquiryUpdateStatusHistoryPayloadGqlInput,
  UserProductInquiryUpdateUserSnapshotGqlInput,
  UserProductInquiryPreviewSubmitGqlInput,
  UserProductInquiryContactSubmitGqlInput,
} from "./graphql/inputs";
import {
  UserProductInquiryPreviewSubmitGqlResponse,
  UserProductInquiryListPaginatedOffsetGqlResponse,
  UserProductInquiryListSummaryGqlResponse,
  UserProductInquiryContactSubmitGqlResponse,
  UserProductInquiryDetailGqlResponse,
  UserProductInquiryDetailPreviewGqlResponse,
} from "./graphql/responses";

type UserProductInquiryListRecord = UserProductInquiry & {
  _id: Types.ObjectId;
  audit?: {
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
  };
};

type UserProductInquiryListSortField =
  | "createdAt"
  | "updatedAt"
  | "status"
  | "productTitle"
  | "previewGeneratedAt"
  | "contactRequestedAt";

@Injectable()
export class UserProductInquiryService {
  constructor(
    @InjectModel(UserProductInquiry.name)
    private readonly userProductInquiryModel: Model<UserProductInquiryDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly appSettingsService: AppSettingsService,
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly productAiPreviewService: ProductAiPreviewService,
    private readonly fileService: FileService,
  ) {}

  async submitPreview(
    input: UserProductInquiryPreviewSubmitGqlInput,
    userId: Types.ObjectId,
  ): Promise<UserProductInquiryPreviewSubmitGqlResponse> {
    const productId = input.productId.toString();
    const fabricKey = input.fabricKey.trim();
    const colorKey = input.colorKey.trim();
    const environmentFileId = input.environmentFileId.toString();

    const [previewResult, user] = await Promise.all([
      this.productAiPreviewService.runPreview({
        colorKey,
        environmentFileId,
        fabricKey,
        ownerUserId: userId,
        productId,
      }),
      this.userService.findById(userId),
    ]);

    if (!user) {
      throw new NotFoundException(EXCEPTION_CONSTANT.USER_NOT_FOUND);
    }

    const generatedAt = new Date(previewResult.generatedAt);
    const sourceProductImageFileId = previewResult.sourceProductImageFileId;
    const resultFileId = previewResult.resultFileId;
    const openRouterConfig =
      await this.appSettingsService.getOpenRouterConfig();
    const modelName =
      openRouterConfig?.model?.trim() || DEFAULT_OPENROUTER_MODEL;
    const placementPrompt = openRouterConfig?.placementPrompt?.trim();
    const isRiverflowModel = modelName.includes("riverflow");
    const stagingDurationSeconds =
      await this.appSettingsService.getProductAiPreviewStagingDurationSeconds();

    const previewEntry = this.buildPreviewEntry({
      environmentFileId: input.environmentFileId,
      resultFileId: new Types.ObjectId(resultFileId),
      sourceProductImageFileId: new Types.ObjectId(sourceProductImageFileId),
      generatedAt,
      durationSeconds: previewResult.durationSeconds,
      modelName,
      placementPrompt,
      aspectRatio: previewResult.aspectRatio,
      imageSize: previewResult.imageSize,
      isRiverflowModel,
      fabricSnapshot: {
        fabricKey,
        colorKey,
        patternName: previewResult.fabric.patternName,
        colorName: previewResult.fabric.colorName,
        ...(previewResult.fabric.colorHex
          ? { colorHex: previewResult.fabric.colorHex }
          : {}),
        label: previewResult.fabric.label,
      },
    });

    const existingInquiry = await this.resolvePreviewSubmitInquiry(
      input,
      userId,
    );

    if (existingInquiry) {
      if (!existingInquiry.productId.equals(input.productId)) {
        throw new BadRequestException(
          EXCEPTION_CONSTANT.USER_PRODUCT_INQUIRY_PRODUCT_MISMATCH,
        );
      }

      if (!this.canAppendPreviewToInquiry(existingInquiry.status)) {
        throw new BadRequestException(
          EXCEPTION_CONSTANT.USER_PRODUCT_INQUIRY_CONTACT_ALREADY_SUBMITTED,
        );
      }

      const previews = this.normalizePreviewArray(existingInquiry.preview);
      existingInquiry.preview = [...previews, previewEntry];
      existingInquiry.productSnapshot = {
        title: previewResult.product.title,
      };
      existingInquiry.markModified("preview");

      await existingInquiry.save();

      return this.buildPreviewSubmitResponse({
        inquiryId: existingInquiry._id,
        productId: existingInquiry.productId,
        status: existingInquiry.status,
        previewResult,
        environmentFileId: input.environmentFileId,
        resultFileId: new Types.ObjectId(resultFileId),
        sourceProductImageFileId: new Types.ObjectId(sourceProductImageFileId),
        generatedAt,
        stagingDurationSeconds,
      });
    }

    const createdInquiry = await this.userProductInquiryModel.create({
      isArchived: false,
      userId,
      productId: input.productId,
      userSnapshot: this.toUserProductInquiryUserSnapshot(user),
      productSnapshot: {
        title: previewResult.product.title,
      },
      status: UserProductInquiryStatus.PREVIEW_GENERATED,
      statusHistory: [
        {
          status: UserProductInquiryStatus.PREVIEW_GENERATED,
          reason: "Smart preview generated",
          changedAt: generatedAt,
          changedBy: userId,
        },
      ],
      preview: [previewEntry],
    });

    return this.buildPreviewSubmitResponse({
      inquiryId: createdInquiry._id,
      productId: createdInquiry.productId,
      status: createdInquiry.status,
      previewResult,
      environmentFileId: input.environmentFileId,
      resultFileId: new Types.ObjectId(resultFileId),
      sourceProductImageFileId: new Types.ObjectId(sourceProductImageFileId),
      generatedAt,
      stagingDurationSeconds,
    });
  }

  async submitContact(
    input: UserProductInquiryContactSubmitGqlInput,
    userId: Types.ObjectId,
  ): Promise<UserProductInquiryContactSubmitGqlResponse> {
    const phoneRaw = input.phone.trim();
    if (!isValidMobilePhone(phoneRaw)) {
      throw new BadRequestException(EXCEPTION_CONSTANT.INVALID_MOBILE);
    }

    const normalizedPhone = normalizeAuthIdentityMobileForSubmit(phoneRaw);
    if (!normalizedPhone) {
      throw new BadRequestException(EXCEPTION_CONSTANT.INVALID_MOBILE);
    }

    const { firstName, lastName } = this.splitContactFullName(input.fullName);
    const requestedAt = new Date();
    const contact = {
      firstName,
      lastName,
      phone: normalizedPhone,
      requestedAt,
    };

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException(EXCEPTION_CONSTANT.USER_NOT_FOUND);
    }

    const userSnapshot = this.toUserProductInquiryUserSnapshot(user);

    const existingInquiry = await this.resolveContactSubmitInquiry(
      input,
      userId,
    );

    if (existingInquiry) {
      if (!existingInquiry.productId.equals(input.productId)) {
        throw new BadRequestException(
          EXCEPTION_CONSTANT.USER_PRODUCT_INQUIRY_PRODUCT_MISMATCH,
        );
      }

      if (existingInquiry.status !== UserProductInquiryStatus.PREVIEW_GENERATED) {
        throw new BadRequestException(
          EXCEPTION_CONSTANT.USER_PRODUCT_INQUIRY_CONTACT_ALREADY_SUBMITTED,
        );
      }

      existingInquiry.userSnapshot = userSnapshot;
      existingInquiry.status = UserProductInquiryStatus.CALL_REQUESTED;
      existingInquiry.contact = contact;
      existingInquiry.statusHistory.push({
        status: UserProductInquiryStatus.CALL_REQUESTED,
        reason: "In-person visit contact requested",
        changedAt: requestedAt,
        changedBy: userId,
      });

      await existingInquiry.save();

      return this.toContactSubmitResponse(existingInquiry);
    }

    const product = await this.productService.findActiveProductById(
      input.productId.toString(),
    );

    if (!product) {
      throw new NotFoundException(
        EXCEPTION_CONSTANT.PRODUCT_NOT_FOUND_OR_INACTIVE,
      );
    }

    const createdInquiry = await this.userProductInquiryModel.create({
      isArchived: false,
      userId,
      productId: input.productId,
      userSnapshot,
      productSnapshot: {
        title: product.title,
      },
      status: UserProductInquiryStatus.CALL_REQUESTED,
      statusHistory: [
        {
          status: UserProductInquiryStatus.CALL_REQUESTED,
          reason: "In-person visit contact requested",
          changedAt: requestedAt,
          changedBy: userId,
        },
      ],
      contact,
    });

    return this.toContactSubmitResponse(createdInquiry);
  }

  private async resolveContactSubmitInquiry(
    input: UserProductInquiryContactSubmitGqlInput,
    userId: Types.ObjectId,
  ): Promise<UserProductInquiryDocument | null> {
    const notDeletedFilter = {
      $or: [
        { "audit.deletedAt": null },
        { "audit.deletedAt": { $exists: false } },
      ],
    };

    if (input.inquiryId) {
      const inquiry = await this.userProductInquiryModel
        .findOne({
          _id: input.inquiryId,
          ...notDeletedFilter,
        })
        .exec();

      if (!inquiry) {
        throw new NotFoundException(
          EXCEPTION_CONSTANT.USER_PRODUCT_INQUIRY_NOT_FOUND,
        );
      }

      if (!inquiry.userId.equals(userId)) {
        throw new ForbiddenException(
          EXCEPTION_CONSTANT.USER_PRODUCT_INQUIRY_OWNERSHIP_REQUIRED,
        );
      }

      return inquiry;
    }

    return this.userProductInquiryModel
      .findOne({
        userId,
        productId: input.productId,
        status: UserProductInquiryStatus.PREVIEW_GENERATED,
        ...notDeletedFilter,
      })
      .sort({ "audit.createdAt": -1 })
      .exec();
  }

  private toContactSubmitResponse(
    inquiry: UserProductInquiryDocument,
  ): UserProductInquiryContactSubmitGqlResponse {
    if (!inquiry.contact) {
      throw new BadRequestException(
        EXCEPTION_CONSTANT.USER_PRODUCT_INQUIRY_CONTACT_REQUIRED,
      );
    }

    return {
      id: inquiry._id,
      status: inquiry.status,
      contact: {
        firstName: inquiry.contact.firstName,
        lastName: inquiry.contact.lastName,
        phone: inquiry.contact.phone,
        requestedAt: inquiry.contact.requestedAt,
      },
    };
  }

  async list(
    input: UserProductInquiryListGqlInput,
  ): Promise<UserProductInquiryListPaginatedOffsetGqlResponse> {
    const { filters, options } = input || {};
    const limit =
      options?.limit ?? PAGINATION_CONSTANT.OFFSET_BASED.DEFAULT_LIMIT;
    const skip = options?.skip ?? PAGINATION_CONSTANT.OFFSET_BASED.DEFAULT_SKIP;
    const filterQuery = this.buildListFilterQuery(filters);
    const sortOptions = this.resolveListSortOptions(options?.sort);

    const [inquiries, total] = await Promise.all([
      this.userProductInquiryModel
        .find(filterQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean<UserProductInquiryListRecord[]>()
        .exec(),
      this.userProductInquiryModel.countDocuments(filterQuery).exec(),
    ]);

    return {
      items: inquiries.map((inquiry) => this.toListSummaryResponse(inquiry)),
      pagination: {
        limit,
        skip,
        total,
        count: inquiries.length,
      },
    };
  }

  async detail(
    input: UserProductInquiryDetailGqlInput,
  ): Promise<UserProductInquiryDetailGqlResponse> {
    const inquiry = await this.userProductInquiryModel
      .findOne({
        _id: input.id,
        $or: [
          { "audit.deletedAt": null },
          { "audit.deletedAt": { $exists: false } },
        ],
      })
      .lean<UserProductInquiryListRecord>()
      .exec();

    if (!inquiry) {
      throw new NotFoundException(
        EXCEPTION_CONSTANT.USER_PRODUCT_INQUIRY_NOT_FOUND,
      );
    }

    return this.toDetailResponse(inquiry);
  }

  async update(
    input: UserProductInquiryUpdateGqlInput,
  ): Promise<UserProductInquiryDetailGqlResponse> {
    const inquiry = await this.userProductInquiryModel
      .findOne({
        _id: input.id,
        $or: [
          { "audit.deletedAt": null },
          { "audit.deletedAt": { $exists: false } },
        ],
      })
      .exec();

    if (!inquiry) {
      throw new NotFoundException(
        EXCEPTION_CONSTANT.USER_PRODUCT_INQUIRY_NOT_FOUND,
      );
    }

    await this.assertUpdateReferencesExist(input);
    this.assertFullUpdateInput(input);

    inquiry.isArchived = input.isArchived;
    inquiry.userId = input.userId;
    inquiry.productId = input.productId;
    inquiry.userSnapshot = this.mapUpdateUserSnapshot(input.user);
    inquiry.productSnapshot = this.mapUpdateProductSnapshot(input.product);
    inquiry.status = input.status;
    inquiry.statusHistory = input.statusHistory.map((entry) =>
      this.mapUpdateStatusHistoryEntry(entry),
    );

    if (input.preview === null) {
      inquiry.set("preview", undefined);
    } else if (input.preview) {
      inquiry.preview = input.preview.map((preview) =>
        this.mapUpdatePreview(preview),
      );
    }

    if (input.contact === null) {
      inquiry.set("contact", undefined);
    } else if (input.contact) {
      inquiry.contact = this.mapUpdateContact(input.contact);
    }

    inquiry.markModified("statusHistory");

    try {
      await inquiry.save();
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : EXCEPTION_CONSTANT.UNKNOWN_ERROR_OCCURRED,
      );
    }

    return this.toDetailResponse(inquiry.toObject() as UserProductInquiryListRecord);
  }

  async updateStatus(
    input: UserProductInquiryStatusUpdateGqlInput,
    adminUserId: Types.ObjectId,
  ): Promise<UserProductInquiryDetailGqlResponse> {
    const inquiry = await this.userProductInquiryModel
      .findOne({
        _id: input.id,
        $or: [
          { "audit.deletedAt": null },
          { "audit.deletedAt": { $exists: false } },
        ],
      })
      .exec();

    if (!inquiry) {
      throw new NotFoundException(
        EXCEPTION_CONSTANT.USER_PRODUCT_INQUIRY_NOT_FOUND,
      );
    }

    const changedAt = new Date();
    const description = this.normalizeOptionalText(input.description);
    const historyEntry: UserProductInquiryStatusHistoryEntry = {
      status: input.status,
      reason: this.resolveStatusUpdateReason(input.status),
      changedAt,
      changedBy: adminUserId,
      ...(description ? { description } : {}),
    };

    if (input.status === UserProductInquiryStatus.CONTACTED) {
      if (!input.payload?.contactedAt || !input.payload?.contactedBy) {
        throw new BadRequestException(
          "Contact payload is required when status is CONTACTED",
        );
      }

      await this.assertSuperAdminUserExists(input.payload.contactedBy);

      historyEntry.payload = {
        contactedAt: new Date(input.payload.contactedAt),
        contactedBy: input.payload.contactedBy,
      };
    }

    if (input.status === UserProductInquiryStatus.SALE_COMPLETED) {
      if (!input.payload?.completedAt || !input.payload?.completedBy) {
        throw new BadRequestException(
          "Sale completion payload is required when status is SALE_COMPLETED",
        );
      }

      await this.assertSuperAdminUserExists(input.payload.completedBy);

      const salePayload = {
        completedAt: new Date(input.payload.completedAt),
        completedBy: input.payload.completedBy,
      };

      const isSalePayloadCorrection =
        inquiry.status === UserProductInquiryStatus.SALE_COMPLETED;

      if (isSalePayloadCorrection) {
        const lastEntry =
          inquiry.statusHistory[inquiry.statusHistory.length - 1];

        if (lastEntry.status !== UserProductInquiryStatus.SALE_COMPLETED) {
          throw new BadRequestException(
            "Cannot update sale completion payload when the last status history entry is not SALE_COMPLETED",
          );
        }

        lastEntry.payload = salePayload;

        if (description) {
          lastEntry.description = description;
        }

        inquiry.markModified("statusHistory");
      } else {
        historyEntry.payload = salePayload;
        inquiry.status = input.status;
        inquiry.statusHistory.push(historyEntry);
        inquiry.markModified("statusHistory");
      }
    } else {
      inquiry.status = input.status;
      inquiry.statusHistory.push(historyEntry);
      inquiry.markModified("statusHistory");
    }

    try {
      await inquiry.save();
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : EXCEPTION_CONSTANT.UNKNOWN_ERROR_OCCURRED,
      );
    }

    return this.toDetailResponse(inquiry.toObject() as UserProductInquiryListRecord);
  }

  private resolveStatusUpdateReason(
    status: UserProductInquiryStatus,
  ): string {
    switch (status) {
      case UserProductInquiryStatus.PREVIEW_GENERATED:
        return "Smart preview generated";
      case UserProductInquiryStatus.CALL_REQUESTED:
        return "In-person visit contact requested";
      case UserProductInquiryStatus.PENDING:
        return "Inquiry marked as pending";
      case UserProductInquiryStatus.CONTACTED:
        return "Customer contacted";
      case UserProductInquiryStatus.SALE_COMPLETED:
        return "Sale completed";
      case UserProductInquiryStatus.CLOSED:
        return "Inquiry closed";
      case UserProductInquiryStatus.CANCELLED:
        return "Inquiry cancelled";
      default:
        return "Status updated by administrator";
    }
  }

  private assertFullUpdateInput(input: UserProductInquiryUpdateGqlInput): void {
    const requiredNullableKeys = [
      "preview",
      "contact",
    ] as const;

    for (const key of requiredNullableKeys) {
      if (input[key] === undefined) {
        throw new BadRequestException(
          `userProductInquiryUpdate.${key} is required; pass null to clear optional sections`,
        );
      }
    }
  }

  private async assertUpdateReferencesExist(
    input: UserProductInquiryUpdateGqlInput,
  ): Promise<void> {
    const [ownerUser, product] = await Promise.all([
      this.userService.findById(input.userId),
      this.productModel.findById(input.productId).select({ _id: 1 }).lean().exec(),
    ]);

    if (!ownerUser) {
      throw new NotFoundException(EXCEPTION_CONSTANT.USER_NOT_FOUND);
    }

    if (!product) {
      throw new NotFoundException(EXCEPTION_CONSTANT.PRODUCT_NOT_FOUND);
    }

    const referencedUserIds: Types.ObjectId[] = [input.userId];
    const referencedFileIds: Types.ObjectId[] = [];
    const superAdminChecks: Promise<void>[] = [];

    for (const entry of input.statusHistory) {
      if (entry.changedBy) {
        referencedUserIds.push(entry.changedBy);
      }

      if (entry.payload?.contactedBy) {
        referencedUserIds.push(entry.payload.contactedBy);
        superAdminChecks.push(
          this.assertSuperAdminUserExists(entry.payload.contactedBy),
        );
      }

      if (entry.payload?.completedBy) {
        referencedUserIds.push(entry.payload.completedBy);
        superAdminChecks.push(
          this.assertSuperAdminUserExists(entry.payload.completedBy),
        );
      }
    }

    if (input.preview?.length) {
      for (const preview of input.preview) {
        referencedFileIds.push(
          preview.environmentFileId,
          preview.resultFileId,
        );

        if (preview.sourceProductImageFileId) {
          referencedFileIds.push(preview.sourceProductImageFileId);
        }
      }
    }

    await Promise.all([
      this.assertUsersExist(referencedUserIds),
      this.assertStoredFilesExist(referencedFileIds),
      ...superAdminChecks,
    ]);
  }

  private async assertUsersExist(
    userIds: readonly Types.ObjectId[],
  ): Promise<void> {
    const uniqueIds = [
      ...new Set(userIds.map((userId) => userId.toString())),
    ];

    await Promise.all(
      uniqueIds.map(async (userId) => {
        const user = await this.userService.findById(new Types.ObjectId(userId));

        if (!user) {
          throw new NotFoundException(EXCEPTION_CONSTANT.USER_NOT_FOUND);
        }
      }),
    );
  }

  private async assertSuperAdminUserExists(
    userId: Types.ObjectId,
  ): Promise<void> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException(EXCEPTION_CONSTANT.USER_NOT_FOUND);
    }

    if (!user.roles?.includes(UserRole.SUPER_ADMIN)) {
      throw new BadRequestException(
        "Contacted by user must have SUPER_ADMIN role",
      );
    }
  }

  private async assertStoredFilesExist(
    fileIds: readonly Types.ObjectId[],
  ): Promise<void> {
    const uniqueIds = [
      ...new Set(fileIds.map((fileId) => fileId.toString())),
    ];

    if (uniqueIds.length === 0) {
      return;
    }

    const summaries = await this.fileService.getFileSummariesByIds(uniqueIds);

    if (summaries.size !== uniqueIds.length) {
      throw new NotFoundException(EXCEPTION_CONSTANT.FILE_NOT_FOUND);
    }
  }

  private mapUpdateUserSnapshot(
    input: UserProductInquiryUpdateUserSnapshotGqlInput,
  ): UserProductInquiryUserSnapshot {
    const phoneNumber = this.normalizeOptionalText(input.phoneNumber);

    return {
      fullName: input.fullName.trim(),
      username: input.username.trim().toLowerCase(),
      ...(phoneNumber ? { phoneNumber } : {}),
    };
  }

  private mapUpdateProductSnapshot(
    input: UserProductInquiryUpdateProductSnapshotGqlInput,
  ): { title: string } {
    return {
      title: input.title.trim(),
    };
  }

  private mapUpdateFabricSnapshot(
    input: UserProductInquiryUpdateFabricSnapshotGqlInput,
  ): UserProductInquiryFabricSnapshot {
    const colorHex = this.normalizeOptionalText(input.colorHex);

    return {
      fabricKey: input.fabricKey.trim(),
      colorKey: input.colorKey.trim(),
      patternName: input.patternName.trim(),
      colorName: input.colorName.trim(),
      label: input.label.trim(),
      ...(colorHex ? { colorHex } : {}),
    };
  }

  private mapUpdateStatusHistoryEntry(
    input: UserProductInquiryUpdateStatusHistoryEntryGqlInput,
  ): UserProductInquiryStatusHistoryEntry {
    const description = this.normalizeOptionalText(input.description);

    return {
      status: input.status,
      reason: input.reason.trim(),
      changedAt: new Date(input.changedAt),
      ...(description ? { description } : {}),
      ...(input.changedBy ? { changedBy: input.changedBy } : {}),
      ...(input.payload
        ? { payload: this.mapStatusHistoryPayloadFromUpdateInput(input.payload) }
        : {}),
    };
  }

  private mapStatusHistoryPayloadFromUpdateInput(
    input: UserProductInquiryUpdateStatusHistoryPayloadGqlInput,
  ): UserProductInquiryStatusHistoryPayload {
    const payload: UserProductInquiryStatusHistoryPayload = {};

    if (input.contactedAt) {
      payload.contactedAt = new Date(input.contactedAt);
    }

    if (input.contactedBy) {
      payload.contactedBy = input.contactedBy;
    }

    if (input.completedAt) {
      payload.completedAt = new Date(input.completedAt);
    }

    if (input.completedBy) {
      payload.completedBy = input.completedBy;
    }

    return payload;
  }

  private mapStatusHistoryPayloadToResponse(
    payload: UserProductInquiryStatusHistoryPayload,
  ) {
    return {
      ...(payload.contactedAt ? { contactedAt: payload.contactedAt } : {}),
      ...(payload.contactedBy ? { contactedBy: payload.contactedBy } : {}),
      ...(payload.completedAt ? { completedAt: payload.completedAt } : {}),
      ...(payload.completedBy ? { completedBy: payload.completedBy } : {}),
    };
  }

  private mapUpdatePreview(
    input: UserProductInquiryUpdatePreviewGqlInput,
  ): UserProductInquiryPreview {
    const placementPrompt = this.normalizeOptionalText(input.model.placementPrompt);
    const aspectRatio = this.normalizeOptionalText(input.model.aspectRatio);
    const imageSize = this.normalizeOptionalText(input.model.imageSize);
    const reasoningEffort = this.normalizeOptionalText(input.model.reasoningEffort);

    return {
      environmentFileId: input.environmentFileId,
      resultFileId: input.resultFileId,
      generatedAt: new Date(input.generatedAt),
      fabricSnapshot: this.mapUpdateFabricSnapshot(input.fabric),
      model: {
        provider: input.model.provider.trim(),
        model: input.model.model.trim(),
        ...(placementPrompt ? { placementPrompt } : {}),
        ...(aspectRatio ? { aspectRatio } : {}),
        ...(imageSize ? { imageSize } : {}),
        ...(reasoningEffort ? { reasoningEffort } : {}),
      },
      ...(input.sourceProductImageFileId
        ? { sourceProductImageFileId: input.sourceProductImageFileId }
        : {}),
      ...(input.durationSeconds != null
        ? { durationSeconds: input.durationSeconds }
        : {}),
    };
  }

  private mapUpdateContact(
    input: UserProductInquiryUpdateContactGqlInput,
  ): UserProductInquiryContact {
    const phoneRaw = input.phone.trim();

    if (!isValidMobilePhone(phoneRaw)) {
      throw new BadRequestException(EXCEPTION_CONSTANT.INVALID_MOBILE);
    }

    const normalizedPhone = normalizeAuthIdentityMobileForSubmit(phoneRaw);

    if (!normalizedPhone) {
      throw new BadRequestException(EXCEPTION_CONSTANT.INVALID_MOBILE);
    }

    const customerNote = this.normalizeOptionalText(input.customerNote);

    return {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: normalizedPhone,
      requestedAt: new Date(input.requestedAt),
      ...(customerNote ? { customerNote } : {}),
    };
  }

  private async toDetailResponse(
    inquiry: UserProductInquiryListRecord,
  ): Promise<UserProductInquiryDetailGqlResponse> {
    const [user, product] = await Promise.all([
      this.userService.findById(inquiry.userId),
      this.productModel
        .findById(inquiry.productId)
        .select({ coverImageFileIds: 1 })
        .lean<{ coverImageFileIds?: Types.ObjectId[] } | null>()
        .exec(),
    ]);

    const coverImageFileIds = product?.coverImageFileIds ?? [];
    const previews = this.normalizePreviewArray(inquiry.preview);
    const previewFileIds = previews.flatMap((preview) => [
      preview.environmentFileId,
      preview.resultFileId,
      preview.sourceProductImageFileId,
    ]);
    const fileAccessUrlMap = await this.fileService.getAccessUrlMap([
      ...coverImageFileIds,
      ...previewFileIds,
    ]);

    const resolveFileAccessUrl = (fileId?: Types.ObjectId) => {
      if (!fileId) {
        return undefined;
      }

      return fileAccessUrlMap.get(fileId.toString());
    };

    const coverImageAccessUrls = coverImageFileIds
      .map((fileId) => resolveFileAccessUrl(fileId))
      .filter((accessUrl): accessUrl is NonNullable<typeof accessUrl> =>
        Boolean(accessUrl),
      );

    return {
      id: inquiry._id,
      isArchived: inquiry.isArchived,
      userId: inquiry.userId,
      productId: inquiry.productId,
      user: {
        fullName: inquiry.userSnapshot.fullName,
        username: inquiry.userSnapshot.username,
        phoneNumber: inquiry.userSnapshot.phoneNumber,
        roles: user?.roles ?? [],
      },
      product: {
        title: inquiry.productSnapshot.title,
        coverImageAccessUrls,
      },
      status: inquiry.status,
      statusHistory: (inquiry.statusHistory ?? []).map((entry) => ({
        status: entry.status,
        reason: entry.reason,
        ...(entry.description ? { description: entry.description } : {}),
        changedAt: entry.changedAt,
        ...(entry.changedBy ? { changedBy: entry.changedBy } : {}),
        ...(entry.payload
          ? { payload: this.mapStatusHistoryPayloadToResponse(entry.payload) }
          : {}),
      })),
      preview: previews.length
        ? previews.map((preview) =>
            this.mapPreviewToDetailResponse(preview, resolveFileAccessUrl),
          )
        : undefined,
      contact: inquiry.contact
        ? {
            firstName: inquiry.contact.firstName,
            lastName: inquiry.contact.lastName,
            phone: inquiry.contact.phone,
            requestedAt: inquiry.contact.requestedAt,
            ...(inquiry.contact.customerNote
              ? { customerNote: inquiry.contact.customerNote }
              : {}),
          }
        : undefined,
      createdAt: inquiry.audit?.createdAt,
      updatedAt: inquiry.audit?.updatedAt,
      ...(inquiry.audit?.createdBy ? { createdBy: inquiry.audit.createdBy } : {}),
      ...(inquiry.audit?.updatedBy ? { updatedBy: inquiry.audit.updatedBy } : {}),
    };
  }

  private toListSummaryResponse(
    inquiry: UserProductInquiryListRecord,
  ): UserProductInquiryListSummaryGqlResponse {
    const latestPreviewFabric = this.getLatestPreviewFabricSnapshot(
      inquiry.preview,
    );

    return {
      id: inquiry._id,
      user: {
        fullName: inquiry.userSnapshot.fullName,
        username: inquiry.userSnapshot.username,
        phoneNumber: inquiry.userSnapshot.phoneNumber,
      },
      product: {
        title: inquiry.productSnapshot.title,
      },
      fabric: latestPreviewFabric?.patternName
        ? {
            patternName: latestPreviewFabric.patternName,
            colorName: latestPreviewFabric.colorName,
            ...(latestPreviewFabric.colorHex
              ? { colorHex: latestPreviewFabric.colorHex }
              : {}),
          }
        : undefined,
      status: inquiry.status,
      contact: inquiry.contact
        ? {
            firstName: inquiry.contact.firstName,
            lastName: inquiry.contact.lastName,
            phone: inquiry.contact.phone,
            requestedAt: inquiry.contact.requestedAt,
          }
        : undefined,
      previewGeneratedAt: this.getLatestPreviewGeneratedAt(inquiry.preview),
      previewCount: this.normalizePreviewArray(inquiry.preview).length,
      createdAt: inquiry.audit?.createdAt,
      updatedAt: inquiry.audit?.updatedAt,
    };
  }

  private buildListFilterQuery(
    filters?: UserProductInquiryListGqlInput["filters"],
  ): FilterQuery<UserProductInquiry> {
    const query: FilterQuery<UserProductInquiry> = {
      $and: [
        {
          $or: [
            { "audit.deletedAt": null },
            { "audit.deletedAt": { $exists: false } },
          ],
        },
      ],
    };

    if (!filters) {
      query.isArchived = false;
      return query;
    }

    if (typeof filters.isArchived === "boolean") {
      query.isArchived = filters.isArchived;
    } else {
      query.isArchived = false;
    }

    if (filters.query?.trim()) {
      const searchRegex = this.createContainsRegex(filters.query);
      this.addListOrFilter(query, [
        { "userSnapshot.fullName": searchRegex },
        { "userSnapshot.username": searchRegex },
        { "userSnapshot.phoneNumber": searchRegex },
        { "productSnapshot.title": searchRegex },
        { "preview.fabricSnapshot.label": searchRegex },
        { "contact.firstName": searchRegex },
        { "contact.lastName": searchRegex },
        { "contact.phone": searchRegex },
      ]);
    }

    if (filters.id) {
      query._id = new Types.ObjectId(filters.id);
    }

    if (filters.userId) {
      query.userId = new Types.ObjectId(filters.userId);
    }

    if (filters.productId) {
      query.productId = new Types.ObjectId(filters.productId);
    }

    this.addListContainsFilter(
      query,
      "userSnapshot.fullName",
      filters.userFullName,
    );
    this.addListContainsFilter(
      query,
      "userSnapshot.username",
      filters.username,
    );
    this.addListContainsFilter(
      query,
      "userSnapshot.phoneNumber",
      filters.userPhone,
    );
    this.addListContainsFilter(
      query,
      "productSnapshot.title",
      filters.productTitle,
    );
    this.addListContainsFilter(
      query,
      "preview.fabricSnapshot.label",
      filters.fabricLabel,
    );

    if (filters.statuses?.length) {
      query.status = { $in: filters.statuses };
    } else if (filters.status) {
      query.status = filters.status;
    }

    this.addListContainsFilter(
      query,
      "contact.firstName",
      filters.contactFirstName,
    );
    this.addListContainsFilter(
      query,
      "contact.lastName",
      filters.contactLastName,
    );
    this.addListContainsFilter(query, "contact.phone", filters.contactPhone);

    this.addListDateRangeFilter(
      query,
      "audit.createdAt",
      filters.createdAtFrom,
      filters.createdAtTo,
    );
    this.addListDateRangeFilter(
      query,
      "audit.updatedAt",
      filters.updatedAtFrom,
      filters.updatedAtTo,
    );
    this.addListDateRangeFilter(
      query,
      "preview.generatedAt",
      filters.previewGeneratedAtFrom,
      filters.previewGeneratedAtTo,
    );
    this.addListDateRangeFilter(
      query,
      "contact.requestedAt",
      filters.contactRequestedAtFrom,
      filters.contactRequestedAtTo,
    );

    return query;
  }

  private resolveListSortOptions(
    sort?: UserProductInquiryListSortOptionInput,
  ): Record<string, 1 | -1> {
    const sortOptions = buildSortOptions<UserProductInquiryListSortField>(
      sort ?? {},
      {
        createdAt: "audit.createdAt",
        updatedAt: "audit.updatedAt",
        status: "status",
        productTitle: "productSnapshot.title",
        previewGeneratedAt: "preview.generatedAt",
        contactRequestedAt: "contact.requestedAt",
      },
      { createdAt: SortingOrder.DESC },
    );

    sortOptions._id = Object.values(sortOptions)[0] ?? -1;

    return sortOptions;
  }

  private addListContainsFilter(
    query: FilterQuery<UserProductInquiry>,
    path: string,
    value?: string,
  ): void {
    if (value?.trim()) {
      query[path] = this.createContainsRegex(value);
    }
  }

  private addListOrFilter(
    query: FilterQuery<UserProductInquiry>,
    conditions: FilterQuery<UserProductInquiry>[],
  ): void {
    query.$and = [
      ...(Array.isArray(query.$and) ? query.$and : []),
      { $or: conditions },
    ];
  }

  private addListDateRangeFilter(
    query: FilterQuery<UserProductInquiry>,
    path: string,
    from?: string,
    to?: string,
  ): void {
    const range: Record<string, Date> = {};
    const fromDate = this.parseListFilterDate(from, false);
    const toDate = this.parseListFilterDate(to, true);

    if (fromDate) {
      range.$gte = fromDate;
    }

    if (toDate) {
      range.$lte = toDate;
    }

    if (Object.keys(range).length > 0) {
      query[path] = range;
    }
  }

  private parseListFilterDate(
    value: string | undefined,
    endOfDay: boolean,
  ): Date | undefined {
    if (!value?.trim()) {
      return undefined;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return undefined;
    }

    if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
      date.setHours(23, 59, 59, 999);
    }

    return date;
  }

  private createContainsRegex(value: string): {
    $regex: string;
    $options: string;
  } {
    const escaped = value.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return { $regex: escaped, $options: "i" };
  }

  private toUserProductInquiryUserSnapshot(
    user: Pick<User, "profile" | "username">,
  ): UserProductInquiryUserSnapshot {
    const fullName = [
      this.normalizeOptionalText(user.profile?.firstName),
      this.normalizeOptionalText(user.profile?.lastName),
    ]
      .filter(Boolean)
      .join(" ");
    const phoneNumber = this.normalizeOptionalText(user.profile?.phoneNumber);

    return {
      fullName: fullName || "N/A",
      username: user.username,
      ...(phoneNumber ? { phoneNumber } : {}),
    };
  }

  private normalizeOptionalText(value?: string | null): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }

  private splitContactFullName(fullName: string): {
    firstName: string;
    lastName: string;
  } {
    const trimmed = fullName.trim();
    const spaceIndex = trimmed.search(/\s/);

    if (spaceIndex === -1) {
      return {
        firstName: trimmed,
        lastName: "\u200c",
      };
    }

    const firstName = trimmed.slice(0, spaceIndex).trim();
    const lastName = trimmed.slice(spaceIndex).trim();

    return {
      firstName,
      lastName: lastName || "\u200c",
    };
  }

  private normalizePreviewArray(
    preview?: UserProductInquiryPreview | UserProductInquiryPreview[] | null,
  ): UserProductInquiryPreview[] {
    if (preview == null) {
      return [];
    }

    if (Array.isArray(preview)) {
      return preview;
    }

    return [preview];
  }

  private getLatestPreviewGeneratedAt(
    preview?: UserProductInquiryPreview | UserProductInquiryPreview[] | null,
  ): Date | undefined {
    const previews = this.normalizePreviewArray(preview);

    return previews.reduce<Date | undefined>((latest, entry) => {
      if (!entry.generatedAt) {
        return latest;
      }

      if (!latest || entry.generatedAt > latest) {
        return entry.generatedAt;
      }

      return latest;
    }, undefined);
  }

  private buildPreviewEntry(params: {
    environmentFileId: Types.ObjectId;
    resultFileId: Types.ObjectId;
    sourceProductImageFileId: Types.ObjectId;
    generatedAt: Date;
    durationSeconds: number;
    modelName: string;
    placementPrompt?: string;
    aspectRatio?: string;
    imageSize: string;
    isRiverflowModel: boolean;
    fabricSnapshot: UserProductInquiryFabricSnapshot;
  }): UserProductInquiryPreview {
    return {
      environmentFileId: params.environmentFileId,
      resultFileId: params.resultFileId,
      sourceProductImageFileId: params.sourceProductImageFileId,
      generatedAt: params.generatedAt,
      durationSeconds: params.durationSeconds,
      fabricSnapshot: params.fabricSnapshot,
      model: {
        provider: "openrouter",
        model: params.modelName,
        ...(params.placementPrompt ? { placementPrompt: params.placementPrompt } : {}),
        ...(params.aspectRatio ? { aspectRatio: params.aspectRatio } : {}),
        imageSize: params.imageSize,
        ...(params.isRiverflowModel ? { reasoningEffort: "high" } : {}),
      },
    };
  }

  private getLatestPreviewFabricSnapshot(
    preview?: UserProductInquiryPreview | UserProductInquiryPreview[] | null,
  ): UserProductInquiryFabricSnapshot | undefined {
    const previews = this.normalizePreviewArray(preview);
    let latestFabric: UserProductInquiryFabricSnapshot | undefined;
    let latestGeneratedAt: Date | undefined;

    for (const entry of previews) {
      if (!entry.fabricSnapshot || !entry.generatedAt) {
        continue;
      }

      if (!latestGeneratedAt || entry.generatedAt > latestGeneratedAt) {
        latestGeneratedAt = entry.generatedAt;
        latestFabric = entry.fabricSnapshot;
      }
    }

    return latestFabric;
  }

  private mapFabricSnapshotToDetailResponse(
    fabricSnapshot: UserProductInquiryFabricSnapshot,
  ): UserProductInquiryDetailPreviewGqlResponse["fabric"] {
    return {
      fabricKey: fabricSnapshot.fabricKey,
      colorKey: fabricSnapshot.colorKey,
      patternName: fabricSnapshot.patternName,
      colorName: fabricSnapshot.colorName,
      ...(fabricSnapshot.colorHex ? { colorHex: fabricSnapshot.colorHex } : {}),
      label: fabricSnapshot.label,
    };
  }

  private mapPreviewToDetailResponse(
    preview: UserProductInquiryPreview,
    resolveFileAccessUrl: (
      fileId?: Types.ObjectId,
    ) => UserProductInquiryDetailPreviewGqlResponse["environmentFileAccessUrl"],
  ): UserProductInquiryDetailPreviewGqlResponse {
    return {
      environmentFileId: preview.environmentFileId,
      resultFileId: preview.resultFileId,
      ...(preview.sourceProductImageFileId
        ? { sourceProductImageFileId: preview.sourceProductImageFileId }
        : {}),
      generatedAt: preview.generatedAt,
      ...(preview.durationSeconds != null
        ? { durationSeconds: preview.durationSeconds }
        : {}),
      model: {
        provider: preview.model.provider,
        model: preview.model.model,
        ...(preview.model.placementPrompt
          ? { placementPrompt: preview.model.placementPrompt }
          : {}),
        ...(preview.model.aspectRatio
          ? { aspectRatio: preview.model.aspectRatio }
          : {}),
        ...(preview.model.imageSize
          ? { imageSize: preview.model.imageSize }
          : {}),
        ...(preview.model.reasoningEffort
          ? { reasoningEffort: preview.model.reasoningEffort }
          : {}),
      },
      fabric: this.mapFabricSnapshotToDetailResponse(preview.fabricSnapshot),
      environmentFileAccessUrl: resolveFileAccessUrl(
        preview.environmentFileId,
      ),
      resultFileAccessUrl: resolveFileAccessUrl(preview.resultFileId),
      sourceProductImageFileAccessUrl: resolveFileAccessUrl(
        preview.sourceProductImageFileId,
      ),
    };
  }

  private canAppendPreviewToInquiry(status: UserProductInquiryStatus): boolean {
    return (
      status === UserProductInquiryStatus.PREVIEW_GENERATED ||
      status === UserProductInquiryStatus.CALL_REQUESTED
    );
  }

  private async resolvePreviewSubmitInquiry(
    input: UserProductInquiryPreviewSubmitGqlInput,
    userId: Types.ObjectId,
  ): Promise<UserProductInquiryDocument | null> {
    if (!input.inquiryId) {
      return null;
    }

    const notDeletedFilter = {
      $or: [
        { "audit.deletedAt": null },
        { "audit.deletedAt": { $exists: false } },
      ],
    };

    const inquiry = await this.userProductInquiryModel
      .findOne({
        _id: input.inquiryId,
        ...notDeletedFilter,
      })
      .exec();

    if (!inquiry) {
      throw new NotFoundException(
        EXCEPTION_CONSTANT.USER_PRODUCT_INQUIRY_NOT_FOUND,
      );
    }

    if (!inquiry.userId.equals(userId)) {
      throw new ForbiddenException(
        EXCEPTION_CONSTANT.USER_PRODUCT_INQUIRY_OWNERSHIP_REQUIRED,
      );
    }

    return inquiry;
  }

  private buildPreviewSubmitResponse(params: {
    inquiryId: Types.ObjectId;
    productId: Types.ObjectId;
    status: UserProductInquiryStatus;
    previewResult: ProductAiPreviewResult;
    environmentFileId: Types.ObjectId;
    resultFileId: Types.ObjectId;
    sourceProductImageFileId: Types.ObjectId;
    generatedAt: Date;
    stagingDurationSeconds: number;
  }): UserProductInquiryPreviewSubmitGqlResponse {
    const { previewResult } = params;

    return {
      id: params.inquiryId,
      productId: params.productId,
      status: params.status,
      image: previewResult.image,
      durationSeconds: previewResult.durationSeconds,
      stagingDurationSeconds: params.stagingDurationSeconds,
      description: previewResult.description,
      environmentFileId: params.environmentFileId,
      resultFileId: params.resultFileId,
      sourceProductImageFileId: params.sourceProductImageFileId,
      generatedAt: params.generatedAt,
      ...(previewResult.aspectRatio
        ? { aspectRatio: previewResult.aspectRatio }
        : {}),
      imageSize: previewResult.imageSize,
      product: {
        id: new Types.ObjectId(previewResult.product.id),
        title: previewResult.product.title,
      },
      fabric: {
        patternName: previewResult.fabric.patternName,
        colorName: previewResult.fabric.colorName,
        ...(previewResult.fabric.colorHex
          ? { colorHex: previewResult.fabric.colorHex }
          : {}),
        label: previewResult.fabric.label,
      },
    };
  }
}
