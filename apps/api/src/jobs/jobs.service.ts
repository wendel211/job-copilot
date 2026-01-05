import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AtsType, JobSourceType, Prisma } from "@prisma/client";

interface FindAllParams {
  page?: number;
  limit?: number;
  q?: string;
  company?: string;
  location?: string;
  atsType?: string;
  source?: string;
  remote?: boolean;
}

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
      },
    });

    if (!job) {
      throw new NotFoundException(`Vaga com ID ${id} não encontrada.`);
    }

    return job;
  }

  async findAll(params: FindAllParams) {
    const { page = 1, limit = 36, q, company, location, atsType, source, remote } = params;
    const skip = (page - 1) * limit;

    // Construção dinâmica do filtro (Where)
    const where: Prisma.JobWhereInput = {
      AND: [
        // Filtro de Busca (Título, Descrição ou Empresa)
        q ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { company: { name: { contains: q, mode: "insensitive" } } },
          ],
        } : {},

        // Filtro Específico de Empresa
        company ? {
          company: { name: { contains: company, mode: "insensitive" } },
        } : {},

        // Filtro de Localização
        location ? {
          location: { contains: location, mode: "insensitive" },
        } : {},

        // Filtro de ATS (Greenhouse, Lever, etc)
        atsType ? { atsType: atsType as AtsType } : {},

        // NOVO: Filtro de Fonte (Adzuna, Remotive, etc)
        source ? { sourceType: source as JobSourceType } : {},

        // Filtro de Remoto (apenas se for explicitamente true/false)
        remote === true || remote === false ? { remote } : {},
      ],
    };

    // Executa Transaction: Busca Dados + Conta Total
    const [data, total] = await this.prisma.$transaction([
      this.prisma.job.findMany({
        where,
        include: { company: true },
        orderBy: { postedAt: "desc" }, // Mais recentes primeiro
        take: limit,
        skip: skip,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        limit,
      },
    };
  }
  async findRecommendations(userId: string) {
 
    const userSkills = ['react', 'node', 'typescript', 'next.js', 'nest', 'javascript'];

    return this.prisma.job.findMany({
      where: {
        OR: userSkills.map(skill => ({
          description: { contains: skill, mode: 'insensitive' }
        }))
      },
      include: { company: true },
      orderBy: { postedAt: 'desc' },
      take: 5 
    });
  }
}