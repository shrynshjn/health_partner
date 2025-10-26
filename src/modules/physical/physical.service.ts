import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PhysicalParam, PhysicalParamDocument } from './physical.schema';
import { CreatePhysicalDto } from './dto/create-physical.dto';
import { UpdatePhysicalDto } from './dto/update-physical.dto';

@Injectable()
export class PhysicalService {
  constructor(@InjectModel(PhysicalParam.name) private model: Model<PhysicalParamDocument>) {}

  async create(userId: string, dto: CreatePhysicalDto) {
    const doc = new this.model({
      ...dto,
      userId: new Types.ObjectId(userId),
      measuredAt: new Date(dto.measuredAt),
    });
    await doc.save();
    return { message: 'Physical parameter logged', paramId: doc._id, createdAt: doc.createdAt };
  }

  async bulk(userId: string, items: CreatePhysicalDto[], idempotencyKey?: string) {
    const docs = items.map(d => ({
      ...d,
      userId: new Types.ObjectId(userId),
      measuredAt: new Date(d.measuredAt),
      idempotencyKey: d.idempotencyKey ?? idempotencyKey,
    }));
    const res = await this.model.insertMany(docs);
    return { message: 'Physical parameters logged', createdIds: res.map(r => r._id), count: res.length };
  }

  async getLatest(userId: string, type: string) {
    const doc = await this.model.findOne({ userId: new Types.ObjectId(userId), type, deletedAt: { $exists: false } })
      .sort({ measuredAt: -1, _id: -1 });
    if (!doc) throw new NotFoundException('No record found');
    return doc;
  }

  async updateLatest(userId: string, type: string, dto: UpdatePhysicalDto) {
    const latest = await this.model.findOne({ userId: new Types.ObjectId(userId), type, deletedAt: { $exists: false } })
      .sort({ measuredAt: -1, _id: -1 });
    if (!latest) throw new NotFoundException('No record found');
    const set: any = { ...dto };
    if ((dto as any).measuredAt) set.measuredAt = new Date((dto as any).measuredAt);
    const updated = await this.model.findByIdAndUpdate(latest._id, { $set: set }, { new: true });
    return { message: 'Latest parameter updated', updatedAt: updated?.updatedAt };
  }

  async deleteLatest(userId: string, type: string) {
    const latest = await this.model.findOne({ userId: new Types.ObjectId(userId), type, deletedAt: { $exists: false } })
      .sort({ measuredAt: -1, _id: -1 });
    if (!latest) throw new NotFoundException('No record found');
    const upd = await this.model.findByIdAndUpdate(latest._id, { $set: { deletedAt: new Date() } }, { new: true });
    return { message: 'Latest parameter deleted', deletedAt: upd?.deletedAt };
  }

  async trends(userId: string, types: string[], start: Date, end: Date, interval: 'day'|'week'|'month' = 'day') {
    const unit = interval;
    const results = await this.model.aggregate([
      { $match: { userId: new Types.ObjectId(userId), type: { $in: types }, measuredAt: { $gte: start, $lt: end }, deletedAt: { $exists: false } } },
      { $addFields: { bucket: { $dateTrunc: { date: '$measuredAt', unit } } } },
      { $group: { _id: { type: '$type', t: '$bucket' }, value: { $avg: '$value' } } },
      { $project: { _id: 0, type: '$_id.type', t: '$_id.t', value: 1 } },
      { $sort: { type: 1, t: 1 } }
    ]);
    const byType: Record<string, any[]> = {};
    for (const r of results) {
      if (!byType[r.type]) byType[r.type] = [];
      byType[r.type].push({ t: r.t, value: r.value });
    }
    return { series: Object.entries(byType).map(([type, points]) => ({ type, points })) };
  }
}
