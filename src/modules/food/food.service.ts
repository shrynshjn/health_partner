import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Food, FoodDocument } from './food.schema';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';

@Injectable()
export class FoodService {
  constructor(@InjectModel(Food.name) private foodModel: Model<FoodDocument>) {}

  async create(userId: string, dto: CreateFoodDto) {
    const doc = new this.foodModel({ ...dto, eatTime: new Date(dto.eatTime), userId: new Types.ObjectId(userId) });
    await doc.save();
    return { message: 'Food logged successfully', foodId: doc._id, createdAt: doc.createdAt };
  }

  async findByRange(userId: string, start: Date, end: Date, mealType?: string, limit = 100, cursor?: string) {
    const filter: any = { userId: new Types.ObjectId(userId), eatTime: { $gte: start, $lt: end }, deletedAt: { $exists: false } };
    if (mealType) filter.mealType = mealType;
    if (cursor) filter._id = { $lt: new Types.ObjectId(cursor) };
    const items = await this.foodModel.find(filter).sort({ _id: -1 }).limit(limit);
    const nextCursor = items.length === limit ? items[items.length - 1]._id.toString() : null;
    return { items, nextCursor };
  }

  async update(userId: string, id: string, dto: UpdateFoodDto) {
    const data = { ...dto } as any;
    if (data.eatTime) data.eatTime = new Date(data.eatTime);
    const updated = await this.foodModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      { $set: data },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Food not found');
    return { message: 'Food updated', updatedAt: updated.updatedAt };
  }

  async remove(userId: string, id: string) {
    const updated = await this.foodModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      { $set: { deletedAt: new Date() } },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Food not found');
    return { message: 'Food deleted', deletedAt: updated.deletedAt };
  }

  async logMealBulk(userId: string, items: CreateFoodDto[], idempotencyKey?: string) {
  const docs = items.map(item => ({
    ...item,
    userId: new Types.ObjectId(userId),
    eatTime: new Date(item.eatTime),
    createdAt: new Date(),
    idempotencyKey,
  }));

  const inserted = await this.foodModel.insertMany(docs);

  return {
    message: 'Meal logged successfully',
    ids: inserted.map(doc => doc._id),
    count: inserted.length,
  };
}
}
