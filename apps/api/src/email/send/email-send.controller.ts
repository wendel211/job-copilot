import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { EmailSendService } from "./email-send.service";

@ApiTags("Email Send")
@Controller("email/send")
export class EmailSendController {
  constructor(private readonly service: EmailSendService) {}
  @Post()
  @ApiOperation({ summary: "Envio Direto (Sem rascunho prévio)" })
  async sendDirect(
    @Body() body: { 
      userId: string; 
      subject: string; 
      body: string; 
      to: string; 
      jobId?: string 
    }
  ) {
    return this.service.sendDirect(body.userId, body);
  }

  @Post('draft')
  @ApiOperation({ summary: "Envio de Rascunho Existente pelo ID" })
  async sendDraft(
    @Body() body: { 
      userId: string; 
      draftId: string 
    }
  ) {
    return this.service.sendSavedDraft(body.userId, body.draftId);
  }
}