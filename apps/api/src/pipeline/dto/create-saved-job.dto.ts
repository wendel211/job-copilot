import { IsString, IsNotEmpty } from "class-validator";

export class CreateSavedJobDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  jobId: string;
}
