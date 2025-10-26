import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Workout, WorkoutDocument } from "./workout.schema";
import { CreateWorkoutDto } from "./dto/create-workout.dto";
import { UpdateWorkoutDto } from "./dto/update-workout.dto";

@Injectable()
export class WorkoutService {
  constructor(
    @InjectModel(Workout.name) private workoutModel: Model<WorkoutDocument>
  ) {}

  async create(userId: string, dto: CreateWorkoutDto) {
    const data: any = {
      ...dto,
      userId: new Types.ObjectId(userId),
      startTime: new Date(dto.startTime),
    };
    if (dto.endTime) data.endTime = new Date(dto.endTime);
    if (!data.endTime && data.duration) {
      data.endTime = new Date(
        new Date(dto.startTime).getTime() + data.duration
      );
    }
    const doc = new this.workoutModel(data);
    await doc.save();
    return {
      message: "Workout logged successfully",
      workoutId: doc._id,
      createdAt: doc.createdAt,
    };
  }

  async createBulk(userId: string, items: CreateWorkoutDto[]) {
    const docs = items.map((dto) => {
      const data: any = {
        ...dto,
        userId: new Types.ObjectId(userId),
        startTime: new Date(dto.startTime),
      };
      if (dto.endTime) data.endTime = new Date(dto.endTime);
      if (!data.endTime && data.duration) {
        data.endTime = new Date(
          new Date(dto.startTime).getTime() + data.duration
        );
      }
      return data;
    });
    const res = await this.workoutModel.insertMany(docs);
    return {
      message: "Workouts logged",
      createdIds: res.map((d) => d._id),
      count: res.length,
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
    const items = await this.workoutModel
      .find(filter)
      .sort({ _id: -1 })
      .limit(limit);
    const last = items[items.length - 1] as any;
    const nextCursor = items.length === limit ? last._id.toString() : null;
    return { items, nextCursor };
  }

  async update(userId: string, id: string, dto: UpdateWorkoutDto) {
    const data: any = { ...dto };
    if (data.startTime) data.startTime = new Date(data.startTime);
    if (data.endTime) data.endTime = new Date(data.endTime);
    const updated = await this.workoutModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      { $set: data },
      { new: true }
    );
    if (!updated) throw new NotFoundException("Workout not found");
    return { message: "Workout updated", updatedAt: updated.updatedAt };
  }

  async remove(userId: string, id: string) {
    const updated = await this.workoutModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      { $set: { deletedAt: new Date() } },
      { new: true }
    );
    if (!updated) throw new NotFoundException("Workout not found");
    return { message: "Workout deleted", deletedAt: updated.deletedAt };
  }
}
