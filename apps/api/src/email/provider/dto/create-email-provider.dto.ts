import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateEmailProviderDto {
  @IsString()
  userId: string;

  @IsString()
  type: string; // 'smtp'

  @IsOptional()
  @IsString()
  smtpHost?: string;

  @IsOptional()
  @IsNumber()
  smtpPort?: number;

  @IsOptional()
  @IsBoolean()
  smtpSecure?: boolean;

  @IsOptional()
  @IsString()
  smtpUser?: string;

  @IsOptional()
  @IsString()
  smtpPass?: string;

  @IsOptional()
  @IsString()
  fromEmail?: string;

  @IsOptional()
  @IsString()
  fromName?: string;
}
