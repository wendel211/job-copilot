import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { UpdateDraftDto } from "./dto/update-draft.dto";

@Injectable()
export class EmailDraftService {
  constructor(private readonly prisma: PrismaService) {}

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

    return { draft: updated };
  }

  // ============================================================
  // ATUALIZAR CAMPOS DO DRAFT (safe update)
  // ============================================================
  async updateDraft(userId: string, draftId: string, dto: UpdateDraftDto) {
    if (!userId) throw new BadRequestException("userId is required");

    const exists = await this.prisma.emailDraft.findFirst({
      where: { id: draftId, userId },
      select: { id: true },
    });

    if (!exists) throw new NotFoundException("Draft not found");

    const { subject, bodyText, toEmail, attachments, checklist } = dto;

    const updated = await this.prisma.emailDraft.update({
      where: { id: draftId },
      data: {
        subject: subject ?? undefined,
        bodyText: bodyText ?? undefined,
        toEmail: toEmail ?? undefined,
        attachments: attachments ?? undefined,
        checklist: checklist ?? undefined,
      },
      select: {
        id: true,
        subject: true,
        bodyText: true,
        toEmail: true,
        attachments: true,
        checklist: true,
        updatedAt: true,
        editorOpenedAt: true,
      },
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
      select: { id: true, checklist: true },
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
      select: { id: true, checklist: true, updatedAt: true },
    });

    return { draft: updated };
  }
}
