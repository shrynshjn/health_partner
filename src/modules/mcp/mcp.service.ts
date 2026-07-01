import { Injectable } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { FoodService } from '../food/food.service';
import { WorkoutService } from '../workout/workout.service';
import { WaterService } from '../water/water.service';
import { SleepService } from '../sleep/sleep.service';
import { HealthService } from '../health/health.service';
import { PhysicalService } from '../physical/physical.service';
import { GoalsService } from '../goals/goals.service';
import { DailySummaryService } from '../daily-summary/daily-summary.service';
import { DailyActivityService } from '../daily-activity/daily-activity.service';
import { UserService } from '../user/user.service';
import { FrequentIngredientService } from '../frequent-ingredients/frequent-ingredient.service';
import { WalkDaysService } from '../walk-days/walk-days.service';

@Injectable()
export class McpService {
  constructor(
    private readonly food: FoodService,
    private readonly workout: WorkoutService,
    private readonly water: WaterService,
    private readonly sleep: SleepService,
    private readonly health: HealthService,
    private readonly physical: PhysicalService,
    private readonly goals: GoalsService,
    private readonly dailySummary: DailySummaryService,
    private readonly dailyActivity: DailyActivityService,
    private readonly userService: UserService,
    private readonly walkDays: WalkDaysService,
    private readonly frequentIngredients: FrequentIngredientService,
  ) {}

  createServerForUser(userId: string): McpServer {
    const server = new McpServer({ name: 'health-partner', version: '1.0.0' });

    server.tool(
      'log_food',
      'Log a food/meal entry for the authenticated user',
      {
        name: z.string().describe('Food item name'),
        qty: z.number().describe('Quantity consumed'),
        unit: z.string().describe('Unit: g, ml, piece, bowl, etc.'),
        calories: z.number(),
        protein: z.number().describe('Protein in grams'),
        carbs: z.number().describe('Carbs in grams'),
        fats: z.number().describe('Fats in grams'),
        eatTime: z.string().describe('ISO8601 datetime of consumption'),
        mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
        fibre: z.number().optional(),
        naturalText: z.string().optional().describe('Natural language summary'),
      },
      async (dto) => {
        const result = await this.food.create(userId, dto as any);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'get_food_logs',
      'Retrieve food logs for a date range',
      {
        start: z.string().describe('ISO8601 start datetime'),
        end: z.string().describe('ISO8601 end datetime'),
        mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
      },
      async ({ start, end, mealType }) => {
        const result = await this.food.findByRange(userId, new Date(start), new Date(end), mealType);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'log_workout',
      'Log a workout session',
      {
        name: z.string(),
        type: z.enum(['yoga', 'running', 'walking', 'cycling', 'gym']),
        startTime: z.string().describe('ISO8601 datetime'),
        duration: z.number().describe('Duration in milliseconds'),
        calories: z.number().describe('Calories burned'),
        intensity: z.enum(['low', 'medium', 'high']).optional(),
        description: z.string().optional(),
      },
      async (dto) => {
        const result = await this.workout.create(userId, dto as any);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'get_workouts',
      'Retrieve workout logs for a date range',
      {
        start: z.string().describe('ISO8601 start datetime'),
        end: z.string().describe('ISO8601 end datetime'),
      },
      async ({ start, end }) => {
        const result = await this.workout.findByRange(userId, new Date(start), new Date(end));
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'log_water',
      'Log water intake',
      {
        qty: z.number().describe('Amount consumed in ml'),
        drankAt: z.string().describe('ISO8601 datetime'),
      },
      async (dto) => {
        const result = await this.water.create(userId, dto as any);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'log_sleep',
      'Log a sleep session',
      {
        startTime: z.string().describe('ISO8601 sleep start'),
        endTime: z.string().describe('ISO8601 sleep end'),
        duration: z.number().describe('Duration in milliseconds'),
        source: z.string().optional(),
      },
      async (dto) => {
        const result = await this.sleep.create(userId, dto as any);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'get_daily_summary',
      'Get daily health summary scores and goal progress',
      {
        start: z.string().describe('ISO8601 start date'),
        end: z.string().describe('ISO8601 end date'),
      },
      async ({ start, end }) => {
        const result = await this.dailySummary.getSummary(userId, new Date(start), new Date(end));
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'log_health_metric',
      'Log a health lab result (e.g. vitamin D, HbA1c, cholesterol)',
      {
        name: z.string().describe('Parameter name e.g. vitaminD, hba1c'),
        value: z.number(),
        refMin: z.number().describe('Reference range minimum'),
        refMax: z.number().describe('Reference range maximum'),
        isOkay: z.boolean().describe('Whether value is within reference range'),
        reportTime: z.string().describe('ISO8601 datetime'),
        unit: z.string().optional(),
        category: z.string().optional(),
      },
      async (dto) => {
        const result = await this.health.create(userId, dto as any);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'log_physical',
      'Log a physical measurement (weight, body fat, BMI, etc.)',
      {
        type: z.enum([
          'weight', 'height', 'bodyFat', 'waist', 'hip', 'quads', 'chest',
          'biceps', 'calves', 'muscleMass', 'bmi', 'bmr', 'boneMass',
          'metabolicAge', 'skeletalMuscle', 'subcutaneousFat', 'visceralFat',
        ]),
        value: z.number(),
        measuredAt: z.string().describe('ISO8601 datetime'),
        source: z.string().optional(),
      },
      async (dto) => {
        const result = await this.physical.create(userId, dto as any);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'get_goals',
      'Get the user\'s health goals',
      {},
      async () => {
        const result = await this.goals.get(userId);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'get_profile',
      'Get the current user\'s profile (name, email, date of birth)',
      {},
      async () => {
        const result = await this.userService.getProfile(userId);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'update_profile',
      'Update the current user\'s profile (first name, last name, date of birth)',
      {
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        dob: z.string().optional().describe('ISO8601 date, e.g. 1995-06-15'),
        gender: z.string().optional().describe('e.g. male, female, other'),
      },
      async (dto) => {
        const result = await this.userService.updateProfile(userId, dto);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'delete_food_log',
      'Permanently delete a food log entry by its ID. Only entries logged today can be deleted.',
      { id: z.string().describe('Food log document ID') },
      async ({ id }) => {
        const result = await this.food.hardDeleteToday(userId, id);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'delete_water_log',
      'Permanently delete a water log entry by its ID. Only entries logged today can be deleted.',
      { id: z.string().describe('Water log document ID') },
      async ({ id }) => {
        const result = await this.water.hardDeleteToday(userId, id);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'log_activity',
      'Log or update daily activity data (steps, active minutes, distance) for a given date',
      {
        date: z.string().describe('ISO8601 date, e.g. 2024-06-30'),
        steps: z.number().optional(),
        activeMinutes: z.number().optional(),
        distanceMeters: z.number().optional(),
        source: z.string().optional().describe('Data source, e.g. "apple_health", "manual"'),
      },
      async (dto) => {
        const result = await this.dailyActivity.upsert(userId, dto as any);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'get_activity',
      'Get daily activity logs (steps, active minutes, distance) for a date range',
      {
        start: z.string().describe('ISO8601 start date'),
        end: z.string().describe('ISO8601 end date'),
      },
      async ({ start, end }) => {
        const result = await this.dailyActivity.findByDateRange(userId, new Date(start), new Date(end));
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'get_walk_days',
      'Get hourly walk slot history for a date range. Each day contains a slots map keyed by hour (0–23). Each slot has status (completed/expired), completionSource (manual/healthkit), completionReason (steps/active_minutes), steps count, and activeMinutes for that hour.',
      {
        start: z.string().describe('Start date YYYY-MM-DD'),
        end: z.string().describe('End date YYYY-MM-DD'),
      },
      async ({ start, end }) => {
        const result = await this.walkDays.findByRange(userId, start, end);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'get_walk_day',
      'Get the hourly walk slots for a single day',
      {
        date: z.string().describe('Date YYYY-MM-DD'),
      },
      async ({ date }) => {
        const result = await this.walkDays.findByRange(userId, date, date);
        return { content: [{ type: 'text', text: JSON.stringify(result[0] ?? null) }] };
      },
    );

    server.tool(
      'add_frequent_ingredient',
      'Save a frequently used ingredient with its nutritional data so it can be referenced later for accurate calorie and macro estimation',
      {
        name: z.string(),
        aliases: z.array(z.string()).optional().describe('Alternative names or nicknames'),
        brand: z.string().optional(),
        calories: z.number().describe('Calories per serving'),
        protein: z.number(),
        carbs: z.number(),
        fats: z.number(),
        fibre: z.number().optional(),
        additionalNutritionData: z.record(z.string(), z.number()).optional().describe('Extra nutrition fields e.g. { addedSugar: 2, saturatedFat: 5, sodium: 120 }'),
        servingUnit: z.string().optional().describe('Unit the nutrition values are based on, e.g. "100g", "1 cup"'),
        servingSize: z.number().optional(),
        source: z.string().optional(),
        notes: z.string().optional(),
      },
      async (dto) => {
        const result = await this.frequentIngredients.create(userId, dto as any);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'search_frequent_ingredients',
      'Search or list the user\'s saved frequent ingredients. Use this before logging food to find known nutritional data for an ingredient',
      {
        q: z.string().optional().describe('Search query matched against name, aliases, and brand'),
        limit: z.number().optional().describe('Max results to return (default 20)'),
        cursor: z.string().optional().describe('Pagination cursor from previous response'),
      },
      async ({ q, limit, cursor }) => {
        const result = await this.frequentIngredients.query(userId, {
          q,
          limit: limit ? String(limit) : undefined,
          cursor,
        });
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'delete_frequent_ingredient',
      'Permanently delete a saved frequent ingredient by its ID',
      { id: z.string().describe('Ingredient document ID') },
      async ({ id }) => {
        const result = await this.frequentIngredients.delete(userId, id);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    return server;
  }
}
