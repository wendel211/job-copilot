import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class EmailPreviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getPreview(draftId: string, userId: string) {
    const draft = await this.prisma.emailDraft.findFirst({
      where: { id: draftId, userId },
      include: { user: true, job: { include: { company: true } } },
    });

    if (!draft) throw new NotFoundException("Draft not found");

    const html = this.toHtml(draft.bodyText);

    return {
      draftId: draft.id,
      subject: draft.subject,
      html,
    };
  }

  private toHtml(text: string) {
    // quebra linhas → <br/>
    return (
      "<div style='font-family: sans-serif; white-space: pre-line;'>" +
      text.replace(/\n/g, "\n") +
      "</div>"
    );
  }
}
