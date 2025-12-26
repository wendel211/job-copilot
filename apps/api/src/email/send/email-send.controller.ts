import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger"; // 1. Import
import { EmailSendService } from "./email-send.service";
import { SendEmailDto } from "./dto/send-email.dto";

@ApiTags("Email Send") // 2. Tag
@Controller("email")
export class EmailSendController {
  constructor(private readonly service: EmailSendService) {}

  @Post("send")
  @ApiOperation({ summary: "Enviar um email baseado em um rascunho existente" })
  send(@Body() dto: SendEmailDto) {
    return this.service.sendEmail(dto.userId, dto.draftId);
  }
}