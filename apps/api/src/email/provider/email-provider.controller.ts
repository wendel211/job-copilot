import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger"; 
import { EmailProviderService } from "./email-provider.service";
import { CreateEmailProviderDto } from "./dto/create-email-provider.dto";
import { UpdateEmailProviderDto } from "./dto/update-email-provider.dto";

@ApiTags("Email Provider")
@Controller("email/providers")
export class EmailProviderController {
  constructor(private readonly service: EmailProviderService) {}

  @Post()
  @ApiOperation({ summary: "Cadastrar novo provedor SMTP" })
  create(@Body() dto: CreateEmailProviderDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar provedores do usuário" })
  @ApiQuery({ name: "userId", required: true })
  list(@Query("userId") userId: string) {
    return this.service.list(userId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualizar provedor" })
  update(@Param("id") id: string, @Body() dto: UpdateEmailProviderDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remover provedor SMTP" })
  delete(@Param("id") id: string) {
    return this.service.delete(id);
  }

  @Post(":id/test")
  @ApiOperation({ summary: "Testar conexão SMTP" })
  test(@Param("id") id: string) {
    return this.service.test(id);
  }
}