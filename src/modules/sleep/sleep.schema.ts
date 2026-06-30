import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SleepDocument = Sleep & Document;

@Schema({ timestamps: true })
export class Sleep {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true }) startTime: Date;
  @Prop({ required: true }) endTime: Date;
  @Prop({ required: true }) duration: number; // ms
  @Prop() source?: string;
  @Prop() idempotencyKey?: string;
  @Prop() coreSleepMs?: number;
  @Prop() deepSleepMs?: number;
  @Prop() remSleepMs?: number;
  @Prop() awakeDuringMs?: number;
  @Prop() inBedMs?: number;
  @Prop() sleepEfficiency?: number;
  @Prop() sourceName?: string;
  @Prop() avgHeartRate?: number;
  @Prop() minHeartRate?: number;
  @Prop() maxHeartRate?: number;
  @Prop() avgHRV?: number;
  @Prop() avgRespiratoryRate?: number;
  @Prop() avgSpO2?: number;
  @Prop() deletedAt?: Date;

  @Prop({ type: [String], default: [] }) media?: string[];
  @Prop() naturalText?: string;

  @Prop() createdAt?: Date;
  @Prop() updatedAt?: Date;
}

export const SleepSchema = SchemaFactory.createForClass(Sleep);
SleepSchema.index({ userId: 1, startTime: -1 });
