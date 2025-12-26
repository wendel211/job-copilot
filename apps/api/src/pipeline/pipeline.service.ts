import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { AddNoteDto } from "./dto/add-note.dto";
import { CreateSavedJobDto } from "./dto/create-saved-job.dto";
import { EventsService } from "../events/events.service";
import { EventType } from "../events/enums/event-type.enum";

@Injectable()
export class PipelineService {
  constructor(
    private prisma: PrismaService,
    private events: EventsService
  ) {}

  async create(dto: CreateSavedJobDto) {
    const saved = await this.prisma.savedJob.create({ data: dto });

    await this.events.register({
      type: EventType.PIPELINE_STATUS_CHANGED,
      userId: dto.userId,
      jobId: dto.jobId,
      savedJobId: saved.id,
      metadata: { status: saved.status }
    });

    return saved;
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const savedJob = await this.prisma.savedJob.findUnique({ where: { id } });

    if (!savedJob) throw new NotFoundException("Saved job not found");

    const updated = await this.prisma.savedJob.update({
      where: { id },
      data: { status: dto.status }
    });

    await this.events.register({
      type: EventType.PIPELINE_STATUS_CHANGED,
      userId: dto.userId,
      jobId: savedJob.jobId,
      savedJobId: id,
      metadata: {
        from: savedJob.status,
        to: dto.status
      }
    });

    return updated;
  }

  async addNote(id: string, dto: AddNoteDto) {
    const savedJob = await this.prisma.savedJob.findUnique({ where: { id } });

    if (!savedJob) throw new NotFoundException("Saved job not found");

    const updated = await this.prisma.savedJob.update({
      where: { id },
      data: { notes: dto.note }
    });

    await this.events.register({
      type: EventType.PIPELINE_NOTE_ADDED,
      userId: dto.userId,
      jobId: savedJob.jobId,
      savedJobId: id,
      metadata: { note: dto.note }
    });

    return updated;
  }

  async listByUser(userId: string) {
    return this.prisma.savedJob.findMany({
      where: { userId },
      include: {
        job: true,
        events: true
      },
      orderBy: { updatedAt: "desc" }
    });
  }
}
