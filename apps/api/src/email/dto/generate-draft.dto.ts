import { IsString } from "class-validator";

export class GenerateDraftDto {
  @IsString()
  userId: string;

  @IsString()
  jobId: string;
}
