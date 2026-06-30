import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationSettings, NotificationSettingsDocument } from './notification-settings.schema';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';

const DEFAULT_WALK = { enabled: false, startHour: 9, endHour: 18, stepsGoal: 300, activeMinutesGoal: 5 };
const DEFAULT_WATER = { enabled: true, intervalMinutes: 90 };

@Injectable()
export class NotificationSettingsService {
  constructor(
    @InjectModel(NotificationSettings.name)
    private readonly model: Model<NotificationSettingsDocument>,
  ) {}

  async get(userId: string) {
    const doc = await this.model.findOne({ userId: new Types.ObjectId(userId) });
    if (!doc) {
      return { walk: DEFAULT_WALK, water: DEFAULT_WATER, updatedAt: null };
    }
    return { walk: doc.walk, water: doc.water, updatedAt: doc.updatedAt };
  }

  async update(userId: string, dto: UpdateNotificationSettingsDto) {
    const doc = await this.model.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: { walk: dto.walk, water: dto.water } },
      { upsert: true, new: true },
    );
    return { walk: doc.walk, water: doc.water, updatedAt: doc.updatedAt };
  }
}
