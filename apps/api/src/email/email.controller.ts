import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger"; // 1. Imports Swagger
import { EmailService } from "./email.service";
import { GenerateDraftDto } from "./draft/dto/generate-draft.dto";
import { UpdateDraftDto } from "./draft/dto/update-draft.dto";
import { ToggleChecklistDto } from "./dto/toggle-checklist.dto";

@ApiTags("Email Drafts") // 2. Tag para agrupar
@Controller("email")
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post("draft")
  @ApiOperation({ summary: "Gerar novo rascunho com IA" })
  generate(@Body() dto: GenerateDraftDto) {
    return this.emailService.generateDraft(dto.userId, dto.jobId);
  }

  @Get("drafts")
  @ApiOperation({ summary: "Listar rascunhos do usuário" })
  listDrafts(@Query("userId") userId: string) {
    return this.emailService.listDrafts(userId);
  }

  @Get("drafts/:id")
  @ApiOperation({ summary: "Pegar detalhes de um rascunho" })
  getDraftById(@Param("id") id: string, @Query("userId") userId: string) {
    return this.emailService.getDraftById(userId, id);
  }

  @Patch("drafts/:id/opened")
  @ApiOperation({ summary: "Marcar rascunho como aberto/lido" })
  markOpened(@Param("id") id: string, @Body() body: { userId: string }) {
    return this.emailService.markOpened(body.userId, id);
  }

  @Patch("drafts/:id")
  @ApiOperation({ summary: "Atualizar texto ou assunto do rascunho" })
  updateDraft(@Param("id") id: string, @Body() dto: UpdateDraftDto) {
    return this.emailService.updateDraft(dto.userId, id, dto);
  }

  @Patch("drafts/:id/checklist/toggle")
  @ApiOperation({ summary: "Marcar item do checklist (ex: anexou CV)" })
  toggleChecklist(@Param("id") id: string, @Body() dto: ToggleChecklistDto) {
    return this.emailService.toggleChecklist(dto.userId, id, dto.item);
  }
}