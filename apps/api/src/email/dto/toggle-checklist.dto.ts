import { IsString } from "class-validator";

export class ToggleChecklistDto {
  @IsString()
  userId: string;

  @IsString()
  item: string;
}