import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { QueryEventsDto } from "./dto/query-events.dto";

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async register(dto: CreateEventDto) {
    return this.prisma.event.create({ data: dto });
  }

  async list(query: QueryEventsDto) {
    return this.prisma.event.findMany({
      where: {
        userId: query.userId,
        jobId: query.jobId,
        draftId: query.draftId,
        providerId: query.providerId,
        type: query.type
      },
      orderBy: { createdAt: "desc" },
      take: 200
    });
  }
}
