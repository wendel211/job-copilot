import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
} from "@nestjs/common";
import { EmailDraftService } from "./email-draft.service";
import { UpdateDraftDto } from "./dto/update-draft.dto";

@Controller("email/drafts")
export class EmailDraftController {
  constructor(private readonly service: EmailDraftService) {}


  @Get()
  list(@Query("userId") userId: string) {
    return this.service.listDrafts(userId);
  }

  @Get(":id")
  get(@Param("id") id: string, @Query("userId") userId: string) {
    return this.service.getDraftById(userId, id);
  }

  @Patch(":id/opened")
  markOpened(@Param("id") id: string, @Body("userId") userId: string) {
    return this.service.markOpened(userId, id);
  }


  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body("userId") userId: string,
    @Body() dto: UpdateDraftDto
  ) {
    return this.service.updateDraft(userId, id, dto);
  }

  @Patch(":id/checklist/toggle")
  toggle(
    @Param("id") id: string,
    @Body("userId") userId: string,
    @Body("item") item: string,
  ) {
    return this.service.toggleChecklist(userId, id, item);
  }
}
