import { IsOptional, IsEnum, IsString } from "class-validator";
import { SavedJobStatus } from "@prisma/client";

export class ListPipelineDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsEnum(SavedJobStatus)
  status?: SavedJobStatus;

  @IsOptional()
  @IsString()
  search?: string; 
}
