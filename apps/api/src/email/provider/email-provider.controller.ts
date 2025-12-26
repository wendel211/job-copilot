import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger"; // 1. Imports
import { EmailProviderService } from "./email-provider.service";
import { CreateEmailProviderDto } from "./dto/create-email-provider.dto";
import { UpdateEmailProviderDto } from "./dto/update-email-provider.dto";

@ApiTags("Email Provider") // 2. Tag
@Controller("email/providers")
export class EmailProviderController {
  constructor(private readonly service: EmailProviderService) {}

  @Post()
  @ApiOperation({ summary: "Cadastrar novo provedor SMTP (Gmail, Outlook, etc)" })
  create(@Body() dto: CreateEmailProviderDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar provedores configurados do usuário" })
  @ApiQuery({ name: "userId", required: true })
  list(@Query("userId") userId: string) {
    return this.service.list(userId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualizar credenciais SMTP" })
  update(@Param("id") id: string, @Body() dto: UpdateEmailProviderDto) {
    return this.service.update(id, dto);
  }

  @Post(":id/test")
  @ApiOperation({ summary: "Testar conexão enviando um email para si mesmo" })
  test(@Param("id") id: string) {
    return this.service.test(id);
  }
}