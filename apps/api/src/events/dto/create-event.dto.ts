import { IsEnum, IsOptional, IsString, IsObject } from "class-validator";
import { EventType } from "../enums/event-type.enum";

export class CreateEventDto {
  @IsEnum(EventType)
  type: EventType;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  jobId?: string;

  @IsOptional()
  @IsString()
  draftId?: string;

  @IsOptional()
  @IsString()
  providerId?: string;

  @IsOptional()
  @IsString()
  sendId?: string;
  
  @IsOptional()
  @IsString()
  savedJobId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
