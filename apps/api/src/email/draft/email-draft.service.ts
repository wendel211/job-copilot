import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { EventsService } from "../../events/events.service";
import { EventType } from "../../events/enums/event-type.enum";
import { UpdateDraftDto } from "./dto/update-draft.dto";

@Injectable()
export class EmailDraftService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService
  ) {}

  // ============================================================
  // LISTAR
  // ============================================================
  async listDrafts(userId: string) {
    const drafts = await this.prisma.emailDraft.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            atsType: true,
            company: { select: { name: true } },
          },
        },
      },
    });
    return { drafts };
  }

  // ============================================================
  // BUSCAR UM
  // ============================================================
  async getDraftById(userId: string, draftId: string) {
    const draft = await this.prisma.emailDraft.findFirst({
      where: { id: draftId, userId },
      include: {
        job: {
          include: {
            company: true,
            requirements: true,
          },
        },
        sends: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!draft) throw new NotFoundException("Draft not found");
    return { draft };
  }

  // ============================================================
  // ATUALIZAR
  // ============================================================
  async updateDraft(userId: string, draftId: string, dto: UpdateDraftDto) {
    const exists = await this.prisma.emailDraft.findFirst({ where: { id: draftId, userId } });
    if (!exists) throw new NotFoundException("Draft not found");

    const updated = await this.prisma.emailDraft.update({
      where: { id: draftId },
      data: { 
        subject: dto.subject,
        bodyText: dto.bodyText,
        toEmail: dto.toEmail,
        // Adicione outros campos se o DTO permitir (attachments, checklist)
      },
    });

    await this.events.register({
      type: EventType.EMAIL_DRAFT_UPDATED,
      userId,
      draftId,
      metadata: { fields: Object.keys(dto) },
    });

    return { draft: updated };
  }

  // ============================================================
  // NOVO: DELETAR
  // ============================================================
  async deleteDraft(userId: string, draftId: string) {
    const draft = await this.prisma.emailDraft.findFirst({
      where: { id: draftId, userId },
    });

    if (!draft) throw new NotFoundException("Draft not found");

    await this.prisma.emailDraft.delete({
      where: { id: draftId },
    });

    return { success: true };
  }

  async markOpened(userId: string, draftId: string) {
    const draft = await this.prisma.emailDraft.findFirst({ where: { id: draftId, userId } });
    if (!draft) throw new NotFoundException("Draft not found");

    const updated = await this.prisma.emailDraft.update({
        where: { id: draftId },
        data: { editorOpenedAt: new Date() }
    });
    return { draft: updated };
  }

  async toggleChecklist(userId: string, draftId: string, item: string) {
    const draft = await this.prisma.emailDraft.findFirst({ where: { id: draftId, userId } });
    if (!draft) throw new NotFoundException("Draft not found");

    let checklist = draft.checklist || [];
    if (checklist.includes(item)) {
        checklist = checklist.filter(i => i !== item);
    } else {
        checklist.push(item);
    }

    const updated = await this.prisma.emailDraft.update({
        where: { id: draftId },
        data: { checklist }
    });
    return { draft: updated };
  }
}