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
  // LISTAR DRAFTS DO USUÁRIO
  // ============================================================
  async listDrafts(userId: string) {
    if (!userId) throw new BadRequestException("userId is required");

    const drafts = await this.prisma.emailDraft.findMany({
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
    });

    return { drafts };
  }

  // ============================================================
  // BUSCAR DRAFT ESPECÍFICO
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

    const draft = await this.prisma.emailDraft.findFirst({
      where: { id: draftId, userId },
      select: { id: true, editorOpenedAt: true },
    });

    if (!draft) throw new NotFoundException("Draft not found");

    const updated = await this.prisma.emailDraft.update({
      where: { id: draftId },
      data: {
        editorOpenedAt: draft.editorOpenedAt ?? new Date(),
      },
      select: { id: true, editorOpenedAt: true, updatedAt: true },
    });

    // EVENT
    await this.events.register({
      type: EventType.EMAIL_DRAFT_OPENED,
      userId,
      draftId,
      metadata: { openedEditor: true },
    });

    return { draft: updated };
  }

  // ============================================================
  // ATUALIZAR DRAFT (subject / body / toEmail / checklist...)
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

    // EVENT
    await this.events.register({
      type: EventType.EMAIL_DRAFT_UPDATED,
      userId,
      draftId,
      jobId: exists.jobId ?? undefined,
      metadata: { updatedFields: dto },
    });

    return { draft: updated };
  }

  // ============================================================
  // TOGGLE DE CHECKLIST
  // ============================================================
  async toggleChecklist(userId: string, draftId: string, item: string) {
    if (!userId) throw new BadRequestException("userId is required");
    if (!item?.trim()) throw new BadRequestException("Checklist item required");

    const draft = await this.prisma.emailDraft.findFirst({
      where: { id: draftId, userId },
    });

    if (!draft) throw new NotFoundException("Draft not found");

    const normalized = item.trim();
    const lower = normalized.toLowerCase();

    const current = (draft.checklist ?? []).filter(Boolean);
    const exists = current.some((c) => c.toLowerCase() === lower);

    const next = exists
      ? current.filter((c) => c.toLowerCase() !== lower)
      : [...current, normalized];

    const updated = await this.prisma.emailDraft.update({
      where: { id: draftId },
      data: { checklist: next },
    });

    // EVENT
    await this.events.register({
      type: EventType.EMAIL_DRAFT_CHECKLIST_TOGGLED,
      userId,
      draftId,
      metadata: {
        item: normalized,
        added: !exists,
        removed: exists,
      },
    });

    return { draft: updated };
  }
}
