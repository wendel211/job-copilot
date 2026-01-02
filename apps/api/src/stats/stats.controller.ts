import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { StatsService } from "./stats.service";

@ApiTags("Stats")
@Controller("stats")
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  // ===========================================================
  // 🎯 DASHBOARD PRINCIPAL (Resumo)
  // ===========================================================
  @Get()
  @ApiOperation({ summary: "Resumo do Dashboard: Cards de totais e Atividade Recente" })
  @ApiQuery({ name: "userId", required: true, description: "ID do usuário logado" })
  getSummary(@Query("userId") userId: string) {
    return this.stats.getUserStats(userId);
  }

  // ===========================================================
  // 📊 ANALYTICS DETALHADOS (Para gráficos futuros)
  // ===========================================================

  @Get("emails-per-day")
  @ApiOperation({ summary: "Volume de emails enviados por dia" })
  @ApiQuery({ name: "userId", required: true })
  emailsPerDay(@Query("userId") userId: string) {
    return this.stats.emailsPerDay(userId);
  }

  @Get("email-fail-rate")
  @ApiOperation({ summary: "Taxa de sucesso vs falha no envio de emails" })
  @ApiQuery({ name: "userId", required: true })
  emailFailRate(@Query("userId") userId: string) {
    return this.stats.emailFailRate(userId);
  }

  @Get("ats-distribution")
  @ApiOperation({ summary: "Distribuição das vagas por plataforma (Gupy, Greenhouse, etc)" })
  @ApiQuery({ name: "userId", required: true })
  atsStats(@Query("userId") userId: string) {
    return this.stats.atsDistribution(userId);
  }

  @Get("pipeline-funnel")
  @ApiOperation({ summary: "Funil do Pipeline (Status count)" })
  @ApiQuery({ name: "userId", required: true })
  pipelineFunnel(@Query("userId") userId: string) {
    return this.stats.pipelineFunnel(userId);
  }

  @Get("time-to-send")
  @ApiOperation({ summary: "Tempo médio entre criar rascunho e enviar" })
  @ApiQuery({ name: "userId", required: true })
  timeToSend(@Query("userId") userId: string) {
    return this.stats.timeToSendEmail(userId);
  }

  @Get("events-per-day")
  @ApiOperation({ summary: "Atividade diária geral (Eventos totais)" })
  @ApiQuery({ name: "userId", required: true })
  eventsPerDay(@Query("userId") userId: string) {
    return this.stats.eventsPerDay(userId);
  }
}