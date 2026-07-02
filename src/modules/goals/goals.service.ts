import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Goals, GoalsDocument } from "./goals.schema";
import { UpdateGoalsDto } from "./dto/update-goals.dto";
import { GOAL_CATALOG } from "./goal-catalog";

@Injectable()
export class GoalsService {
  constructor(@InjectModel(Goals.name) private model: Model<GoalsDocument>) {}

  getCatalog() {
    return { goals: GOAL_CATALOG };
  }

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
    let doc = await this.model.findOne({ userId: new Types.ObjectId(userId) });

    if (!doc) {
      // Create new if no goals exist
      doc = await this.model.create({
        userId: new Types.ObjectId(userId),
        goals: dto.goals,
      });
      return {
        message: "Goals created successfully",
        updatedAt: doc.updatedAt,
      };
    }

    // Convert existing goals into a map for easier merging
    const existingGoalsMap = new Map(doc.goals.map((g) => [g.parameter, g]));
    // Merge or update incoming goals
    for (const g of dto.goals) {
      existingGoalsMap.set(g.parameter, g);
    }

    // Save merged goals back
    const mergedGoals = Array.from(existingGoalsMap.values());
    doc.goals = [...mergedGoals];
    await doc.save();

    return {
      message: "Goals updated successfully (merged)",
      updatedAt: doc.updatedAt,
      updated: doc.goals.length,
      goals: doc.goals,
    };
  }

  async remove(userId: string, parameter: string) {
    const doc = await this.model.findOne({ userId: new Types.ObjectId(userId) });
    if (!doc || !doc.goals.some((g) => g.parameter === parameter)) {
      throw new NotFoundException(`Goal '${parameter}' not found`);
    }

    doc.goals = doc.goals.filter((g) => g.parameter !== parameter);
    await doc.save();

    return {
      message: "Goal removed successfully",
      updatedAt: doc.updatedAt,
      goals: doc.goals,
    };
  }
}
