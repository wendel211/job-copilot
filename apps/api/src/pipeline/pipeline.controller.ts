import { Controller, Post, Patch, Get, Param, Body } from "@nestjs/common";
import { PipelineService } from "./pipeline.service";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { AddNoteDto } from "./dto/add-note.dto";
import { CreateSavedJobDto } from "./dto/create-saved-job.dto";

@Controller("pipeline")
export class PipelineController {
  constructor(private service: PipelineService) {}

  @Post()
  create(@Body() dto: CreateSavedJobDto) {
    return this.service.create(dto);
  }

  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateStatusDto
  ) {
    return this.service.updateStatus(id, dto);
  }

  @Patch(":id/note")
  addNote(
    @Param("id") id: string,
    @Body() dto: AddNoteDto
  ) {
    return this.service.addNote(id, dto);
  }

  @Get("user/:userId")
  list(@Param("userId") userId: string) {
    return this.service.listByUser(userId);
  }
}
