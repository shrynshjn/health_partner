import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HealthParamDocument = HealthParam & Document;

@Schema({ timestamps: true })
export class HealthParam {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true }) name: string;
  @Prop({ required: true }) value: number;
  @Prop({ required: true }) refMin: number;
  @Prop({ required: true }) refMax: number;
  @Prop({ required: true }) isOkay: boolean;
  @Prop({ required: true }) reportTime: Date;

  @Prop() reportLink?: string;
  @Prop() unit?: string;
  @Prop() category?: string;
  @Prop() idempotencyKey?: string;

  @Prop() createdAt?: Date;
  @Prop() updatedAt?: Date;
}

export const HealthParamSchema = SchemaFactory.createForClass(HealthParam);
HealthParamSchema.index({ userId: 1, name: 1, reportTime: -1 });
