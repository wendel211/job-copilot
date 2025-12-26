import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { FakeEmailStrategy } from "./strategies/fake.strategy";
import { SmtpEmailStrategy } from "./strategies/smtp.strategy";

@Injectable()
export class EmailSendService {
  private fakeStrategy = new FakeEmailStrategy();
  private smtpStrategy = new SmtpEmailStrategy();

  constructor(private readonly prisma: PrismaService) {}

  async sendEmail(userId: string, draftId: string) {
    if (!userId) throw new BadRequestException("userId is required");

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayCount = await this.prisma.emailSend.count({
  where: { userId, submittedAt: { gte: todayStart } },
    });

    if (todayCount >= 5) {
  throw new BadRequestException("Limite diário de 5 envios atingido.");
    }

    const lastSend = await this.prisma.emailSend.findFirst({
  where: { userId },
  orderBy: { submittedAt: "desc" },
});

if (lastSend) {
  const diff = Date.now() - lastSend.submittedAt.getTime();
  if (diff < 60 * 1000) {
    throw new BadRequestException("Aguarde 1 minuto antes de enviar outro email.");
  }
}

const lastForDraft = await this.prisma.emailSend.findFirst({
  where: { userId, draftId },
  orderBy: { submittedAt: "desc" },
});

if (lastForDraft) {
  const diffDraft = Date.now() - lastForDraft.submittedAt.getTime();
  if (diffDraft < 3 * 60 * 1000) {
    throw new BadRequestException("Aguarde 3 minutos antes de reenviar este draft.");
  }
}


    // Carregar draft
    const draft = await this.prisma.emailDraft.findFirst({
      where: { id: draftId, userId },
      include: { user: true },
    });

    if (!draft) throw new NotFoundException("Draft not found");
    if (!draft.toEmail) throw new BadRequestException("Draft sem destinatário (toEmail).");

    const toDomain = draft.toEmail.split("@")[1]?.toLowerCase() ?? "unknown";

    // Criar registro de envio
    const send = await this.prisma.emailSend.create({
      data: {
        userId,
        draftId,
        toEmail: draft.toEmail,
        toDomain,
        status: "queued",
      },
    });

    // Escolher estratégia
    const isProd = process.env.NODE_ENV === "production";
    const strategy = isProd ? this.smtpStrategy : this.fakeStrategy;

    const result = await strategy.send({
      toEmail: draft.toEmail,
      subject: draft.subject,
      bodyText: draft.bodyText,
      fromEmail: draft.user.email,
      fromName: draft.user.fullName ?? "JobCopilot User",
    });

    // Atualizar status
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
}
