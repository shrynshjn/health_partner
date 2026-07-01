import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WalkDay, WalkDaySchema } from './walk-day.schema';
import { WalkDaysService } from './walk-days.service';
import { WalkDaysController } from './walk-days.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: WalkDay.name, schema: WalkDaySchema }])],
  providers: [WalkDaysService],
  controllers: [WalkDaysController],
  exports: [WalkDaysService],
})
export class WalkDaysModule {}
