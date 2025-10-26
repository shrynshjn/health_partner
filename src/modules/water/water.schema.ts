import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WaterDocument = Water & Document;

@Schema({ timestamps: true })
export class Water {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true }) qty: number; // ml
  @Prop({ required: true }) drankAt: Date;
  @Prop() source?: string;
  @Prop() idempotencyKey?: string;
  @Prop() deletedAt?: Date;

  @Prop({ type: [String], default: [] }) media?: string[]; // urls
  @Prop() naturalText?: string;

  @Prop() createdAt?: Date;
  @Prop() updatedAt?: Date;
}

export const WaterSchema = SchemaFactory.createForClass(Water);
WaterSchema.index({ userId: 1, drankAt: -1 });
