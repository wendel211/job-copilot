import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { EventsService } from "./events.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { QueryEventsDto } from "./dto/query-events.dto";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.register(dto);
  }

  @Get()
  list(@Query() query: QueryEventsDto) {
    return this.eventsService.list(query);
  }
}
