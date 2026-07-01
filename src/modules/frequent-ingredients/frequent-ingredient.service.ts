import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FrequentIngredient, FrequentIngredientDocument } from './frequent-ingredient.schema';
import { CreateFrequentIngredientDto } from './dto/create-frequent-ingredient.dto';
import { QueryFrequentIngredientDto } from './dto/query-frequent-ingredient.dto';

@Injectable()
export class FrequentIngredientService {
  constructor(
    @InjectModel(FrequentIngredient.name)
    private readonly model: Model<FrequentIngredientDocument>,
  ) {}

  async create(userId: string, dto: CreateFrequentIngredientDto) {
    const doc = await this.model.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      additionalNutritionData: dto.additionalNutritionData ?? {},
      aliases: dto.aliases ?? [],
      servingUnit: dto.servingUnit ?? '100g',
    });
    return doc;
  }

  async query(userId: string, dto: QueryFrequentIngredientDto) {
    const limit = Math.min(parseInt(dto.limit ?? '20', 10), 100);
    const filter: any = { userId: new Types.ObjectId(userId) };

    if (dto.q) {
      filter.$text = { $search: dto.q };
    }
    if (dto.cursor) {
      filter._id = { $lt: new Types.ObjectId(dto.cursor) };
    }

    const items = await this.model
      .find(filter)
      .sort(dto.q ? { score: { $meta: 'textScore' } } : { useCount: -1, _id: -1 })
      .limit(limit + 1);

    const hasMore = items.length > limit;
    if (hasMore) items.pop();

    return {
      items,
      nextCursor: hasMore ? String(items[items.length - 1]._id) : null,
    };
  }

  async findById(userId: string, id: string) {
    const doc = await this.model.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });
    if (!doc) throw new NotFoundException('Ingredient not found');
    return doc;
  }

  async delete(userId: string, id: string) {
    const doc = await this.model.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });
    if (!doc) throw new NotFoundException('Ingredient not found');
    return { message: 'Ingredient deleted' };
  }

  async incrementUseCount(userId: string, id: string) {
    await this.model.updateOne(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
      { $inc: { useCount: 1 }, $set: { lastUsedAt: new Date() } },
    );
  }
}
