import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DailyActivity, DailyActivityDocument } from './daily-activity.schema';
import { UpsertDailyActivityDto } from './dto/upsert-daily-activity.dto';
import dayjs from 'dayjs';

@Injectable()
export class DailyActivityService {
  constructor(
    @InjectModel(DailyActivity.name)
    private model: Model<DailyActivityDocument>,
  ) {}

  async upsert(userId: string, dto: UpsertDailyActivityDto) {
    const date = dayjs(dto.date).startOf('day').toDate();
    const doc = await this.model.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), date },
      {
        $set: {
          steps: dto.steps,
          activeMinutes: dto.activeMinutes,
          distanceMeters: dto.distanceMeters,
          hourlySteps: dto.hourlySteps ?? {},
          hourlyActiveMinutes: dto.hourlyActiveMinutes ?? {},
          source: dto.source,
        },
      },
      { upsert: true, new: true },
    );
    return { message: 'Activity synced', date: doc.date, steps: doc.steps, activeMinutes: doc.activeMinutes };
  }

  async findByDateRange(userId: string, start: Date, end: Date) {
    return this.model
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: start, $lte: end },
      })
      .sort({ date: -1 });
  }

  async findByDate(userId: string, date: Date) {
    return this.model.findOne({
      userId: new Types.ObjectId(userId),
      date: dayjs(date).startOf('day').toDate(),
    });
  }
}
