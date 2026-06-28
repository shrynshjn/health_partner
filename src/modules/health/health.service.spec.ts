import { Test } from '@nestjs/testing';
import { HealthService } from './health.service';
import { getModelToken } from '@nestjs/mongoose';
import { HealthParam } from './health.schema';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

const UID = '507f1f77bcf86cd799439011';
const docId = new Types.ObjectId();

describe('HealthService', () => {
  let service: HealthService;
  let model: any;

  beforeEach(async () => {
    model = jest.fn(() => ({ save: jest.fn(), _id: docId, createdAt: new Date() })) as any;
    model.findOne = jest.fn();
    model.distinct = jest.fn();
    model.insertMany = jest.fn();
    model.find = jest.fn();

    const module = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: getModelToken(HealthParam.name), useValue: model },
      ],
    }).compile();
    service = module.get(HealthService);
    jest.clearAllMocks();
  });

  it('creates a health metric entry', async () => {
    const dto: any = { name: 'vitaminD', value: 28, refMin: 20, refMax: 50, isOkay: true, reportTime: new Date().toISOString() };
    const result = await service.create(UID, dto);
    expect(result.message).toBe('Health parameter logged');
  });

  it('bulk inserts multiple entries', async () => {
    model.insertMany = jest.fn().mockResolvedValue([{ _id: docId }, { _id: new Types.ObjectId() }]);
    const items: any[] = [
      { name: 'iron', value: 12, refMin: 10, refMax: 30, isOkay: true, reportTime: new Date().toISOString() },
      { name: 'zinc', value: 8, refMin: 7, refMax: 15, isOkay: true, reportTime: new Date().toISOString() },
    ];
    const result = await service.bulk(UID, items);
    expect(result.count).toBe(2);
  });

  it('getLatest throws NotFoundException when no record', async () => {
    model.findOne = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue(null) });
    await expect(service.getLatest(UID, 'vitaminD')).rejects.toThrow(NotFoundException);
  });

  it('getLatest returns doc when found', async () => {
    const doc = { name: 'vitaminD', value: 28 };
    model.findOne = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue(doc) });
    const result = await service.getLatest(UID, 'vitaminD');
    expect(result).toEqual(doc);
  });

  it('listNames returns distinct names', async () => {
    model.distinct = jest.fn().mockResolvedValue(['vitaminD', 'iron']);
    const result = await service.listNames(UID);
    expect(result).toEqual({ names: ['vitaminD', 'iron'] });
  });
});
