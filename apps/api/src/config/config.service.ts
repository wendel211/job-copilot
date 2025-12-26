import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}


  get databaseUrl(): string {
    return this.config.get<string>("DATABASE_URL", "");
  }


  get smtpDebugMode(): boolean {
    return this.config.get("SMTP_DEBUG") === "true";
  }


  get isProduction(): boolean {
    return this.config.get("NODE_ENV") === "production";
  }

  get port(): number {
    return Number(this.config.get("PORT") ?? 3000);
  }
}
