import { IsString } from "class-validator";

export class SendEmailDto {
  @IsString()
  userId: string;

  @IsString()
  draftId: string;
}
