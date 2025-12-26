import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UpsertTemplateDto } from "./dto/upsert-template.dto";

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(dto: UpsertTemplateDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException("User not found");

    const template = await this.prisma.userTemplate.upsert({
      where: { userId: dto.userId },
      create: {
        userId: dto.userId,
        baseIntro: dto.baseIntro ?? null,
        baseBullets: dto.baseBullets ?? null,
        closingLine: dto.closingLine ?? null,
      },
      update: {
        baseIntro: dto.baseIntro ?? undefined,
        baseBullets: dto.baseBullets ?? undefined,
        closingLine: dto.closingLine ?? undefined,
      },
    });

    return { template };
  }

  async getMe(userId: string) {
    const template = await this.prisma.userTemplate.findUnique({
      where: { userId },
    });
    return { template };
  }
}
