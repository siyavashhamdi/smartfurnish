import type { FileAccessUrl } from "../../../utils/fileAccessUrl.util";
import { getFileIdFromAccessUrl } from "../../../utils/fileAccessUrl.util";
import type { ProductEditRecord } from "../product-list.api";
import { isProductFreeForColors } from "../product-pricing.util";
import type {
  DiscountKind,
  DraftCoverImage,
  DraftFabric,
  DraftFabricColor,
  DraftMaterialProfile,
  DraftSetPiece,
  DraftSetPieceDimension,
  DraftSetPieceImage,
  DraftVendor,
} from "./types";

let tempIdCounter = 0;

export function createTempId(prefix: string): string {
  tempIdCounter += 1;
  return `${prefix}-${Date.now()}-${tempIdCounter}`;
}

function stripNumberSeparators(value: string): string {
  return value.replace(/[,٬\s]/g, "");
}

export function formatIntegerWithThousands(value: string): string {
  const digits = stripNumberSeparators(value).replace(/\D/g, "");
  if (!digits) {
    return "";
  }
  return Number(digits).toLocaleString("en-US");
}

export function createEmptyMaterialProfile(): DraftMaterialProfile {
  return {
    texture: "",
    primaryMaterial: "",
    careInstructions: "",
  };
}

export function createEmptyVendor(): DraftVendor {
  return {
    name: "",
    phone: "",
    address: "",
    notes: "",
  };
}

export function createDraftCoverImage(accessUrl: FileAccessUrl | null = null): DraftCoverImage {
  return {
    id: createTempId("cover"),
    file: null,
    accessUrl,
  };
}

export function createDraftSetPieceImage(
  accessUrl: FileAccessUrl | null = null
): DraftSetPieceImage {
  return {
    id: createTempId("set-piece-image"),
    file: null,
    accessUrl,
  };
}

export function createDraftSetPieceDimension(): DraftSetPieceDimension {
  return {
    id: createTempId("dimension"),
    label: "",
    displayText: "",
    widthCm: "",
    heightCm: "",
    depthCm: "",
  };
}

export function createDraftSetPiece(): DraftSetPiece {
  return {
    id: createTempId("set-piece"),
    name: "",
    description: "",
    sortOrder: "",
    weightKg: "",
    images: [createDraftSetPieceImage()],
    dimensions: [],
    materialProfile: createEmptyMaterialProfile(),
  };
}

export function createDraftFabricColor(): DraftFabricColor {
  return {
    id: createTempId("fabric-color"),
    name: "",
    hexCode: "",
    priceIrt: "",
    discountEnabled: false,
    discountKind: "PERCENTAGE",
    discountValue: "",
    sortOrder: "",
    isActive: true,
    aiImage: createDraftSetPieceImage(),
  };
}

export function createEmptyFabricColorDefaults(): Pick<
  DraftFabric,
  | "defaultPriceIrt"
  | "defaultDiscountEnabled"
  | "defaultDiscountKind"
  | "defaultDiscountValue"
> {
  return {
    defaultPriceIrt: "",
    defaultDiscountEnabled: false,
    defaultDiscountKind: "PERCENTAGE",
    defaultDiscountValue: "",
  };
}

export function applyFabricColorDefaults(
  color: DraftFabricColor,
  fabric: Pick<
    DraftFabric,
    | "defaultPriceIrt"
    | "defaultDiscountEnabled"
    | "defaultDiscountKind"
    | "defaultDiscountValue"
  >
): DraftFabricColor {
  return {
    ...color,
    priceIrt: fabric.defaultPriceIrt,
    discountEnabled: fabric.defaultDiscountEnabled,
    discountKind: fabric.defaultDiscountKind,
    discountValue: fabric.defaultDiscountValue,
  };
}

export function createDraftFabricColorFromFabricDefaults(
  fabric: Pick<
    DraftFabric,
    | "defaultPriceIrt"
    | "defaultDiscountEnabled"
    | "defaultDiscountKind"
    | "defaultDiscountValue"
  >
): DraftFabricColor {
  return applyFabricColorDefaults(createDraftFabricColor(), fabric);
}

export function createDraftFabric(): DraftFabric {
  return {
    id: createTempId("fabric"),
    patternName: "",
    sortOrder: "",
    isActive: true,
    colors: [createDraftFabricColor()],
    ...createEmptyFabricColorDefaults(),
  };
}

export function resolveDraftMinPriceIrt(fabrics: readonly DraftFabric[]): number | null {
  const prices = fabrics.flatMap((fabric) =>
    fabric.colors
      .map((color) => parseOptionalNumber(color.priceIrt))
      .filter((price): price is number => price != null && price > 0)
  );

  if (prices.length === 0) {
    return null;
  }

  return Math.min(...prices);
}

export function isDraftProductFreeCandidate(fabrics: readonly DraftFabric[]): boolean {
  return isProductFreeForColors({
    fabrics: fabrics.map((fabric) => ({
      isActive: fabric.isActive,
      colors: fabric.colors.map((color) => {
        const priceIrt = parseOptionalNumber(color.priceIrt) ?? null;
        const discountValue = parseOptionalNumber(color.discountValue);

        return {
          isActive: color.isActive,
          priceIrt,
          discount:
            color.discountEnabled && priceIrt != null && priceIrt > 0 && discountValue != null
              ? {
                  type: color.discountKind,
                  value: discountValue,
                }
              : null,
        };
      }),
    })),
  });
}

function mapMaterialProfileFromRecord(
  profile: ProductEditRecord["materialProfile"]
): DraftMaterialProfile {
  if (!profile) {
    return createEmptyMaterialProfile();
  }

  return {
    texture: profile.texture?.trim() || "",
    primaryMaterial: profile.primaryMaterial?.trim() || "",
    careInstructions: profile.careInstructions?.trim() || "",
  };
}

export function createDraftsFromProduct(product: ProductEditRecord | null): {
  coverImages: DraftCoverImage[];
  vendor: DraftVendor;
  materialProfile: DraftMaterialProfile;
  setPieces: DraftSetPiece[];
  fabrics: DraftFabric[];
} {
  if (!product) {
    return {
      coverImages: [createDraftCoverImage()],
      vendor: createEmptyVendor(),
      materialProfile: createEmptyMaterialProfile(),
      setPieces: [],
      fabrics: [],
    };
  }

  return {
    coverImages:
      product.coverImageAccessUrls.length > 0
        ? product.coverImageAccessUrls.map((accessUrl) => createDraftCoverImage(accessUrl))
        : [createDraftCoverImage()],
    vendor: {
      name: product.vendor?.name?.trim() || "",
      phone: product.vendor?.phone?.trim() || "",
      address: product.vendor?.address?.trim() || "",
      notes: product.vendor?.notes?.trim() || "",
    },
    materialProfile: mapMaterialProfileFromRecord(product.materialProfile),
    setPieces: product.setPieces.map((piece) => ({
      id: createTempId("set-piece"),
      name: piece.name,
      description: piece.description?.trim() || "",
      sortOrder: typeof piece.sortOrder === "number" ? String(piece.sortOrder) : "",
      weightKg: typeof piece.weightKg === "number" ? String(piece.weightKg) : "",
      images:
        piece.imageAccessUrls.length > 0
          ? piece.imageAccessUrls.map((accessUrl) => createDraftSetPieceImage(accessUrl))
          : [createDraftSetPieceImage()],
      dimensions: piece.dimensions.map((dimension) => ({
        id: createTempId("dimension"),
        label: dimension.label?.trim() || "",
        displayText: dimension.displayText?.trim() || "",
        widthCm: typeof dimension.widthCm === "number" ? String(dimension.widthCm) : "",
        heightCm: typeof dimension.heightCm === "number" ? String(dimension.heightCm) : "",
        depthCm: typeof dimension.depthCm === "number" ? String(dimension.depthCm) : "",
      })),
      materialProfile: mapMaterialProfileFromRecord(piece.materialProfile),
    })),
    fabrics: product.fabrics.map((fabric) => ({
      id: createTempId("fabric"),
      patternName: fabric.patternName,
      sortOrder: typeof fabric.sortOrder === "number" ? String(fabric.sortOrder) : "",
      isActive: fabric.isActive,
      ...createEmptyFabricColorDefaults(),
      colors: fabric.colors.map((color) => ({
        id: createTempId("fabric-color"),
        name: color.name,
        hexCode: color.hexCode?.trim() || "",
        priceIrt:
          typeof color.priceIrt === "number" && color.priceIrt > 0
            ? formatIntegerWithThousands(String(color.priceIrt))
            : "",
        discountEnabled: color.discount != null,
        discountKind: color.discount?.type ?? "PERCENTAGE",
        discountValue: color.discount
          ? color.discount.type === "PERCENTAGE"
            ? String(color.discount.value)
            : formatIntegerWithThousands(String(color.discount.value))
          : "",
        sortOrder: typeof color.sortOrder === "number" ? String(color.sortOrder) : "",
        isActive: color.isActive,
        aiImage: createDraftSetPieceImage(color.aiProductImageAccessUrl ?? null),
      })),
    })),
  };
}

export function resolveStoredFileId(
  uploadedFileId: string | undefined,
  existingAccessUrl: FileAccessUrl | null
): string | null {
  return uploadedFileId ?? getFileIdFromAccessUrl(existingAccessUrl) ?? null;
}

export function trimToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.replace(/[,٬\s]/g, "").trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function mapMaterialProfileInput(
  profile: DraftMaterialProfile
): Record<string, unknown> | null {
  const hasContent =
    profile.texture.trim() ||
    profile.primaryMaterial.trim() ||
    profile.careInstructions.trim();

  if (!hasContent) {
    return null;
  }

  return {
    texture: trimToNull(profile.texture),
    primaryMaterial: trimToNull(profile.primaryMaterial),
    careInstructions: trimToNull(profile.careInstructions),
  };
}

export function mapVendorInput(vendor: DraftVendor): Record<string, unknown> | null {
  if (!vendor.name.trim()) {
    return null;
  }

  return {
    name: vendor.name.trim(),
    phone: trimToNull(vendor.phone),
    address: trimToNull(vendor.address),
    notes: trimToNull(vendor.notes),
  };
}

export type UploadedProductFileMap = {
  readonly coverImageFileIdsByDraftId: Record<string, string>;
  readonly setPieceImageFileIds: Record<string, string>;
  readonly fabricColorImageFileIds: Record<string, string>;
};

export function buildProductWriteMutationInput(input: {
  readonly isEditMode: boolean;
  readonly productId?: string | null;
  readonly title: string;
  readonly summary: string;
  readonly fullDescription: string;
  readonly notes: string;
  readonly isActive: boolean;
  readonly isReviewSubmissionEnabled: boolean;
  readonly isReviewsSectionVisible: boolean;
  readonly guaranteePeriodInMonths: string;
  readonly tags: string[];
  readonly coverImages: DraftCoverImage[];
  readonly vendor: DraftVendor;
  readonly materialProfile: DraftMaterialProfile;
  readonly setPieces: DraftSetPiece[];
  readonly fabrics: DraftFabric[];
  readonly uploadedFiles: UploadedProductFileMap;
}): Record<string, unknown> {
  const coverImageFileIds = input.coverImages
    .map((cover) =>
      resolveStoredFileId(
        input.uploadedFiles.coverImageFileIdsByDraftId[cover.id],
        cover.accessUrl
      )
    )
    .filter((fileId): fileId is string => Boolean(fileId));

  const mutationInput: Record<string, unknown> = {
    title: input.title.trim(),
    summary: trimToNull(input.summary),
    fullDescription: trimToNull(input.fullDescription),
    notes: trimToNull(input.notes),
    coverImageFileIds,
    isActive: input.isActive === true,
    isReviewSubmissionEnabled: input.isReviewSubmissionEnabled === true,
    isReviewsSectionVisible: input.isReviewsSectionVisible === true,
    guaranteePeriodInMonths: parseOptionalNumber(input.guaranteePeriodInMonths) ?? 0,
    tags: input.tags,
    vendor: mapVendorInput(input.vendor),
    materialProfile: mapMaterialProfileInput(input.materialProfile),
    setPieces: input.setPieces
      .filter((piece) => piece.name.trim())
      .map((piece, pieceIndex) => ({
        name: piece.name.trim(),
        description: trimToNull(piece.description),
        sortOrder: parseOptionalNumber(piece.sortOrder) ?? pieceIndex + 1,
        weightKg: parseOptionalNumber(piece.weightKg) ?? null,
        imageFileIds: piece.images
          .map((image) =>
            resolveStoredFileId(
              input.uploadedFiles.setPieceImageFileIds[image.id],
              image.accessUrl
            )
          )
          .filter((fileId): fileId is string => Boolean(fileId)),
        dimensions: piece.dimensions
          .filter((dimension) => dimension.label.trim() || dimension.displayText.trim())
          .map((dimension, dimensionIndex) => ({
            label: trimToNull(dimension.label),
            displayText: trimToNull(dimension.displayText),
            widthCm: parseOptionalNumber(dimension.widthCm) ?? null,
            heightCm: parseOptionalNumber(dimension.heightCm) ?? null,
            depthCm: parseOptionalNumber(dimension.depthCm) ?? null,
            sortOrder: dimensionIndex + 1,
          })),
        materialProfile: mapMaterialProfileInput(piece.materialProfile),
      })),
    fabrics: input.fabrics
      .filter((fabric) => fabric.patternName.trim())
      .map((fabric, fabricIndex) => ({
        patternName: fabric.patternName.trim(),
        sortOrder: parseOptionalNumber(fabric.sortOrder) ?? fabricIndex + 1,
        isActive: fabric.isActive,
        colors: fabric.colors
          .filter((color) => color.name.trim())
          .map((color, colorIndex) => {
            const parsedColorPrice = parseOptionalNumber(color.priceIrt);
            const parsedDiscountValue = parseOptionalNumber(color.discountValue);
            const hasColorDiscount =
              color.discountEnabled &&
              parsedColorPrice != null &&
              parsedColorPrice > 0 &&
              parsedDiscountValue != null;

            return {
              name: color.name.trim(),
              hexCode: trimToNull(color.hexCode),
              priceIrt: parsedColorPrice ?? null,
              discount: hasColorDiscount
                ? {
                    type: color.discountKind,
                    value: parsedDiscountValue,
                  }
                : input.isEditMode
                  ? null
                  : undefined,
              sortOrder: parseOptionalNumber(color.sortOrder) ?? colorIndex + 1,
              isActive: color.isActive,
              aiProductImageFileId: resolveStoredFileId(
                input.uploadedFiles.fabricColorImageFileIds[color.aiImage.id],
                color.aiImage.accessUrl
              ),
            };
          }),
      })),
  };

  if (input.isEditMode && input.productId) {
    mutationInput.id = input.productId;
  }

  return mutationInput;
}
