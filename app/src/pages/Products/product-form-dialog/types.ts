export type DiscountKind = "PERCENTAGE" | "FIXED_AMOUNT_IRT";

export type DraftCoverImage = {
  readonly id: string;
  readonly file: File | null;
  readonly accessUrl: import("../../utils/fileAccessUrl.util").FileAccessUrl | null;
};

export type DraftMaterialProfile = {
  readonly texture: string;
  readonly primaryMaterial: string;
  readonly careInstructions: string;
};

export type DraftVendor = {
  readonly name: string;
  readonly phone: string;
  readonly address: string;
  readonly notes: string;
};

export type DraftSetPieceDimension = {
  readonly id: string;
  readonly label: string;
  readonly displayText: string;
  readonly widthCm: string;
  readonly heightCm: string;
  readonly depthCm: string;
};

export type DraftSetPieceImage = {
  readonly id: string;
  readonly file: File | null;
  readonly accessUrl: import("../../utils/fileAccessUrl.util").FileAccessUrl | null;
};

export type DraftSetPiece = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly sortOrder: string;
  readonly weightKg: string;
  readonly images: DraftSetPieceImage[];
  readonly dimensions: DraftSetPieceDimension[];
  readonly materialProfile: DraftMaterialProfile;
};

export type DraftFabricColor = {
  readonly id: string;
  readonly name: string;
  readonly hexCode: string;
  readonly sortOrder: string;
  readonly isActive: boolean;
  readonly aiImage: DraftSetPieceImage;
};

export type DraftFabric = {
  readonly id: string;
  readonly patternName: string;
  readonly sortOrder: string;
  readonly isActive: boolean;
  readonly colors: DraftFabricColor[];
};
