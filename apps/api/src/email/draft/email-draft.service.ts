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
  // LISTAR DRAFTS
  // ============================================================
  async listDrafts(userId: string) {
    if (!userId) throw new BadRequestException("userId is required");

    return {
      drafts: await this.prisma.emailDraft.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          subject: true,
          toEmail: true,
          updatedAt: true,
          checklist: true,
          attachments: true,
          job: {
            select: {
              id: true,
              title: true,
              atsType: true,
              applyUrl: true,
              company: { select: { id: true, name: true } },
            },
          },
        },
      }),
    };
  }

  // ============================================================
  // BUSCAR UM DRAFT ESPECÍFICO
  // ============================================================
  async getDraftById(userId: string, draftId: string) {
    if (!userId) throw new BadRequestException("userId is required");

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
          take: 10,
        },
      },
    });

    if (!draft) throw new NotFoundException("Draft not found");

    return { draft };
  }

  // ============================================================
  // MARCAR COMO ABERTO NO EDITOR
  // ============================================================
  async markOpened(userId: string, draftId: string) {
    if (!userId) throw new BadRequestException("userId is required");

    const exists = await this.prisma.emailDraft.findFirst({
      where: { id: draftId, userId },
      select: { id: true, editorOpenedAt: true },
    });

    if (!exists) throw new NotFoundException("Draft not found");

    const updated = await this.prisma.emailDraft.update({
      where: { id: draftId },
      data: {
        editorOpenedAt: exists.editorOpenedAt ?? new Date(),
      },
      select: { id: true, editorOpenedAt: true, updatedAt: true },
    });

    // EVENT: draft opened
    await this.events.register({
      type: EventType.EMAIL_DRAFT_UPDATED,
      userId,
      draftId,
      metadata: { openedEditor: true }
    });

    return { draft: updated };
  }

  // ============================================================
  // ATUALIZAR DRAFT
  // ============================================================
  async updateDraft(userId: string, draftId: string, dto: UpdateDraftDto) {
    if (!userId) throw new BadRequestException("userId is required");

    const exists = await this.prisma.emailDraft.findFirst({
      where: { id: draftId, userId },
    });

    if (!exists) throw new NotFoundException("Draft not found");

    const updated = await this.prisma.emailDraft.update({
      where: { id: draftId },
      data: {
        subject: dto.subject ?? undefined,
        bodyText: dto.bodyText ?? undefined,
        toEmail: dto.toEmail ?? undefined,
        attachments: dto.attachments ?? undefined,
        checklist: dto.checklist ?? undefined,
      },
    });

    // EVENT: draft updated
    await this.events.register({
      type: EventType.EMAIL_DRAFT_UPDATED,
      userId,
      draftId,
      jobId: exists.jobId ?? undefined,
      metadata: dto
    });

    return { draft: updated };
  }

  // ============================================================
  // TOGGLE CHECKLIST
  // ============================================================
  async toggleChecklist(userId: string, draftId: string, item: string) {
    if (!userId) throw new BadRequestException("userId is required");
    if (!item?.trim()) throw new BadRequestException("Checklist item required");

    const draft = await this.prisma.emailDraft.findFirst({
      where: { id: draftId, userId },
    });

    if (!draft) throw new NotFoundException("Draft not found");

    const normalized = item.trim();
    const normalizedKey = normalized.toLowerCase();

    const current = (draft.checklist ?? []).filter(Boolean);
    const currentKeys = current.map((x) => x.toLowerCase());
    const has = currentKeys.includes(normalizedKey);

    const next = has
      ? current.filter((x) => x.toLowerCase() !== normalizedKey)
      : [...current, normalized];

    const updated = await this.prisma.emailDraft.update({
      where: { id: draftId },
      data: { checklist: next },
    });

    // EVENT: checklist toggled
    await this.events.register({
      type: EventType.EMAIL_DRAFT_UPDATED,
      userId,
      draftId,
      metadata: { checklistChanged: true, item }
    });

    return { draft: updated };
  }
}
