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

    return server;
  }
}
