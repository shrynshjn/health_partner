import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DailySummaryDocument = DailySummary & Document;

@Schema({ timestamps: true })
export class DailySummary {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  day: Date; // 'YYYY-MM-DD'

  @Prop({ type: Number, required: true })
  score: number;

  @Prop({ type: Array, default: [] })
  metrics: {
    parameter: string;
    goal: number;
    value: number;
    achieved: boolean;
    // 'in_progress' only ever appears for the current, still-ongoing day —
    // past days are always resolved to 'achieved' or 'failed'.
    status: 'achieved' | 'in_progress' | 'failed';
  }[];
}

export const DailySummarySchema = SchemaFactory.createForClass(DailySummary);
DailySummarySchema.index({ userId: 1, day: 1 }, { unique: true });