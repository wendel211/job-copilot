import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger"; // 1. Imports
import { EmailDraftService } from "./email-draft.service";
import { UpdateDraftDto } from "./dto/update-draft.dto";

@ApiTags("Email Drafts") // 2. Tag
@Controller("email/drafts")
export class EmailDraftController {
  constructor(private readonly service: EmailDraftService) {}

  // Listar todos os drafts do usuário
  @Get()
  @ApiOperation({ summary: "Listar todos os rascunhos do usuário" })
  @ApiQuery({ name: "userId", required: true })
  list(@Query("userId") userId: string) {
    return this.service.listDrafts(userId);
  }

  // Obter um draft específico
  @Get(":id")
  @ApiOperation({ summary: "Obter detalhes de um rascunho específico" })
  @ApiQuery({ name: "userId", required: true })
  get(@Param("id") id: string, @Query("userId") userId: string) {
    return this.service.getDraftById(userId, id);
  }

  // Marcar como aberto no editor
  @Patch(":id/open")
  @ApiOperation({ summary: "Marcar rascunho como aberto/visualizado" })
  markOpened(@Param("id") id: string, @Body("userId") userId: string) {
    return this.service.markOpened(userId, id);
  }

  // Atualizar campos do draft
  @Patch(":id")
  @ApiOperation({ summary: "Editar conteúdo do rascunho" })
  update(
    @Param("id") id: string,
    @Body("userId") userId: string, // Nota: Se possível, use um DTO completo aqui no futuro
    @Body() dto: UpdateDraftDto
  ) {
    return this.service.updateDraft(userId, id, dto);
  }

  // Toggle de checklist
  @Patch(":id/checklist")
  @ApiOperation({ summary: "Marcar/Desmarcar item do checklist" })
  toggle(
    @Param("id") id: string,
    @Body("userId") userId: string,
    @Body("item") item: string,
  ) {
    return this.service.toggleChecklist(userId, id, item);
  }
}