import { Controller, Get, Query, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger"; // 1. Imports Swagger
import { EventsService } from "./events.service";

@ApiTags("Events") // 2. Agrupamento
@Controller("events")
export class EventsController {
  constructor(private service: EventsService) {}

  @Get()
  @ApiOperation({ summary: "Listar eventos recentes do sistema" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Limite de registros (padrão 50)" })
  listRecent(@Query("limit") limit?: string) {
    return this.service.listRecent(limit ? Number(limit) : 50);
  }

  @Get("user/:id")
  @ApiOperation({ summary: "Ver histórico de eventos de um usuário" })
  listByUser(@Param("id") id: string) {
    return this.service.listByUser(id);
  }

  @Get("job/:id")
  @ApiOperation({ summary: "Ver histórico de eventos de uma vaga específica" })
  listByJob(@Param("id") id: string) {
    return this.service.listByJob(id);
  }
}