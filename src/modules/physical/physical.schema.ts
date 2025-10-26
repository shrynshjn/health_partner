import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PhysicalParamDocument = PhysicalParam & Document;

@Schema({ timestamps: true })
export class PhysicalParam {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['weight','height','bodyFat','waist','hip','quads','chest','biceps','calves'] })
  type: string;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true })
  measuredAt: Date;

  @Prop()
  source?: string;

  @Prop()
  idempotencyKey?: string;

  @Prop()
  deletedAt?: Date;

  @Prop({ type: [String], default: [] })
  media?: string[];

  @Prop() createdAt?: Date;
  @Prop() updatedAt?: Date;
}

export const PhysicalParamSchema = SchemaFactory.createForClass(PhysicalParam);
PhysicalParamSchema.index({ userId: 1, type: 1, measuredAt: -1 });
