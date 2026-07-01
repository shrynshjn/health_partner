import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FrequentIngredient, FrequentIngredientSchema } from './frequent-ingredient.schema';
import { FrequentIngredientService } from './frequent-ingredient.service';
import { FrequentIngredientController } from './frequent-ingredient.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FrequentIngredient.name, schema: FrequentIngredientSchema }]),
  ],
  providers: [FrequentIngredientService],
  controllers: [FrequentIngredientController],
  exports: [FrequentIngredientService],
})
export class FrequentIngredientModule {}
