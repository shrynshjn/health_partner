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
import { WalkDaysService } from '../walk-days/walk-days.service';
import { FrequentIngredientService } from '../frequent-ingredients/frequent-ingredient.service';

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

    // ─── Food ────────────────────────────────────────────────────────────────

    server.tool(
      'log_food',
      'Log a food or meal entry. Before logging, call search_frequent_ingredients to check if the user has saved nutritional data for this ingredient — use those values for accuracy. Supports micronutrients and meal type.',
      {
        name: z.string().describe('Food item name'),
        qty: z.number().describe('Quantity consumed'),
        unit: z.string().describe('Unit: g, ml, piece, bowl, cup, etc.'),
        calories: z.number(),
        protein: z.number().describe('Protein in grams'),
        carbs: z.number().describe('Carbohydrates in grams'),
        fats: z.number().describe('Fats in grams'),
        eatTime: z.string().describe('ISO8601 datetime of consumption'),
        mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
        fibre: z.number().optional().describe('Dietary fibre in grams'),
        naturalText: z.string().optional().describe('Natural language description of the meal'),
        source: z.string().optional().describe('Entry source: ai, manual, camera'),
      },
      async (dto) => {
        const result = await this.food.create(userId, dto as any);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'get_food_logs',
      'Retrieve the user\'s food log entries for a date range. Returns items with calories, macros, and meal type. Use this to review what was eaten, compute daily totals, or identify missing logs.',
      {
        start: z.string().describe('ISO8601 start datetime'),
        end: z.string().describe('ISO8601 end datetime'),
        mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional().describe('Filter by meal type'),
      },
      async ({ start, end, mealType }) => {
        const result = await this.food.findByRange(userId, new Date(start), new Date(end), mealType);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'log_food_bulk',
      'Log multiple food entries at once — ideal for logging a full meal with several items (e.g. roti + dal + sabzi) in a single call. Before logging, call search_frequent_ingredients for each item to use accurate saved nutritional values.',
      {
        items: z.array(z.object({
          name: z.string(),
          qty: z.number(),
          unit: z.string().describe('g, ml, piece, bowl, cup, etc.'),
          calories: z.number(),
          protein: z.number(),
          carbs: z.number(),
          fats: z.number(),
          eatTime: z.string().describe('ISO8601 datetime of consumption'),
          mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
          fibre: z.number().optional(),
          naturalText: z.string().optional(),
          source: z.string().optional(),
        })).describe('Array of food items to log together'),
        idempotencyKey: z.string().optional().describe('Unique key to prevent duplicate submissions'),
      },
      async ({ items, idempotencyKey }) => {
        const result = await this.food.logMealBulk(userId, items as any, idempotencyKey);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'delete_food_log',
      'Permanently delete a food log entry by its ID. Only entries logged today can be deleted — use get_food_logs to find the ID first.',
      { id: z.string().describe('Food log document _id') },
      async ({ id }) => {
        const result = await this.food.hardDeleteToday(userId, id);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    // ─── Water ───────────────────────────────────────────────────────────────

    server.tool(
      'log_water',
      'Log a water intake entry. qty is in millilitres. Call this each time the user drinks water; multiple entries per day are normal.',
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
      'delete_water_log',
      'Permanently delete a water log entry by its ID. Only entries logged today can be deleted — use get_daily_summary or get_food_logs context to find the ID.',
      { id: z.string().describe('Water log document _id') },
      async ({ id }) => {
        const result = await this.water.hardDeleteToday(userId, id);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    // ─── Workout ─────────────────────────────────────────────────────────────

    server.tool(
      'log_workout',
      'Log a workout session with duration, calories burned, and intensity. Duration is in milliseconds.',
      {
        name: z.string().describe('Workout name e.g. "Morning Run"'),
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
      'Retrieve workout sessions for a date range. Returns name, type, duration, calories burned, and intensity.',
      {
        start: z.string().describe('ISO8601 start datetime'),
        end: z.string().describe('ISO8601 end datetime'),
      },
      async ({ start, end }) => {
        const result = await this.workout.findByRange(userId, new Date(start), new Date(end));
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    // ─── Sleep ───────────────────────────────────────────────────────────────

    server.tool(
      'log_sleep',
      'Log a sleep session. Duration is in milliseconds. Overnight sleep should use the actual start/end times — the summary attributes it to the wake-up day.',
      {
        startTime: z.string().describe('ISO8601 sleep start datetime'),
        endTime: z.string().describe('ISO8601 sleep end datetime'),
        duration: z.number().describe('Duration in milliseconds'),
        source: z.string().optional().describe('e.g. apple_health, manual'),
      },
      async (dto) => {
        const result = await this.sleep.create(userId, dto as any);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    // ─── Daily Summary ───────────────────────────────────────────────────────

    server.tool(
      'get_daily_summary',
      'Get the user\'s daily health summary for a date range. Returns per-day totals (calories, water, sleep, steps, workout) alongside goal achievement scores. Use this for a quick overview of how the user is tracking against their goals.',
      {
        start: z.string().describe('ISO8601 start date'),
        end: z.string().describe('ISO8601 end date'),
      },
      async ({ start, end }) => {
        const result = await this.dailySummary.getSummary(userId, new Date(start), new Date(end));
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    // ─── Health Metrics ──────────────────────────────────────────────────────

    server.tool(
      'log_health_metric',
      'Log a lab test or health report result (e.g. vitamin D, HbA1c, cholesterol, haemoglobin). Stores the value alongside its reference range and whether it is within normal limits.',
      {
        name: z.string().describe('Parameter name e.g. vitaminD, hba1c, cholesterol'),
        value: z.number(),
        refMin: z.number().describe('Reference range minimum'),
        refMax: z.number().describe('Reference range maximum'),
        isOkay: z.boolean().describe('Whether the value is within the reference range'),
        reportTime: z.string().describe('ISO8601 datetime of the report'),
        unit: z.string().optional().describe('Unit e.g. ng/mL, %'),
        category: z.string().optional().describe('Category e.g. vitamins, lipids, diabetes'),
      },
      async (dto) => {
        const result = await this.health.create(userId, dto as any);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    // ─── Physical Measurements ───────────────────────────────────────────────

    server.tool(
      'log_physical',
      'Log a body measurement (weight, height, body fat %, waist, BMI, etc.). Use this whenever the user shares a measurement from a smart scale or tape measure.',
      {
        type: z.enum([
          'weight', 'height', 'bodyFat', 'waist', 'hip', 'quads', 'chest',
          'biceps', 'calves', 'muscleMass', 'bmi', 'bmr', 'boneMass',
          'metabolicAge', 'skeletalMuscle', 'subcutaneousFat', 'visceralFat',
        ]),
        value: z.number(),
        measuredAt: z.string().describe('ISO8601 datetime'),
        source: z.string().optional().describe('e.g. smart_scale, manual'),
      },
      async (dto) => {
        const result = await this.physical.create(userId, dto as any);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    // ─── Goals ───────────────────────────────────────────────────────────────

    server.tool(
      'get_goals',
      'Retrieve the user\'s configured health goals (calories, water, sleep, steps, weight, etc.) including target values and goal types (min/max/target). Use this to contextualise progress and give personalised advice.',
      {},
      async () => {
        const result = await this.goals.get(userId);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    // ─── User Profile ────────────────────────────────────────────────────────

    server.tool(
      'get_profile',
      'Get the current user\'s profile including name, email, date of birth, gender, and diet preference (e.g. vegetarian). Use this to personalise recommendations.',
      {},
      async () => {
        const result = await this.userService.getProfile(userId);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'update_profile',
      'Update the current user\'s profile fields. All fields are optional — only provided fields are changed.',
      {
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        dob: z.string().optional().describe('Date of birth, ISO8601 date e.g. 1995-06-15'),
        gender: z.string().optional().describe('e.g. male, female, other'),
        dietPreference: z.string().optional().describe('e.g. vegetarian, vegan, non-vegetarian, eggetarian, pescatarian'),
      },
      async (dto) => {
        const result = await this.userService.updateProfile(userId, dto);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    // ─── Daily Activity ──────────────────────────────────────────────────────

    server.tool(
      'log_activity',
      'Log or update daily activity stats (steps, active minutes, distance) for a given date. This is an upsert — calling it again for the same date replaces the previous values.',
      {
        date: z.string().describe('ISO8601 date e.g. 2024-06-30'),
        steps: z.number().optional(),
        activeMinutes: z.number().optional(),
        distanceMeters: z.number().optional(),
        source: z.string().optional().describe('Data source e.g. apple_health, manual'),
      },
      async (dto) => {
        const result = await this.dailyActivity.upsert(userId, dto as any);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'get_activity',
      'Retrieve daily activity logs (steps, active minutes, distance) for a date range, sorted newest first.',
      {
        start: z.string().describe('ISO8601 start date'),
        end: z.string().describe('ISO8601 end date'),
      },
      async ({ start, end }) => {
        const result = await this.dailyActivity.findByDateRange(userId, new Date(start), new Date(end));
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    // ─── Walk Days ───────────────────────────────────────────────────────────

    server.tool(
      'get_walk_days',
      'Get hourly walk slot history for a date range. Each day has a slots map keyed 0–23 (hour). Each slot has status (completed/expired), completionSource (manual/healthkit), steps, and activeMinutes. Useful for analysing walk consistency throughout the day.',
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
      'Get the hourly walk slots for a single day. Shorthand for get_walk_days with the same start and end date.',
      {
        date: z.string().describe('Date YYYY-MM-DD'),
      },
      async ({ date }) => {
        const result = await this.walkDays.findByRange(userId, date, date);
        return { content: [{ type: 'text', text: JSON.stringify(result[0] ?? null) }] };
      },
    );

    // ─── Frequent Ingredients ────────────────────────────────────────────────

    server.tool(
      'search_frequent_ingredients',
      'Search or list the user\'s saved frequent ingredients. Always call this before logging food — if a match is found, use its stored nutritional values for accurate calorie and macro logging. Results are sorted by usage frequency when no query is given.',
      {
        q: z.string().optional().describe('Full-text search across name, aliases, and brand'),
        limit: z.number().optional().describe('Max results (default 20, max 100)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
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
      'add_frequent_ingredient',
      'Save a new frequently used ingredient with its full nutritional data. Include the raw ingredients list from packaging when available — it is used later to analyse preservative, additive, and allergen consumption across all saved ingredients.',
      {
        name: z.string(),
        aliases: z.array(z.string()).optional().describe('Alternative names or nicknames e.g. ["cottage cheese", "chenna"]'),
        brand: z.string().optional(),
        calories: z.number().describe('Calories per serving'),
        protein: z.number().describe('Protein in grams'),
        carbs: z.number().describe('Carbohydrates in grams'),
        fats: z.number().describe('Fats in grams'),
        fibre: z.number().optional(),
        additionalNutritionData: z.record(z.string(), z.number()).optional().describe('Extra fields e.g. { addedSugar: 2, saturatedFat: 5, transFat: 0, sodium: 120 }'),
        servingUnit: z.string().optional().describe('Unit the nutrition values are based on e.g. "100g", "1 cup"'),
        servingSize: z.number().optional(),
        ingredients: z.array(z.string()).optional().describe('Raw ingredient list from packaging e.g. ["water", "sugar", "E202", "E211"]'),
        source: z.string().optional().describe('e.g. manual, barcode_scan'),
        notes: z.string().optional(),
      },
      async (dto) => {
        const result = await this.frequentIngredients.create(userId, dto as any);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'update_frequent_ingredient',
      'Update an existing saved ingredient. All fields are optional — only provided fields are changed. Use this to correct nutrition values, add missing fields like the ingredients list, or update notes.',
      {
        id: z.string().describe('Ingredient document _id'),
        name: z.string().optional(),
        aliases: z.array(z.string()).optional(),
        brand: z.string().optional(),
        calories: z.number().optional(),
        protein: z.number().optional(),
        carbs: z.number().optional(),
        fats: z.number().optional(),
        fibre: z.number().optional(),
        additionalNutritionData: z.record(z.string(), z.number()).optional(),
        servingUnit: z.string().optional(),
        servingSize: z.number().optional(),
        ingredients: z.array(z.string()).optional().describe('Raw ingredient list from packaging'),
        source: z.string().optional(),
        notes: z.string().optional(),
      },
      async ({ id, ...dto }) => {
        const result = await this.frequentIngredients.update(userId, id, dto as any);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    server.tool(
      'delete_frequent_ingredient',
      'Permanently delete a saved frequent ingredient by its ID. Use search_frequent_ingredients to find the ID first.',
      { id: z.string().describe('Ingredient document _id') },
      async ({ id }) => {
        const result = await this.frequentIngredients.delete(userId, id);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      },
    );

    return server;
  }
}
