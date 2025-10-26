import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Water, WaterDocument } from "./water.schema";
import { CreateWaterDto } from "./dto/create-water.dto";
import { UpdateWaterDto } from "./dto/update-water.dto";

@Injectable()
export class WaterService {
  constructor(
    @InjectModel(Water.name) private waterModel: Model<WaterDocument>
  ) {}

  async create(userId: string, dto: CreateWaterDto) {
    const doc = new this.waterModel({
      ...dto,
      userId: new Types.ObjectId(userId),
      drankAt: new Date(dto.drankAt),
    });
    await doc.save();
    return {
      message: "Water logged successfully",
      waterId: doc._id,
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
      drankAt: { $gte: start, $lt: end },
      deletedAt: { $exists: false },
    };
    if (cursor) filter._id = { $lt: new Types.ObjectId(cursor) };
    const items = await this.waterModel
      .find(filter)
      .sort({ _id: -1 })
      .limit(limit);
    const last = items[items.length - 1] as any;
    const nextCursor = items.length === limit ? last._id.toString() : null;
    return { items, nextCursor };
  }

  async update(userId: string, id: string, dto: UpdateWaterDto) {
    const data: any = { ...dto };
    if (data.drankAt) data.drankAt = new Date(data.drankAt);
    const updated = await this.waterModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      { $set: data },
      { new: true }
    );
    if (!updated) throw new NotFoundException("Water log not found");
    return { message: "Water updated", updatedAt: updated.updatedAt };
  }

  async remove(userId: string, id: string) {
    const updated = await this.waterModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      { $set: { deletedAt: new Date() } },
      { new: true }
    );
    if (!updated) throw new NotFoundException("Water log not found");
    return { message: "Water deleted", deletedAt: updated.deletedAt };
  }
}
