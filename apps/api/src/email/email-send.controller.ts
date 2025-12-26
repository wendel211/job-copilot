import { Body, Controller, Post } from "@nestjs/common";
import { EmailSendService } from "./email-send.service";
import { SendEmailDto } from "./dto/send-email.dto";

@Controller("email")
export class EmailSendController {
  constructor(private readonly service: EmailSendService) {}

  @Post("send")
  send(@Body() dto: SendEmailDto) {
    return this.service.sendEmail(dto.userId, dto.draftId);
  }
}
