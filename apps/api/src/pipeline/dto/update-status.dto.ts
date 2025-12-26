import { IsEnum } from "class-validator";
import { SavedJobStatus } from "@prisma/client";

export class UpdateStatusDto {
  @IsEnum(SavedJobStatus, {
    message: "Status inválido. Use: discovered, prepared, sent, screening, interview, closed."
  })
  status: SavedJobStatus;
}
