import { Injectable } from "@nestjs/common";

@Injectable()
export class HealthService {
  check() {
    return {
      ok: true,
      timestamp: new Date().toISOString(),
    };
  }
}