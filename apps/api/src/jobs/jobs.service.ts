import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

type SearchArgs = {
  q?: string;
  remote?: boolean;
  take: number;
  skip: number;
};

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async search({ q, remote, take, skip }: SearchArgs) {
    const where: any = {};

    if (typeof remote === "boolean") where.remote = remote;

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { company: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: { company: true },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      this.prisma.job.count({ where }),
    ]);

    return { total, take, skip, items };
  }
}
