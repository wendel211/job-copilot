import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpsertTemplateDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  @MaxLength(800)
  baseIntro?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  baseBullets?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  closingLine?: string;
}
