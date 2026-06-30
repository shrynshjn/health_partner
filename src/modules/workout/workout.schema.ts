import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export const WORKOUT_TYPES = [
  'running','walking','cycling','swimming','hiking','elliptical','rowing','stair_climbing','jump_rope','mixed_cardio',
  'strength_training','hiit','cross_training','crossfit','core_training','functional_training',
  'yoga','pilates','barre','stretching','tai_chi','meditation',
  'tennis','badminton','squash','table_tennis','pickleball','padel','racquetball',
  'soccer','basketball','volleyball','rugby','cricket','hockey','handball','baseball','softball',
  'boxing','martial_arts','kickboxing','wrestling',
  'climbing','skiing','snowboarding','surfing','paddling',
  'golf','dance','gymnastics','track_and_field','cycling_indoor',
  'gym','other',
] as const;

export type WorkoutDocument = Workout & Document;

@Schema({ timestamps: true })
export class Workout {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true, required: true })
  userId: Types.ObjectId;

  @Prop() user_input?: string;
  @Prop({ required: true }) name: string;
  @Prop({ required: true, enum: WORKOUT_TYPES }) type: string;
  @Prop({ required: true }) startTime: Date;
  @Prop({ required: true }) duration: number; // ms
  @Prop() endTime?: Date;
  @Prop() calories: number;
  @Prop({ enum: ['indoor','outdoor','gym'], required: false }) location?: string;
  @Prop() description?: string;
  @Prop({ enum: ['low','medium','high'], required: false }) intensity?: string;
  @Prop() avgHeartRate?: number;
  @Prop() distanceMeters?: number;
  @Prop() minHeartRate?: number;
  @Prop() maxHeartRate?: number;
  @Prop({ type: MongooseSchema.Types.Mixed, default: undefined }) metadata?: Record<string, any>;
  @Prop() source?: string;
  @Prop() idempotencyKey?: string;
  @Prop() deletedAt?: Date;
  @Prop({ type: [String], default: [] }) media?: string[];
  @Prop() naturalText?: string;

  @Prop() createdAt?: Date;
  @Prop() updatedAt?: Date;
}

export const WorkoutSchema = SchemaFactory.createForClass(Workout);
WorkoutSchema.index({ userId: 1, startTime: -1 });
