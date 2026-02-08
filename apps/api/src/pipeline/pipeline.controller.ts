import { Controller, Post, Patch, Get, Param, Body, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { PipelineService } from "./pipeline.service";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { AddNoteDto } from "./dto/add-note.dto";
import { CreateSavedJobDto } from "./dto/create-saved-job.dto";

@ApiTags("Pipeline")
@Controller("pipeline")
export class PipelineController {
  constructor(private service: PipelineService) { }

  @Post()
  @ApiOperation({ summary: "Adicionar uma vaga ao pipeline (Salvar)" })
  create(@Body() dto: CreateSavedJobDto) {
    return this.service.create(dto);
  }

  @Get("check")
  @ApiOperation({ summary: "Verificar se user já salvou esta vaga" })
  checkStatus(
    @Query("userId") userId: string,
    @Query("jobId") jobId: string
  ) {
    return this.service.checkStatus(userId, jobId);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Atualizar status (Ex: Applied, Interviewing)" })
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateStatusDto
  ) {
    return this.service.updateStatus(id, dto);
  }

  @Patch(":id/note")
  @ApiOperation({ summary: "Adicionar anotação pessoal na vaga" })
  addNote(
    @Param("id") id: string,
    @Body() dto: AddNoteDto
  ) {
    return this.service.addNote(id, dto);
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Listar todas as vagas salvas do usuário" })
  list(@Param("userId") userId: string) {
    return this.service.listByUser(userId);
  }
}