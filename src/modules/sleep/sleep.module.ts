import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Sleep, SleepSchema } from './sleep.schema';
import { SleepService } from './sleep.service';
import { SleepController } from './sleep.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Sleep.name, schema: SleepSchema }])],
  providers: [SleepService],
  controllers: [SleepController],
})
export class SleepModule {}
