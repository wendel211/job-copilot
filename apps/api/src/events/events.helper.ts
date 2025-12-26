import { Injectable } from "@nestjs/common";
import { EventsService } from "./events.service";
import { EventType } from "./enums/event-type.enum";
import { EventContext } from "./interfaces/event-context.interface";

@Injectable()
export class EventsHelper {
  constructor(private readonly events: EventsService) {}

  async emit(type: EventType, context: EventContext = {}) {
    return this.events.register({
      type,
      ...context,
    });
  }
}
