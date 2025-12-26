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
