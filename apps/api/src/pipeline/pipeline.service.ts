import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { AddNoteDto } from "./dto/add-note.dto";
import { CreateSavedJobDto } from "./dto/create-saved-job.dto";
import { EventsService } from "../events/events.service";
import { EventType } from "../events/enums/event-type.enum";
import { SavedJobStatus } from "@prisma/client"; 

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

    // 3. Verificar se já existe
    const exists = await this.prisma.savedJob.findUnique({
      where: { userId_jobId: { userId: dto.userId, jobId: dto.jobId } }
    });

    // --- CORREÇÃO PRINCIPAL ---
    // Se já existe, retornamos o objeto existente e NÃO lançamos erro.
    // Isso permite que o frontend pegue o ID sem quebrar.
    if (exists) {
        return exists;
    }

    // 4. Criar item se não existir
    const saved = await this.prisma.savedJob.create({
      data: {
        userId: dto.userId,
        jobId: dto.jobId,
        status: SavedJobStatus.discovered
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

    const dataToUpdate: any = { status: dto.status };

    // Se mudar para applied, atualiza a data
    if (dto.status === SavedJobStatus.applied) {
        dataToUpdate.appliedAt = new Date();
    }

    const updated = await this.prisma.savedJob.update({
      where: { id },
      data: dataToUpdate
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
        job: {
            include: {
                company: true 
            }
        },
        events: true
      },
      orderBy: { updatedAt: "desc" }
    });
  }

  async updateStatusByUserAndJob(
    userId: string,
    jobId: string,
    status: SavedJobStatus
  ) {
    const saved = await this.prisma.savedJob.findUnique({
      where: {
        userId_jobId: { userId, jobId }
      }
    });

    if (!saved) return null; 

    return this.updateStatus(saved.id, {
      status
    });
  }
}