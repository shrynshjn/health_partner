import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationSettingsDocument = NotificationSettings & Document;

export class WalkSettings {
  enabled: boolean;
  startHour: number;
  endHour: number;
  stepsGoal: number;
  activeMinutesGoal: number;
}

export class WaterSettings {
  enabled: boolean;
  intervalMinutes: number;
}

@Schema({ timestamps: true, collection: 'notification_settings' })
export class NotificationSettings {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Object, default: () => ({ enabled: false, startHour: 9, endHour: 18, stepsGoal: 300, activeMinutesGoal: 5 }) })
  walk: WalkSettings;

  @Prop({ type: Object, default: () => ({ enabled: true, intervalMinutes: 90 }) })
  water: WaterSettings;

  @Prop() createdAt?: Date;
  @Prop() updatedAt?: Date;
}

export const NotificationSettingsSchema = SchemaFactory.createForClass(NotificationSettings);
NotificationSettingsSchema.index({ userId: 1 }, { unique: true });
