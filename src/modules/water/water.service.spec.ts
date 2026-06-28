import { Test } from '@nestjs/testing';
import { WaterService } from './water.service';
import { getModelToken } from '@nestjs/mongoose';
import { Water } from './water.schema';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

const UID = '507f1f77bcf86cd799439011';
const docId = new Types.ObjectId();

describe('WaterService', () => {
  let service: WaterService;
  let model: any;

  beforeEach(async () => {
    model = jest.fn(() => ({ save: jest.fn(), _id: docId, createdAt: new Date() })) as any;
    model.find = jest.fn();
    model.findOneAndUpdate = jest.fn();

    const module = await Test.createTestingModule({
      providers: [
        WaterService,
        { provide: getModelToken(Water.name), useValue: model },
      ],
    }).compile();
    service = module.get(WaterService);
    jest.clearAllMocks();
  });

  it('creates a water entry and returns summary', async () => {
    const result = await service.create(UID, { qty: 300, drankAt: new Date().toISOString() });
    expect(result.message).toBe('Water logged successfully');
  });

  it('findByRange returns items', async () => {
    const items = [{ _id: docId }];
    model.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue(items) }),
    });
    const result = await service.findByRange(UID, new Date(), new Date());
    expect(result.items).toHaveLength(1);
    expect(result.nextCursor).toBeNull();
  });

  it('update throws NotFoundException when not found', async () => {
    model.findOneAndUpdate = jest.fn().mockResolvedValue(null);
    await expect(service.update(UID, String(docId), {})).rejects.toThrow(NotFoundException);
  });

  it('remove throws NotFoundException when not found', async () => {
    model.findOneAndUpdate = jest.fn().mockResolvedValue(null);
    await expect(service.remove(UID, String(docId))).rejects.toThrow(NotFoundException);
  });
});
