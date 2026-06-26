import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyActivity, DailyActivitySchema } from './daily-activity.schema';
import { DailyActivityService } from './daily-activity.service';
import { DailyActivityController } from './daily-activity.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: DailyActivity.name, schema: DailyActivitySchema }])],
  providers: [DailyActivityService],
  controllers: [DailyActivityController],
  exports: [DailyActivityService],
})
export class DailyActivityModule {}
