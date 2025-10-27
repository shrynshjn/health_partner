
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class DailySummary extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Date, required: true, index: true })
  day: Date;

  @Prop({
    type: [
      {
        parameter: String,
        goal: Number,
        value: Number,
        achieved: Boolean,
      },
    ],
    default: [],
  })
  metrics: {
    parameter: string;
    goal: number;
    value: number;
    achieved: boolean;
  }[];

  @Prop({ type: Number, default: 0 })
  score: number;

  @Prop({ type: Boolean, default: false })
  generatedByCron: boolean;
}

export const DailySummarySchema = SchemaFactory.createForClass(DailySummary);
DailySummarySchema.index({ userId: 1, day: 1 }, { unique: true });
