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

  async updateDraft(userId: string, draftId: string, dto: UpdateDraftDto) {
    const exists = await this.prisma.emailDraft.findFirst({ where: { id: draftId, userId } });
    if (!exists) throw new NotFoundException("Draft not found");

    const updated = await this.prisma.emailDraft.update({
      where: { id: draftId },
      data: { ...dto },
    });

    await this.events.register({
      type: EventType.EMAIL_DRAFT_UPDATED,
      userId,
      draftId,
      metadata: { fields: Object.keys(dto) },
    });

    return { draft: updated };
  }
}