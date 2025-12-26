import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDto } from "./dto/create-event.dto";

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async register(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        type: dto.type,
        userId: dto.userId ?? undefined,
        jobId: dto.jobId ?? undefined,
        draftId: dto.draftId ?? undefined,
        providerId: dto.providerId ?? undefined,
        sendId: dto.sendId ?? undefined,
        savedJobId: dto.savedJobId ?? undefined,
        metadata: dto.metadata ?? {},
      },
    });
  }

  async listRecent(limit = 50) {
    return this.prisma.event.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  async listByUser(userId: string) {
    return this.prisma.event.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async listByJob(jobId: string) {
    return this.prisma.event.findMany({
      where: { jobId },
      orderBy: { createdAt: "desc" },
    });
  }
}
