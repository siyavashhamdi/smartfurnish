import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
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
  UserProductInquiryStatusHistoryContacted,
  UserProductInquiryStatusHistorySaleCompleted,
  UserProductInquiryPreview,
  UserProductInquiryContact,
} from "../../database/schemas";
import {
  BadgeCountTriggerAction,
  BadgeCountTriggerSource,
  GeneralSubscriptionUpdateType,
  NotificationMode,
  NotificationSource,
  UserProductInquiryStatus,
  USER_PRODUCT_INQUIRY_TERMINAL_STATUSES,
  UserRole,
} from "../../enums";
import { SortingOrder } from "../../common/pagination/input/sorting-order.enum";
import { buildSortOptions } from "../../common/pagination/utils";
import {
  isValidMobilePhone,
  normalizeAuthIdentityMobileForSubmit,
} from "../../utils/contact-validation.util";
import { AppSettingsService } from "../app-settings";
import { BadgeService } from "../badge/badge.service";
import { FileService } from "../file";
import { NotificationService } from "../notification/notification.service";
import { ProductService } from "../product/product.service";
import { ProductAiPreviewService } from "../product-ai-preview/services/product-ai-preview.service";
import type { ProductAiPreviewResult } from "../product-ai-preview/services/product-ai-preview.service";
import {
  resolveWebPushBody,
  resolveWebPushTitle,
} from "../push-notification/utils/resolve-web-push-content.util";
import { PushNotificationService } from "../push-notification/push-notification.service";
import { UserService, UserSubscriptionService } from "../user";
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
  UserProductInquiryUpdateStatusHistoryContactedGqlInput,
  UserProductInquiryUpdateStatusHistorySaleCompletedGqlInput,
  UserProductInquiryUpdateUserSnapshotGqlInput,
  UserProductInquiryPreviewSubmitGqlInput,
  UserProductInquiryContactSubmitGqlInput,
  UserProductInquiryClaimGqlInput,
  UserProductInquiryHasActiveRequestGqlInput,
} from "./graphql/inputs";
import {
  UserProductInquiryPreviewSubmitGqlResponse,
  UserProductInquiryListPaginatedOffsetGqlResponse,
  UserProductInquiryListSummaryGqlResponse,
  UserProductInquiryContactSubmitGqlResponse,
  UserProductInquiryClaimGqlResponse,
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

export type ActiveUserProductInquirySummary = {
  readonly id: Types.ObjectId;
  readonly status: UserProductInquiryStatus;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly requestedAt: Date;
};

export type FindActiveUserProductInquiriesParams = {
  readonly phone?: string;
  readonly productId?: Types.ObjectId;
  readonly userId?: Types.ObjectId;
  readonly excludeInquiryId?: Types.ObjectId;
};

const INQUIRY_BADGE_STATUSES = [
  UserProductInquiryStatus.CALL_REQUESTED,
  UserProductInquiryStatus.CONTACTED,
  UserProductInquiryStatus.PENDING,
] as const;

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
    private readonly badgeService: BadgeService,
    private readonly notificationService: NotificationService,
    private readonly userSubscriptionService: UserSubscriptionService,
    private readonly pushNotificationService: PushNotificationService,
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

      return await this.buildPreviewSubmitResponse({
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

    return await this.buildPreviewSubmitResponse({
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

      if (
        existingInquiry.status !== UserProductInquiryStatus.PREVIEW_GENERATED
      ) {
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

      await this.publishInquiryBadgeCountSignal({
        inquiryId: existingInquiry._id,
        action: BadgeCountTriggerAction.UPDATED,
        includeStaffUsersWhenActionableInquiriesExist: true,
        previousStatus: UserProductInquiryStatus.PREVIEW_GENERATED,
        nextStatus: UserProductInquiryStatus.CALL_REQUESTED,
      });

      await this.notifyInquiryContactSubmitted(existingInquiry);

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

    await this.publishInquiryBadgeCountSignal({
      inquiryId: createdInquiry._id,
      action: BadgeCountTriggerAction.CREATED,
      includeStaffUsersWhenActionableInquiriesExist: true,
      nextStatus: UserProductInquiryStatus.CALL_REQUESTED,
    });

    await this.notifyInquiryContactSubmitted(createdInquiry);

    return this.toContactSubmitResponse(createdInquiry);
  }

  async findActiveInquiries(
    params: FindActiveUserProductInquiriesParams,
  ): Promise<ActiveUserProductInquirySummary[]> {
    const normalizedPhone = params.phone?.trim()
      ? normalizeAuthIdentityMobileForSubmit(params.phone.trim())
      : null;

    if (!normalizedPhone && !params.userId) {
      return [];
    }

    const filter: FilterQuery<UserProductInquiry> = {
      $and: [
        {
          $or: [
            { "audit.deletedAt": null },
            { "audit.deletedAt": { $exists: false } },
          ],
        },
      ],
      isArchived: false,
      status: { $nin: [...USER_PRODUCT_INQUIRY_TERMINAL_STATUSES] },
      contact: { $exists: true, $ne: null },
    };

    if (normalizedPhone) {
      filter["contact.phone"] = normalizedPhone;
    }

    if (params.productId) {
      filter.productId = params.productId;
    }

    if (params.userId) {
      filter.userId = params.userId;
    }

    if (params.excludeInquiryId) {
      filter._id = { $ne: params.excludeInquiryId };
    }

    const inquiries = await this.userProductInquiryModel
      .find(filter)
      .select({
        _id: 1,
        status: 1,
        "contact.firstName": 1,
        "contact.lastName": 1,
        "contact.phone": 1,
        "contact.requestedAt": 1,
      })
      .sort({ "contact.requestedAt": -1 })
      .lean<
        Array<{
          _id: Types.ObjectId;
          status: UserProductInquiryStatus;
          contact: {
            firstName: string;
            lastName: string;
            phone: string;
            requestedAt: Date;
          };
        }>
      >()
      .exec();

    return inquiries.map((inquiry) => ({
      id: inquiry._id,
      status: inquiry.status,
      firstName: inquiry.contact.firstName,
      lastName: inquiry.contact.lastName,
      phone: inquiry.contact.phone,
      requestedAt: inquiry.contact.requestedAt,
    }));
  }

  async hasActiveInquiryRequest(
    input: UserProductInquiryHasActiveRequestGqlInput,
  ): Promise<boolean> {
    const phoneRaw = input.phone.trim();
    if (!isValidMobilePhone(phoneRaw)) {
      return false;
    }

    const normalizedPhone = normalizeAuthIdentityMobileForSubmit(phoneRaw);
    if (!normalizedPhone) {
      return false;
    }

    const activeInquiries = await this.findActiveInquiries({
      phone: normalizedPhone,
      productId: input.productId,
    });

    return activeInquiries.length > 0;
  }

  async claimInquiryForRegisteredUser(
    input: UserProductInquiryClaimGqlInput,
    anonymousUserId: Types.ObjectId,
    anonymousSessionId: string,
  ): Promise<UserProductInquiryClaimGqlResponse> {
    const registeredUser =
      await this.userService.resolveActiveUserFromAccessToken(
        input.accessToken,
      );

    if (
      !registeredUser ||
      registeredUser.roles?.includes(UserRole.ANONYMOUS) ||
      registeredUser.roles?.includes(UserRole.SUPER_ADMIN)
    ) {
      throw new BadRequestException(
        EXCEPTION_CONSTANT.USER_PRODUCT_INQUIRY_CLAIM_INVALID_ACCESS_TOKEN,
      );
    }

    const inquiry = await this.userProductInquiryModel
      .findOne({
        _id: input.inquiryId,
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

    if (inquiry.userId.equals(registeredUser._id)) {
      await this.userService.completeAnonymousSessionHandoff({
        anonymousSessionId,
        anonymousUserId,
        successorAccessToken: input.accessToken,
      });
      return { id: inquiry._id };
    }

    if (!inquiry.userId.equals(anonymousUserId)) {
      throw new ForbiddenException(
        EXCEPTION_CONSTANT.USER_PRODUCT_INQUIRY_OWNERSHIP_REQUIRED,
      );
    }

    inquiry.userId = registeredUser._id;
    inquiry.userSnapshot =
      this.toUserProductInquiryUserSnapshot(registeredUser);
    await inquiry.save();

    await this.userService.completeAnonymousSessionHandoff({
      anonymousSessionId,
      anonymousUserId,
      successorAccessToken: input.accessToken,
    });

    return { id: inquiry._id };
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

    const previousStatus = inquiry.status;

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
        error instanceof Error
          ? error.message
          : EXCEPTION_CONSTANT.UNKNOWN_ERROR_OCCURRED,
      );
    }

    await this.publishInquiryStatusChangeBadgeCountSignal({
      inquiryId: inquiry._id,
      previousStatus,
      nextStatus: inquiry.status,
    });

    await this.notifyInquiryStatusChanged(inquiry, previousStatus, {
      changedByAdmin: true,
    });

    return this.toDetailResponse(
      inquiry.toObject() as UserProductInquiryListRecord,
    );
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

    const previousStatus = inquiry.status;
    const changedAt = new Date();
    const description = this.normalizeOptionalText(input.description);
    let isSalePayloadCorrection = false;
    const historyEntry: UserProductInquiryStatusHistoryEntry = {
      status: input.status,
      reason: this.resolveStatusUpdateReason(input.status),
      changedAt,
      changedBy: adminUserId,
      ...(description ? { description } : {}),
    };

    if (input.status === UserProductInquiryStatus.CONTACTED) {
      if (!input.contacted?.contactedAt || !input.contacted?.contactedBy) {
        throw new BadRequestException(
          "Contact details are required when status is CONTACTED",
        );
      }

      await this.assertSuperAdminUserExists(input.contacted.contactedBy);

      historyEntry.contacted = {
        contactedAt: new Date(input.contacted.contactedAt),
        contactedBy: input.contacted.contactedBy,
      };
    }

    if (input.status === UserProductInquiryStatus.SALE_COMPLETED) {
      if (
        !input.saleCompleted?.completedAt ||
        !input.saleCompleted?.completedBy ||
        input.saleCompleted?.finalPriceIrt == null
      ) {
        throw new BadRequestException(
          "Sale completion details are required when status is SALE_COMPLETED",
        );
      }

      await this.assertSuperAdminUserExists(input.saleCompleted.completedBy);

      const saleCompleted: UserProductInquiryStatusHistorySaleCompleted = {
        completedAt: new Date(input.saleCompleted.completedAt),
        completedBy: input.saleCompleted.completedBy,
        finalPriceIrt: input.saleCompleted.finalPriceIrt,
      };

      isSalePayloadCorrection =
        inquiry.status === UserProductInquiryStatus.SALE_COMPLETED;

      if (isSalePayloadCorrection) {
        const lastEntry =
          inquiry.statusHistory[inquiry.statusHistory.length - 1];

        if (lastEntry.status !== UserProductInquiryStatus.SALE_COMPLETED) {
          throw new BadRequestException(
            "Cannot update sale completion details when the last status history entry is not SALE_COMPLETED",
          );
        }

        lastEntry.saleCompleted = saleCompleted;

        if (description) {
          lastEntry.description = description;
        }

        inquiry.markModified("statusHistory");
      } else {
        historyEntry.saleCompleted = saleCompleted;
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
        error instanceof Error
          ? error.message
          : EXCEPTION_CONSTANT.UNKNOWN_ERROR_OCCURRED,
      );
    }

    if (!isSalePayloadCorrection) {
      await this.publishInquiryStatusChangeBadgeCountSignal({
        inquiryId: inquiry._id,
        previousStatus,
        nextStatus: inquiry.status,
      });

      await this.notifyInquiryStatusChanged(inquiry, previousStatus, {
        changedByAdmin: true,
      });
    }

    return this.toDetailResponse(
      inquiry.toObject() as UserProductInquiryListRecord,
    );
  }

  private resolveStatusUpdateReason(status: UserProductInquiryStatus): string {
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
    const requiredNullableKeys = ["preview", "contact"] as const;

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
      this.productModel
        .findById(input.productId)
        .select({ _id: 1 })
        .lean()
        .exec(),
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

      if (entry.contacted?.contactedBy) {
        referencedUserIds.push(entry.contacted.contactedBy);
        superAdminChecks.push(
          this.assertSuperAdminUserExists(entry.contacted.contactedBy),
        );
      }

      if (entry.saleCompleted?.completedBy) {
        referencedUserIds.push(entry.saleCompleted.completedBy);
        superAdminChecks.push(
          this.assertSuperAdminUserExists(entry.saleCompleted.completedBy),
        );
      }
    }

    if (input.preview?.length) {
      for (const preview of input.preview) {
        referencedFileIds.push(preview.environmentFileId, preview.resultFileId);

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
    const uniqueIds = [...new Set(userIds.map((userId) => userId.toString()))];

    await Promise.all(
      uniqueIds.map(async (userId) => {
        const user = await this.userService.findById(
          new Types.ObjectId(userId),
        );

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
    const uniqueIds = [...new Set(fileIds.map((fileId) => fileId.toString()))];

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
      ...(input.contacted
        ? {
            contacted: this.mapStatusHistoryContactedFromUpdateInput(
              input.contacted,
            ),
          }
        : {}),
      ...(input.saleCompleted
        ? {
            saleCompleted: this.mapStatusHistorySaleCompletedFromUpdateInput(
              input.saleCompleted,
            ),
          }
        : {}),
    };
  }

  private mapStatusHistoryContactedFromUpdateInput(
    input: UserProductInquiryUpdateStatusHistoryContactedGqlInput,
  ): UserProductInquiryStatusHistoryContacted {
    return {
      contactedAt: new Date(input.contactedAt),
      contactedBy: input.contactedBy,
    };
  }

  private mapStatusHistorySaleCompletedFromUpdateInput(
    input: UserProductInquiryUpdateStatusHistorySaleCompletedGqlInput,
  ): UserProductInquiryStatusHistorySaleCompleted {
    return {
      completedAt: new Date(input.completedAt),
      completedBy: input.completedBy,
      finalPriceIrt: input.finalPriceIrt,
    };
  }

  private mapStatusHistoryContactedToResponse(
    contacted: UserProductInquiryStatusHistoryContacted,
  ) {
    return {
      contactedAt: contacted.contactedAt,
      contactedBy: contacted.contactedBy,
    };
  }

  private mapStatusHistorySaleCompletedToResponse(
    saleCompleted: UserProductInquiryStatusHistorySaleCompleted,
  ) {
    return {
      completedAt: saleCompleted.completedAt,
      completedBy: saleCompleted.completedBy,
      finalPriceIrt: saleCompleted.finalPriceIrt,
    };
  }

  private mapUpdatePreview(
    input: UserProductInquiryUpdatePreviewGqlInput,
  ): UserProductInquiryPreview {
    const placementPrompt = this.normalizeOptionalText(
      input.model.placementPrompt,
    );
    const aspectRatio = this.normalizeOptionalText(input.model.aspectRatio);
    const imageSize = this.normalizeOptionalText(input.model.imageSize);
    const reasoningEffort = this.normalizeOptionalText(
      input.model.reasoningEffort,
    );

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

    const relatedActiveInquiries = inquiry.contact?.phone
      ? await this.findActiveInquiries({
          phone: inquiry.contact.phone,
          excludeInquiryId: inquiry._id,
        })
      : [];

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
        ...(entry.contacted
          ? {
              contacted: this.mapStatusHistoryContactedToResponse(
                entry.contacted,
              ),
            }
          : {}),
        ...(entry.saleCompleted
          ? {
              saleCompleted: this.mapStatusHistorySaleCompletedToResponse(
                entry.saleCompleted,
              ),
            }
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
      relatedActiveInquiries: relatedActiveInquiries.map((relatedInquiry) => ({
        id: relatedInquiry.id,
        status: relatedInquiry.status,
        firstName: relatedInquiry.firstName,
        lastName: relatedInquiry.lastName,
        phone: relatedInquiry.phone,
        requestedAt: relatedInquiry.requestedAt,
      })),
      createdAt: inquiry.audit?.createdAt,
      updatedAt: inquiry.audit?.updatedAt,
      ...(inquiry.audit?.createdBy
        ? { createdBy: inquiry.audit.createdBy }
        : {}),
      ...(inquiry.audit?.updatedBy
        ? { updatedBy: inquiry.audit.updatedBy }
        : {}),
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

    if (filters.userFullName?.trim()) {
      const contactNameRegex = this.createContainsRegex(filters.userFullName);
      this.addListOrFilter(query, [
        { "contact.firstName": contactNameRegex },
        { "contact.lastName": contactNameRegex },
      ]);
    }
    this.addListContainsFilter(
      query,
      "userSnapshot.username",
      filters.username,
    );
    this.addListContainsFilter(query, "contact.phone", filters.userPhone);
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
        ...(params.placementPrompt
          ? { placementPrompt: params.placementPrompt }
          : {}),
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
      environmentFileAccessUrl: resolveFileAccessUrl(preview.environmentFileId),
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

  private async buildPreviewSubmitResponse(params: {
    inquiryId: Types.ObjectId;
    productId: Types.ObjectId;
    status: UserProductInquiryStatus;
    previewResult: ProductAiPreviewResult;
    environmentFileId: Types.ObjectId;
    resultFileId: Types.ObjectId;
    sourceProductImageFileId: Types.ObjectId;
    generatedAt: Date;
    stagingDurationSeconds: number;
  }): Promise<UserProductInquiryPreviewSubmitGqlResponse> {
    const { previewResult } = params;
    const accessUrlMap = await this.fileService.getAccessUrlMap([
      params.resultFileId,
    ]);
    const resultFileAccessUrl = accessUrlMap.get(
      params.resultFileId.toString(),
    );

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
      ...(resultFileAccessUrl ? { resultFileAccessUrl } : {}),
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

  private async publishInquiryBadgeCountSignal(params: {
    inquiryId: Types.ObjectId;
    action: BadgeCountTriggerAction;
    includeStaffUsers?: boolean;
    includeStaffUsersWhenActionableInquiriesExist?: boolean;
    previousStatus?: UserProductInquiryStatus;
    nextStatus?: UserProductInquiryStatus;
  }): Promise<void> {
    let includeStaffUsers = params.includeStaffUsers ?? false;

    if (params.includeStaffUsersWhenActionableInquiriesExist) {
      includeStaffUsers = await this.shouldPublishStaffInquiryBadgeCountSignal(
        params.previousStatus,
        params.nextStatus,
      );
    }

    if (!includeStaffUsers) {
      return;
    }

    await this.badgeService.publishCountSignal({
      includeStaffUsers,
      payload: {
        source: BadgeCountTriggerSource.INQUIRY,
        action: params.action,
        inquiryId: params.inquiryId.toString(),
      },
    });
  }

  private async publishInquiryStatusChangeBadgeCountSignal(params: {
    inquiryId: Types.ObjectId;
    previousStatus: UserProductInquiryStatus;
    nextStatus: UserProductInquiryStatus;
  }): Promise<void> {
    if (params.previousStatus === params.nextStatus) {
      return;
    }

    await this.publishInquiryBadgeCountSignal({
      inquiryId: params.inquiryId,
      action: BadgeCountTriggerAction.UPDATED,
      includeStaffUsersWhenActionableInquiriesExist: true,
      previousStatus: params.previousStatus,
      nextStatus: params.nextStatus,
    });
  }

  private async shouldPublishStaffInquiryBadgeCountSignal(
    previousStatus?: UserProductInquiryStatus,
    nextStatus?: UserProductInquiryStatus,
  ): Promise<boolean> {
    if (
      nextStatus &&
      INQUIRY_BADGE_STATUSES.includes(
        nextStatus as (typeof INQUIRY_BADGE_STATUSES)[number],
      )
    ) {
      return true;
    }

    if (await this.hasAnyActionableInquiries()) {
      return true;
    }

    return (
      previousStatus != null &&
      INQUIRY_BADGE_STATUSES.includes(
        previousStatus as (typeof INQUIRY_BADGE_STATUSES)[number],
      )
    );
  }

  private async hasAnyActionableInquiries(): Promise<boolean> {
    const actionableInquiry = await this.userProductInquiryModel
      .findOne({
        isArchived: false,
        status: { $in: [...INQUIRY_BADGE_STATUSES] },
        $or: [
          { "audit.deletedAt": null },
          { "audit.deletedAt": { $exists: false } },
        ],
      })
      .select({ _id: 1 })
      .lean<{ _id: Types.ObjectId }>()
      .exec();

    return actionableInquiry != null;
  }

  private async notifyInquiryContactSubmitted(
    inquiry: UserProductInquiryDocument,
  ): Promise<void> {
    const productTitle =
      this.normalizeOptionalText(inquiry.productSnapshot?.title) || "محصول";

    await this.deliverInquiryEndUserNotification({
      inquiry,
      title: "درخواست بازدید ثبت شد",
      message: `درخواست بازدید حضوری شما برای محصول «${productTitle}» با موفقیت ثبت شد. به‌زودی با شما تماس می‌گیریم.`,
      mode: NotificationMode.SUCCESS,
      payload: {
        notificationKind: "INQUIRY_CONTACT_SUBMITTED",
      },
      silent: true,
    });
  }

  private resolveInquiryStatusNotificationContent(
    productTitle: string,
    status: UserProductInquiryStatus,
  ): {
    title: string;
    message: string;
    mode: NotificationMode;
    payload: Record<string, unknown>;
  } | null {
    switch (status) {
      case UserProductInquiryStatus.PENDING:
        return {
          title: "درخواست بازدید در حال بررسی است",
          message: `درخواست بازدید حضوری شما برای محصول «${productTitle}» در حال بررسی است. شما را از وضعیت مطلع خواهیم کرد.`,
          mode: NotificationMode.SUCCESS,
          payload: {
            notificationKind: "INQUIRY_UNDER_REVIEW",
          },
        };
      case UserProductInquiryStatus.CANCELLED:
        return {
          title: "درخواست بازدید لغو شد",
          message: `درخواست بازدید حضوری شما برای محصول «${productTitle}» لغو شد. در صورت تمایل می‌توانید درخواست جدید ثبت کنید.`,
          mode: NotificationMode.WARNING,
          payload: {
            notificationKind: "INQUIRY_CANCELLED",
          },
        };
      default:
        return null;
    }
  }

  private async notifyInquiryStatusChanged(
    inquiry: UserProductInquiryDocument,
    previousStatus: UserProductInquiryStatus,
    options?: { changedByAdmin?: boolean },
  ): Promise<void> {
    const nextStatus = inquiry.status;

    if (previousStatus === nextStatus) {
      return;
    }

    if (
      nextStatus !== UserProductInquiryStatus.PENDING &&
      nextStatus !== UserProductInquiryStatus.CANCELLED
    ) {
      return;
    }

    if (options?.changedByAdmin !== true) {
      return;
    }

    const productTitle =
      this.normalizeOptionalText(inquiry.productSnapshot?.title) || "محصول";
    const notificationContent = this.resolveInquiryStatusNotificationContent(
      productTitle,
      nextStatus,
    );

    if (!notificationContent) {
      return;
    }

    const { title, message, mode, payload } = notificationContent;

    await this.deliverInquiryEndUserNotification({
      inquiry,
      title,
      message,
      mode,
      payload,
    });
  }

  private async deliverInquiryEndUserNotification(params: {
    inquiry: UserProductInquiryDocument;
    title: string;
    message: string;
    mode: NotificationMode;
    payload: Record<string, unknown>;
    silent?: boolean;
  }): Promise<void> {
    const inquiryId = params.inquiry._id.toString();
    const productId = params.inquiry.productId.toString();
    const notificationPayload: Record<string, unknown> = {
      inquiryId,
      productId,
      ...params.payload,
    };
    const subscriptionPayload: Record<string, unknown> = {
      ...notificationPayload,
      title: params.title,
      description: params.message,
      mode: params.mode,
      isPushNotification: true,
    };

    const notification = await this.notificationService.createForEndUser({
      userId: params.inquiry.userId,
      source: NotificationSource.INQUIRY,
      mode: params.mode,
      title: params.title,
      message: params.message,
      payload: notificationPayload,
    });

    if (params.silent === true) {
      return;
    }

    await this.userSubscriptionService.publishToUser({
      userId: params.inquiry.userId.toString(),
      updateType: GeneralSubscriptionUpdateType.NOTIFICATION,
      targetId: notification._id.toString(),
      payload: subscriptionPayload,
    });

    void this.pushNotificationService.deliverToUser(
      params.inquiry.userId.toString(),
      {
        title: resolveWebPushTitle(subscriptionPayload, params.title),
        body: resolveWebPushBody(subscriptionPayload, params.message),
        notificationId: notification._id.toString(),
        payload: subscriptionPayload,
        tag: notification._id.toString(),
      },
    );
  }
}
