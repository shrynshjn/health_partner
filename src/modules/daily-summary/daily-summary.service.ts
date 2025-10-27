
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DailySummary } from './daily-summary.schema';
import { Food } from '../food/food.schema';
import { Workout } from '../workout/workout.schema';
import { Water } from '../water/water.schema';
import { Sleep } from '../sleep/sleep.schema';
import { Goals } from '../goals/goals.schema';
import dayjs from 'dayjs';

@Injectable()
export class DailySummaryService {
  private readonly logger = new Logger(DailySummaryService.name);

  constructor(
    @InjectModel(DailySummary.name)
    private readonly summaryModel: Model<DailySummary>,
    @InjectModel(Food.name)
    private readonly foodModel: Model<Food>,
    @InjectModel(Workout.name)
    private readonly workoutModel: Model<Workout>,
    @InjectModel(Water.name)
    private readonly waterModel: Model<Water>,
    @InjectModel(Sleep.name)
    private readonly sleepModel: Model<Sleep>,
    @InjectModel(Goals.name)
    private readonly goalsModel: Model<Goals>,
  ) {}

  async getSummary(userId: string, start: Date, end: Date) {
    const userObjectId = new Types.ObjectId(userId);
    const startDate = dayjs(start).startOf('day');
    const endDate = dayjs(end).endOf('day');

    const summaries = await this.summaryModel
      .find({
        userId: userObjectId,
        day: { $gte: startDate.toDate(), $lte: endDate.toDate() },
      })
      .sort({ day: 1 });

    const allDays = [];
    for (let d = startDate; d.isBefore(endDate) || d.isSame(endDate, 'day'); d = d.add(1, 'day')) {
      allDays.push(d.toDate());
    }

    const existingDays = summaries.map((s) => s.day.toISOString().split('T')[0]);
    const missingDays = allDays.filter(
      (d) => !existingDays.includes(d.toISOString().split('T')[0]),
    );

    for (const day of missingDays) {
      const summary = await this.computeDailySummary(userId, day, true);
      if (summary) summaries.push(summary);
    }

    return summaries;
  }

  async computeDailySummary(userId: string, day: Date, auto = false) {
    const userObjectId = new Types.ObjectId(userId);
    const dateStart = dayjs(day).startOf('day');
    const dateEnd = dayjs(day).endOf('day');

    const goalsDoc = await this.goalsModel.findOne({ userId: userObjectId });
    if (!goalsDoc) return null;

    const [foods, workouts, waterLogs, sleepLogs] = await Promise.all([
      this.foodModel.find({ userId, eatTime: { $gte: dateStart, $lte: dateEnd } }),
      this.workoutModel.find({ userId, startTime: { $gte: dateStart, $lte: dateEnd } }),
      this.waterModel.find({ userId, drankAt: { $gte: dateStart, $lte: dateEnd } }),
      this.sleepModel.find({ userId, startTime: { $gte: dateStart, $lte: dateEnd } }),
    ]);

    const totals: Record<string, number> = {
      calories: foods.reduce((a, f) => a + f.calories, 0),
      protein: foods.reduce((a, f) => a + f.protein, 0),
      carbs: foods.reduce((a, f) => a + f.carbs, 0),
      fats: foods.reduce((a, f) => a + f.fats, 0),
      water: waterLogs.reduce((a, w) => a + w.qty, 0),
      sleep: sleepLogs.reduce((a, s) => a + s.duration, 0) / 3600000,
      workout: workouts.reduce((a, w) => a + w.calories, 0),
    };

    const metrics = goalsDoc.goals.map((g) => {
      const value = totals[g.parameter.toLowerCase()] ?? 0;
      const achieved =
        g.type === 'target'
          ? Math.abs(g.target - value) <= g.target * 0.1
          : g.type === 'max'
          ? value <= g.target
          : value >= g.target;
      return { parameter: g.parameter, goal: g.target, value, achieved };
    });

    const score = (metrics.filter((m) => m.achieved).length / metrics.length) * 100 || 0;

    const summary = await this.summaryModel.findOneAndUpdate(
      { userId: userObjectId, day: dateStart.toDate() },
      { userId: userObjectId, day: dateStart.toDate(), metrics, score, generatedByCron: auto },
      { upsert: true, new: true },
    );

    return summary;
  }

  async runMidnightJob() {
    this.logger.log('Running daily summary cron job...');
    const yesterday = dayjs().subtract(1, 'day').startOf('day').toDate();
    const users = await this.goalsModel.distinct('userId');
    for (const userId of users) {
      await this.computeDailySummary(userId.toString(), yesterday, true);
    }
    this.logger.log('Daily summary generation completed.');
  }
}
