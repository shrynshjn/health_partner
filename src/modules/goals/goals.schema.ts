import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GoalsDocument = Goals & Document;

export class GoalItem {
  parameter: string;
  target: number;
  type: 'min' | 'max' | 'target';
  unit: string;
}

@Schema({ timestamps: true, collection: 'goals' })
export class Goals {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: [Object], default: [] })
  goals: GoalItem[];

  @Prop() createdAt?: Date;
  @Prop() updatedAt?: Date;
}

export const GoalsSchema = SchemaFactory.createForClass(Goals);
GoalsSchema.index({ userId: 1 }, { unique: true });
