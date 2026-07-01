
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DailySummary } from './daily-summary.schema';
import { Food } from '../food/food.schema';
import { Workout } from '../workout/workout.schema';
import { Water } from '../water/water.schema';
import { Sleep } from '../sleep/sleep.schema';
import { Goals } from '../goals/goals.schema';
import { DailyActivity } from '../daily-activity/daily-activity.schema';
import { PhysicalParam } from '../physical/physical.schema';
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
    @InjectModel(DailyActivity.name)
    private readonly activityModel: Model<DailyActivity>,
    @InjectModel(PhysicalParam.name)
    private readonly physicalModel: Model<PhysicalParam>,
  ) {}

  async getSummary(userId: string, start: Date, end: Date) {
    const userObjectId = new Types.ObjectId(userId);
    const startDate = dayjs(start).startOf('day');
    const endDate = dayjs(end).endOf('day');
    // Always recompute the last 2 days live so data logged after the midnight cron
    // (food, sleep, workouts added retroactively) always shows up immediately.
    const liveKeys = new Set([
      dayjs().startOf('day').toDate().toISOString().split('T')[0],
      dayjs().subtract(1, 'day').startOf('day').toDate().toISOString().split('T')[0],
    ]);

    const existing = await this.summaryModel
      .find({
        userId: userObjectId,
        day: { $gte: startDate.toDate(), $lte: endDate.toDate() },
      })
      .sort({ day: 1 });

    // Exclude the live window from the cache so they are always recomputed below
    const existingDayKeys = new Set(
      existing
        .filter((s) => !liveKeys.has(s.day.toISOString().split('T')[0]))
        .map((s) => s.day.toISOString().split('T')[0]),
    );

    const allDays: Date[] = [];
    for (let d = startDate; d.isBefore(endDate) || d.isSame(endDate, 'day'); d = d.add(1, 'day')) {
      allDays.push(d.toDate());
    }

    const missingDays = allDays.filter((d) => !existingDayKeys.has(d.toISOString().split('T')[0]));

    const computed: typeof existing = [];
    for (const day of missingDays) {
      const summary = await this.computeDailySummary(userId, day, true);
      if (summary) computed.push(summary);
    }

    // Drop stale cached versions of today/yesterday — use freshly computed ones
    const pastExisting = existing.filter((s) => !liveKeys.has(s.day.toISOString().split('T')[0]));
    return [...pastExisting, ...computed].sort((a, b) => a.day.getTime() - b.day.getTime());
  }

  // Default goals used when user has no Goals document yet
  private readonly DEFAULT_GOALS: { parameter: string; target: number; type: 'min' | 'max' | 'target'; unit: string }[] = [
    { parameter: 'calories',       target: 2000, type: 'min',    unit: 'kcal' },
    { parameter: 'water',          target: 2500, type: 'min',    unit: 'ml'   },
    { parameter: 'sleep',          target: 7,    type: 'min',    unit: 'h'    },
    { parameter: 'steps',          target: 10000,type: 'min',    unit: 'steps'},
    { parameter: 'active_minutes',  target: 30,   type: 'min',    unit: 'min'  },
    { parameter: 'workout',         target: 300,  type: 'min',    unit: 'kcal' },
    { parameter: 'calories_burned', target: 500,  type: 'min',    unit: 'kcal' },
  ];

  async computeDailySummary(userId: string, day: Date, auto = false) {
    const userObjectId = new Types.ObjectId(userId);
    const dateStart = dayjs(day).startOf('day');
    const dateEnd = dayjs(day).endOf('day');

    const goalsDoc = await this.goalsModel.findOne({ userId: userObjectId });
    // Fall back to defaults so summaries work before the user configures goals
    const goalsList = goalsDoc?.goals?.length ? goalsDoc.goals : this.DEFAULT_GOALS;

    const notDeleted = { deletedAt: null };
    const [foods, workouts, waterLogs, sleepLogs, activityLog, latestWeight] = await Promise.all([
      this.foodModel.find({ userId: userObjectId, eatTime: { $gte: dateStart.toDate(), $lte: dateEnd.toDate() }, ...notDeleted }),
      this.workoutModel.find({ userId: userObjectId, startTime: { $gte: dateStart.toDate(), $lte: dateEnd.toDate() }, ...notDeleted }),
      this.waterModel.find({ userId: userObjectId, drankAt: { $gte: dateStart.toDate(), $lte: dateEnd.toDate() }, ...notDeleted }),
      // Use endTime so overnight sleep (started yesterday, woke up today) is attributed to the wake-up day
      this.sleepModel.find({ userId: userObjectId, endTime: { $gte: dateStart.toDate(), $lte: dateEnd.toDate() }, ...notDeleted }),
      // Use a date range to avoid exact-timestamp matching issues across timezones
      this.activityModel.findOne({ userId: userObjectId, date: { $gte: dateStart.toDate(), $lte: dateEnd.toDate() } }),
      // Most recent weight on or before this day — carry forward last known value
      this.physicalModel.findOne(
        { userId: userObjectId, type: 'weight', measuredAt: { $lte: dateEnd.toDate() }, deletedAt: null },
        null,
        { sort: { measuredAt: -1 } },
      ),
    ]);

    const totals: Record<string, number> = {
      calories:       foods.reduce((a, f) => a + (f.calories ?? 0), 0),
      protein:        foods.reduce((a, f) => a + (f.protein ?? 0), 0),
      carbs:          foods.reduce((a, f) => a + (f.carbs ?? 0), 0),
      fats:           foods.reduce((a, f) => a + (f.fats ?? 0), 0),
      fibre:          foods.reduce((a, f) => a + (f.fibre ?? 0), 0),
      water:          waterLogs.reduce((a, w) => a + (w.qty ?? 0), 0),
      sleep:          sleepLogs.reduce((a, s) => a + (s.duration ?? 0), 0) / 3_600_000,
      workout:        workouts.reduce((a, w) => a + (w.calories ?? 0), 0),
      steps:            activityLog?.steps ?? 0,
      active_minutes:   activityLog?.activeMinutes ?? 0,
      calories_burned:  activityLog?.calories ?? 0,
      // Carry forward the most recent weight on or before this day
      weight:           latestWeight?.value ?? 0,
    };

    // Skip persisting if no actual data exists for this day (avoids caching empty days)
    const hasData = totals.calories > 0 || totals.water > 0 || totals.sleep > 0 ||
                    totals.steps > 0 || totals.active_minutes > 0 || totals.workout > 0 ||
                    totals.weight > 0;
    if (!hasData) return null;

    const metrics = goalsList.map((g) => {
      const value = totals[g.parameter.toLowerCase()] ?? 0;
      const achieved =
        g.type === 'target'
          ? Math.abs(g.target - value) <= g.target * 0.1
          : g.type === 'max'
          ? value <= g.target
          : value >= g.target;
      return { parameter: g.parameter, goal: g.target, value, achieved };
    });

    const score = metrics.length > 0
      ? (metrics.filter((m) => m.achieved).length / metrics.length) * 100
      : 0;

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
    // Use activityModel to find all users with data — not goalsModel, so users without
    // configured goals still get summaries computed via default goals
    const userIds = await this.activityModel.distinct('userId');
    for (const userId of userIds) {
      await this.computeDailySummary(userId.toString(), yesterday, true);
    }
    this.logger.log(`Daily summary generation completed for ${userIds.length} users.`);
  }
}
