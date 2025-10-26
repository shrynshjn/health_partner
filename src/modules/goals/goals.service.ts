import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Goals, GoalsDocument } from "./goals.schema";
import { UpdateGoalsDto } from "./dto/update-goals.dto";

@Injectable()
export class GoalsService {
  constructor(@InjectModel(Goals.name) private model: Model<GoalsDocument>) {}

  async get(userId: string) {
    const doc = await this.model.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!doc) {
      return { goals: [], updatedAt: new Date().toISOString() };
    }
    return {
      goals: doc.goals,
      updatedAt: doc.updatedAt
        ? doc.updatedAt.toISOString()
        : new Date().toISOString(),
    };
  }

  async update(userId: string, dto: UpdateGoalsDto) {
    const updated = await this.model.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: { goals: dto.goals } },
      { upsert: true, new: true }
    );
    return {
      message: "Goals updated successfully",
      updatedAt: updated.updatedAt
        ? updated.updatedAt.toISOString()
        : new Date().toISOString(),
      updated: updated.goals.length,
    };
  }
}
