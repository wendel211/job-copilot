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
  ) { }

  // ============================================================
  // CRIAR OU RETORNAR EXISTENTE
  // ============================================================
  async create(dto: CreateSavedJobDto) {
    // 1. Validar user
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException("User not found");

    // 2. Validar job
    const job = await this.prisma.job.findUnique({ where: { id: dto.jobId } });
    if (!job) throw new NotFoundException("Job not found");

    // 3. Verificar se já existe
    const exists = await this.prisma.savedJob.findUnique({
      where: { userId_jobId: { userId: dto.userId, jobId: dto.jobId } }
    });

    // Se já existe, retorna o existente (Idempotência)
    if (exists) {
      return exists;
    }

    // 4. Criar item
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

  // ============================================================
  // VERIFICAR STATUS (Checar se já existe)
  // ============================================================
  async checkStatus(userId: string, jobId: string) {
    const saved = await this.prisma.savedJob.findUnique({
      where: {
        userId_jobId: { userId, jobId }
      }
    });
    return saved || null;
  }

  // ============================================================
  // ATUALIZAR STATUS (Pelo ID do Item)
  // ============================================================
  async updateStatus(id: string, dto: UpdateStatusDto) {
    const savedJob = await this.prisma.savedJob.findUnique({ where: { id } });
    if (!savedJob) throw new NotFoundException("Saved job not found");

    // Cast seguro para o Enum
    const newStatus = dto.status as SavedJobStatus;

    const dataToUpdate: any = { status: newStatus };

    // Se mudar para applied, atualiza a data
    if (newStatus === SavedJobStatus.applied) {
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
        to: newStatus
      }
    });

    return updated;
  }

  // ============================================================
  // ADICIONAR NOTA
  // ============================================================
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

  // ============================================================
  // LISTAR TUDO DO USUÁRIO
  // ============================================================
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

  // ============================================================
  // REMOVER (Desalvar)
  // ============================================================
  async delete(id: string) {
    const exists = await this.prisma.savedJob.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException("Item not found");

    await this.prisma.savedJob.delete({ where: { id } });

    return { success: true };
  }

  async updateStatusByUserAndJob(
    userId: string,
    jobId: string,
    status: string | SavedJobStatus
  ) {
    // 1. Busca existente
    let saved = await this.prisma.savedJob.findUnique({
      where: {
        userId_jobId: { userId, jobId }
      }
    });

    if (!saved) {
      saved = await this.create({ userId, jobId });
    }

    return this.updateStatus(saved.id, {
      status: status as SavedJobStatus
    });
  }
}