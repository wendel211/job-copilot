import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { EmailService } from "./email.service";
import { GenerateDraftDto } from "./dto/generate-draft.dto";
import { UpdateDraftDto } from "./dto/update-draft.dto";
import { ToggleChecklistDto } from "./dto/toggle-checklist.dto";

@Controller("email")
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post("draft")
  generate(@Body() dto: GenerateDraftDto) {
    return this.emailService.generateDraft(dto.userId, dto.jobId);
  }

  @Get("drafts")
  listDrafts(@Query("userId") userId: string) {
    return this.emailService.listDrafts(userId);
  }

  @Get("drafts/:id")
  getDraftById(@Param("id") id: string, @Query("userId") userId: string) {
    return this.emailService.getDraftById(userId, id);
  }


  @Patch("drafts/:id/opened")
  markOpened(@Param("id") id: string, @Body() body: { userId: string }) {
    return this.emailService.markOpened(body.userId, id);
  }


  @Patch("drafts/:id")
  updateDraft(@Param("id") id: string, @Body() dto: UpdateDraftDto) {
    return this.emailService.updateDraft(dto.userId, id, dto);
  }


  @Patch("drafts/:id/checklist/toggle")
  toggleChecklist(@Param("id") id: string, @Body() dto: ToggleChecklistDto) {
    return this.emailService.toggleChecklist(dto.userId, id, dto.item);
  }
}
