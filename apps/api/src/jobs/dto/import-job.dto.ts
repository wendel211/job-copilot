import { IsOptional, IsString, IsUrl, IsEnum } from "class-validator";
import { JobSourceType } from "@prisma/client";

export class ImportJobDto {
  @IsOptional()
  @IsUrl({}, { message: "URL inválida" })
  url?: string;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  @IsEnum(JobSourceType, { message: "sourceType inválido" })
  sourceType?: JobSourceType;

  @IsOptional()
  @IsString()
  userId?: string;
}
