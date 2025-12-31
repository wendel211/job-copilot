import { Controller, Get, Query, Param, NotFoundException } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger"; 
import { JobsService } from "./jobs.service";
import { SearchJobsDto } from "./dto/search-jobs.dto";

@ApiTags("Jobs") 
@Controller("jobs")
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get("search")
  @ApiOperation({ summary: "Buscar vagas com filtros" }) 
  search(@Query() query: SearchJobsDto) {
    return this.jobsService.search({
      q: query.q?.trim(),
      company: query.company?.trim(),
      location: query.location?.trim(),
      atsType: query.atsType,
      remote:
        query.remote === "true"
          ? true
          : query.remote === "false"
          ? false
          : undefined,
      take: query.take ? Number(query.take) : 20,
      skip: query.skip ? Number(query.skip) : 0,
    });
  }


  @Get(":id")
  @ApiOperation({ summary: "Buscar detalhes de uma vaga pelo ID" })
  async findOne(@Param("id") id: string) {
    return this.jobsService.findOne(id);
  }
}