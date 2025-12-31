import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AtsType } from "@prisma/client";

interface SearchParams {
  q?: string;
  company?: string;
  location?: string;
  atsType?: string;
  remote?: boolean;
  take: number;
  skip: number;
}

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  // ADICIONADO: Método para buscar uma vaga específica
  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: true, // Importante: Traz os dados da empresa (nome, site, etc)
      },
    });

    if (!job) {
      throw new NotFoundException(`Vaga com ID ${id} não encontrada.`);
    }

    return job;
  }

  // Método de busca existente (mantido igual)
  async search(params: SearchParams) {
    const { q, company, location, atsType, remote, take, skip } = params;

    return this.prisma.job.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { title: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                  {
                    company: {
                      name: { contains: q, mode: "insensitive" },
                    },
                  },
                ],
              }
            : {},

          company
            ? {
                company: {
                  name: { contains: company, mode: "insensitive" },
                },
              }
            : {},

          location
            ? {
                location: { contains: location, mode: "insensitive" },
              }
            : {},

          atsType
            ? {
                atsType: atsType as AtsType,
              }
            : {},

          remote === true || remote === false ? { remote } : {},
        ],
      },
      include: {
        company: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take,
      skip,
    });
  }
}