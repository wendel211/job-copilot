import {
  Body,
  Controller,
  Delete, // <--- Importado
  Get,
  Param,
  Patch,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { EmailDraftService } from "./email-draft.service";
import { UpdateDraftDto } from "./dto/update-draft.dto";

@ApiTags("Email Drafts")
@Controller("email/drafts")
export class EmailDraftController {
  constructor(private readonly service: EmailDraftService) {}

  @Get()
  @ApiOperation({ summary: "Listar todos os rascunhos do usuário" })
  @ApiQuery({ name: "userId", required: true })
  list(@Query("userId") userId: string) {
    return this.service.listDrafts(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Obter detalhes de um rascunho específico" })
  @ApiQuery({ name: "userId", required: true })
  get(@Param("id") id: string, @Query("userId") userId: string) {
    return this.service.getDraftById(userId, id);
  }

  @Patch(":id/open")
  @ApiOperation({ summary: "Marcar rascunho como aberto" })
  markOpened(@Param("id") id: string, @Body("userId") userId: string) {
    return this.service.markOpened(userId, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualizar conteúdo do rascunho" })
  update(
    @Param("id") id: string,
    @Body("userId") userId: string, 
    @Body() dto: UpdateDraftDto
  ) {
    // Fallback se o userId não vier no body do DTO
    const uid = userId || (dto as any).userId; 
    return this.service.updateDraft(uid, id, dto);
  }

  @Patch(":id/checklist")
  @ApiOperation({ summary: "Marcar/Desmarcar item da checklist" })
  toggle(
    @Param("id") id: string,
    @Body("userId") userId: string,
    @Body("item") item: string,
  ) {
    return this.service.toggleChecklist(userId, id, item);
  }

  
  @Delete(":id")
  @ApiOperation({ summary: "Excluir rascunho permanentemente" })
  @ApiQuery({ name: "userId", required: true })
  delete(@Param("id") id: string, @Query("userId") userId: string) {
    return this.service.deleteDraft(userId, id);
  }
}