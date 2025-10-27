import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Mongoose, Types } from "mongoose";
import { Goals, GoalsDocument } from "./goals.schema";
import { UpdateGoalsDto } from "./dto/update-goals.dto";
import e from "express";

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

  async update(userId: Types.ObjectId, dto: UpdateGoalsDto) {
    console.log("Updating goals for user:", userId, "with dto:", dto);
    let doc = await this.model.findOne({ userId });

    if (!doc) {
      // Create new if no goals exist
      doc = await this.model.create({ userId, goals: dto.goals });
      return {
        message: "Goals created successfully",
        updatedAt: doc.updatedAt,
      };
    }

    // Convert existing goals into a map for easier merging
    const existingGoalsMap = new Map(doc.goals.map((g) => [g.parameter, g]));
    console.log(existingGoalsMap);
    // Merge or update incoming goals
    for (const g of dto.goals) {
      existingGoalsMap.set(g.parameter, g);
    }

    // Save merged goals back
    const mergedGoals = Array.from(existingGoalsMap.values());
    doc.goals = [...mergedGoals];
    console.log("Merged goals:", mergedGoals);
    await doc.save();

    return {
      message: "Goals updated successfully (merged)",
      updatedAt: doc.updatedAt,
      updated: doc.goals.length,
      goals: doc.goals,
    };
  }
}
