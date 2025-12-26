import { Controller, Get, Query, Param } from "@nestjs/common";
import { EventsService } from "./events.service";

@Controller("events")
export class EventsController {
  constructor(private service: EventsService) {}

  @Get()
  listRecent(@Query("limit") limit?: string) {
    return this.service.listRecent(limit ? Number(limit) : 50);
  }

  @Get("user/:id")
  listByUser(@Param("id") id: string) {
    return this.service.listByUser(id);
  }

  @Get("job/:id")
  listByJob(@Param("id") id: string) {
    return this.service.listByJob(id);
  }
}
