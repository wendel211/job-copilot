import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { TemplatesService } from "./templates.service";
import { UpsertTemplateDto } from "./dto/upsert-template.dto";

@Controller("templates")
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  upsert(@Body() dto: UpsertTemplateDto) {
    return this.templatesService.upsert(dto);
  }

  @Get("me")
  getMe(@Query("userId") userId: string) {
    return this.templatesService.getMe(userId);
  }
}
