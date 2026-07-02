import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { DailySummaryService } from './daily-summary.service';
import { DailySummary } from './daily-summary.schema';
import { Food } from '../food/food.schema';
import { Workout } from '../workout/workout.schema';
import { Water } from '../water/water.schema';
import { Sleep } from '../sleep/sleep.schema';
import { Goals } from '../goals/goals.schema';
import { DailyActivity } from '../daily-activity/daily-activity.schema';
import { PhysicalParam } from '../physical/physical.schema';

const UID = '507f1f77bcf86cd799439011';

describe('DailySummaryService status computation', () => {
  let service: DailySummaryService;
  let goalsModel: any;
  let activityModel: any;
  let summaryModel: any;

  const emptyFind = () => ({ find: jest.fn().mockResolvedValue([]) });

  beforeEach(async () => {
    goalsModel = { findOne: jest.fn() };
    activityModel = { findOne: jest.fn().mockResolvedValue(null), distinct: jest.fn() };
    summaryModel = {
      find: jest.fn().mockResolvedValue([]),
      findOneAndUpdate: jest.fn((_filter, update) => Promise.resolve(update)),
    };

    const module = await Test.createTestingModule({
      providers: [
        DailySummaryService,
        { provide: getModelToken(DailySummary.name), useValue: summaryModel },
        { provide: getModelToken(Food.name), useValue: emptyFind() },
        { provide: getModelToken(Workout.name), useValue: emptyFind() },
        { provide: getModelToken(Water.name), useValue: emptyFind() },
        { provide: getModelToken(Sleep.name), useValue: emptyFind() },
        { provide: getModelToken(Goals.name), useValue: goalsModel },
        { provide: getModelToken(DailyActivity.name), useValue: activityModel },
        { provide: getModelToken(PhysicalParam.name), useValue: { findOne: jest.fn().mockResolvedValue(null) } },
      ],
    }).compile();

    service = module.get(DailySummaryService);
  });

  function withSteps(value: number, target: number, type: 'min' | 'max' | 'target' = 'min') {
    goalsModel.findOne.mockResolvedValue({
      goals: [{ parameter: 'steps', target, type, unit: 'steps' }],
    });
    activityModel.findOne.mockResolvedValue({ steps: value, activeMinutes: 0, calories: 0 });
  }

  it('marks a below-target min goal as in_progress for today', async () => {
    withSteps(5000, 10000, 'min');
    const result = await service.computeDailySummary(UID, dayjs().toDate());
    expect(result!.metrics[0].status).toBe('in_progress');
  });

  it('marks the same below-target min goal as failed for a past day', async () => {
    withSteps(5000, 10000, 'min');
    const yesterday = dayjs().subtract(1, 'day').toDate();
    const result = await service.computeDailySummary(UID, yesterday);
    expect(result!.metrics[0].status).toBe('failed');
  });

  it('marks a met min goal as achieved regardless of day', async () => {
    withSteps(12000, 10000, 'min');
    const result = await service.computeDailySummary(UID, dayjs().toDate());
    expect(result!.metrics[0].status).toBe('achieved');
  });

  it('marks an exceeded max goal as failed even for today', async () => {
    withSteps(300, 250, 'max'); // reuse steps field as a stand-in numeric total
    const result = await service.computeDailySummary(UID, dayjs().toDate());
    expect(result!.metrics[0].status).toBe('failed');
  });

  it('marks an under-limit max goal as achieved', async () => {
    withSteps(200, 250, 'max');
    const result = await service.computeDailySummary(UID, dayjs().toDate());
    expect(result!.metrics[0].status).toBe('achieved');
  });

  it('marks an undershot target goal as in_progress for today', async () => {
    withSteps(1000, 2000, 'target'); // within reach of the 1800-2200 band
    const result = await service.computeDailySummary(UID, dayjs().toDate());
    expect(result!.metrics[0].status).toBe('in_progress');
  });

  it('marks an overshot target goal as failed even for today', async () => {
    withSteps(2500, 2000, 'target'); // past the +10% band, unrecoverable
    const result = await service.computeDailySummary(UID, dayjs().toDate());
    expect(result!.metrics[0].status).toBe('failed');
  });

  it('marks a within-band target goal as achieved', async () => {
    withSteps(2100, 2000, 'target');
    const result = await service.computeDailySummary(UID, dayjs().toDate());
    expect(result!.metrics[0].status).toBe('achieved');
  });
});
