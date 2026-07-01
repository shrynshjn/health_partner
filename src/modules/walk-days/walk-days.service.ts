import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WalkDay, WalkDayDocument } from './walk-day.schema';
import { UpsertSlotDto } from './dto/upsert-slot.dto';

@Injectable()
export class WalkDaysService {
  constructor(
    @InjectModel(WalkDay.name) private readonly model: Model<WalkDayDocument>,
  ) {}

  async upsertSlot(userId: string, date: string, hour: number, dto: UpsertSlotDto) {
    const slotValue: Record<string, any> = {
      status: dto.status,
      recordedAt: new Date(),
    };
    if (dto.completionSource) slotValue.completionSource = dto.completionSource;
    if (dto.completionReason) slotValue.completionReason = dto.completionReason;
    if (dto.steps !== undefined) slotValue.steps = dto.steps;
    if (dto.activeMinutes !== undefined) slotValue.activeMinutes = dto.activeMinutes;

    return this.model.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), date },
      { $set: { [`slots.${hour}`]: slotValue } },
      { upsert: true, new: true },
    );
  }

  async deleteSlot(userId: string, date: string, hour: number) {
    return this.model.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), date },
      { $unset: { [`slots.${hour}`]: '' } },
      { new: true },
    );
  }

  async findByRange(userId: string, startDate: string, endDate: string) {
    return this.model
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      })
      .lean();
  }
}
