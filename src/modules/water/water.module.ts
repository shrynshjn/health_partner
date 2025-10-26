import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Water, WaterSchema } from './water.schema';
import { WaterService } from './water.service';
import { WaterController } from './water.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Water.name, schema: WaterSchema }])],
  providers: [WaterService],
  controllers: [WaterController],
})
export class WaterModule {}
