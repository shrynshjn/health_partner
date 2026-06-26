import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DailyActivityDocument = DailyActivity & Document;

@Schema({ timestamps: true })
export class DailyActivity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true }) date: Date; // start of day UTC

  @Prop({ default: 0 }) steps: number;
  @Prop({ default: 0 }) activeMinutes: number;
  @Prop({ default: 0 }) distanceMeters: number;

  // hourly breakdowns: key = "HH" (zero-padded), value = count/minutes
  @Prop({ type: Object, default: {} }) hourlySteps: Record<string, number>;
  @Prop({ type: Object, default: {} }) hourlyActiveMinutes: Record<string, number>;

  @Prop() source?: string;

  @Prop() createdAt?: Date;
  @Prop() updatedAt?: Date;
}

export const DailyActivitySchema = SchemaFactory.createForClass(DailyActivity);
DailyActivitySchema.index({ userId: 1, date: -1 });
DailyActivitySchema.index({ userId: 1, date: 1 }, { unique: true }); // one doc per user per day
