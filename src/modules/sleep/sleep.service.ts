import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Sleep, SleepDocument } from "./sleep.schema";
import { CreateSleepDto } from "./dto/create-sleep.dto";
import { UpdateSleepDto } from "./dto/update-sleep.dto";

@Injectable()
export class SleepService {
  constructor(
    @InjectModel(Sleep.name) private sleepModel: Model<SleepDocument>
  ) {}

  async create(userId: string, dto: CreateSleepDto) {
    const doc = new this.sleepModel({
      ...dto,
      userId: new Types.ObjectId(userId),
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
    });
    await doc.save();
    return {
      message: "Sleep logged successfully",
      sleepId: doc._id,
      createdAt: doc.createdAt,
    };
  }

  async findByRange(
    userId: string,
    start: Date,
    end: Date,
    limit = 100,
    cursor?: string
  ) {
    const filter: any = {
      userId: new Types.ObjectId(userId),
      startTime: { $gte: start, $lt: end },
      deletedAt: { $exists: false },
    };
    if (cursor) filter._id = { $lt: new Types.ObjectId(cursor) };
    const items = await this.sleepModel
      .find(filter)
      .sort({ _id: -1 })
      .limit(limit);
    const last = items[items.length - 1] as any;
    const nextCursor = items.length === limit ? last._id.toString() : null;
    return { items, nextCursor };
  }

  async update(userId: string, id: string, dto: UpdateSleepDto) {
    const data: any = { ...dto };
    if (data.startTime) data.startTime = new Date(data.startTime);
    if (data.endTime) data.endTime = new Date(data.endTime);
    const updated = await this.sleepModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      { $set: data },
      { new: true }
    );
    if (!updated) throw new NotFoundException("Sleep log not found");
    return { message: "Sleep updated", updatedAt: updated.updatedAt };
  }

  async remove(userId: string, id: string) {
    const updated = await this.sleepModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      { $set: { deletedAt: new Date() } },
      { new: true }
    );
    if (!updated) throw new NotFoundException("Sleep log not found");
    return { message: "Sleep deleted", deletedAt: updated.deletedAt };
  }
}
