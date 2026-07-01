import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FoodModule } from '../food/food.module';
import { WorkoutModule } from '../workout/workout.module';
import { WaterModule } from '../water/water.module';
import { SleepModule } from '../sleep/sleep.module';
import { HealthModule } from '../health/health.module';
import { PhysicalModule } from '../physical/physical.module';
import { GoalsModule } from '../goals/goals.module';
import { DailySummaryModule } from '../daily-summary/daily-summary.module';
import { DailyActivityModule } from '../daily-activity/daily-activity.module';
import { UserModule } from '../user/user.module';
import { FrequentIngredientModule } from '../frequent-ingredients/frequent-ingredient.module';
import { WalkDaysModule } from '../walk-days/walk-days.module';
import { McpService } from './mcp.service';
import { McpController } from './mcp.controller';

@Module({
  imports: [
    AuthModule,
    FoodModule,
    WorkoutModule,
    WaterModule,
    SleepModule,
    HealthModule,
    PhysicalModule,
    GoalsModule,
    DailySummaryModule,
    DailyActivityModule,
    UserModule,
    WalkDaysModule,
    FrequentIngredientModule,
  ],
  providers: [McpService],
  controllers: [McpController],
})
export class McpModule {}
