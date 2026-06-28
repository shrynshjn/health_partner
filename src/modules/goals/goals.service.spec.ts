import { Test } from '@nestjs/testing';
import { GoalsService } from './goals.service';
import { getModelToken } from '@nestjs/mongoose';
import { Goals } from './goals.schema';
import { Types } from 'mongoose';

const UID = '507f1f77bcf86cd799439011';

describe('GoalsService', () => {
  let service: GoalsService;
  let model: any;

  beforeEach(async () => {
    model = { findOne: jest.fn(), create: jest.fn(), findOneAndUpdate: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        GoalsService,
        { provide: getModelToken(Goals.name), useValue: model },
      ],
    }).compile();
    service = module.get(GoalsService);
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('returns empty goals when no doc exists', async () => {
      model.findOne.mockResolvedValue(null);
      const result = await service.get(UID);
      expect(result.goals).toEqual([]);
    });

    it('returns goals from existing doc', async () => {
      const goals = [{ parameter: 'calories', type: 'min', target: 2000 }];
      model.findOne.mockResolvedValue({ goals, updatedAt: new Date() });
      const result = await service.get(UID);
      expect(result.goals).toEqual(goals);
    });
  });

  describe('update', () => {
    it('creates goals if none exist', async () => {
      model.findOne.mockResolvedValue(null);
      model.create.mockResolvedValue({ goals: [], updatedAt: new Date() });
      const result = await service.update(UID, { goals: [] } as any);
      expect(result.message).toBe('Goals created successfully');
    });

    it('updates existing goals and merges', async () => {
      const existing = {
        goals: [],
        save: jest.fn().mockResolvedValue({ goals: [], updatedAt: new Date() }),
        updatedAt: new Date(),
      };
      model.findOne.mockResolvedValue(existing);
      const result = await service.update(UID, { goals: [] } as any);
      expect(result.message).toContain('Goals updated successfully');
    });
  });
});
