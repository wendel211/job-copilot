import { Body, Controller, Post } from "@nestjs/common";
import { EmailService } from "./email.service";
import { GenerateDraftDto } from "./dto/generate-draft.dto";

@Controller("email")
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post("draft")
  generate(@Body() dto: GenerateDraftDto) {
    return this.emailService.generateDraft(dto.userId, dto.jobId);
  }
}
