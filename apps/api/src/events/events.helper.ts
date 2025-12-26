import { EventsService } from "./events.service";
import { EventType } from "./enums/event-type.enum";
import { EventContext } from "./interfaces/event-context.interface";

export class EventsHelper {
  constructor(private events: EventsService) {}

  async emit(type: EventType, context: EventContext = {}) {
    return this.events.register({
      type,
      ...context
    });
  }
}
