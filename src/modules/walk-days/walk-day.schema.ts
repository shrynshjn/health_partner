import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class SlotEntry {
  status: 'completed' | 'expired';
  completionSource?: 'manual' | 'healthkit';
  completionReason?: 'steps' | 'active_minutes';
  steps?: number;
  activeMinutes?: number;
  recordedAt: Date;
}

@Schema({ timestamps: false, collection: 'walk_days' })
export class WalkDay {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  date: string; // "YYYY-MM-DD"

  @Prop({ type: Object, default: {} })
  slots: Record<string, SlotEntry>;
}

export type WalkDayDocument = WalkDay & Document;
export const WalkDaySchema = SchemaFactory.createForClass(WalkDay);
WalkDaySchema.index({ userId: 1, date: 1 }, { unique: true });
