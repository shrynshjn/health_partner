import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Workout, WorkoutSchema } from './workout.schema';
import { WorkoutService } from './workout.service';
import { WorkoutController } from './workout.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Workout.name, schema: WorkoutSchema }])],
  providers: [WorkoutService],
  controllers: [WorkoutController],
})
export class WorkoutModule {}
