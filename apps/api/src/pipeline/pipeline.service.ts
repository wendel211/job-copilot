import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { AddNoteDto } from "./dto/add-note.dto";
import { CreateSavedJobDto } from "./dto/create-saved-job.dto";
import { EventsService } from "../events/events.service";
import { EventType } from "../events/enums/event-type.enum";
import { SavedJobStatus } from "@prisma/client"; // 1. Importação necessária

@Injectable()
export class PipelineService {
  constructor(
    private prisma: PrismaService,
    private events: EventsService
  ) {}

  async create(dto: CreateSavedJobDto) {
    // 1. Validar user
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId }
    });
    if (!user) throw new NotFoundException("User not found");

    // 2. Validar job
    const job = await this.prisma.job.findUnique({
      where: { id: dto.jobId }
    });
    if (!job) throw new NotFoundException("Job not found");

    // 3. Evitar duplicação
    const exists = await this.prisma.savedJob.findUnique({
      where: { userId_jobId: { userId: dto.userId, jobId: dto.jobId } }
    });

    if (exists) {
      throw new ConflictException("Job already saved in pipeline");
    }

    // 4. Criar item
    const saved = await this.prisma.savedJob.create({
      data: {
        userId: dto.userId,
        jobId: dto.jobId,
        status: "discovered"
      }
    });

    // 5. Registrar evento
    await this.events.register({
      type: EventType.PIPELINE_ITEM_CREATED,
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
      userId: savedJob.userId,
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
      userId: savedJob.userId,
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
  } // <--- 2. Faltava fechar esta chave do método listByUser

  // 3. Método movido para o escopo correto da Classe
  async updateStatusByUserAndJob(
    userId: string,
    jobId: string,
    status: SavedJobStatus
  ) {
    // Buscar o savedJob pela chave composta
    const saved = await this.prisma.savedJob.findUnique({
      where: {
        userId_jobId: { userId, jobId }
      }
    });

    if (!saved) return null; 

    // 4. Correção: Passar apenas o status, sem o userId
    return this.updateStatus(saved.id, {
      status
    });
  }
}