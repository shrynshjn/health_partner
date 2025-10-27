
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DailySummaryService } from './daily-summary.service';

@Injectable()
export class DailySummaryCron {
  constructor(private readonly service: DailySummaryService) {}

  @Cron('0 0 * * *')
  async handleMidnightSummary() {
    await this.service.runMidnightJob();
  }
}
