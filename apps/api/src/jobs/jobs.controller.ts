import { Controller, Get, Query, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger"; 
import { JobsService } from "./jobs.service";

@ApiTags("Jobs") 
@Controller("jobs")
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // 1. LISTAGEM GERAL (Com paginação e filtros)
  @Get()
  @ApiOperation({ summary: "Listar vagas com paginação e filtros" })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página (padrão 1)' })
  @ApiQuery({ name: 'q', required: false, description: 'Termo de busca' })
  @ApiQuery({ name: 'remote', required: false, type: Boolean })
  @ApiQuery({ name: 'source', required: false, description: 'Fonte (adzuna, remotive, etc)' })
  @ApiQuery({ name: 'atsType', required: false })
  async findAll(
    @Query('page') page?: string,
    @Query('q') q?: string,
    @Query('company') company?: string,
    @Query('location') location?: string,
    @Query('atsType') atsType?: string,
    @Query('source') source?: string,
    @Query('remote') remote?: string,
  ) {
    // Tratamento de tipos
    const pageNumber = page ? parseInt(page, 10) : 1;
    const isRemote = remote === 'true' ? true : remote === 'false' ? false : undefined;

    return this.jobsService.findAll({
      page: pageNumber,
      limit: 24, 
      q: q?.trim(),
      company: company?.trim(),
      location: location?.trim(),
      atsType,
      source,
      remote: isRemote
    });
  }

  // 2. RECOMENDAÇÕES (Deve vir antes do :id para não confundir rotas)
  @Get("recommendations")
  @ApiOperation({ summary: "Vagas sugeridas para o perfil (Simulado)" })
  async getRecommendations() {
    // userId fixo por enquanto, futuramente pegamos do JWT (@User)
    const userId = 'user-placeholder'; 
    return this.jobsService.findRecommendations(userId);
  }

  // 3. DETALHES DA VAGA
  @Get(":id")
  @ApiOperation({ summary: "Buscar detalhes de uma vaga pelo ID" })
  async findOne(@Param("id") id: string) {
    return this.jobsService.findOne(id);
  }
}