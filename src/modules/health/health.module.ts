import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthParam, HealthParamSchema } from './health.schema';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: HealthParam.name, schema: HealthParamSchema }])],
  providers: [HealthService],
  controllers: [HealthController],
})
export class HealthModule {}
