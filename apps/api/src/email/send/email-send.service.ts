import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { EmailProviderService } from "../provider/email-provider.service";
import { EventsService } from "../../events/events.service";
import { EventType } from "../../events/enums/event-type.enum";
import { PipelineService } from "../../pipeline/pipeline.service";
import { EmailSendStatus } from "@prisma/client";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailSendService {
  private readonly logger = new Logger(EmailSendService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providerService: EmailProviderService,
    private readonly events: EventsService,
    private readonly pipeline: PipelineService
  ) {}
  async sendDirect(
    userId: string,
    dto: { subject: string; body: string; to: string; jobId?: string }
  ) {
    if (!userId) throw new BadRequestException("userId is required");
    if (!dto.to) throw new BadRequestException("Destinatário é obrigatório");

    await this.enforceRateLimit(userId);

    // 1. Enviar
    const sendResult = await this.transmitEmail(userId, {
      to: dto.to,
      subject: dto.subject,
      body: dto.body,
    });

    // 2. Salvar Histórico (Cria Draft + SendLog)
    const result = await this.prisma.$transaction(async (tx) => {
      const draft = await tx.emailDraft.create({
        data: {
          userId,
          jobId: dto.jobId,
          subject: dto.subject,
          bodyText: dto.body,
          toEmail: dto.to,
          editorOpenedAt: new Date(),
        },
      });

      const toDomain = dto.to.split("@")[1]?.toLowerCase() ?? "unknown";

      const sendLog = await tx.emailSend.create({
        data: {
          userId,
          draftId: draft.id,
          providerId: sendResult.providerId,
          toEmail: dto.to,
          toDomain,
          status: sendResult.status,
          error: sendResult.error,
          sentAt: sendResult.status === EmailSendStatus.sent ? new Date() : null,
        },
      });

      return { draft, sendLog };
    });

    // 3. Pipeline e Eventos
    await this.handlePostSend(userId, result.sendLog, dto.jobId, sendResult.error);

    return { success: true, messageId: sendResult.messageId };
  }
  async sendSavedDraft(userId: string, draftId: string) {
    const draft = await this.prisma.emailDraft.findFirst({
      where: { id: draftId, userId },
    });

    if (!draft) throw new NotFoundException("Rascunho não encontrado.");
    if (!draft.toEmail) throw new BadRequestException("Rascunho sem destinatário.");

    await this.enforceRateLimit(userId);

    const sendResult = await this.transmitEmail(userId, {
      to: draft.toEmail,
      subject: draft.subject,
      body: draft.bodyText,
    });

    const toDomain = draft.toEmail.split("@")[1]?.toLowerCase() ?? "unknown";

    const sendLog = await this.prisma.emailSend.create({
      data: {
        userId,
        draftId: draft.id,
        providerId: sendResult.providerId,
        toEmail: draft.toEmail,
        toDomain,
        status: sendResult.status,
        error: sendResult.error,
        sentAt: sendResult.status === EmailSendStatus.sent ? new Date() : null,
      },
    });

    await this.handlePostSend(userId, sendLog, draft.jobId, sendResult.error);

    return { success: true, messageId: sendResult.messageId };
  }

  private async transmitEmail(userId: string, data: { to: string; subject: string; body: string }) {
    // Provedor Ativo
    const provider = await this.providerService.getActiveProvider(userId);
    
    // Se não tiver provider e estiver em DEV, usa Fake
    const isDev = process.env.NODE_ENV !== "production";
    if (!provider) {
        if (isDev) {
            this.logger.warn(`[DEV] Enviando email fake para ${data.to}`);
            return { 
                status: EmailSendStatus.sent, 
                messageId: `fake-${Date.now()}`, 
                providerId: null, 
                error: null 
            };
        }
        throw new BadRequestException("Nenhum provedor de e-mail ativo.");
    }

    // Configurar Nodemailer
    const transporter = nodemailer.createTransport({
      host: provider.smtpHost,
      port: provider.smtpPort,
      secure: provider.smtpSecure,
      auth: {
        user: provider.smtpUser,
        pass: provider.smtpPassEnc, // Já vem descriptografado
      },
    });

    try {
      const info = await transporter.sendMail({
        from: `"${provider.fromName}" <${provider.fromEmail}>`,
        to: data.to,
        subject: data.subject,
        text: data.body,
      });

      return { 
          status: EmailSendStatus.sent, 
          messageId: info.messageId, 
          providerId: provider.id, 
          error: null 
      };
    } catch (error) {
      this.logger.error(`Erro SMTP: ${error.message}`);
      return { 
          status: EmailSendStatus.failed, 
          messageId: null, 
          providerId: provider.id, 
          error: String(error) 
      };
    }
  }
  private async handlePostSend(userId: string, sendLog: any, jobId: string | null | undefined, error: string | null) {
    if (sendLog.status === EmailSendStatus.failed) {
        await this.events.register({
            type: EventType.EMAIL_FAILED,
            userId,
            sendId: sendLog.id,
            metadata: { error }
        });
        throw new BadRequestException(`Falha no envio: ${error}`);
    }

    await this.events.register({
        type: EventType.EMAIL_SENT,
        userId,
        draftId: sendLog.draftId,
        sendId: sendLog.id,
        jobId: jobId ?? undefined,
        metadata: { to: sendLog.toEmail }
    });

    if (jobId) {
      try {

          await this.pipeline.updateStatusByUserAndJob(userId, jobId, "sent");
      } catch (e) {
          this.logger.warn("Erro ao atualizar pipeline automaticamente.", e);
      }
    }
  }

  private async enforceRateLimit(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const count = await this.prisma.emailSend.count({ where: { userId, submittedAt: { gte: today } } });
    if (count >= 50) throw new BadRequestException("Limite diário de envios atingido.");
  }
}