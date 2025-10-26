import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FoodDocument = Food & Document;

@Schema({ timestamps: true })
export class Food {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true, required: true })
  userId: Types.ObjectId;

  @Prop() user_input?: string;
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) qty: number;
  @Prop({ required: true }) unit: string;
  @Prop({ required: true }) calories: number;
  @Prop({ required: true }) protein: number;
  @Prop({ required: true }) carbs: number;
  @Prop({ required: true }) fats: number;
  @Prop({ required: true }) eatTime: Date;

  @Prop() fibre?: number;
  @Prop() calcium?: number;
  @Prop() iron?: number;
  @Prop() zinc?: number;
  @Prop() magnesium?: number;
  @Prop() cholesterol?: number;
  @Prop() sodium?: number;
  @Prop() potassium?: number;
  @Prop() vitaminD?: number;
  @Prop() vitaminB12?: number;
  @Prop() omega3?: number;

  @Prop() source?: string;
  @Prop() mealType?: string;
  @Prop({ type: [String], default: [] }) media?: string[];
  @Prop() naturalText?: string;
  @Prop() idempotencyKey?: string;
  @Prop() deletedAt?: Date;

  @Prop() createdAt?: Date;
  @Prop() updatedAt?: Date;
}

export const FoodSchema = SchemaFactory.createForClass(Food);
FoodSchema.index({ userId: 1, eatTime: -1 });
