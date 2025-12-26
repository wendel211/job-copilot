import { Controller, Get, Query } from "@nestjs/common";
import { StatsService } from "./stats.service";

@Controller("stats")
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get("emails-per-day")
  emailsPerDay(@Query("userId") userId: string) {
    return this.stats.emailsPerDay(userId);
  }

  @Get("email-fail-rate")
  emailFailRate(@Query("userId") userId: string) {
    return this.stats.emailFailRate(userId);
  }

  @Get("ats-distribution")
  atsStats(@Query("userId") userId: string) {
    return this.stats.atsDistribution(userId);
  }

  @Get("pipeline-funnel")
  pipelineFunnel(@Query("userId") userId: string) {
    return this.stats.pipelineFunnel(userId);
  }

  @Get("time-to-send")
  timeToSend(@Query("userId") userId: string) {
    return this.stats.timeToSendEmail(userId);
  }

  @Get("events-per-day")
  eventsPerDay(@Query("userId") userId: string) {
    return this.stats.eventsPerDay(userId);
  }
}
