import { IsArray, IsEmail, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateDraftDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @IsOptional()
  @IsString()
  @MaxLength(12000)
  bodyText?: string;

  @IsOptional()
  @IsEmail()
  toEmail?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  checklist?: string[];
}
