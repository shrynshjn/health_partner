import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HealthParam, HealthParamDocument } from './health.schema';
import { CreateHealthDto } from './dto/create-health.dto';

@Injectable()
export class HealthService {
  constructor(@InjectModel(HealthParam.name) private model: Model<HealthParamDocument>) {}

  async create(userId: string, dto: CreateHealthDto) {
    const doc = new this.model({
      ...dto,
      userId: new Types.ObjectId(userId),
      reportTime: new Date(dto.reportTime),
    });
    await doc.save();
    return { message: 'Health parameter logged', paramId: doc._id, createdAt: doc.createdAt };
  }

  async bulk(userId: string, items: CreateHealthDto[], idempotencyKey?: string) {
    const docs = items.map(d => ({
      ...d,
      userId: new Types.ObjectId(userId),
      reportTime: new Date(d.reportTime),
      idempotencyKey: d.idempotencyKey ?? idempotencyKey,
    }));
    const res = await this.model.insertMany(docs);
    return { message: 'Health parameters logged', createdIds: res.map(r => r._id), count: res.length };
  }

  async getLatest(userId: string, name: string) {
    const doc = await this.model.findOne({ userId: new Types.ObjectId(userId), name })
      .sort({ reportTime: -1, _id: -1 });
    if (!doc) throw new NotFoundException('No record found');
    return doc;
  }

  async listNames(userId: string) {
    const names = await this.model.distinct('name', { userId: new Types.ObjectId(userId) });
    return { names };
  }

  async trends(userId: string, names: string[], start: Date, end: Date, interval: 'day'|'week'|'month' = 'day') {
    const unit = interval;
    const results = await this.model.aggregate([
      { $match: { userId: new Types.ObjectId(userId), name: { $in: names }, reportTime: { $gte: start, $lt: end } } },
      { $addFields: { bucket: { $dateTrunc: { date: '$reportTime', unit } } } },
      { $group: { _id: { name: '$name', t: '$bucket' }, value: { $avg: '$value' }, refMin: { $avg: '$refMin' }, refMax: { $avg: '$refMax' } } },
      { $project: { _id: 0, name: '$_id.name', t: '$_id.t', value: 1, refMin: 1, refMax: 1 } },
      { $sort: { name: 1, t: 1 } }
    ]);
    const byName: Record<string, any[]> = {};
    for (const r of results) {
      if (!byName[r.name]) byName[r.name] = [];
      byName[r.name].push({ t: r.t, value: r.value, refMin: r.refMin, refMax: r.refMax });
    }
    return { series: Object.entries(byName).map(([name, points]) => ({ name, points })) };
  }
}
