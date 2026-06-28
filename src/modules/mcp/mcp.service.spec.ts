import { Test } from '@nestjs/testing';
import { McpService } from './mcp.service';
import { FoodService } from '../food/food.service';
import { WorkoutService } from '../workout/workout.service';
import { WaterService } from '../water/water.service';
import { SleepService } from '../sleep/sleep.service';
import { HealthService } from '../health/health.service';
import { PhysicalService } from '../physical/physical.service';
import { GoalsService } from '../goals/goals.service';
import { DailySummaryService } from '../daily-summary/daily-summary.service';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const makeMock = () => ({
  create: jest.fn(),
  findByRange: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  get: jest.fn(),
  getSummary: jest.fn(),
  getLatest: jest.fn(),
  listNames: jest.fn(),
});

describe('McpService', () => {
  let service: McpService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        McpService,
        { provide: FoodService, useValue: makeMock() },
        { provide: WorkoutService, useValue: makeMock() },
        { provide: WaterService, useValue: makeMock() },
        { provide: SleepService, useValue: makeMock() },
        { provide: HealthService, useValue: makeMock() },
        { provide: PhysicalService, useValue: makeMock() },
        { provide: GoalsService, useValue: makeMock() },
        { provide: DailySummaryService, useValue: makeMock() },
      ],
    }).compile();
    service = module.get(McpService);
  });

  it('createServerForUser returns an McpServer instance', () => {
    const server = service.createServerForUser('user123');
    expect(server).toBeInstanceOf(McpServer);
  });

  it('each call returns a fresh server instance', () => {
    const s1 = service.createServerForUser('user1');
    const s2 = service.createServerForUser('user2');
    expect(s1).not.toBe(s2);
  });

  it('server has the expected tools registered', async () => {
    const server = service.createServerForUser('user123');
    const transport = {
      start: jest.fn(),
      close: jest.fn(),
      send: jest.fn(),
      onclose: undefined,
      onerror: undefined,
      onmessage: undefined,
      sessionId: undefined,
    } as any;
    await server.connect(transport);

    const expectedTools = [
      'log_food', 'get_food_logs', 'log_workout', 'get_workouts',
      'log_water', 'log_sleep', 'get_daily_summary', 'log_health_metric',
      'log_physical', 'get_goals',
    ];

    // Access registered tools via the internal server object
    const registeredTools = (server as any)._registeredTools;
    for (const name of expectedTools) {
      expect(registeredTools).toHaveProperty(name);
    }
  });
});
