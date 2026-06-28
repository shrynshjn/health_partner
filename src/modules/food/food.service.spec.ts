import { Test } from '@nestjs/testing';
import { FoodService } from './food.service';
import { getModelToken } from '@nestjs/mongoose';
import { Food } from './food.schema';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

const UID = '507f1f77bcf86cd799439011';
const docId = new Types.ObjectId();

describe('FoodService', () => {
  let service: FoodService;
  let model: any;

  beforeEach(async () => {
    model = jest.fn(() => ({ save: jest.fn(), _id: docId, createdAt: new Date() })) as any;
    model.find = jest.fn();
    model.findOneAndUpdate = jest.fn();
    model.insertMany = jest.fn();

    const module = await Test.createTestingModule({
      providers: [
        FoodService,
        { provide: getModelToken(Food.name), useValue: model },
      ],
    }).compile();
    service = module.get(FoodService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('saves a food document and returns summary', async () => {
      const dto: any = { name: 'Rice', qty: 1, unit: 'bowl', calories: 300, protein: 5, carbs: 60, fats: 1, eatTime: new Date().toISOString() };
      const result = await service.create(UID, dto);
      expect(result.message).toBe('Food logged successfully');
      expect(result.foodId).toBeDefined();
    });
  });

  describe('findByRange', () => {
    it('returns items and nextCursor=null when fewer than limit', async () => {
      const items = [{ _id: docId }];
      model.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue(items) }),
      });
      const result = await service.findByRange(UID, new Date(), new Date());
      expect(result.items).toHaveLength(1);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe('update', () => {
    it('throws NotFoundException if doc not found', async () => {
      model.findOneAndUpdate = jest.fn().mockResolvedValue(null);
      await expect(service.update(UID, String(docId), {})).rejects.toThrow(NotFoundException);
    });

    it('returns updated message on success', async () => {
      model.findOneAndUpdate = jest.fn().mockResolvedValue({ updatedAt: new Date() });
      const result = await service.update(UID, String(docId), { name: 'Dal' });
      expect(result.message).toBe('Food updated');
    });
  });

  describe('remove', () => {
    it('throws NotFoundException if doc not found', async () => {
      model.findOneAndUpdate = jest.fn().mockResolvedValue(null);
      await expect(service.remove(UID, String(docId))).rejects.toThrow(NotFoundException);
    });

    it('returns deleted message on success', async () => {
      model.findOneAndUpdate = jest.fn().mockResolvedValue({ deletedAt: new Date() });
      const result = await service.remove(UID, String(docId));
      expect(result.message).toBe('Food deleted');
    });
  });

  describe('logMealBulk', () => {
    it('inserts multiple docs and returns count', async () => {
      model.insertMany = jest.fn().mockResolvedValue([{ _id: docId }, { _id: new Types.ObjectId() }]);
      const items: any[] = [
        { name: 'A', qty: 1, unit: 'g', calories: 100, protein: 1, carbs: 1, fats: 1, eatTime: new Date().toISOString() },
        { name: 'B', qty: 2, unit: 'g', calories: 200, protein: 2, carbs: 2, fats: 2, eatTime: new Date().toISOString() },
      ];
      const result = await service.logMealBulk(UID, items);
      expect(result.count).toBe(2);
      expect(result.message).toBe('Meal logged successfully');
    });
  });
});
