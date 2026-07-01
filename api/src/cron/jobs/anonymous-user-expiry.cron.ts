import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

import { AnonymousUserExpiryService } from "../../modules/user/anonymous-user-expiry.service";

@Injectable()
export class AnonymousUserExpiryCron {
  private readonly logger = new Logger(AnonymousUserExpiryCron.name);
  private isRunning = false;

  constructor(
    private readonly anonymousUserExpiryService: AnonymousUserExpiryService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM, {
    name: "anonymous-user-expiry",
    timeZone: "UTC",
  })
  async handleAnonymousUserExpiry(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn(
        "Anonymous user expiry cron is still running, skipping this tick",
      );
      return;
    }

    this.isRunning = true;

    try {
      await this.anonymousUserExpiryService.deactivateExpiredAnonymousUsers();
    } catch (error) {
      this.logger.error(
        "Anonymous user expiry cron failed",
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.isRunning = false;
    }
  }
}
