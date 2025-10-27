import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { FoodModule } from './modules/food/food.module';
import { WorkoutModule } from './modules/workout/workout.module';
import { WaterModule } from './modules/water/water.module';
import { SleepModule } from './modules/sleep/sleep.module';
import { HealthModule } from './modules/health/health.module';
import { PhysicalModule } from './modules/physical/physical.module';
import { GoalsModule } from './modules/goals/goals.module';
import { MediaModule } from './modules/media/media.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { DailySummary } from './modules/daily-summary/daily-summary.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),
    AuthModule,
    UserModule,
    FoodModule,
    WorkoutModule,
    WaterModule,
    SleepModule,
    HealthModule,
    PhysicalModule,
    GoalsModule,
    MediaModule,
    DailySummary,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Log every route
  }
}
