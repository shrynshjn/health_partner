import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PhysicalParam, PhysicalParamSchema } from './physical.schema';
import { PhysicalService } from './physical.service';
import { PhysicalController } from './physical.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: PhysicalParam.name, schema: PhysicalParamSchema }])],
  providers: [PhysicalService],
  controllers: [PhysicalController],
})
export class PhysicalModule {}
