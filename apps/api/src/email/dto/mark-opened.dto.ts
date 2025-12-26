import { IsString } from "class-validator";

export class MarkOpenedDto {
  @IsString()
  userId: string;
}