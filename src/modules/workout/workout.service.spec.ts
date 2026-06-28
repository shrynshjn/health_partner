import { Test } from '@nestjs/testing';
import { WorkoutService } from './workout.service';
import { getModelToken } from '@nestjs/mongoose';
import { Workout } from './workout.schema';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

const UID = '507f1f77bcf86cd799439011';
const docId = new Types.ObjectId();

describe('WorkoutService', () => {
  let service: WorkoutService;
  let model: any;

  beforeEach(async () => {
    model = jest.fn(() => ({ save: jest.fn(), _id: docId, createdAt: new Date() })) as any;
    model.find = jest.fn();
    model.findOneAndUpdate = jest.fn();
    model.insertMany = jest.fn();

    const module = await Test.createTestingModule({
      providers: [
        WorkoutService,
        { provide: getModelToken(Workout.name), useValue: model },
      ],
    }).compile();
    service = module.get(WorkoutService);
    jest.clearAllMocks();
  });

  it('creates a workout and returns summary', async () => {
    const dto: any = { name: 'Run', type: 'running', startTime: new Date().toISOString(), duration: 3600000, calories: 400 };
    const result = await service.create(UID, dto);
    expect(result.message).toBe('Workout logged successfully');
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
