import { IsString, IsEnum } from "class-validator";
import { PipelineStatus } from "../enums/pipeline-status.enum";

export class CreateSavedJobDto {
  @IsString()
  userId: string;

  @IsString()
  jobId: string;

  @IsEnum(PipelineStatus)
  status: PipelineStatus = PipelineStatus.DISCOVERED;
}
