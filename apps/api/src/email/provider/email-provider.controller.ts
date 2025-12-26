import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { EmailProviderService } from "./email-provider.service";
import { CreateEmailProviderDto } from "./dto/create-email-provider.dto";
import { UpdateEmailProviderDto } from "./dto/update-email-provider.dto";

@Controller("email/providers")
export class EmailProviderController {
  constructor(private readonly service: EmailProviderService) {}

  @Post()
  create(@Body() dto: CreateEmailProviderDto) {
    return this.service.create(dto);
  }

  @Get()
  list(@Query("userId") userId: string) {
    return this.service.list(userId);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateEmailProviderDto) {
    return this.service.update(id, dto);
  }

  @Post(":id/test")
  test(@Param("id") id: string) {
    return this.service.test(id);
  }
}
    