import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FrequentIngredientDocument = FrequentIngredient & Document;

@Schema({ timestamps: true })
export class FrequentIngredient {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true }) name: string;
  @Prop({ type: [String], default: [] }) aliases: string[];
  @Prop() brand?: string;

  // Core macros (per 100g or per serving — defined by unit)
  @Prop({ required: true }) calories: number;
  @Prop({ required: true }) protein: number;
  @Prop({ required: true }) carbs: number;
  @Prop({ required: true }) fats: number;
  @Prop() fibre?: number;

  // Additional nutrition data (addedSugar, transFat, saturatedFat, sodium, etc.)
  @Prop({ type: Object, default: {} }) additionalNutritionData: Record<string, number>;

  // Reference unit for the nutrition values above
  @Prop({ default: '100g' }) servingUnit: string;
  @Prop() servingSize?: number;

  // Raw ingredient list (e.g. from packaging): ["water", "sugar", "E202", "modified starch"]
  @Prop({ type: [String], default: [] }) ingredients: string[];

  @Prop() source?: string;
  @Prop() notes?: string;

  @Prop({ default: 0 }) useCount: number;
  @Prop() lastUsedAt?: Date;

  @Prop() createdAt?: Date;
  @Prop() updatedAt?: Date;
}

export const FrequentIngredientSchema = SchemaFactory.createForClass(FrequentIngredient);
FrequentIngredientSchema.index({ userId: 1, name: 1 });
FrequentIngredientSchema.index({ userId: 1, useCount: -1 });
FrequentIngredientSchema.index({ userId: 1, name: 'text', aliases: 'text', brand: 'text' });
