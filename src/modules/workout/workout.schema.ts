import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkoutDocument = Workout & Document;

@Schema({ timestamps: true })
export class Workout {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true, required: true })
  userId: Types.ObjectId;

  @Prop() user_input?: string;
  @Prop({ required: true }) name: string;
  @Prop({ required: true, enum: ['yoga','running','walking','cycling','gym'] }) type: string;
  @Prop({ required: true }) startTime: Date;
  @Prop({ required: true }) duration: number; // ms
  @Prop() endTime?: Date;
  @Prop() calories?: number;
  @Prop({ enum: ['indoor','outdoor','gym'], required: false }) location?: string;
  @Prop() description?: string;
  @Prop({ enum: ['low','medium','high'], required: false }) intensity?: string;
  @Prop() avgHeartRate?: number;
  @Prop() source?: string;
  @Prop() idempotencyKey?: string;
  @Prop() deletedAt?: Date;
  @Prop({ type: [String], default: [] }) media?: string[];
  @Prop() naturalText?: string;
}

export const WorkoutSchema = SchemaFactory.createForClass(Workout);
WorkoutSchema.index({ userId: 1, startTime: -1 });
