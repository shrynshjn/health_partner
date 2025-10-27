import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailySummaryController } from './daily-summary.controller';
import { DailySummaryService } from './daily-summary.service';
import { DailySummary, DailySummarySchema } from './daily-summary.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DailySummary.name, schema: DailySummarySchema },
    ]),
  ],
  controllers: [DailySummaryController],
  providers: [DailySummaryService],
  exports: [DailySummaryService],
})
export class DailySummaryModule {}
