import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { FakeEmailStrategy } from "../strategies/fake.strategy";
import { SmtpEmailStrategy } from "../strategies/smtp.strategy";
import { EmailProviderService } from "../provider/email-provider.service";
import { EventsService } from "../../events/events.service";
import { EventType } from "../../events/enums/event-type.enum";
import { PipelineService } from "../../pipeline/pipeline.service";
import { EmailSendStatus } from "@prisma/client";

@Injectable()
export class EmailSendService {
  private fakeStrategy = new FakeEmailStrategy();

  constructor(
    private readonly prisma: PrismaService,
    private readonly providerService: EmailProviderService,
    private readonly events: EventsService,
    private readonly pipeline: PipelineService
  ) {}

  // ============================================================
  // ENVIO COMPLETO (Rate limit + Strategy + Eventos + Pipeline)
  // ============================================================
  async sendEmail(userId: string, draftId: string) {
    if (!userId) throw new BadRequestException("userId is required");

    // ------------------------------------------------------------
    // 1) Carregar draft
    // ------------------------------------------------------------
    const draft = await this.prisma.emailDraft.findFirst({
      where: { id: draftId, userId },
      include: { user: true },
    });

    if (!draft) throw new NotFoundException("Draft not found");
    if (!draft.toEmail)
      throw new BadRequestException(
        "Draft não possui destinatário (toEmail)."
      );

    const toDomain = draft.toEmail.split("@")[1]?.toLowerCase() ?? "unknown";

    // ------------------------------------------------------------
    // 2) Rate limit
    // ------------------------------------------------------------
    await this.enforceRateLimit(userId, draftId);

    // ------------------------------------------------------------
    // 3) Registrar tentativa (queued)
    // ------------------------------------------------------------
    const send = await this.prisma.emailSend.create({
      data: {
        userId,
        draftId,
        toEmail: draft.toEmail,
        toDomain,
        status: EmailSendStatus.queued,
      },
    });

    // ------------------------------------------------------------
    // 4) Selecionar estratégia
    // ------------------------------------------------------------
    const isProd = process.env.NODE_ENV === "production";

    let strategy: FakeEmailStrategy | SmtpEmailStrategy;
    let provider: any = null;

    if (!isProd) {
      strategy = this.fakeStrategy;
    } else {
      provider = await this.providerService.getActiveProvider(userId);
      if (!provider) {
        throw new BadRequestException(
          "Nenhum provedor ativo de envio configurado."
        );
      }

      strategy = new SmtpEmailStrategy(provider);
    }

    try {
      // ========================================================
      // 5) TENTAR ENVIAR
      // ========================================================
      const result = await strategy.send({
        toEmail: draft.toEmail,
        subject: draft.subject,
        bodyText: draft.bodyText,
        fromEmail: provider?.fromEmail ?? draft.user.email,
        fromName: provider?.fromName ?? draft.user.fullName ?? "JobCopilot User",
      });

      if (!result.success) throw new Error(result.error);

      // ========================================================
      // 6) Registrar como ENVIADO
      // ========================================================
      const updated = await this.prisma.emailSend.update({
        where: { id: send.id },
        data: {
          status: EmailSendStatus.sent,
          sentAt: new Date(),
        },
      });

      // EVENTO
      await this.events.register({
        type: EventType.EMAIL_SENT,
        userId,
        draftId: draft.id,
        sendId: send.id,
        jobId: draft.jobId ?? undefined,
        metadata: {
          to: draft.toEmail,
          providerId: provider?.id ?? null,
        },
      });

      // ========================================================
      // 7) Atualizar pipeline automaticamente
      // ========================================================
      if (draft.jobId) {
        await this.pipeline.updateStatusByUserAndJob(
          userId,
          draft.jobId,
          "sent"
        );
      }

      return { send: updated };

    } catch (error) {
      // ========================================================
      // 8) Se falhar → marcar como FAILED
      // ========================================================
      const failed = await this.prisma.emailSend.update({
        where: { id: send.id },
        data: {
          status: EmailSendStatus.failed,
          error: String(error),
        },
      });

      // EVENTO
      await this.events.register({
        type: EventType.EMAIL_FAILED,
        userId,
        draftId,
        sendId: send.id,
        metadata: { error: String(error) },
      });

      return { send: failed };
    }
  }

  // ============================================================
  // RATE LIMIT (Anti-bot, Anti-loop, Anti-spam)
  // ============================================================
  private async enforceRateLimit(userId: string, draftId: string) {
    const now = new Date();

    // -----------------------------
    // 1) Máximo 5 envios por dia
    // -----------------------------
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await this.prisma.emailSend.count({
      where: { userId, submittedAt: { gte: today } },
    });

    if (todayCount >= 5) {
      throw new BadRequestException("Limite diário de 5 envios atingido.");
    }

    // -----------------------------
    // 2) Intervalo mínimo de 1 minuto
    // -----------------------------
    const lastSend = await this.prisma.emailSend.findFirst({
      where: { userId },
      orderBy: { submittedAt: "desc" },
    });

    if (lastSend) {
      const diff = now.getTime() - lastSend.submittedAt.getTime();
      if (diff < 60 * 1000) {
        throw new BadRequestException(
          "Aguarde 1 minuto antes de enviar outro email."
        );
      }
    }

    // -----------------------------
    // 3) Evitar reenvio do mesmo draft em < 3 min
    // -----------------------------
    const lastForDraft = await this.prisma.emailSend.findFirst({
      where: { userId, draftId },
      orderBy: { submittedAt: "desc" },
    });

    if (lastForDraft) {
      const diffDraft = now.getTime() - lastForDraft.submittedAt.getTime();
      if (diffDraft < 3 * 60 * 1000) {
        throw new BadRequestException(
          "Aguarde 3 minutos antes de reenviar este rascunho."
        );
      }
    }

    return true;
  }
}
