import { Test } from '@nestjs/testing';
import { SleepService } from './sleep.service';
import { getModelToken } from '@nestjs/mongoose';
import { Sleep } from './sleep.schema';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

const UID = '507f1f77bcf86cd799439011';
const docId = new Types.ObjectId();

describe('SleepService', () => {
  let service: SleepService;
  let model: any;

  beforeEach(async () => {
    model = jest.fn(() => ({ save: jest.fn(), _id: docId, createdAt: new Date() })) as any;
    model.find = jest.fn();
    model.findOneAndUpdate = jest.fn();

    const module = await Test.createTestingModule({
      providers: [
        SleepService,
        { provide: getModelToken(Sleep.name), useValue: model },
      ],
    }).compile();
    service = module.get(SleepService);
    jest.clearAllMocks();
  });

  it('creates a sleep entry and returns summary', async () => {
    const now = new Date();
    const later = new Date(now.getTime() + 8 * 3600_000);
    const result = await service.create(UID, {
      startTime: now.toISOString(),
      endTime: later.toISOString(),
      duration: 8 * 3600_000,
    });
    expect(result.message).toBe('Sleep logged successfully');
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
