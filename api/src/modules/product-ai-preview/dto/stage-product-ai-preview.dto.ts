import { Transform } from "class-transformer";
import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
} from "class-validator";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class StageProductAiPreviewDto {
  @Transform(({ value }) => trimString(value))
  @IsMongoId({ message: "productId must be a valid Mongo ID" })
  productId: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  fabricKey: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  colorKey: string;

  @Transform(({ value }) => trimString(value))
  @IsMongoId({ message: "environmentFileId must be a valid Mongo ID" })
  environmentFileId: string;
}
