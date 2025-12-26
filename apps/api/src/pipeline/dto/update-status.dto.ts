import { IsEnum, IsString } from "class-validator";
import { PipelineStatus } from "../enums/pipeline-status.enum";

export class UpdateStatusDto {
  @IsEnum(PipelineStatus)
  status: PipelineStatus;

  @IsString()
  userId: string;
}
