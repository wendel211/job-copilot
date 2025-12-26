import { Controller, Get, Query } from "@nestjs/common";
import { JobsService } from "./jobs.service";

@Controller("jobs")
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get("search")
  search(
    @Query("q") q?: string,
    @Query("remote") remote?: string,
    @Query("take") take?: string,
    @Query("skip") skip?: string,
  ) {
    return this.jobsService.search({
      q: q?.trim(),
      remote: remote === "true" ? true : remote === "false" ? false : undefined,
      take: take ? Number(take) : 20,
      skip: skip ? Number(skip) : 0,
    });
  }
}
