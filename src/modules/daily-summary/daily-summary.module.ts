import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailySummaryController } from './daily-summary.controller';
import { DailySummaryService } from './daily-summary.service';
import { DailySummary, DailySummarySchema } from './daily-summary.schema';
import { Food, FoodSchema } from '../food/food.schema';
import { Workout, WorkoutSchema } from '../workout/workout.schema';
import { Water, WaterSchema } from '../water/water.schema';
import { Sleep, SleepSchema } from '../sleep/sleep.schema';
import { Goals, GoalsSchema } from '../goals/goals.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DailySummary.name, schema: DailySummarySchema },
      {name: Food.name, schema: FoodSchema},
      {name: Workout.name, schema: WorkoutSchema},
      {name: Water.name, schema: WaterSchema},
      {name: Sleep.name, schema: SleepSchema},
      {name: Goals.name, schema: GoalsSchema},
    ]),
  ],
  controllers: [DailySummaryController],
  providers: [DailySummaryService],
  exports: [DailySummaryService],
})
export class DailySummaryModule {}
