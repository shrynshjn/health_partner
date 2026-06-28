import { Test } from '@nestjs/testing';
import { PhysicalService } from './physical.service';
import { getModelToken } from '@nestjs/mongoose';
import { PhysicalParam } from './physical.schema';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

const UID = '507f1f77bcf86cd799439011';
const docId = new Types.ObjectId();

describe('PhysicalService', () => {
  let service: PhysicalService;
  let model: any;

  beforeEach(async () => {
    model = jest.fn(() => ({ save: jest.fn(), _id: docId, createdAt: new Date() })) as any;
    model.findOne = jest.fn();
    model.findOneAndUpdate = jest.fn();
    model.findByIdAndUpdate = jest.fn();
    model.insertMany = jest.fn();
    model.aggregate = jest.fn();

    const module = await Test.createTestingModule({
      providers: [
        PhysicalService,
        { provide: getModelToken(PhysicalParam.name), useValue: model },
      ],
    }).compile();
    service = module.get(PhysicalService);
    jest.clearAllMocks();
  });

  it('creates a physical measurement', async () => {
    const dto: any = { type: 'weight', value: 72.4, measuredAt: new Date().toISOString() };
    const result = await service.create(UID, dto);
    expect(result.message).toBe('Physical parameter logged');
  });

  it('getLatest throws NotFoundException when no record', async () => {
    model.findOne = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue(null) });
    await expect(service.getLatest(UID, 'weight')).rejects.toThrow(NotFoundException);
  });

  it('getLatest returns doc when found', async () => {
    const doc = { type: 'weight', value: 72.4 };
    model.findOne = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue(doc) });
    const result = await service.getLatest(UID, 'weight');
    expect(result).toEqual(doc);
  });

  it('deleteLatest throws NotFoundException when no record exists', async () => {
    model.findOne = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue(null) });
    await expect(service.deleteLatest(UID, 'weight')).rejects.toThrow(NotFoundException);
  });
});
