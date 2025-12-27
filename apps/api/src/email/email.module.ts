import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";

// SUBMÓDULOS
import { EmailDraftModule } from "./draft/email-draft.module";
import { EmailSendModule } from "./send/email-send.module";
import { EmailProviderModule } from "./provider/email-provider.module";
import { EmailPreviewModule } from "./preview/email-preview.module";

@Module({
  imports: [
    PrismaModule,
    EmailDraftModule,
    EmailSendModule,
    EmailProviderModule,
    EmailPreviewModule,
  ],
})
export class EmailModule {}
