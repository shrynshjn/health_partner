export interface GoalCatalogEntry {
  parameter: string;
  label: string;
  emoji: string;
  unit: string;
  defaultTarget: number;
  defaultType: 'min' | 'max' | 'target';
}

/**
 * The full set of parameters daily-summary.service.ts's computeDailySummary
 * knows how to total up (see its `totals` map). A goal for any parameter
 * outside this list can never be scored — its value stays 0 forever — so
 * this is the single source of truth for what's addable as a goal.
 */
export const GOAL_CATALOG: GoalCatalogEntry[] = [
  { parameter: 'calories', label: 'Daily Calories', emoji: '🍽️', unit: 'kcal', defaultTarget: 2000, defaultType: 'max' },
  { parameter: 'protein', label: 'Protein', emoji: '🫘', unit: 'g', defaultTarget: 120, defaultType: 'min' },
  { parameter: 'carbs', label: 'Carbs', emoji: '🌾', unit: 'g', defaultTarget: 250, defaultType: 'max' },
  { parameter: 'fats', label: 'Fats', emoji: '🫙', unit: 'g', defaultTarget: 70, defaultType: 'max' },
  { parameter: 'fibre', label: 'Fibre', emoji: '🥦', unit: 'g', defaultTarget: 30, defaultType: 'min' },
  { parameter: 'water', label: 'Water Intake', emoji: '💧', unit: 'ml', defaultTarget: 2500, defaultType: 'min' },
  { parameter: 'sleep', label: 'Sleep', emoji: '😴', unit: 'h', defaultTarget: 7, defaultType: 'min' },
  { parameter: 'workout', label: 'Workout Calories', emoji: '💪', unit: 'kcal', defaultTarget: 300, defaultType: 'min' },
  { parameter: 'steps', label: 'Daily Steps', emoji: '👟', unit: 'steps', defaultTarget: 10000, defaultType: 'min' },
  { parameter: 'active_minutes', label: 'Active Minutes', emoji: '⚡', unit: 'min', defaultTarget: 30, defaultType: 'min' },
  { parameter: 'calories_burned', label: 'Calories Burned', emoji: '🔥', unit: 'kcal', defaultTarget: 500, defaultType: 'min' },
  { parameter: 'weight', label: 'Weight', emoji: '⚖️', unit: 'kg', defaultTarget: 70, defaultType: 'target' },
];

export const GOAL_PARAM_KEYS = GOAL_CATALOG.map(g => g.parameter);

export const GOAL_PARAMETERS = new Set(GOAL_PARAM_KEYS);
