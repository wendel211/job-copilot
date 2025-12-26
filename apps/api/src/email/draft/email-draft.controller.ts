import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
} from "@nestjs/common";
import { EmailDraftService } from "./email-draft.service";
import { UpdateDraftDto } from "./dto/update-draft.dto";

@Controller("email/drafts")
export class EmailDraftController {
  constructor(private readonly service: EmailDraftService) {}

  // Listar todos os drafts do usuário
  @Get()
  list(@Query("userId") userId: string) {
    return this.service.listDrafts(userId);
  }

  // Obter um draft específico
  @Get(":id")
  get(@Param("id") id: string, @Query("userId") userId: string) {
    return this.service.getDraftById(userId, id);
  }

  // Marcar como aberto no editor
  @Patch(":id/open")
  markOpened(@Param("id") id: string, @Body("userId") userId: string) {
    return this.service.markOpened(userId, id);
  }

  // Atualizar campos do draft
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body("userId") userId: string,
    @Body() dto: UpdateDraftDto
  ) {
    return this.service.updateDraft(userId, id, dto);
  }

  // Toggle de checklist
  @Patch(":id/checklist")
  toggle(
    @Param("id") id: string,
    @Body("userId") userId: string,
    @Body("item") item: string,
  ) {
    return this.service.toggleChecklist(userId, id, item);
  }
}
