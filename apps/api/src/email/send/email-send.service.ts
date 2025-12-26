import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { FakeEmailStrategy } from "../strategies/fake.strategy";
import { SmtpEmailStrategy } from "../strategies/smtp.strategy";
import { EmailProviderService } from "../provider/email-provider.service";

@Injectable()
export class EmailSendService {
  private fakeStrategy = new FakeEmailStrategy();

  constructor(
    private readonly prisma: PrismaService,
    private readonly providerService: EmailProviderService,
  ) {}

  // ============================================================
  // ENVIO CONTROLADO
  // ============================================================
  async sendEmail(userId: string, draftId: string) {
    if (!userId) throw new BadRequestException("userId is required");

    // ------------------------------------------------------------
    // 1) Carregar Draft
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
    // 2) R A T E   L I M I T   (Anti-SPAM)
    // ------------------------------------------------------------
    await this.enforceRateLimit(userId, draftId);

    // ------------------------------------------------------------
    // 3) Registrar tentativa de envio
    // ------------------------------------------------------------
    const send = await this.prisma.emailSend.create({
      data: {
        userId,
        draftId,
        toEmail: draft.toEmail,
        toDomain,
        status: "queued",
      },
    });

    // ------------------------------------------------------------
    // 4) Selecionar Estratégia
    // ------------------------------------------------------------
    const isProd = process.env.NODE_ENV === "production";

    let strategy: any;
    let provider: any = null;

    if (!isProd) {
      // → DEV usa estratégia Fake (simula envio)
      strategy = this.fakeStrategy;
    } else {
      // → PROD exige provider ativo
      provider = await this.providerService.getActiveProvider(userId);
      if (!provider) {
        throw new BadRequestException(
          "Nenhum provedor ativo de envio configurado."
        );
      }

      strategy = new SmtpEmailStrategy(provider);
    }

    // ------------------------------------------------------------
    // 5) Enviar email (real ou fake)
    // ------------------------------------------------------------
    const result = await strategy.send({
      toEmail: draft.toEmail,
      subject: draft.subject,
      bodyText: draft.bodyText,
      fromEmail: provider?.fromEmail ?? draft.user.email,
      fromName: provider?.fromName ?? draft.user.fullName ?? "JobCopilot User",
    });

    // ------------------------------------------------------------
    // 6) Atualizar registro com resultado
    // ------------------------------------------------------------
    const updated = await this.prisma.emailSend.update({
      where: { id: send.id },
      data: {
        status: result.success ? "sent" : "failed",
        sentAt: result.success ? new Date() : null,
        error: result.error ?? null,
      },
    });

    return { send: updated };
  }

  // ============================================================
  // RATE LIMIT (Anti-Bot, Anti-Spam, Anti-Loop)
  // ============================================================
  private async enforceRateLimit(userId: string, draftId: string) {
    const now = new Date();

    // -----------------------------
    // 1) Máximo 5 envios por dia
    // -----------------------------
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayCount = await this.prisma.emailSend.count({
      where: { userId, submittedAt: { gte: todayStart } },
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
    // 3) Evitar loop do mesmo draft (< 3 min)
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
