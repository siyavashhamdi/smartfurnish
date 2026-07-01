import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";

import { PAGINATION_CONSTANT } from "../../constants/pagination.constant";
import { EXCEPTION_CONSTANT } from "../../constants/exception.constant";
import { DEFAULT_OPENROUTER_MODEL } from "../app-settings/app-settings.types";
import {
  User,
  UserProductInquiry,
  UserProductInquiryDocument,
  UserProductInquiryFabricSnapshot,
  UserProductInquiryUserSnapshot,
  ProductDocument,
} from "../../database/schemas";
import { UserProductInquiryStatus } from "../../enums";
import { SortingOrder } from "../../common/pagination/input/sorting-order.enum";
import { buildSortOptions } from "../../common/pagination/utils";
import {
  isValidMobilePhone,
  normalizeAuthIdentityMobileForSubmit,
} from "../../utils/contact-validation.util";
import { AppSettingsService } from "../app-settings";
import { ProductService } from "../product/product.service";
import { ProductAiPreviewService } from "../product-ai-preview/services/product-ai-preview.service";
import { UserService } from "../user/user.service";
import {
  UserProductInquiryListGqlInput,
  UserProductInquiryListSortOptionInput,
  UserProductInquiryPreviewSubmitGqlInput,
  UserProductInquiryContactSubmitGqlInput,
} from "./graphql/inputs";
import {
  UserProductInquiryPreviewSubmitGqlResponse,
  UserProductInquiryListPaginatedOffsetGqlResponse,
  UserProductInquiryListSummaryGqlResponse,
  UserProductInquiryContactSubmitGqlResponse,
} from "./graphql/responses";

type UserProductInquiryListRecord = UserProductInquiry & {
  _id: Types.ObjectId;
  audit?: {
    createdAt?: Date;
    updatedAt?: Date;
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
    private readonly appSettingsService: AppSettingsService,
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly productAiPreviewService: ProductAiPreviewService,
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

    const createdInquiry = await this.userProductInquiryModel.create({
      isArchived: false,
      userId,
      productId: input.productId,
      userSnapshot: this.toUserProductInquiryUserSnapshot(user),
      productSnapshot: {
        title: previewResult.product.title,
      },
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
      status: UserProductInquiryStatus.PREVIEW_GENERATED,
      statusHistory: [
        {
          status: UserProductInquiryStatus.PREVIEW_GENERATED,
          reason: "Smart preview generated",
          changedAt: generatedAt,
          changedBy: userId,
        },
      ],
      preview: {
        environmentFileId: input.environmentFileId,
        resultFileId: new Types.ObjectId(resultFileId),
        sourceProductImageFileId: new Types.ObjectId(sourceProductImageFileId),
        generatedAt,
        durationSeconds: previewResult.durationSeconds,
        model: {
          provider: "openrouter",
          model: modelName,
          ...(placementPrompt ? { placementPrompt } : {}),
          ...(previewResult.aspectRatio
            ? { aspectRatio: previewResult.aspectRatio }
            : {}),
          imageSize: previewResult.imageSize,
          ...(isRiverflowModel ? { reasoningEffort: "high" } : {}),
        },
      },
    });

    return {
      id: createdInquiry._id,
      productId: createdInquiry.productId,
      status: createdInquiry.status,
      image: previewResult.image,
      durationSeconds: previewResult.durationSeconds,
      stagingDurationSeconds,
      description: previewResult.description,
      environmentFileId: input.environmentFileId,
      resultFileId: new Types.ObjectId(resultFileId),
      sourceProductImageFileId: new Types.ObjectId(sourceProductImageFileId),
      generatedAt,
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
    const fabricSnapshot = await this.resolveOptionalFabricSnapshot(
      input.productId,
      input.fabricKey,
      input.colorKey,
    );

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
      if (fabricSnapshot) {
        existingInquiry.fabricSnapshot = fabricSnapshot;
      }
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
      ...(fabricSnapshot ? { fabricSnapshot } : {}),
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

  private async resolveOptionalFabricSnapshot(
    productId: Types.ObjectId,
    fabricKey?: string,
    colorKey?: string,
  ): Promise<UserProductInquiryFabricSnapshot | undefined> {
    const normalizedFabricKey = fabricKey?.trim();
    const normalizedColorKey = colorKey?.trim();

    if (!normalizedFabricKey && !normalizedColorKey) {
      return undefined;
    }

    if (!normalizedFabricKey || !normalizedColorKey) {
      throw new BadRequestException(
        EXCEPTION_CONSTANT.USER_PRODUCT_INQUIRY_FABRIC_SELECTION_INCOMPLETE,
      );
    }

    const product = await this.productService.findActiveProductById(
      productId.toString(),
    );

    if (!product) {
      throw new NotFoundException(
        EXCEPTION_CONSTANT.PRODUCT_NOT_FOUND_OR_INACTIVE,
      );
    }

    return this.resolveFabricSnapshot(
      product,
      normalizedFabricKey,
      normalizedColorKey,
    );
  }

  private resolveFabricSnapshot(
    product: ProductDocument,
    fabricKey: string,
    colorKey: string,
  ): UserProductInquiryFabricSnapshot {
    const fabric = (product.fabrics ?? []).find(
      (entry) => entry.key === fabricKey && entry.isActive,
    );

    if (!fabric) {
      throw new BadRequestException(
        EXCEPTION_CONSTANT.USER_PRODUCT_INQUIRY_FABRIC_NOT_AVAILABLE,
      );
    }

    const color = (fabric.colors ?? []).find(
      (entry) => entry.key === colorKey && entry.isActive,
    );

    if (!color) {
      throw new BadRequestException(
        EXCEPTION_CONSTANT.USER_PRODUCT_INQUIRY_FABRIC_COLOR_NOT_AVAILABLE,
      );
    }

    return {
      fabricKey,
      colorKey,
      patternName: fabric.patternName,
      colorName: color.name,
      ...(color.hexCode ? { colorHex: color.hexCode } : {}),
      label: `${fabric.patternName} — ${color.name}`,
    };
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

  private toListSummaryResponse(
    inquiry: UserProductInquiryListRecord,
  ): UserProductInquiryListSummaryGqlResponse {
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
      fabric: inquiry.fabricSnapshot?.patternName
        ? {
            patternName: inquiry.fabricSnapshot.patternName,
            colorName: inquiry.fabricSnapshot.colorName,
            ...(inquiry.fabricSnapshot.colorHex
              ? { colorHex: inquiry.fabricSnapshot.colorHex }
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
      previewGeneratedAt: inquiry.preview?.generatedAt,
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
        { "fabricSnapshot.label": searchRegex },
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
      "fabricSnapshot.label",
      filters.fabricLabel,
    );

    if (filters.status) {
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
}
