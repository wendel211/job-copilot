import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger"; // 1. Imports Swagger
import { TemplatesService } from "./templates.service";
import { UpsertTemplateDto } from "./dto/upsert-template.dto";

@ApiTags("Templates") // 2. Agrupamento
@Controller("templates")
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: "Criar ou atualizar um template de email" })
  upsert(@Body() dto: UpsertTemplateDto) {
    return this.templatesService.upsert(dto);
  }

  @Get("me")
  @ApiOperation({ summary: "Listar meus templates personalizados" })
  @ApiQuery({ name: "userId", required: true, description: "ID do usuário dono dos templates" })
  getMe(@Query("userId") userId: string) {
    return this.templatesService.getMe(userId);
  }
}