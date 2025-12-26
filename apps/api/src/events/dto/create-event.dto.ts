import { IsOptional, IsString, IsEnum } from "class-validator";
import { EventType } from "../enums/event-type.enum";

export class CreateEventDto {
  @IsEnum(EventType)
  type: EventType;

  @IsOptional()
  @IsString()
  userId?: string | null;

  @IsOptional()
  @IsString()
  jobId?: string | null;

  @IsOptional()
  @IsString()
  draftId?: string | null;

  @IsOptional()
  @IsString()
  providerId?: string | null;

  @IsOptional()
  @IsString()
  sendId?: string | null;

  @IsOptional()
  @IsString()
  savedJobId?: string | null;

  @IsOptional()
  metadata?: any;
}
