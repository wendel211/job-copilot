import { Controller, Get, Param, Query } from "@nestjs/common";
import { EmailPreviewService } from "./email-preview.service";

@Controller("email")
export class EmailPreviewController {
  constructor(private readonly service: EmailPreviewService) {}

  @Get("drafts/:id/preview")
  preview(@Param("id") draftId: string, @Query("userId") userId: string) {
    return this.service.getPreview(draftId, userId);
  }
}
